"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <Image
        src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
        alt="AKV Hyjnesha"
        width={64}
        height={64}
        className="rounded-full border border-border mb-6 opacity-60"
      />
      <h1 className="font-playfair text-2xl font-semibold text-foreground mb-2">
        Du bist offline · Je jeni offline
      </h1>
      <p className="text-muted text-sm max-w-xs mb-6">
        Bitte prüfe deine Internetverbindung und versuche es erneut.
        <br />
        Ju lutemi kontrolloni lidhjen tuaj me internetin.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleRetry}
          disabled={!isOnline}
          className={`px-4 py-3 border text-sm transition-colors ${
            isOnline
              ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              : "border-border text-muted cursor-not-allowed"
          }`}
        >
          {isOnline ? "Erneut versuchen · Provo përsëri" : "Warten auf Verbindung..."}
        </button>

        {isOnline && (
          <p className="text-xs text-muted">
            Verbindung erkannt - Seite wird neu geladen
          </p>
        )}
      </div>

      <div className="mt-8 max-w-xs text-xs text-white/80">
        <p className="mb-2">Offline-Features verfügbar:</p>
        <ul className="text-left space-y-1">
          <li>• Gespeicherte Daten anzeigen</li>
          <li>• Offline-Navigation</li>
          <li>• Automatische Synchronisation bei Verbindung</li>
        </ul>
      </div>
    </div>
  );
}
