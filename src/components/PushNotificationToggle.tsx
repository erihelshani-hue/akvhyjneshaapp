"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status =
  | "checking"
  | "unsupported"
  | "permission_denied"
  | "worker_missing"
  | "registering"
  | "unsubscribed"
  | "subscribing"
  | "subscribed"
  | "error";

const PUSH_LOG_PREFIX = "[Push]";

function logPush(message: string, details?: unknown) {
  if (details === undefined) {
    console.info(PUSH_LOG_PREFIX, message);
  } else {
    console.info(PUSH_LOG_PREFIX, message, details);
  }
}

function logPushError(message: string, error: unknown) {
  console.error(PUSH_LOG_PREFIX, message, error);
}

class PushSetupError extends Error {
  status: Status;

  constructor(status: Status, message: string) {
    super(message);
    this.name = "PushSetupError";
    this.status = status;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

function isPushSupported() {
  const supported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    window.isSecureContext;

  logPush("Support check", {
    secureContext: typeof window !== "undefined" ? window.isSecureContext : false,
    notification: typeof window !== "undefined" && "Notification" in window,
    serviceWorker: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    pushManager: typeof window !== "undefined" && "PushManager" in window,
    standalone:
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches,
  });

  return supported;
}

async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new PushSetupError("unsupported", "Service Worker API is not available.");
  }

  logPush("Checking existing service worker registration");
  let registration = await navigator.serviceWorker.getRegistration();
  logPush("Existing registration lookup finished", {
    found: Boolean(registration),
    scope: registration?.scope,
    active: Boolean(registration?.active),
    installing: Boolean(registration?.installing),
    waiting: Boolean(registration?.waiting),
  });

  if (!registration) {
    try {
      logPush("No registration found; registering /sw.js with scope /");
      registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      logPush("Service worker registration succeeded", {
        scope: registration.scope,
        active: Boolean(registration.active),
        installing: Boolean(registration.installing),
        waiting: Boolean(registration.waiting),
      });
    } catch (error) {
      logPushError("Service worker registration failed", error);
      throw new PushSetupError("worker_missing", "Service worker registration failed.");
    }
  }

  try {
    logPush("Waiting for navigator.serviceWorker.ready");
    const readyRegistration = await navigator.serviceWorker.ready;
    logPush("navigator.serviceWorker.ready resolved", {
      scope: readyRegistration.scope,
      active: Boolean(readyRegistration.active),
      controller: Boolean(navigator.serviceWorker.controller),
    });

    if (!("pushManager" in readyRegistration)) {
      throw new PushSetupError("unsupported", "PushManager is not available on the registration.");
    }

    return readyRegistration;
  } catch (error) {
    if (error instanceof PushSetupError) throw error;
    logPushError("Service worker ready wait failed", error);
    throw new PushSetupError("worker_missing", "Service worker never became ready.");
  }
}

function subscriptionToBody(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  };
}

export function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [testBusy, setTestBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      if (typeof window === "undefined") return;

      if (!isPushSupported()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        logPush("Notification permission is denied");
        if (!cancelled) setStatus("permission_denied");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        logPush("Initial registration status", {
          found: Boolean(registration),
          scope: registration?.scope,
          controller: Boolean(navigator.serviceWorker.controller),
        });

        if (!registration) {
          if (!cancelled) setStatus("unsubscribed");
          return;
        }

        const subscription = await registration.pushManager.getSubscription();
        logPush("Initial getSubscription result", {
          subscribed: Boolean(subscription),
          endpoint: subscription?.endpoint,
        });

        if (!cancelled) setStatus(subscription ? "subscribed" : "unsubscribed");
      } catch (error) {
        logPushError("Initial push status check failed", error);
        if (!cancelled) {
          setStatus("error");
          setMessage("Push-Status konnte nicht geprueft werden.");
        }
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  async function subscribe() {
    setBusy(true);
    setMessage(null);

    try {
      if (!isPushSupported()) {
        setStatus("unsupported");
        return;
      }

      logPush("Requesting notification permission", {
        currentPermission: Notification.permission,
      });
      const permission = await Notification.requestPermission();
      logPush("Notification permission result", permission);

      if (permission !== "granted") {
        setStatus(permission === "denied" ? "permission_denied" : "unsubscribed");
        return;
      }

      setStatus("registering");
      const registration = await getOrRegisterServiceWorker();

      setStatus("subscribing");
      let subscription = await registration.pushManager.getSubscription();
      let createdSubscription = false;
      logPush("getSubscription before subscribe", {
        subscribed: Boolean(subscription),
        endpoint: subscription?.endpoint,
      });

      if (!subscription) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) {
          throw new PushSetupError("error", "Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        }

        logPush("Creating push subscription");
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        createdSubscription = true;
        logPush("pushManager.subscribe succeeded", {
          endpoint: subscription.endpoint,
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionToBody(subscription)),
      });

      const responseBody = await response.json().catch(() => null);
      logPush("/api/push/subscribe response", {
        ok: response.ok,
        status: response.status,
        body: responseBody,
      });

      if (!response.ok) {
        if (createdSubscription) {
          await subscription.unsubscribe().catch((error) => {
            logPushError("Cleanup unsubscribe after failed server save failed", error);
          });
        }
        throw new PushSetupError("error", "Subscription could not be saved on the server.");
      }

      setStatus("subscribed");
      setMessage("Benachrichtigungen sind aktiv.");
    } catch (error) {
      logPushError("Push subscribe failed", error);
      setStatus(error instanceof PushSetupError ? error.status : "error");
      setMessage(
        error instanceof PushSetupError
          ? error.message
          : "Benachrichtigungen konnten nicht aktiviert werden."
      );
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMessage(null);

    try {
      const registration = await getOrRegisterServiceWorker();
      const subscription = await registration.pushManager.getSubscription();
      logPush("Unsubscribe getSubscription result", {
        subscribed: Boolean(subscription),
        endpoint: subscription?.endpoint,
      });

      if (subscription) {
        const response = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        const responseBody = await response.json().catch(() => null);
        logPush("/api/push/subscribe DELETE response", {
          ok: response.ok,
          status: response.status,
          body: responseBody,
        });

        if (!response.ok) {
          throw new PushSetupError("error", "Subscription could not be removed on the server.");
        }

        await subscription.unsubscribe();
      }

      setStatus("unsubscribed");
      setMessage("Benachrichtigungen wurden deaktiviert.");
    } catch (error) {
      logPushError("Push unsubscribe failed", error);
      setStatus(error instanceof PushSetupError ? error.status : "error");
      setMessage(
        error instanceof PushSetupError
          ? error.message
          : "Benachrichtigungen konnten nicht deaktiviert werden."
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendTestNotification() {
    setTestBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const responseBody = await response.json().catch(() => null);
      logPush("/api/push/test response", {
        ok: response.ok,
        status: response.status,
        body: responseBody,
      });

      if (!response.ok) {
        throw new Error(responseBody?.error ?? "Test notification failed.");
      }

      setMessage("Test-Benachrichtigung wurde gesendet.");
    } catch (error) {
      logPushError("Test notification failed", error);
      setMessage("Test-Benachrichtigung konnte nicht gesendet werden.");
    } finally {
      setTestBusy(false);
    }
  }

  if (status === "checking") return null;

  if (status === "unsupported") {
    return (
      <p className="text-sm text-muted">
        Dein Browser unterstuetzt keine Push-Benachrichtigungen oder die App laeuft
        nicht in einem sicheren Kontext.
      </p>
    );
  }

  if (status === "permission_denied") {
    return (
      <div className="space-y-1">
        <p className="text-sm text-foreground font-medium">Benachrichtigungen blockiert</p>
        <p className="text-xs text-muted leading-relaxed">
          Bitte erlaube Benachrichtigungen in den iOS-Einstellungen der Home-Screen-App
          und oeffne die App danach neu.
        </p>
      </div>
    );
  }

  const title = status === "subscribed" ? "Benachrichtigungen aktiv" : "Benachrichtigungen";
  const description =
    status === "subscribed"
      ? "Du erhaeltst Benachrichtigungen bei neuen Proben, Veranstaltungen und Ankuendigungen."
      : status === "registering"
        ? "Service Worker wird registriert..."
        : status === "subscribing"
          ? "Push-Subscription wird erstellt..."
          : status === "worker_missing"
            ? "Der Service Worker konnte nicht registriert werden."
            : status === "error"
              ? "Beim Einrichten der Benachrichtigungen ist ein Fehler aufgetreten."
              : "Bleib auf dem Laufenden und aktiviere Push-Benachrichtigungen.";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
        {status === "subscribed" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={unsubscribe}
            disabled={busy || testBusy}
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
            disabled={busy || status === "registering" || status === "subscribing"}
            className="shrink-0 gap-2"
          >
            <Bell className="h-3.5 w-3.5" />
            {status === "registering" || status === "subscribing" ? "Aktiviert..." : "Aktivieren"}
          </Button>
        )}
      </div>

      {status === "subscribed" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={sendTestNotification}
          disabled={busy || testBusy}
          className="gap-2"
        >
          <Send className="h-3.5 w-3.5" />
          {testBusy ? "Test wird gesendet..." : "Test-Benachrichtigung senden"}
        </Button>
      )}

      {message && (
        <p className="text-xs text-muted leading-relaxed" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
