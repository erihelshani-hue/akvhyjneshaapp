import { createServiceClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/database";
import { AttendanceTable, type MemberAttendanceData } from "./AttendanceTable";

type AttendanceRow = {
  user_id: string;
  entity_type: "rehearsal" | "event";
  entity_id: string;
  entity_date: string | null;
  status: AttendanceStatus;
};

function initStats() {
  return { yes: 0, no: 0, maybe: 0, total: 0 };
}

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00Z").toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
  });
}

function todayISODate() {
  // Use Europe/Vienna local date so "next upcoming" is correct for the choir's timezone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

export default async function AttendancePage() {
  const supabase = await createServiceClient();
  const today = todayISODate();

  // Only archived rehearsals + the single next upcoming (non-archived, date >= today) rehearsal
  // count toward attendance. Events are never counted. Deleted rehearsals can't appear here
  // because we query by id from the live table — orphaned attendance rows are ignored downstream.
  const [{ data: profiles }, { data: archivedRehearsals }, { data: upcomingRehearsal }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
      supabase
        .from("rehearsals")
        .select("id, title, date")
        .eq("is_archived", true)
        .order("date", { ascending: false }),
      supabase
        .from("rehearsals")
        .select("id, title, date")
        .eq("is_archived", false)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1),
    ]);

  const consideredRehearsals = [
    ...(archivedRehearsals ?? []),
    ...(upcomingRehearsal ?? []),
  ];
  const rehearsalMap = new Map(consideredRehearsals.map((r) => [r.id, r]));

  // Pull only attendance rows for considered rehearsals — orphaned/deleted rows are excluded
  // by the IN-filter, and event rows are never queried.
  const ids = Array.from(rehearsalMap.keys());
  const { data: attendances } = ids.length
    ? await supabase
        .from("attendances")
        .select("user_id, entity_type, entity_id, entity_date, status")
        .eq("entity_type", "rehearsal")
        .in("entity_id", ids)
    : { data: [] as AttendanceRow[] };

  type OccurrenceKey = string;
  type UserAttendance = {
    profile: { id: string; full_name: string; avatar_url: string | null };
    rehearsal: ReturnType<typeof initStats>;
    rehearsalMissed: { key: OccurrenceKey; entity_id: string; entity_date: string | null }[];
  };

  const statsMap = new Map<string, UserAttendance>();
  for (const profile of profiles ?? []) {
    statsMap.set(profile.id, {
      profile,
      rehearsal: initStats(),
      rehearsalMissed: [],
    });
  }

  for (const row of (attendances ?? []) as AttendanceRow[]) {
    const entry = statsMap.get(row.user_id);
    if (!entry) continue;
    // Guard: the IN-filter already excludes deleted/event rows, but double-check the map
    // so future query changes can't reintroduce orphaned counting.
    if (!rehearsalMap.has(row.entity_id)) continue;
    const key: OccurrenceKey = `${row.entity_id}::${row.entity_date ?? ""}`;
    entry.rehearsal[row.status] += 1;
    entry.rehearsal.total += 1;
    if (row.status === "no") {
      entry.rehearsalMissed.push({ key, entity_id: row.entity_id, entity_date: row.entity_date });
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

    return {
      profile: entry.profile,
      rehearsal: entry.rehearsal,
      missedRehearsals,
    };
  });

  const upcomingDate = upcomingRehearsal?.[0]?.date ?? null;

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted">
        Basis: alle archivierten Proben{upcomingDate ? ` + nächste Probe (${fmtDate(upcomingDate)})` : ""}.
        Veranstaltungen, gelöschte und weitere zukünftige Proben werden nicht berücksichtigt.
      </p>
      <AttendanceTable stats={stats} upcomingDate={upcomingDate ? fmtDate(upcomingDate) : null} />
    </div>
  );
}
