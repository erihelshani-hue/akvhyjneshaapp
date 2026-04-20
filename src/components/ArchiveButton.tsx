"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { archiveEntity } from "@/app/(protected)/admin/actions";
import { Archive, RotateCcw } from "lucide-react";

interface ArchiveButtonProps {
  type: "rehearsal" | "event";
  id: string;
  isArchived: boolean;
}

export function ArchiveButton({ type, id, isArchived }: ArchiveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      try {
        await archiveEntity(type, id, isArchived ? "restore" : "archive");
      } catch {
        setError("Fehler beim Archivieren.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        className="h-9 w-9 rounded-lg"
        title={isArchived ? "Wiederherstellen" : "Archivieren"}
      >
        {isArchived ? (
          <RotateCcw className="h-3.5 w-3.5" />
        ) : (
          <Archive className="h-3.5 w-3.5" />
        )}
      </Button>
      {error && <p className="text-xs text-red-400 max-w-[80px]">{error}</p>}
    </div>
  );
}
