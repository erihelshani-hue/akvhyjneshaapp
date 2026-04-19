"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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

export function RSVPBar({
  currentStatus,
  yesCount,
  noCount,
  onRSVP,
}: RSVPBarProps) {
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <RSVPButton
          label={t("yes")}
          value="yes"
          current={status}
          disabled={isPending}
          onClick={() => handleRSVP("yes")}
          activeClass="bg-accent text-white border-accent shadow-sm"
        />
        <RSVPButton
          label={t("maybe")}
          value="maybe"
          current={status}
          disabled={isPending}
          onClick={() => handleRSVP("maybe")}
          activeClass="bg-surface-2 text-foreground border-zinc-600"
        />
        <RSVPButton
          label={t("no")}
          value="no"
          current={status}
          disabled={isPending}
          onClick={() => handleRSVP("no")}
          activeClass="bg-surface-2 text-muted border-zinc-700"
        />
      </div>
      <div className="flex gap-2 text-xs text-muted">
        <span className="flex-1 text-center">
          {optimisticYesCount === 1 ? t("attendingOne") : t("attending", { count: optimisticYesCount })}
        </span>
        <span className="flex-1" />
        <span className="flex-1 text-center">
          {optimisticNoCount === 1 ? t("decliningOne") : t("declining", { count: optimisticNoCount })}
        </span>
      </div>
    </div>
  );
}

function RSVPButton({
  label,
  value,
  current,
  disabled,
  onClick,
  activeClass,
}: {
  label: string;
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
        "flex-1 h-10 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50",
        isActive
          ? activeClass
          : "bg-transparent border-border text-muted hover:border-zinc-600 hover:text-foreground hover:bg-surface-2/50"
      )}
    >
      {label}
    </button>
  );
}
