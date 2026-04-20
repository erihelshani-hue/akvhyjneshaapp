import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { MemberCard } from "@/components/MemberCard";
import { InviteButton } from "./InviteButton";
import { isTodayBirthday, daysUntilBirthday, formatBirthdayShort } from "@/lib/birthday";
import type { Profile } from "@/types/database";

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .split("T")[0];
}

function currentMonthLabel() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toLocaleDateString("de-DE", {
    month: "long",
    timeZone: "UTC",
  });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function TodayBirthdayCard({ member }: { member: Profile }) {
  const initials = getInitials(member.full_name);
  return (
    <div className="flex items-center gap-4 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3.5">
      <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden border border-accent/30">
        {member.avatar_url ? (
          <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" sizes="44px" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-surface-2">
            <span className="font-playfair text-sm font-semibold text-foreground">{initials}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
        <p className="text-xs text-accent mt-0.5">
          {member.birthday ? formatBirthdayShort(member.birthday) : ""}
        </p>
      </div>
    </div>
  );
}

function UpcomingBirthdayRow({ member, daysUntil }: { member: Profile; daysUntil: number }) {
  const initials = getInitials(member.full_name);
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-border bg-surface-2">
        {member.avatar_url ? (
          <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" sizes="32px" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-playfair text-[11px] font-semibold text-muted">{initials}</span>
          </div>
        )}
      </div>
      <p className="flex-1 min-w-0 text-sm text-foreground truncate">{member.full_name}</p>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted">{member.birthday ? formatBirthdayShort(member.birthday) : ""}</p>
        <p className="text-xs text-muted mt-0.5">
          {daysUntil === 1 ? "Morgen" : `in ${daysUntil} Tagen`}
        </p>
      </div>
    </div>
  );
}

export default async function MembersPage({}: Record<string, never>) {
  const t = await getTranslations("member");
  const [user, role, supabase, serviceClient] = await Promise.all([
    getUser(),
    getUserRole(),
    createClient(),
    createServiceClient(),
  ]);

  const month = currentMonthStart();
  const monthLabel = currentMonthLabel();

  const [{ data: membersData }, { data: contributions }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    serviceClient
      .from("member_contributions")
      .select("user_id, amount_due, amount_paid")
      .eq("contribution_month", month),
  ]);

  const isAdmin = role === "admin";
  const members: Profile[] = membersData ?? [];

  const contributionMap = new Map(
    (contributions ?? []).map((c) => [
      c.user_id,
      { paid: c.amount_paid >= c.amount_due && c.amount_due > 0, hasDue: c.amount_due > 0 },
    ])
  );

  const todayBirthdays = members.filter((m) => m.birthday && isTodayBirthday(m.birthday));

  const upcomingBirthdays = members
    .filter((m) => m.birthday && !isTodayBirthday(m.birthday))
    .map((m) => ({ member: m, daysUntil: daysUntilBirthday(m.birthday!) }))
    .filter(({ daysUntil }) => daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const hasBirthdaySections = todayBirthdays.length > 0 || upcomingBirthdays.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground tracking-tight">
          {t("title")}
        </h1>
        {isAdmin && <InviteButton />}
      </div>

      {/* Today's birthdays */}
      {todayBirthdays.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Heute Geburtstag 🎂
          </p>
          <div className="space-y-2">
            {todayBirthdays.map((member) => (
              <TodayBirthdayCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming birthdays within 30 days */}
      {upcomingBirthdays.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            Nächste Geburtstage
          </p>
          {upcomingBirthdays.map(({ member, daysUntil }) => (
            <UpcomingBirthdayRow key={member.id} member={member} daysUntil={daysUntil} />
          ))}
        </section>
      )}

      {/* All members */}
      <section className="space-y-3">
        {hasBirthdaySections && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Alle Mitglieder
          </p>
        )}
        {members.length === 0 ? (
          <p className="text-sm text-muted">{t("noMembers")}</p>
        ) : (
          <div className="space-y-2">
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
