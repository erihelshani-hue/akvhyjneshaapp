"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { addChecklistItem, deleteChecklistItem, toggleChecklistItem } from "./checklist-actions";

type ChecklistItem = {
  id: string;
  label: string;
  is_done: boolean;
  sort_order: number;
};

const QUICK_ITEMS = ["Tracht", "Treffpunkt", "Bus organisiert", "Instrumente", "Programm", "Notenblätter", "Verpflegung", "Fotos/Video"];

export function EventChecklist({
  eventId,
  items: initialItems,
  isAdmin,
}: {
  eventId: string;
  items: ChecklistItem[];
  isAdmin: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  const doneCount = items.filter((i) => i.is_done).length;

  function handleToggle(item: ChecklistItem) {
    if (!isAdmin) return;
    const next = !item.is_done;
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_done: next } : i));
    startTransition(async () => {
      try {
        await toggleChecklistItem(item.id, next, eventId);
      } catch {
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_done: item.is_done } : i));
      }
    });
  }

  function handleDelete(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => {
      try {
        await deleteChecklistItem(itemId, eventId);
      } catch {
        setItems(initialItems);
      }
    });
  }

  function handleAdd(label: string) {
    if (!label.trim()) return;
    const tempId = `temp-${Date.now()}`;
    const newItem: ChecklistItem = { id: tempId, label: label.trim(), is_done: false, sort_order: items.length };
    setItems((prev) => [...prev, newItem]);
    setNewLabel("");
    setAdding(false);
    startTransition(async () => {
      try {
        await addChecklistItem(eventId, label.trim(), items.length);
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== tempId));
      }
    });
  }

  if (items.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs uppercase tracking-widest text-muted">Checkliste</p>
          {items.length > 0 && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              doneCount === items.length
                ? "bg-emerald-400/15 text-emerald-400"
                : "bg-surface-2 text-muted"
            }`}>
              {doneCount}/{items.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
        >
          {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {adding ? "Abbrechen" : "Hinzufügen"}
        </button>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((doneCount / items.length) * 100)}%` }}
          />
        </div>
      )}

      {/* Items */}
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 group">
              <button
                type="button"
                onClick={() => handleToggle(item)}
                disabled={!isAdmin || isPending}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  item.is_done
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : isAdmin
                      ? "border-border hover:border-border-strong text-transparent hover:text-muted"
                      : "border-border text-transparent"
                }`}
              >
                <Check className="h-3 w-3" />
              </button>
              <span className={`flex-1 text-sm transition-colors ${item.is_done ? "line-through text-muted" : "text-foreground"}`}>
                {item.label}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      {adding && (
        <div className="space-y-2 pt-1">
          {/* Quick-add buttons */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ITEMS.filter((q) => !items.some((i) => i.label === q)).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAdd(q)}
                className="text-xs px-2.5 py-1 rounded-full border border-border text-muted hover:border-border-strong hover:text-foreground transition-colors"
              >
                + {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd(newLabel)}
              placeholder="Eigener Punkt..."
              className="flex-1 h-9 rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent/50"
              autoFocus
            />
            <button
              type="button"
              onClick={() => handleAdd(newLabel)}
              disabled={!newLabel.trim()}
              className="h-9 px-4 rounded-md bg-accent text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-opacity"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-xs text-muted italic">Noch keine Punkte. Füge die erste Aufgabe hinzu.</p>
      )}
    </div>
  );
}
