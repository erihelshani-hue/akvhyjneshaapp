import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { getRehearsalById } from "@/lib/cached-data";
import { getOccurrencesForRehearsal } from "@/lib/recurring";
import { RecurringTag } from "@/components/RecurringTag";
import { RehearsalDeleteButton } from "./RehearsalDeleteButton";
import { RehearsalRSVP } from "./RehearsalRSVP";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTimeRange } from "@/lib/utils";
import { Edit, MapPin, Clock, ArrowLeft } from "lucide-react";
import { ArchiveButton } from "@/components/ArchiveButton";
import Image from "next/image";
import type { AttendanceStatus } from "@/types/database";

type ParticipantStatus = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  status: AttendanceStatus | null;
};

const STATUS_ORDER: (AttendanceStatus | null)[] = ["yes", "no", "maybe", null];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function RehearsalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: queryDate } = await searchParams;
  const t = await getTranslations("rehearsal");
  const tCommon = await getTranslations("common");
  const tRsvp = await getTranslations("rsvp");
  const supabase = await createClient();

  const [user, role, rehearsal] = await Promise.all([
    getUser(),
    getUserRole(),
    getRehearsalById(id),
  ]);

  if (!rehearsal) notFound();
  const isAdmin = role === "admin";

  const occurrences = getOccurrencesForRehearsal(rehearsal, 8);
  const targetDate = queryDate ?? occurrences[0]?.date ?? rehearsal.date;

  const { data: attendance } = await supabase
    .from("attendances")
    .select("status")
    .eq("user_id", user!.id)
    .eq("entity_type", "rehearsal")
    .eq("entity_id", id)
    .eq("entity_date", targetDate)
    .single();

  const [{ count: yesCount }, { count: noCount }] = await Promise.all([
    supabase
      .from("attendances")
      .select("*", { count: "exact", head: true })
      .eq("entity_type", "rehearsal")
      .eq("entity_id", id)
      .eq("entity_date", targetDate)
      .eq("status", "yes"),
    supabase
      .from("attendances")
      .select("*", { count: "exact", head: true })
      .eq("entity_type", "rehearsal")
      .eq("entity_id", id)
      .eq("entity_date", targetDate)
      .eq("status", "no"),
  ]);

  const serviceClient = await createServiceClient();
  const [membersRes, attendancesRes] = await Promise.all([
    serviceClient.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    serviceClient
      .from("attendances")
      .select("user_id, status")
      .eq("entity_type", "rehearsal")
      .eq("entity_id", id)
      .eq("entity_date", targetDate),
  ]);

  const statusByUser = new Map<string, AttendanceStatus>(
    (attendancesRes.data ?? []).map((item: { user_id: string; status: AttendanceStatus }) => [
      item.user_id,
      item.status,
    ])
  );

  const allParticipants: ParticipantStatus[] = (membersRes.data ?? []).map(
    (member: { id: string; full_name: string; avatar_url: string | null }) => ({
      id: member.id,
      fullName: member.full_name,
      avatarUrl: member.avatar_url ?? null,
      status: statusByUser.get(member.id) ?? null,
    })
  );

  const groups = STATUS_ORDER
    .map((status) => ({
      status,
      members: allParticipants.filter((p) => p.status === status),
    }))
    .filter((g) => g.members.length > 0);

  const noAnswerCount = allParticipants.filter((p) => !p.status).length;

  const title = rehearsal.title;
  const notes = rehearsal.notes;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/rehearsals" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {tCommon("back")}
      </Link>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-playfair text-3xl font-semibold text-foreground">
            {title}
          </h1>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link href={`/rehearsals/${id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-zinc-600 hover:text-foreground" aria-label={t("edit")}>
                <Edit className="h-3.5 w-3.5" />
              </Link>
              <ArchiveButton type="rehearsal" id={id} isArchived={rehearsal.is_archived} />
              <RehearsalDeleteButton rehearsalId={id} />
            </div>
          )}
        </div>
        {rehearsal.is_recurring && <RecurringTag />}
      </div>

      {rehearsal.is_recurring && occurrences.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">{t("recurring")}</p>
          <div className="flex flex-wrap gap-2">
            {occurrences.map((occ) => (
              <Link
                key={occ.date}
                href={`/rehearsals/${id}?date=${occ.date}`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  occ.date === targetDate
                    ? "border-accent/60 bg-accent/10 text-foreground font-medium"
                    : "border-border text-muted hover:border-zinc-600 hover:text-foreground"
                }`}
              >
                {formatDate(occ.date)}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted w-20 shrink-0">{t("form.date")}:</span>
          <span className="text-foreground">{formatDate(targetDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted w-20 shrink-0">{t("time")}:</span>
          <span className="text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted" />
            {formatTimeRange(rehearsal.recurrence_time ?? rehearsal.time, rehearsal.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted w-20 shrink-0">{t("location")}:</span>
          <span className="text-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted" />
            {rehearsal.location}
          </span>
        </div>
        {notes && (
          <div className="flex items-start gap-2 text-sm pt-1">
            <span className="text-muted w-20 shrink-0 pt-0.5">{t("notes")}:</span>
            <span className="text-foreground">{notes}</span>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("yourStatus")}</p>
        <RehearsalRSVP
          entityId={id}
          entityDate={targetDate}
          currentStatus={attendance?.status as AttendanceStatus ?? null}
          yesCount={yesCount ?? 0}
          noCount={noCount ?? 0}
        />
      </div>

      {/* Participant breakdown — grouped like WhatsApp votes */}
      {allParticipants.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("attendees")}</p>
              {noAnswerCount > 0 && (
                <p className="text-xs text-muted">{tRsvp("noAnswerCount", { count: noAnswerCount })}</p>
              )}
            </div>

            {groups.map(({ status, members }) => {
              const label =
                status === "yes" ? tRsvp("yes")
                : status === "no" ? tRsvp("no")
                : status === "maybe" ? tRsvp("maybe")
                : tRsvp("noAnswer");

              const headerColor =
                status === "yes" ? "text-emerald-400"
                : status === "no" ? "text-red-400"
                : "text-muted";

              return (
                <div key={status ?? "none"}>
                  {/* Group header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${headerColor}`}>
                      {label}
                    </span>
                    <span className="text-[11px] text-muted font-medium">
                      {members.length}
                    </span>
                  </div>

                  {/* Members */}
                  <div className="space-y-1">
                    {members.map((p) => (
                      <ParticipantRow key={p.id} participant={p} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ParticipantRow({ participant }: { participant: ParticipantStatus }) {
  const initials = getInitials(participant.fullName);
  return (
    <div className="flex items-center gap-3 py-1.5">
      {/* Avatar */}
      <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-border bg-surface-2">
        {participant.avatarUrl ? (
          <Image
            src={participant.avatarUrl}
            alt={participant.fullName}
            fill
            className="object-cover"
            sizes="32px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-[11px] font-semibold text-muted">
              {initials}
            </span>
          </div>
        )}
      </div>
      {/* Name */}
      <span className="text-sm text-foreground flex-1 min-w-0 truncate">
        {participant.fullName}
      </span>
    </div>
  );
}
