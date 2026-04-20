"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateAttendanceAdmin } from "../actions";
import type { AttendanceStatus, EntityType } from "@/types/database";
import { Check } from "lucide-react";

type Member = { id: string; full_name: string; avatar_url: string | null };
type AttendanceMap = Record<string, AttendanceStatus | null>;

interface AttendanceEditorProps {
  entityType: EntityType;
  entityId: string;
  entityDate: string;
  members: Member[];
  initialAttendance: AttendanceMap;
}

const STATUS_OPTIONS: { value: AttendanceStatus | null; label: string; color: string }[] = [
  { value: "yes",   label: "Dabei",       color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  { value: "no",    label: "Nicht dabei", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  { value: "maybe", label: "Vielleicht",  color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  { value: null,    label: "Keine Ang.",  color: "text-muted bg-surface-2 border-border" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function AttendanceEditor({
  entityType,
  entityId,
  entityDate,
  members,
  initialAttendance,
}: AttendanceEditorProps) {
  const [attendance, setAttendance] = useState<AttendanceMap>(initialAttendance);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  async function handleChange(userId: string, status: AttendanceStatus | null) {
    setAttendance((prev) => ({ ...prev, [userId]: status }));
    setSaving((prev) => ({ ...prev, [userId]: true }));
    setSaved((prev) => ({ ...prev, [userId]: false }));

    startTransition(async () => {
      try {
        await updateAttendanceAdmin(entityType, entityId, entityDate, userId, status);
        setSaved((prev) => ({ ...prev, [userId]: true }));
        setTimeout(() => setSaved((prev) => ({ ...prev, [userId]: false })), 1500);
      } catch {
        setAttendance((prev) => ({ ...prev, [userId]: initialAttendance[userId] ?? null }));
      } finally {
        setSaving((prev) => ({ ...prev, [userId]: false }));
      }
    });
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const currentStatus = attendance[member.id] ?? null;
        const initials = getInitials(member.full_name);
        return (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface">
            <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-border bg-surface-2">
              {member.avatar_url ? (
                <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" sizes="32px" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="font-playfair text-[10px] font-semibold text-muted">{initials}</span>
                </div>
              )}
            </div>

            <p className="flex-1 min-w-0 text-sm text-foreground truncate">{member.full_name}</p>

            {/* Status selector */}
            <div className="flex gap-1 flex-wrap justify-end shrink-0">
              {STATUS_OPTIONS.map(({ value, label, color }) => {
                const isSelected = currentStatus === value;
                return (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => handleChange(member.id, value)}
                    disabled={saving[member.id]}
                    className={`text-[10px] font-medium px-2 py-1 rounded-md border transition-colors ${
                      isSelected
                        ? color
                        : "text-muted border-transparent hover:border-border hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            <div className="w-4 shrink-0">
              {saving[member.id] && (
                <div className="h-3 w-3 rounded-full border border-muted/40 border-t-muted animate-spin" />
              )}
              {saved[member.id] && !saving[member.id] && (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
