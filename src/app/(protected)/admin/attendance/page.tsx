import { createServiceClient } from "@/lib/supabase/server";
import type { AttendanceStatus, EntityType } from "@/types/database";
import { AttendanceTable, type MemberAttendanceData } from "./AttendanceTable";

type AttendanceRow = { user_id: string; entity_type: EntityType; entity_id: string; entity_date: string | null; status: AttendanceStatus };

function initStats() {
  return { yes: 0, no: 0, maybe: 0, total: 0 };
}

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

export default async function AttendancePage() {
  const supabase = await createServiceClient();

  const [{ data: profiles }, { data: rehearsals }, { data: events }, { data: attendances }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    supabase.from("rehearsals").select("id, title, date").order("date", { ascending: false }),
    supabase.from("events").select("id, title, date").order("date", { ascending: false }),
    supabase.from("attendances").select("user_id, entity_type, entity_id, entity_date, status"),
  ]);

  const rehearsalMap = new Map((rehearsals ?? []).map((r) => [r.id, r]));
  const eventMap     = new Map((events     ?? []).map((e) => [e.id, e]));

  type OccurrenceKey = string; // `${entity_id}::${entity_date}`
  type UserAttendance = {
    profile: { id: string; full_name: string; avatar_url: string | null };
    rehearsal: ReturnType<typeof initStats>;
    event: ReturnType<typeof initStats>;
    rehearsalMissed: { key: OccurrenceKey; entity_id: string; entity_date: string | null }[];
    eventMissed: { key: OccurrenceKey; entity_id: string; entity_date: string | null }[];
  };

  const statsMap = new Map<string, UserAttendance>();
  for (const profile of profiles ?? []) {
    statsMap.set(profile.id, {
      profile,
      rehearsal: initStats(),
      event: initStats(),
      rehearsalMissed: [],
      eventMissed: [],
    });
  }

  for (const row of (attendances ?? []) as AttendanceRow[]) {
    const entry = statsMap.get(row.user_id);
    if (!entry) continue;
    if (row.entity_type === "rehearsal" && !rehearsalMap.has(row.entity_id)) continue;
    if (row.entity_type === "event"     && !eventMap.has(row.entity_id))     continue;
    const key: OccurrenceKey = `${row.entity_id}::${row.entity_date ?? ""}`;
    if (row.entity_type === "rehearsal") {
      entry.rehearsal[row.status] += 1;
      entry.rehearsal.total += 1;
      if (row.status === "no") entry.rehearsalMissed.push({ key, entity_id: row.entity_id, entity_date: row.entity_date });
    } else {
      entry.event[row.status] += 1;
      entry.event.total += 1;
      if (row.status === "no") entry.eventMissed.push({ key, entity_id: row.entity_id, entity_date: row.entity_date });
    }
  }

  const stats: MemberAttendanceData[] = Array.from(statsMap.values()).map((entry) => {
    const missedRehearsals = entry.rehearsalMissed
      .sort((a, b) => (b.entity_date ?? "").localeCompare(a.entity_date ?? ""))
      .map((r) => ({
        id: r.key,
        title: rehearsalMap.get(r.entity_id)?.title ?? "Probe",
        date: fmtDate(r.entity_date),
      }));

    const missedEvents = entry.eventMissed
      .sort((a, b) => (b.entity_date ?? "").localeCompare(a.entity_date ?? ""))
      .map((e) => ({
        id: e.key,
        title: eventMap.get(e.entity_id)?.title ?? "Veranstaltung",
        date: fmtDate(e.entity_date),
      }));

    return {
      profile: entry.profile,
      rehearsal: entry.rehearsal,
      event: entry.event,
      missedRehearsals,
      missedEvents,
    };
  });

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted">
        Basis: alle gespeicherten Abstimmungen (Ja / Nein / Vielleicht). Ohne Antwort wird nicht gezählt. Klicke auf ein Mitglied für Details.
      </p>
      <AttendanceTable stats={stats} />
    </div>
  );
}
