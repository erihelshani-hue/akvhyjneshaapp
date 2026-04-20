import { CreditCard } from "lucide-react";
import type { MemberContribution } from "@/types/database";

interface ContributionSummaryProps {
  contributions: MemberContribution[];
}

function formatMonth(isoDate: string) {
  return new Date(isoDate + "T12:00:00Z").toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .split("T")[0];
}

export function ContributionSummary({ contributions }: ContributionSummaryProps) {
  if (contributions.length === 0) return null;

  const totalOpen = contributions.reduce(
    (sum, c) => sum + Math.max(0, c.amount_due - c.amount_paid),
    0
  );
  const openContributions = contributions
    .map((c) => ({ ...c, openAmount: Math.max(0, c.amount_due - c.amount_paid) }))
    .filter((c) => c.openAmount > 0);

  const currentMonth = currentMonthStart();
  const currentMonthEntry = contributions.find((c) => c.contribution_month === currentMonth);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 border border-border">
          <CreditCard className="h-3.5 w-3.5 text-muted" />
        </div>
        <p className="text-sm font-medium text-foreground">Mitgliedsbeitrag</p>
      </div>

      {/* Current month */}
      {currentMonthEntry && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">{formatMonth(currentMonthEntry.contribution_month)}</span>
          <div className="flex items-center gap-2">
            <span className="text-foreground">€{currentMonthEntry.amount_due.toFixed(2)}</span>
            {currentMonthEntry.amount_due > 0 && currentMonthEntry.amount_paid >= currentMonthEntry.amount_due ? (
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                Bezahlt
              </span>
            ) : currentMonthEntry.amount_due > 0 ? (
              <span className="text-[10px] font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                Offen
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Open months */}
      {openContributions.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-border">
          <p className="text-xs font-medium text-muted">Offene Monate</p>
          <div className="space-y-1.5">
            {openContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-muted">
                  {formatMonth(contribution.contribution_month)}
                </span>
                <span className="shrink-0 font-medium text-red-400">
                  â‚¬{contribution.openAmount.toFixed(2)} offen
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total open */}
      {totalOpen > 0 && (
        <div className="flex items-center justify-between pt-1 border-t border-border text-sm">
          <span className="text-muted font-medium">Gesamt offen</span>
          <span className="text-red-400 font-semibold">€{totalOpen.toFixed(2)}</span>
        </div>
      )}

      {totalOpen === 0 && contributions.some((c) => c.amount_due > 0) && (
        <p className="text-xs text-emerald-400">Alle Beiträge bezahlt ✓</p>
      )}
    </div>
  );
}
