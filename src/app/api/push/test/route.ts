import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/webpush";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendPushToUser(user.id, {
    title: "AKV Hyjnesha",
    body: "Test-Benachrichtigung erfolgreich gesendet.",
    url: "/settings",
  });

  if (result.total === 0) {
    return NextResponse.json(
      { ok: false, error: "No push subscription found for this user", result },
      { status: 404 }
    );
  }

  if (result.sent === 0) {
    return NextResponse.json(
      { ok: false, error: "No push notification was delivered", result },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, result });
}
