import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPushToAll } from "@/lib/webpush";
import { isTodayBirthday, buildBirthdayPushMessage } from "@/lib/birthday";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = await createServiceClient();

  const { data: allMembers, error } = await supabase
    .from("profiles")
    .select("id, full_name, birthday")
    .not("birthday", "is", null);

  if (error) {
    console.error("[Birthday Cron] Failed to fetch profiles", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const todayBirthdays = (allMembers ?? []).filter(
    (m) => m.birthday && isTodayBirthday(m.birthday)
  );

  if (todayBirthdays.length === 0) {
    return NextResponse.json({ message: "No birthdays today", sent: 0 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const birthdayIds = todayBirthdays.map((m) => m.id);

  // Check which ones were already notified today
  const { data: existing } = await supabase
    .from("birthday_notifications")
    .select("birthday_person_id")
    .in("birthday_person_id", birthdayIds)
    .eq("notification_date", todayStr);

  const alreadyNotified = new Set((existing ?? []).map((e) => e.birthday_person_id));
  const toNotify = todayBirthdays.filter((m) => !alreadyNotified.has(m.id));

  if (toNotify.length === 0) {
    return NextResponse.json({ message: "Already notified today", sent: 0 });
  }

  // Build Albanian push message
  const firstNames = toNotify.map((m) => m.full_name.split(" ")[0]);
  const { title, body } = buildBirthdayPushMessage(firstNames);

  await sendPushToAll({ title, body, url: "/members" });

  // Record sent notifications to prevent duplicates
  const { error: insertError } = await supabase.from("birthday_notifications").insert(
    toNotify.map((m) => ({
      birthday_person_id: m.id,
      notification_date: todayStr,
    }))
  );

  if (insertError) {
    console.error("[Birthday Cron] Failed to record notifications", insertError);
  }

  console.log(`[Birthday Cron] Sent birthday notification for: ${firstNames.join(", ")}`);
  return NextResponse.json({ message: "Notifications sent", sent: toNotify.length, names: firstNames });
}
