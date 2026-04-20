"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { archiveEntity } from "../actions";
import { RotateCcw } from "lucide-react";

interface RestoreButtonProps {
  type: "rehearsal" | "event";
  id: string;
}

export function RestoreButton({ type, id }: RestoreButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRestore() {
    setError(null);
    startTransition(async () => {
      try {
        await archiveEntity(type, id, "restore");
      } catch {
        setError("Fehler beim Wiederherstellen.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRestore}
        disabled={isPending}
        className="gap-1.5 text-xs h-8"
      >
        <RotateCcw className="h-3 w-3" />
        {isPending ? "Wird wiederhergestellt…" : "Wiederherstellen"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
