"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

export type MemberAttendanceData = {
  profile: { id: string; full_name: string; avatar_url: string | null };
  rehearsal: { yes: number; no: number; maybe: number; total: number };
  event: { yes: number; no: number; maybe: number; total: number };
  missedRehearsals: { id: string; title: string; date: string }[];
  missedEvents: { id: string; title: string; date: string }[];
};

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

function MemberRow({ data }: { data: MemberAttendanceData }) {
  const [open, setOpen] = useState(false);
  const { profile, rehearsal, event, missedRehearsals, missedEvents } = data;
  const initials = getInitials(profile.full_name);
  const totalYes = rehearsal.yes + event.yes;
  const totalAll = rehearsal.total + event.total;

  return (
    <>
      {/* Mobile card */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/30 transition-colors"
        >
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
            <p className="text-xs text-muted">Gesamt: {totalYes}/{totalAll} Ja</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AttendanceBar yes={totalYes} total={totalAll} />
            {open ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
          </div>
        </button>
        {open && (
          <div className="border-t border-border px-4 pb-4 pt-3 bg-surface-2/20 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs text-muted">
              <div>
                <p className="font-medium text-foreground mb-0.5">Proben</p>
                <p>✓ {rehearsal.yes} · ✗ {rehearsal.no} · ? {rehearsal.maybe}</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-0.5">Veranstaltungen</p>
                <p>✓ {event.yes} · ✗ {event.no} · ? {event.maybe}</p>
              </div>
            </div>
            {missedRehearsals.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Fehlende Proben</p>
                <ul className="space-y-1">
                  {missedRehearsals.map((r) => (
                    <li key={r.id} className="text-xs text-muted flex justify-between gap-2">
                      <span className="truncate">{r.title}</span>
                      <span className="shrink-0 text-dim">{r.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {missedEvents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Fehlende Veranstaltungen</p>
                <ul className="space-y-1">
                  {missedEvents.map((e) => (
                    <li key={e.id} className="text-xs text-muted flex justify-between gap-2">
                      <span className="truncate">{e.title}</span>
                      <span className="shrink-0 text-dim">{e.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {missedRehearsals.length === 0 && missedEvents.length === 0 && (
              <p className="text-xs text-muted italic">Keine Abwesenheiten.</p>
            )}
          </div>
        )}
      </div>

      {/* Desktop table rows */}
      <tr className="hidden sm:table-row bg-surface hover:bg-surface-2/30 transition-colors cursor-pointer" onClick={() => setOpen((v) => !v)}>
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
        <td className="px-3 py-3 text-center"><span className="text-emerald-400 font-medium">{rehearsal.yes}</span></td>
        <td className="px-3 py-3 text-center"><span className="text-red-400 font-medium">{rehearsal.no}</span></td>
        <td className="px-3 py-3 text-center text-muted">{rehearsal.maybe}</td>
        <td className="px-3 py-3 text-center"><span className="text-emerald-400 font-medium">{event.yes}</span></td>
        <td className="px-3 py-3 text-center"><span className="text-red-400 font-medium">{event.no}</span></td>
        <td className="px-3 py-3 text-center text-muted">{event.maybe}</td>
        <td className="px-4 py-3 min-w-[120px]"><AttendanceBar yes={totalYes} total={totalAll} /></td>
        <td className="px-3 py-3 text-center text-muted">
          {open ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />}
        </td>
      </tr>
      {open && (
        <tr className="hidden sm:table-row bg-surface-2/20">
          <td colSpan={9} className="px-6 py-3 border-t border-border">
            <div className="flex flex-wrap gap-6 text-xs text-muted">
              {missedRehearsals.length > 0 && (
                <div className="min-w-[200px]">
                  <p className="font-medium text-foreground mb-1.5">Fehlende Proben</p>
                  <ul className="space-y-1">
                    {missedRehearsals.map((r) => (
                      <li key={r.id} className="flex justify-between gap-4">
                        <span>{r.title}</span>
                        <span className="text-dim">{r.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {missedEvents.length > 0 && (
                <div className="min-w-[200px]">
                  <p className="font-medium text-foreground mb-1.5">Fehlende Veranstaltungen</p>
                  <ul className="space-y-1">
                    {missedEvents.map((e) => (
                      <li key={e.id} className="flex justify-between gap-4">
                        <span>{e.title}</span>
                        <span className="text-dim">{e.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {missedRehearsals.length === 0 && missedEvents.length === 0 && (
                <p className="italic">Keine Abwesenheiten.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function AttendanceTable({ stats }: { stats: MemberAttendanceData[] }) {
  return (
    <>
      {/* Mobile */}
      <div className="space-y-2 sm:hidden">
        {stats.map((data) => <MemberRow key={data.profile.id} data={data} />)}
      </div>

      {/* Desktop */}
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
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.map((data) => <MemberRow key={data.profile.id} data={data} />)}
          </tbody>
        </table>
      </div>
    </>
  );
}
