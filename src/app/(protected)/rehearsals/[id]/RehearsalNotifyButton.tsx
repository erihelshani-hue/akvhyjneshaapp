"use client";

import { useState, useTransition } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { sendRehearsalNotifications } from "../actions";

interface Props {
  rehearsalId: string;
  targetDate: string;
  rehearsalTitle: string;
}

export function RehearsalNotifyButton({ rehearsalId, targetDate, rehearsalTitle }: Props) {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await sendRehearsalNotifications(rehearsalId, targetDate, rehearsalTitle);
      setResult(res);
      // Auto-hide after 5s
      setTimeout(() => setResult(null), 5000);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-zinc-600 hover:text-foreground disabled:opacity-50"
        aria-label="Probe-Benachrichtigung senden"
        title="Probe-Erinnerung an alle senden"
      >
        {isPending ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Bell className="h-3.5 w-3.5" />
        )}
      </button>

      {result && (
        <div
          className={`absolute right-0 top-11 z-50 w-72 rounded-lg border p-3 text-xs shadow-lg ${
            result.ok
              ? "border-green-900/30 bg-green-950/80 text-green-300"
              : "border-red-900/30 bg-red-950/80 text-red-300"
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
