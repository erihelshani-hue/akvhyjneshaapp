import { createServiceClient } from "@/lib/supabase/server";
import { ContributionsManager } from "./ContributionsManager";

function getMonthOptions() {
  const now = new Date();
  const months: { value: string; label: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("de-DE", { month: "long", year: "numeric", timeZone: "UTC" }),
    });
  }
  return months;
}

export default async function AdminContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: queryMonth } = await searchParams;
  const monthOptions = getMonthOptions();
  const selectedMonth = queryMonth ?? monthOptions[0].value;
  const monthName =
    monthOptions.find((m) => m.value === selectedMonth)?.label ??
    new Date(selectedMonth + "T12:00:00Z").toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  const supabase = await createServiceClient();

  const [{ data: profiles }, { data: contributions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    supabase
      .from("member_contributions")
      .select("*")
      .eq("contribution_month", selectedMonth),
  ]);

  const contribMap = new Map(
    (contributions ?? []).map((c) => [c.user_id, c])
  );
  const hasEntries = contribMap.size > 0;

  const rows = (profiles ?? []).map((p) => {
    const c = contribMap.get(p.id);
    return {
      userId: p.id,
      fullName: p.full_name,
      avatarUrl: p.avatar_url,
      amountDue: c?.amount_due ?? 0,
      amountPaid: c?.amount_paid ?? 0,
      paidAt: c?.paid_at ?? null,
      notes: c?.notes ?? null,
    };
  });

  return (
    <div className="space-y-5">
      {/* Month selector */}
      <div className="flex flex-wrap gap-2">
        {monthOptions.map(({ value, label }) => {
          const isSelected = value === selectedMonth;
          return (
            <a
              key={value}
              href={`/admin/contributions?month=${value}`}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                isSelected
                  ? "border-accent/60 bg-accent/10 text-foreground font-medium"
                  : "border-border text-muted hover:border-zinc-600 hover:text-foreground"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      <ContributionsManager
        month={selectedMonth}
        monthName={monthName}
        rows={rows}
        hasEntries={hasEntries}
      />
    </div>
  );
}
