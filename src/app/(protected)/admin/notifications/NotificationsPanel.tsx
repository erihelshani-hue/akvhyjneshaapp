"use client";

import { useState, useTransition } from "react";
import { Bell, Send, RefreshCw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerBirthdayNotifications, sendCustomPushNotification } from "./actions";

interface Props {
  todayBirthdays: string[];
}

export function NotificationsPanel({ todayBirthdays }: Props) {
  const [birthdayResult, setBirthdayResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [customResult, setCustomResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [isBirthdayPending, startBirthdayTransition] = useTransition();
  const [isCustomPending, startCustomTransition] = useTransition();

  function handleBirthdayTrigger() {
    startBirthdayTransition(async () => {
      const result = await triggerBirthdayNotifications();
      setBirthdayResult(result);
    });
  }

  function handleCustomSend(e: React.FormEvent) {
    e.preventDefault();
    startCustomTransition(async () => {
      const result = await sendCustomPushNotification(customTitle, customBody);
      setCustomResult(result);
      if (result.ok) {
        setCustomTitle("");
        setCustomBody("");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Birthday notifications */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 shrink-0">
            <PartyPopper className="h-4.5 w-4.5 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Geburtstags-Benachrichtigung</h2>
            <p className="text-xs text-muted mt-0.5">
              Sendet die automatische Geburstagsbenachrichtigung für heute manuell an alle Mitglieder.
            </p>
          </div>
        </div>

        {todayBirthdays.length > 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/15">
            <PartyPopper className="h-3.5 w-3.5 text-accent shrink-0" />
            <p className="text-xs text-foreground">
              Heute: <span className="font-medium">{todayBirthdays.join(", ")}</span>
            </p>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-surface-2 border border-border">
            <p className="text-xs text-muted">
              Heute hat laut Datenbank niemand Geburtstag. Bitte prüfe ob der Geburtstag eingetragen ist.
            </p>
          </div>
        )}

        {birthdayResult && (
          <p className={`text-xs px-3 py-2 rounded-lg border ${
            birthdayResult.ok
              ? "text-green-400 bg-green-950/20 border-green-900/30"
              : "text-red-400 bg-red-950/20 border-red-900/30"
          }`}>
            {birthdayResult.message}
          </p>
        )}

        <Button
          onClick={handleBirthdayTrigger}
          disabled={isBirthdayPending || todayBirthdays.length === 0}
          size="sm"
          className="gap-2"
        >
          {isBirthdayPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {isBirthdayPending ? "Wird gesendet…" : "Jetzt senden"}
        </Button>
      </div>

      {/* Custom notification */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 border border-border shrink-0">
            <Bell className="h-4.5 w-4.5 text-muted" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Benutzerdefinierte Benachrichtigung</h2>
            <p className="text-xs text-muted mt-0.5">
              Sendet eine eigene Push-Benachrichtigung an alle Mitglieder mit aktivierten Benachrichtigungen.
            </p>
          </div>
        </div>

        <form onSubmit={handleCustomSend} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="push-title" className="text-xs">Titel</Label>
            <Input
              id="push-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="z.B. 📢 Wichtige Mitteilung"
              required
              maxLength={64}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="push-body" className="text-xs">Nachricht</Label>
            <Input
              id="push-body"
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="z.B. Probe findet morgen statt!"
              required
              maxLength={160}
            />
          </div>

          {customResult && (
            <p className={`text-xs px-3 py-2 rounded-lg border ${
              customResult.ok
                ? "text-green-400 bg-green-950/20 border-green-900/30"
                : "text-red-400 bg-red-950/20 border-red-900/30"
            }`}>
              {customResult.message}
            </p>
          )}

          <Button type="submit" disabled={isCustomPending} size="sm" className="gap-2">
            {isCustomPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isCustomPending ? "Wird gesendet…" : "Senden"}
          </Button>
        </form>
      </div>
    </div>
  );
}
