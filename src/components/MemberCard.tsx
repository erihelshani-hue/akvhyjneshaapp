"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cake, PartyPopper } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { isTodayBirthday, formatBirthdayShort } from "@/lib/birthday";

interface ContributionStatus {
  paid: boolean;
  hasDue: boolean;
}

interface MemberCardProps {
  member: Profile;
  isAdmin: boolean;
  currentUserId: string;
  contributionStatus?: ContributionStatus | null;
  contributionMonthLabel?: string;
}

export function MemberCard({ member, isAdmin, currentUserId, contributionStatus, contributionMonthLabel }: MemberCardProps) {
  const t = useTranslations("member");
  const [role, setRole] = useState(member.role);

  async function handleRoleChange(newRole: string) {
    const supabase = createClient();
    await supabase.from("profiles").update({ role: newRole as "admin" | "member" }).eq("id", member.id);
    setRole(newRole as "admin" | "member");
  }

  const initials = member.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const hasBirthdayToday = member.birthday ? isTodayBirthday(member.birthday) : false;

  return (
    <div className={`flex items-center gap-4 px-4 py-4 rounded-sm glass transition-all duration-200 hover:border-border-strong ${hasBirthdayToday ? "!border-gold/40 !bg-gold/[0.04]" : ""}`}>
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 ring-1 ring-border-strong">
          {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name} />}
          <AvatarFallback className="font-display text-sm font-medium bg-surface-2 text-foreground">{initials}</AvatarFallback>
        </Avatar>
        {hasBirthdayToday && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-background">
            <PartyPopper className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-semibold text-foreground truncate">{member.full_name}</p>
          <RoleBadge role={role} />
          {member.id === currentUserId && (
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/25">
              {t("you")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted truncate mt-0.5">{member.email}</p>
        {member.birthday && (
          <p className={`text-xs mt-1 flex items-center gap-1.5 font-medium ${hasBirthdayToday ? "text-gold" : "text-muted"}`}>
            <Cake className="h-3 w-3 shrink-0" />
            {formatBirthdayShort(member.birthday)}
            {hasBirthdayToday && <span className="text-gold font-semibold">· Heute Geburtstag!</span>}
          </p>
        )}
        {contributionStatus?.hasDue && contributionMonthLabel && (
          <p className={`text-xs mt-1 font-medium flex items-center gap-1.5 ${contributionStatus.paid ? "text-emerald-400" : "text-red-400"}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${contributionStatus.paid ? "bg-emerald-400" : "bg-red-400"}`} />
            Beitrag {contributionMonthLabel}: {contributionStatus.paid ? "bezahlt" : "offen"}
          </p>
        )}
      </div>
      {isAdmin && member.id !== currentUserId && (
        <div className="shrink-0">
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[110px] text-xs h-9 rounded-sm bg-surface border-border">
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
