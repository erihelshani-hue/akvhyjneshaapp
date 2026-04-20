"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/database";

interface RSVPBarProps {
  entityType: "rehearsal" | "event";
  entityId: string;
  entityDate?: string;
  currentStatus: AttendanceStatus | null;
  yesCount: number;
  noCount: number;
  onRSVP: (status: AttendanceStatus) => Promise<void>;
}

export function RSVPBar({ currentStatus, yesCount, noCount, onRSVP }: RSVPBarProps) {
  const t = useTranslations("rsvp");
  const [status, setStatus] = useState<AttendanceStatus | null>(currentStatus);
  const [optimisticYesCount, setOptimisticYesCount] = useState(yesCount);
  const [optimisticNoCount, setOptimisticNoCount] = useState(noCount);
  const [isPending, startTransition] = useTransition();

  function handleRSVP(newStatus: AttendanceStatus) {
    const previousStatus = status;
    setStatus(newStatus);
    setOptimisticYesCount((count) => {
      if (previousStatus === "yes" && newStatus !== "yes") return Math.max(0, count - 1);
      if (previousStatus !== "yes" && newStatus === "yes") return count + 1;
      return count;
    });
    setOptimisticNoCount((count) => {
      if (previousStatus === "no" && newStatus !== "no") return Math.max(0, count - 1);
      if (previousStatus !== "no" && newStatus === "no") return count + 1;
      return count;
    });
    startTransition(async () => {
      try {
        await onRSVP(newStatus);
      } catch {
        setStatus(previousStatus);
        setOptimisticYesCount(yesCount);
        setOptimisticNoCount(noCount);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <RSVPButton label={t("yes")} Icon={Check} value="yes" current={status} disabled={isPending} onClick={() => handleRSVP("yes")} activeClass="bg-emerald-600/90 text-white border-emerald-500 shadow-[0_8px_24px_-8px_rgba(22,163,74,0.55)]" />
        <RSVPButton label={t("maybe")} Icon={Minus} value="maybe" current={status} disabled={isPending} onClick={() => handleRSVP("maybe")} activeClass="bg-warm/90 text-background border-warm" />
        <RSVPButton label={t("no")} Icon={X} value="no" current={status} disabled={isPending} onClick={() => handleRSVP("no")} activeClass="bg-accent text-white border-accent shadow-[0_8px_24px_-8px_rgba(211,22,34,0.55)]" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted">
        <span className="text-center font-medium text-emerald-400/80">
          {optimisticYesCount === 1 ? t("attendingOne") : t("attending", { count: optimisticYesCount })}
        </span>
        <span />
        <span className="text-center font-medium text-red-400/70">
          {optimisticNoCount === 1 ? t("decliningOne") : t("declining", { count: optimisticNoCount })}
        </span>
      </div>
    </div>
  );
}

function RSVPButton({ label, Icon, value, current, disabled, onClick, activeClass }: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  value: AttendanceStatus;
  current: AttendanceStatus | null;
  disabled: boolean;
  onClick: () => void;
  activeClass: string;
}) {
  const isActive = current === value;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-14 items-center justify-center gap-2 rounded-sm text-[0.78rem] font-bold uppercase tracking-[0.1em] border transition-all duration-300 disabled:opacity-50 active:scale-95",
        isActive ? activeClass : "bg-[rgba(245,237,226,0.04)] border-border text-foreground/80 hover:bg-[rgba(245,237,226,0.08)] hover:border-border-strong"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
