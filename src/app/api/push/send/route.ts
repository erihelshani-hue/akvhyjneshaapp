import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToAll } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, url } = await req.json();

  const result = await sendPushToAll({ title, body, url });

  return NextResponse.json({ ok: true, result });
}
