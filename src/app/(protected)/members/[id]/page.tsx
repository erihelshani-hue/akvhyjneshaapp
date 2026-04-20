import { notFound } from "next/navigation";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Cake, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { RoleBadge } from "@/components/RoleBadge";
import { formatBirthdayShort, isTodayBirthday } from "@/lib/birthday";
import { DanceIcon } from "@/components/icons/DanceIcon";

const DANCE_LABELS: Record<string, string> = {
  lirik: "Lirik",
  perdrin: "Perdrin",
  rugove: "Rugove",
  kollazh: "Kollazh",
  librazhd: "Librazhd",
  tropoje: "Tropojë",
};

function fmtMemberSince(date: string) {
  return new Date(date + "T12:00:00Z").toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supabase, role] = await Promise.all([createServiceClient(), getUserRole()]);

  const { data: member } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, birthday, email, favorite_dance, member_since, available_for_rehearsals, available_for_events, created_at")
    .eq("id", id)
    .single();

  if (!member) notFound();

  const initials = getInitials(member.full_name);
  const hasBirthdayToday = member.birthday ? isTodayBirthday(member.birthday) : false;
  const isAdmin = role === "admin";

  // Attendance stats
  const [{ data: rehearsals }, { data: events }, { data: attendances }] = await Promise.all([
    supabase.from("rehearsals").select("id").eq("is_archived", false),
    supabase.from("events").select("id"),
    supabase.from("attendances").select("entity_type, entity_id, status").eq("user_id", id),
  ]);

  const rehearsalIds = new Set((rehearsals ?? []).map((r) => r.id));
  const eventIds = new Set((events ?? []).map((e) => e.id));

  let rYes = 0, rNo = 0, rMaybe = 0;
  let eYes = 0, eNo = 0, eMaybe = 0;

  for (const a of attendances ?? []) {
    if (a.entity_type === "rehearsal" && rehearsalIds.has(a.entity_id)) {
      if (a.status === "yes") rYes++;
      else if (a.status === "no") rNo++;
      else rMaybe++;
    } else if (a.entity_type === "event" && eventIds.has(a.entity_id)) {
      if (a.status === "yes") eYes++;
      else if (a.status === "no") eNo++;
      else eMaybe++;
    }
  }

  const rTotal = rYes + rNo + rMaybe;
  const eTotal = eYes + eNo + eMaybe;

  return (
    <div className="max-w-lg space-y-6 animate-fade-in-up">
      <Link href="/members" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Mitglieder
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-surface-2">
              {member.avatar_url ? (
                <Image src={member.avatar_url} alt={member.full_name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="font-display text-2xl font-medium text-foreground">{initials}</span>
                </div>
              )}
            </div>
            {hasBirthdayToday && (
              <span className="absolute -top-1 -right-1 text-lg">🎉</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="font-display text-2xl font-medium text-foreground tracking-tight">{member.full_name}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <RoleBadge role={member.role} />
              {member.member_since && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  seit {fmtMemberSince(member.member_since)}
                </span>
              )}
            </div>
            {isAdmin && (
              <p className="text-xs text-muted mt-1">{member.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
        {member.favorite_dance && (
          <div className="flex items-center gap-3 px-5 py-3.5">
            <DanceIcon className="h-4 w-4 text-accent shrink-0" />
            <span className="text-xs text-muted w-28 shrink-0">Lieblingstanz</span>
            <span className="text-sm font-medium text-foreground">{DANCE_LABELS[member.favorite_dance] ?? member.favorite_dance}</span>
          </div>
        )}
        {member.birthday && (
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Cake className="h-4 w-4 text-muted shrink-0" />
            <span className="text-xs text-muted w-28 shrink-0">Geburtstag</span>
            <span className={`text-sm font-medium ${hasBirthdayToday ? "text-yellow-400" : "text-foreground"}`}>
              {formatBirthdayShort(member.birthday)}
              {hasBirthdayToday && " 🎂"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <DanceIcon className="h-4 w-4 text-muted shrink-0" />
          <span className="text-xs text-muted w-28 shrink-0">Proben</span>
          <div className="flex items-center gap-1.5">
            {member.available_for_rehearsals ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-foreground">
              {member.available_for_rehearsals ? "Verfügbar" : "Nicht verfügbar"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Calendar className="h-4 w-4 text-muted shrink-0" />
          <span className="text-xs text-muted w-28 shrink-0">Auftritte</span>
          <div className="flex items-center gap-1.5">
            {member.available_for_events ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-foreground">
              {member.available_for_events ? "Verfügbar" : "Nicht verfügbar"}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance stats */}
      {(rTotal > 0 || eTotal > 0) && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Anwesenheit</p>
          <div className="grid grid-cols-2 gap-4">
            {rTotal > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted">Proben</p>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((rYes / rTotal) * 100)}%` }} />
                </div>
                <p className="text-xs text-muted tabular-nums">
                  <span className="text-emerald-400 font-medium">{rYes}</span> / <span className="text-red-400">{rNo}</span> / <span>{rMaybe}?</span>
                  <span className="ml-1 text-dim">({Math.round((rYes / rTotal) * 100)}%)</span>
                </p>
              </div>
            )}
            {eTotal > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted">Auftritte</p>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((eYes / eTotal) * 100)}%` }} />
                </div>
                <p className="text-xs text-muted tabular-nums">
                  <span className="text-emerald-400 font-medium">{eYes}</span> / <span className="text-red-400">{eNo}</span> / <span>{eMaybe}?</span>
                  <span className="ml-1 text-dim">({Math.round((eYes / eTotal) * 100)}%)</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
