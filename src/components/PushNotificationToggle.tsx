"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";

export function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    const timeout = setTimeout(() => setStatus("unsubscribed"), 3000);
    navigator.serviceWorker.ready.then((reg) => {
      clearTimeout(timeout);
      reg.pushManager.getSubscription().then((sub) =>
        setStatus(sub ? "subscribed" : "unsubscribed")
      );
    });
    return () => clearTimeout(timeout);
  }, []);

  async function subscribe() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "unsubscribed");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("Push subscribe error:", err);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setStatus("unsubscribed");
    } catch (err) {
      console.error("Push unsubscribe error:", err);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;

  if (status === "unsupported") {
    return (
      <p className="text-sm text-muted">
        Dein Browser unterstützt keine Push-Benachrichtigungen.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <div className="space-y-1">
        <p className="text-sm text-foreground font-medium">Benachrichtigungen blockiert</p>
        <p className="text-xs text-muted leading-relaxed">
          Bitte erlaube Benachrichtigungen in den Browser-Einstellungen und lade die Seite neu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          {status === "subscribed" ? "Benachrichtigungen aktiv" : "Benachrichtigungen"}
        </p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">
          {status === "subscribed"
            ? "Du erhältst Benachrichtigungen bei neuen Proben, Veranstaltungen und Ankündigungen."
            : "Bleib auf dem Laufenden — aktiviere Push-Benachrichtigungen."}
        </p>
      </div>
      {status === "subscribed" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={unsubscribe}
          disabled={busy}
          className="shrink-0 gap-2"
        >
          <BellOff className="h-3.5 w-3.5" />
          Deaktivieren
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={subscribe}
          disabled={busy}
          className="shrink-0 gap-2"
        >
          <Bell className="h-3.5 w-3.5" />
          Aktivieren
        </Button>
      )}
    </div>
  );
}
