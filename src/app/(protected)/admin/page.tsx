import { createServiceClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Users, BarChart2, Archive, CreditCard, ChevronRight } from "lucide-react";

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .split("T")[0];
}

export default async function AdminOverviewPage() {
  const supabase = await createServiceClient();
  const month = currentMonthStart();

  const [
    { count: memberCount },
    { count: rehearsalCount },
    { count: eventCount },
    { count: archivedRehearsalCount },
    { count: archivedEventCount },
    { data: contributions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("rehearsals").select("*", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("is_archived", false),
    supabase.from("rehearsals").select("*", { count: "exact", head: true }).eq("is_archived", true),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("is_archived", true),
    supabase
      .from("member_contributions")
      .select("amount_due, amount_paid")
      .eq("contribution_month", month),
  ]);

  const unpaidCount = (contributions ?? []).filter(
    (c) => c.amount_due > 0 && c.amount_paid < c.amount_due
  ).length;

  const stats = [
    { label: "Mitglieder", value: memberCount ?? 0, href: "/members", Icon: Users },
    { label: "Aktive Proben", value: rehearsalCount ?? 0, href: "/rehearsals", Icon: BarChart2 },
    { label: "Aktive Veranstaltungen", value: eventCount ?? 0, href: "/events", Icon: BarChart2 },
    { label: "Archivierte Einträge", value: (archivedRehearsalCount ?? 0) + (archivedEventCount ?? 0), href: "/admin/archive", Icon: Archive },
  ];

  const monthName = new Date(month + "T12:00:00Z").toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const sections = [
    { href: "/admin/attendance", label: "Anwesenheitsstatistik", desc: "Ja/Nein/Vielleicht-Auswertung pro Mitglied", Icon: BarChart2 },
    { href: "/admin/archive", label: "Archiv", desc: "Archivierte Proben und Veranstaltungen verwalten", Icon: Archive },
    { href: "/admin/contributions", label: "Mitgliedsbeiträge", desc: `Beiträge für ${monthName} — ${unpaidCount} offen`, Icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted" />
              <p className="text-xs text-muted">{label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Section links */}
      <div className="space-y-2">
        {sections.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:border-border/80 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-border shrink-0">
              <Icon className="h-4.5 w-4.5 text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted/40 shrink-0 group-hover:text-muted transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
