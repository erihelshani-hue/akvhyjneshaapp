import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EventRSVP } from "./EventRSVP";
import { EventDeleteButton } from "./EventDeleteButton";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTime, formatTimeRange } from "@/lib/utils";
import { MapPin, Clock, Shirt, Users, ExternalLink, ArrowLeft, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/types/database";

type ParticipantStatus = {
  id: string;
  fullName: string;
  status: AttendanceStatus | null;
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("event");
  const tCommon = await getTranslations("common");
  const tRsvp = await getTranslations("rsvp");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [eventRes, profileRes] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
  ]);

  if (!eventRes.data) notFound();

  const event = eventRes.data;
  const isAdmin = profileRes.data?.role === "admin";

  const { data: attendance } = await supabase
    .from("attendances")
    .select("status")
    .eq("user_id", user!.id)
    .eq("entity_type", "event")
    .eq("entity_id", id)
    .eq("entity_date", event.date)
    .single();

  const { count: yesCount } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("entity_type", "event")
    .eq("entity_id", id)
    .eq("entity_date", event.date)
    .eq("status", "yes");

  const [membersRes, attendancesRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name").order("full_name"),
    supabase
      .from("attendances")
      .select("user_id, status")
      .eq("entity_type", "event")
      .eq("entity_id", id)
      .eq("entity_date", event.date),
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

  const title = event.title;
  const notes = event.notes;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {tCommon("back")}
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="font-playfair text-3xl font-semibold text-foreground">{title}</h1>
            <Badge variant="outline" className="text-xs">{t(`type.${event.event_type}`)}</Badge>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-foreground/90">{formatDate(event.date)}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/events/${id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-zinc-600 hover:text-foreground" aria-label={t("edit")}>
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <EventDeleteButton eventId={id} />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="text-muted w-28">{t("time")}:</span>
          <span className="text-foreground">{formatTimeRange(event.time, event.end_time)}</span>
        </div>
        {event.meetup_time && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="text-muted w-28">{t("meetupTime")}:</span>
            <span className="text-foreground">{formatTime(event.meetup_time)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="text-muted w-28">{t("location")}:</span>
          <span className="text-foreground">{event.location}</span>
          {event.location_url && (
            <a
              href={event.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {t("locationLink")}
            </a>
          )}
        </div>
        {event.dress_code && (
          <div className="flex items-center gap-2 text-sm">
            <Shirt className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="text-muted w-28">{t("dressCode")}:</span>
            <span className="text-foreground">{event.dress_code}</span>
          </div>
        )}
        {notes && (
          <div className="flex items-start gap-2 text-sm pt-1">
            <span className="text-muted w-32 shrink-0">{t("notes")}:</span>
            <span className="text-foreground">{notes}</span>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("yourStatus")}</p>
        <EventRSVP
          entityId={id}
          eventDate={event.date}
          currentStatus={attendance?.status as AttendanceStatus ?? null}
          yesCount={yesCount ?? 0}
        />
      </div>

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
