"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

export type MemberAttendanceData = {
  profile: { id: string; full_name: string; avatar_url: string | null };
  rehearsal: { yes: number; no: number; maybe: number; total: number };
  missedRehearsals: { id: string; title: string; date: string }[];
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
  const { profile, rehearsal, missedRehearsals } = data;
  const initials = getInitials(profile.full_name);

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
            <p className="text-xs text-muted">{rehearsal.yes}/{rehearsal.total} Ja</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AttendanceBar yes={rehearsal.yes} total={rehearsal.total} />
            {open ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
          </div>
        </button>
        {open && (
          <div className="border-t border-border px-4 pb-4 pt-3 bg-surface-2/20 space-y-3">
            <div className="text-xs text-muted">
              <p className="font-medium text-foreground mb-0.5">Proben</p>
              <p>✓ {rehearsal.yes} · ✗ {rehearsal.no} · ? {rehearsal.maybe}</p>
            </div>
            {missedRehearsals.length > 0 ? (
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
            ) : (
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
        <td className="px-3 py-3 text-center text-muted tabular-nums">{rehearsal.total}</td>
        <td className="px-4 py-3 min-w-[120px]"><AttendanceBar yes={rehearsal.yes} total={rehearsal.total} /></td>
        <td className="px-3 py-3 text-center text-muted">
          {open ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />}
        </td>
      </tr>
      {open && (
        <tr className="hidden sm:table-row bg-surface-2/20">
          <td colSpan={7} className="px-6 py-3 border-t border-border">
            <div className="text-xs text-muted">
              {missedRehearsals.length > 0 ? (
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
              ) : (
                <p className="italic">Keine Abwesenheiten.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function downloadPdf(stats: MemberAttendanceData[], upcomingDate: string | null) {
  const today = new Date().toLocaleDateString("de-DE");
  const rows = stats
    .map((s) => {
      const r = s.rehearsal;
      const pct = r.total > 0 ? Math.round((r.yes / r.total) * 100) : 0;
      const missed = s.missedRehearsals
        .map((m) => `${m.title} (${m.date})`)
        .join(", ");
      return `<tr>
        <td>${escapeHtml(s.profile.full_name)}</td>
        <td class="num">${r.yes}</td>
        <td class="num">${r.no}</td>
        <td class="num">${r.maybe}</td>
        <td class="num">${r.total}</td>
        <td class="num">${pct}%</td>
        <td>${escapeHtml(missed)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Anwesenheitsstatistik</title>
    <style>
      @page { size: A4; margin: 18mm; }
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #111; font-size: 11px; }
      h1 { font-size: 16px; margin: 0 0 4px; }
      .meta { color: #555; font-size: 10px; margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #999; padding: 4px 6px; text-align: left; vertical-align: top; }
      th { background: #eee; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }
      td.num, th.num { text-align: right; white-space: nowrap; }
      tr { page-break-inside: avoid; }
    </style></head><body>
    <h1>Anwesenheitsstatistik</h1>
    <p class="meta">
      Stand: ${today} · Basis: alle archivierten Proben${upcomingDate ? ` + nächste Probe (${upcomingDate})` : ""}.
      Keine Veranstaltungen, keine gelöschten Proben.
    </p>
    <table>
      <thead><tr>
        <th>Mitglied</th>
        <th class="num">Ja</th>
        <th class="num">Nein</th>
        <th class="num">Vielleicht</th>
        <th class="num">Total</th>
        <th class="num">Quote</th>
        <th>Fehlende Proben</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <script>window.addEventListener('load',()=>{setTimeout(()=>window.print(),200);});</script>
    </body></html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Bitte Pop-ups für diese Seite erlauben, um den PDF-Export zu nutzen.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function AttendanceTable({
  stats,
  upcomingDate,
}: {
  stats: MemberAttendanceData[];
  upcomingDate: string | null;
}) {
  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => downloadPdf(stats, upcomingDate)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-zinc-600 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Als PDF herunterladen
        </button>
      </div>

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
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Ja</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Nein</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Vielleicht</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Total</th>
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
