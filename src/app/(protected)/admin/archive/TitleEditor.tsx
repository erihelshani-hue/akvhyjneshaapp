"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateEntityTitle } from "../actions";

export function TitleEditor({
  type,
  id,
  initialTitle,
}: {
  type: "rehearsal" | "event";
  id: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialTitle);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setValue(initialTitle);
    setError(null);
    setEditing(false);
  }

  function save() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Titel darf nicht leer sein");
      return;
    }
    if (trimmed === initialTitle) {
      setEditing(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateEntityTitle(type, id, trimmed);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-2">
        <h2 className="font-playfair text-xl font-semibold text-foreground break-words">
          {initialTitle}
        </h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Titel bearbeiten"
          className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          disabled={pending}
          className="flex-1 min-w-0 font-playfair text-xl font-semibold bg-surface-2 border border-border rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent/60"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          aria-label="Speichern"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-50 transition-colors"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          aria-label="Abbrechen"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
