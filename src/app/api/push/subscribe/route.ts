import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type PushSubscriptionBody = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function isPushSubscriptionBody(value: unknown): value is PushSubscriptionBody {
  if (!value || typeof value !== "object") return false;

  const body = value as {
    endpoint?: unknown;
    keys?: {
      p256dh?: unknown;
      auth?: unknown;
    };
  };

  return (
    typeof body.endpoint === "string" &&
    body.endpoint.length > 0 &&
    typeof body.keys?.p256dh === "string" &&
    body.keys.p256dh.length > 0 &&
    typeof body.keys?.auth === "string" &&
    body.keys.auth.length > 0
  );
}

async function parseJson(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sub = await parseJson(req);
  if (!isPushSubscriptionBody(sub)) {
    return NextResponse.json(
      { ok: false, error: "Invalid push subscription payload" },
      { status: 400 }
    );
  }

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "user_id,endpoint" }
  );

  if (error) {
    console.error("[Push] Failed to upsert push subscription", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save push subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    saved: true,
    endpointHost: new URL(sub.endpoint).host,
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseJson(req);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, error: "Missing push subscription endpoint" },
      { status: 400 }
    );
  }

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[Push] Failed to delete push subscription", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete push subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
