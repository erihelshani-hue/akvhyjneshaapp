"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cached-data";
import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { sendPushToUser } from "@/lib/webpush";
import { formatDate } from "@/lib/utils";

export async function revalidateRehearsals(rehearsalId?: string) {
  revalidateTag(CACHE_TAGS.rehearsals);
  revalidatePath("/");
  revalidatePath("/rehearsals");
  if (rehearsalId) revalidatePath(`/rehearsals/${rehearsalId}`);
}

export async function sendRehearsalNotifications(
  rehearsalId: string,
  targetDate: string,
  rehearsalTitle: string
): Promise<{ ok: boolean; message: string; reminded: number; nudged: number }> {
  const user = await getUser();
  if (!user) return { ok: false, message: "Nicht angemeldet.", reminded: 0, nudged: 0 };

  const supabase = await createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { ok: false, message: "Keine Berechtigung.", reminded: 0, nudged: 0 };
  }

  const [{ data: allMembers }, { data: attendances }] = await Promise.all([
    supabase.from("profiles").select("id"),
    supabase
      .from("attendances")
      .select("user_id, status")
      .eq("entity_type", "rehearsal")
      .eq("entity_id", rehearsalId)
      .eq("entity_date", targetDate),
  ]);

  const voteMap = new Map<string, string>(
    (attendances ?? []).map((a) => [a.user_id, a.status])
  );

  const reminded: string[] = []; // yes / no → "Heute ist Probe!"
  const nudged: string[] = [];   // maybe / no response → "Bitte abstimmen"

  for (const member of allMembers ?? []) {
    const status = voteMap.get(member.id) ?? null;
    if (status === "yes" || status === "no") {
      reminded.push(member.id);
    } else {
      nudged.push(member.id);
    }
  }

  const formattedDate = formatDate(targetDate);

  await Promise.allSettled([
    ...reminded.map((uid) =>
      sendPushToUser(uid, {
        title: `🎶 Heute ist Probe!`,
        body: `${rehearsalTitle} · ${formattedDate}`,
        url: `/rehearsals/${rehearsalId}?date=${targetDate}`,
      })
    ),
    ...nudged.map((uid) =>
      sendPushToUser(uid, {
        title: `📋 Bitte abstimmen`,
        body: `Wirst du kommen? ${rehearsalTitle} · ${formattedDate}`,
        url: `/rehearsals/${rehearsalId}?date=${targetDate}`,
      })
    ),
  ]);

  return {
    ok: true,
    message: `Erinnerung gesendet: ${reminded.length} Mitglied(er) informiert, ${nudged.length} zum Abstimmen aufgefordert.`,
    reminded: reminded.length,
    nudged: nudged.length,
  };
}
