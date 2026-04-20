"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertContribution, createMonthContributions } from "../actions";
import { Check, Euro, ChevronDown, ChevronUp } from "lucide-react";

type ContributionRow = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  amountDue: number;
  amountPaid: number;
  paidAt: string | null;
  notes: string | null;
};

interface ContributionsManagerProps {
  month: string;
  monthName: string;
  rows: ContributionRow[];
  hasEntries: boolean;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function StatusBadge({ due, paid }: { due: number; paid: number }) {
  if (due === 0) return <span className="text-[10px] text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">—</span>;
  if (paid >= due) return <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Bezahlt</span>;
  return <span className="text-[10px] font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">Offen</span>;
}

function ContributionRowItem({ row, month }: { row: ContributionRow; month: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amountDue, setAmountDue] = useState(String(row.amountDue));
  const [amountPaid, setAmountPaid] = useState(String(row.amountPaid));
  const [notes, setNotes] = useState(row.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = getInitials(row.fullName);
  const due = parseFloat(amountDue) || 0;
  const paid = parseFloat(amountPaid) || 0;

  function handleMarkPaid() {
    setAmountPaid(amountDue);
    save(due, due, notes);
  }

  function save(d: number, p: number, n: string) {
    setError(null);
    startTransition(async () => {
      try {
        await upsertContribution(row.userId, month, d, p, n || null);
        setSaved(true);
        setIsEditing(false);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        setError("Fehler beim Speichern.");
      }
    });
  }

  function handleSave() {
    save(due, paid, notes);
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Row header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2/30 transition-colors"
        onClick={() => setIsEditing((v) => !v)}
      >
        <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-border bg-surface-2">
          {row.avatarUrl ? (
            <Image src={row.avatarUrl} alt={row.fullName} fill className="object-cover" sizes="32px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="font-playfair text-[10px] font-semibold text-muted">{initials}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{row.fullName}</p>
          <p className="text-xs text-muted">
            {due > 0 ? `€${paid.toFixed(2)} / €${due.toFixed(2)}` : "Kein Betrag"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge due={due} paid={paid} />
          {saved && <Check className="h-3.5 w-3.5 text-emerald-400" />}
          {isEditing ? <ChevronUp className="h-3.5 w-3.5 text-muted" /> : <ChevronDown className="h-3.5 w-3.5 text-muted" />}
        </div>
      </button>

      {/* Inline edit form */}
      {isEditing && (
        <div className="px-4 pb-4 pt-2 border-t border-border space-y-3 bg-surface-2/20">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted font-medium">Soll-Betrag (€)</label>
              <div className="relative">
                <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <Input
                  type="number"
                  min="0"
                  step="0.50"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  className="pl-7 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted font-medium">Bezahlt (€)</label>
              <div className="relative">
                <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <Input
                  type="number"
                  min="0"
                  step="0.50"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="pl-7 h-9 text-sm"
                />
              </div>
            </div>
          </div>
          <Input
            placeholder="Notiz (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-9 text-sm"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isPending} className="h-8 text-xs">
              {isPending ? "Speichere…" : "Speichern"}
            </Button>
            {due > 0 && paid < due && (
              <Button size="sm" variant="outline" onClick={handleMarkPaid} disabled={isPending} className="h-8 text-xs">
                Als bezahlt markieren
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ContributionsManager({ month, monthName, rows, hasEntries }: ContributionsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [defaultAmount, setDefaultAmount] = useState("0");
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    const amount = parseFloat(defaultAmount) || 0;
    startTransition(async () => {
      try {
        await createMonthContributions(month, amount);
      } catch {
        setError("Fehler beim Erstellen.");
      }
    });
  }

  const unpaidCount = rows.filter((r) => r.amountDue > 0 && r.amountPaid < r.amountDue).length;
  const totalDue = rows.reduce((s, r) => s + r.amountDue, 0);
  const totalPaid = rows.reduce((s, r) => s + r.amountPaid, 0);

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      {hasEntries && (
        <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-surface p-4 text-sm">
          <div>
            <p className="text-xs text-muted">Gesamt Soll</p>
            <p className="font-semibold text-foreground">€{totalDue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Bezahlt</p>
            <p className="font-semibold text-emerald-400">€{totalPaid.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Offen</p>
            <p className="font-semibold text-red-400">€{(totalDue - totalPaid).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Offene Beiträge</p>
            <p className="font-semibold text-foreground">{unpaidCount}</p>
          </div>
        </div>
      )}

      {/* Create month button */}
      {!hasEntries && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
          <p className="text-sm text-foreground font-medium">Beiträge für {monthName} anlegen</p>
          <p className="text-xs text-muted">Erstellt Einträge für alle aktiven Mitglieder für diesen Monat.</p>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <Input
                type="number"
                min="0"
                step="0.50"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                placeholder="Standardbetrag"
                className="pl-7 h-9 text-sm w-40"
              />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={isPending}>
              {isPending ? "Wird erstellt…" : `Monat anlegen`}
            </Button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {/* Member rows */}
      {hasEntries && (
        <div className="space-y-2">
          {rows.map((row) => (
            <ContributionRowItem key={row.userId} row={row} month={month} />
          ))}
        </div>
      )}
    </div>
  );
}
