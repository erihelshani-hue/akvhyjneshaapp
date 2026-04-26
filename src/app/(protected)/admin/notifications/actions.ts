"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { sendPushToAll } from "@/lib/webpush";
import { isTodayBirthday, buildBirthdayPushMessage } from "@/lib/birthday";

async function requireAdmin() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "admin") throw new Error("Unauthorized");
  return user;
}

export async function triggerBirthdayNotifications(): Promise<{
  ok: boolean;
  message: string;
  names?: string[];
}> {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { data: allMembers, error } = await supabase
    .from("profiles")
    .select("id, full_name, birthday")
    .not("birthday", "is", null);

  if (error) return { ok: false, message: "Datenbankfehler beim Laden der Profile." };

  const todayBirthdays = (allMembers ?? []).filter(
    (m) => m.birthday && isTodayBirthday(m.birthday)
  );

  if (todayBirthdays.length === 0) {
    return { ok: true, message: "Heute hat niemand Geburtstag (laut Datenbank)." };
  }

  const firstNames = todayBirthdays.map((m) => m.full_name.split(" ")[0]);
  const { title, body } = buildBirthdayPushMessage(firstNames);

  const result = await sendPushToAll({ title, body, url: "/members" });

  // Also record in birthday_notifications to prevent duplicate from cron
  const todayStr = new Date().toISOString().split("T")[0];
  await supabase.from("birthday_notifications").upsert(
    todayBirthdays.map((m) => ({
      birthday_person_id: m.id,
      notification_date: todayStr,
    })),
    { onConflict: "birthday_person_id,notification_date", ignoreDuplicates: true }
  );

  return {
    ok: true,
    message: `Benachrichtigung gesendet an ${result.sent} Gerät(e). (${result.failed} fehlgeschlagen)`,
    names: firstNames,
  };
}

export async function sendCustomPushNotification(
  title: string,
  body: string
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();

  if (!title.trim() || !body.trim()) {
    return { ok: false, message: "Titel und Text dürfen nicht leer sein." };
  }

  const result = await sendPushToAll({ title: title.trim(), body: body.trim(), url: "/" });

  return {
    ok: true,
    message: `Nachricht gesendet an ${result.sent} Gerät(e). (${result.failed} fehlgeschlagen)`,
  };
}

export async function getTodayBirthdays(): Promise<string[]> {
  await requireAdmin();
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("profiles")
    .select("full_name, birthday")
    .not("birthday", "is", null);

  return (data ?? [])
    .filter((m) => m.birthday && isTodayBirthday(m.birthday))
    .map((m) => m.full_name);
}
