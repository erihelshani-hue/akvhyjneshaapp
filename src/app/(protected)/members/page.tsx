import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { MemberCard } from "@/components/MemberCard";
import { isTodayBirthday, daysUntilBirthday, formatBirthdayShort } from "@/lib/birthday";
import { PartyPopper } from "lucide-react";
import type { Profile } from "@/types/database";

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().split("T")[0];
}

function currentMonthLabel() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toLocaleDateString("de-DE", { month: "long", timeZone: "UTC" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function TodayBirthdayCard({ member }: { member: Profile }) {
  const initials = getInitials(member.full_name);
  return (
    <div className="relative flex items-center gap-4 rounded-lg glass-gold px-5 py-4 overflow-hidden">
      <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border-2 border-gold/40 ring-2 ring-gold/20">
        {member.avatar_url ? (
          <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-white/[0.06]">
            <span className="font-display text-base font-medium text-foreground">{initials}</span>
          </div>
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-foreground truncate">{member.full_name}</p>
        <p className="text-xs text-gold mt-0.5 font-medium flex items-center gap-1.5">
          <PartyPopper className="h-3 w-3" />
          {member.birthday ? formatBirthdayShort(member.birthday) : ""} · Gëzuar ditëlindjen!
        </p>
      </div>
    </div>
  );
}

function UpcomingBirthdayRow({ member, daysUntil }: { member: Profile; daysUntil: number }) {
  const initials = getInitials(member.full_name);
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-white/10 bg-white/[0.04]">
        {member.avatar_url ? (
          <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-display text-xs font-semibold text-muted">{initials}</span>
          </div>
        )}
      </div>
      <p className="flex-1 min-w-0 text-sm font-medium text-foreground/90 truncate">{member.full_name}</p>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted font-medium">{member.birthday ? formatBirthdayShort(member.birthday) : ""}</p>
        <p className="text-[10px] text-gold/80 mt-0.5 font-semibold uppercase tracking-wider">
          {daysUntil === 1 ? "Morgen" : `in ${daysUntil} Tagen`}
        </p>
      </div>
    </div>
  );
}

export default async function MembersPage({}: Record<string, never>) {
  const t = await getTranslations("member");
  const [user, role, supabase, serviceClient] = await Promise.all([
    getUser(), getUserRole(), createClient(), createServiceClient(),
  ]);

  const month = currentMonthStart();
  const monthLabel = currentMonthLabel();

  const [{ data: membersData }, { data: contributions }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    serviceClient.from("member_contributions").select("user_id, amount_due, amount_paid").eq("contribution_month", month),
  ]);

  const isAdmin = role === "admin";
  const members: Profile[] = membersData ?? [];
  const contributionMap = new Map(
    (contributions ?? []).map((c) => [c.user_id, { paid: c.amount_paid >= c.amount_due && c.amount_due > 0, hasDue: c.amount_due > 0 }])
  );

  const todayBirthdays = members.filter((m) => m.birthday && isTodayBirthday(m.birthday));
  const nowUTC = new Date();
  const todayUTC = Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate());
  const upcomingBirthdays = members
    .filter((m) => {
      if (!m.birthday || isTodayBirthday(m.birthday)) return false;
      const [, bdMonth, bdDay] = m.birthday.split("-").map(Number);
      const birthdayThisYearUTC = Date.UTC(nowUTC.getUTCFullYear(), bdMonth - 1, bdDay);
      return bdMonth - 1 === nowUTC.getUTCMonth() && birthdayThisYearUTC > todayUTC;
    })
    .map((m) => ({ member: m, daysUntil: daysUntilBirthday(m.birthday!) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const hasBirthdaySections = todayBirthdays.length > 0 || upcomingBirthdays.length > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="brand-eyebrow mb-1.5">Anëtarët e ansamblit</p>
          <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted mt-1">{members.length} Mitglieder</p>
        </div>
      </header>
      {todayBirthdays.length > 0 && (
        <section className="space-y-3">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gold flex items-center gap-2">
            <PartyPopper className="h-3.5 w-3.5" />Heute Geburtstag
          </p>
          <div className="space-y-2.5">
            {todayBirthdays.map((member) => <TodayBirthdayCard key={member.id} member={member} />)}
          </div>
        </section>
      )}
      {upcomingBirthdays.length > 0 && (
        <section className="rounded-lg glass p-5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted mb-2">{monthLabel} Geburtstage</p>
          <div className="divide-y divide-white/5">
            {upcomingBirthdays.map(({ member, daysUntil }) => (
              <UpcomingBirthdayRow key={member.id} member={member} daysUntil={daysUntil} />
            ))}
          </div>
        </section>
      )}
      <section className="space-y-3">
        {hasBirthdaySections && (
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Alle Mitglieder</p>
        )}
        {members.length === 0 ? (
          <p className="text-sm text-muted">{t("noMembers")}</p>
        ) : (
          <div className="space-y-2.5 stagger">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                currentUserId={user!.id}
                contributionStatus={contributionMap.get(member.id) ?? null}
                contributionMonthLabel={monthLabel}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
