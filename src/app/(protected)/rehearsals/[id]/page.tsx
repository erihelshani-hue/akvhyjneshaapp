import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOccurrencesForRehearsal } from "@/lib/recurring";
import { RecurringTag } from "@/components/RecurringTag";
import { RehearsalDeleteButton } from "./RehearsalDeleteButton";
import { RehearsalRSVP } from "./RehearsalRSVP";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTimeRange } from "@/lib/utils";
import { Edit, MapPin, Clock, ArrowLeft } from "lucide-react";
import type { AttendanceStatus } from "@/types/database";

type ParticipantStatus = {
  id: string;
  fullName: string;
  status: AttendanceStatus | null;
};

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

  const { data: { user } } = await supabase.auth.getUser();
  const [rehearsalRes, profileRes] = await Promise.all([
    supabase.from("rehearsals").select("*").eq("id", id).single(),
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
  ]);

  if (!rehearsalRes.data) notFound();

  const rehearsal = rehearsalRes.data;
  const isAdmin = profileRes.data?.role === "admin";

  const occurrences = getOccurrencesForRehearsal(rehearsal, 8);
  const targetDate = queryDate ?? occurrences[0]?.date ?? rehearsal.date;

  // Get attendance for this occurrence
  const { data: attendance } = await supabase
    .from("attendances")
    .select("status")
    .eq("user_id", user!.id)
    .eq("entity_type", "rehearsal")
    .eq("entity_id", id)
    .eq("entity_date", targetDate)
    .single();

  // Count yes responses
  const { count: yesCount } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("entity_type", "rehearsal")
    .eq("entity_id", id)
    .eq("entity_date", targetDate)
    .eq("status", "yes");

  const [membersRes, attendancesRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name").order("full_name"),
    supabase
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
  const participants: ParticipantStatus[] = (membersRes.data ?? []).map((member: { id: string; full_name: string }) => ({
    id: member.id,
    fullName: member.full_name,
    status: statusByUser.get(member.id) ?? null,
  }));
  const noAnswerCount = participants.filter((participant) => !participant.status).length;

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
              <RehearsalDeleteButton rehearsalId={id} />
            </div>
          )}
        </div>
        {rehearsal.is_recurring && <RecurringTag />}
      </div>

      {/* Occurrence selector for recurring */}
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

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted w-20 shrink-0">{t("time")}:</span>
          <span className="text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted" />
            {formatDate(targetDate)} {tCommon("at")} {formatTimeRange(rehearsal.recurrence_time ?? rehearsal.time, rehearsal.end_time)}
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
          <div className="flex items-start gap-2 text-sm">
            <span className="text-muted w-20 shrink-0 pt-0.5">{t("notes")}:</span>
            <span className="text-foreground">{notes}</span>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* RSVP */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("yourStatus")}</p>
        <RehearsalRSVP
          entityId={id}
          entityDate={targetDate}
          currentStatus={attendance?.status as AttendanceStatus ?? null}
          yesCount={yesCount ?? 0}
        />
      </div>

      {/* Participant breakdown */}
      {participants.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("attendees")}</p>
              <p className="text-xs text-muted">{tRsvp("noAnswerCount", { count: noAnswerCount })}</p>
            </div>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{participant.fullName}</span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    participant.status === "yes"
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                      : participant.status === "no"
                        ? "text-red-400 bg-red-400/10 border-red-400/20"
                        : participant.status === "maybe"
                          ? "text-foreground bg-surface-2 border-border"
                          : "text-muted bg-surface-2 border-border"
                  }`}>
                    {participant.status === "yes"
                      ? tRsvp("yes")
                      : participant.status === "no"
                        ? tRsvp("no")
                        : participant.status === "maybe"
                          ? tRsvp("maybe")
                          : tRsvp("noAnswer")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
