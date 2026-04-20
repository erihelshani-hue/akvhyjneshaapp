import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import type { AttendanceStatus, EntityType } from "@/types/database";

type AttendanceRow = { user_id: string; entity_type: EntityType; status: AttendanceStatus };
type Profile = { id: string; full_name: string; avatar_url: string | null };

type MemberStats = {
  profile: Profile;
  rehearsal: { yes: number; no: number; maybe: number; total: number };
  event: { yes: number; no: number; maybe: number; total: number };
};

function initStats() {
  return { yes: 0, no: 0, maybe: 0, total: 0 };
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AttendanceBar({ yes, total }: { yes: number; total: number }) {
  if (total === 0) return <span className="text-xs text-muted">—</span>;
  const pct = Math.round((yes / total) * 100);
  const color = pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden min-w-[40px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
}

export default async function AttendancePage() {
  const supabase = await createServiceClient();

  const [{ data: profiles }, { data: attendances }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    supabase.from("attendances").select("user_id, entity_type, status"),
  ]);

  const statsMap = new Map<string, MemberStats>();

  for (const profile of profiles ?? []) {
    statsMap.set(profile.id, {
      profile,
      rehearsal: initStats(),
      event: initStats(),
    });
  }

  for (const row of (attendances ?? []) as AttendanceRow[]) {
    const entry = statsMap.get(row.user_id);
    if (!entry) continue;
    const bucket = row.entity_type === "rehearsal" ? entry.rehearsal : entry.event;
    bucket[row.status] += 1;
    bucket.total += 1;
  }

  const stats = Array.from(statsMap.values());

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted">
        Basis: alle gespeicherten Abstimmungen (Ja / Nein / Vielleicht). Ohne Antwort wird nicht gezählt.
      </p>

      {/* Mobile: cards */}
      <div className="space-y-2 sm:hidden">
        {stats.map(({ profile, rehearsal, event }) => {
          const initials = getInitials(profile.full_name);
          const totalYes = rehearsal.yes + event.yes;
          const totalAll = rehearsal.total + event.total;
          return (
            <div key={profile.id} className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden border border-border bg-surface-2">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" sizes="36px" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="font-playfair text-xs font-semibold text-muted">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted">
                    Gesamt: {totalYes}/{totalAll} Ja
                  </p>
                </div>
                <AttendanceBar yes={totalYes} total={totalAll} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted border-t border-border pt-2">
                <div>
                  <p className="font-medium text-foreground mb-0.5">Proben</p>
                  <p>✓ {rehearsal.yes} · ✗ {rehearsal.no} · ? {rehearsal.maybe}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Veranstaltungen</p>
                  <p>✓ {event.yes} · ✗ {event.no} · ? {event.maybe}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/60">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Mitglied</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Proben Ja</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Proben Nein</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Proben ±</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Events Ja</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Events Nein</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Events ±</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Quote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.map(({ profile, rehearsal, event }) => {
              const initials = getInitials(profile.full_name);
              const totalYes = rehearsal.yes + event.yes;
              const totalAll = rehearsal.total + event.total;
              return (
                <tr key={profile.id} className="bg-surface hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-7 w-7 shrink-0 rounded-full overflow-hidden border border-border bg-surface-2">
                        {profile.avatar_url ? (
                          <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" sizes="28px" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="font-playfair text-[10px] font-semibold text-muted">{initials}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{profile.full_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-emerald-400 font-medium">{rehearsal.yes}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-red-400 font-medium">{rehearsal.no}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-muted">{rehearsal.maybe}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-emerald-400 font-medium">{event.yes}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-red-400 font-medium">{event.no}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-muted">{event.maybe}</td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <AttendanceBar yes={totalYes} total={totalAll} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
