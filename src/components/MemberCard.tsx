"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { isTodayBirthday, formatBirthdayShort } from "@/lib/birthday";

interface MemberCardProps {
  member: Profile;
  isAdmin: boolean;
  currentUserId: string;
}

export function MemberCard({ member, isAdmin, currentUserId }: MemberCardProps) {
  const t = useTranslations("member");
  const [role, setRole] = useState(member.role);

  async function handleRoleChange(newRole: string) {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ role: newRole as "admin" | "member" })
      .eq("id", member.id);
    setRole(newRole as "admin" | "member");
  }

  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasBirthdayToday = member.birthday ? isTodayBirthday(member.birthday) : false;

  return (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border bg-surface transition-colors hover:border-border/80 ${
      hasBirthdayToday ? "border-accent/40" : "border-border"
    }`}>
      <Avatar className="h-10 w-10 shrink-0">
        {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name} />}
        <AvatarFallback className="font-playfair text-xs bg-surface-2 text-foreground border border-border">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
          <RoleBadge role={role} />
          {member.id === currentUserId && (
            <span className="text-[10px] font-medium text-muted bg-surface-2 px-1.5 py-0.5 rounded-full border border-border">
              {t("you")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted truncate mt-0.5">{member.email}</p>
        {member.birthday && (
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${
            hasBirthdayToday ? "text-accent" : "text-muted"
          }`}>
            <Cake className="h-3 w-3 shrink-0" />
            {formatBirthdayShort(member.birthday)}
            {hasBirthdayToday && " · Heute Geburtstag! 🎉"}
          </p>
        )}
      </div>

      {isAdmin && member.id !== currentUserId && (
        <div className="shrink-0">
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-28 text-xs h-8 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">{t("roleMember")}</SelectItem>
              <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
