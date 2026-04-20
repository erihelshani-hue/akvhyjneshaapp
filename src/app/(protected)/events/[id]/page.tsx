import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { getEventById } from "@/lib/cached-data";
import { EventRSVP } from "./EventRSVP";
import { EventDeleteButton } from "./EventDeleteButton";
import { Link } from "@/i18n/navigation";
import { formatDateRange, formatTime, formatTimeRange } from "@/lib/utils";
import { MapPin, Clock, Shirt, Users, ExternalLink, ArrowLeft, Edit } from "lucide-react";
import { ArchiveButton } from "@/components/ArchiveButton";
import { Badge } from "@/components/ui/badge";
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

  const [user, role, event] = await Promise.all([
    getUser(),
    getUserRole(),
    getEventById(id),
  ]);

  if (!event) notFound();
  const isAdmin = role === "admin";

  const { data: attendance } = await supabase
    .from("attendances")
    .select("status")
    .eq("user_id", user!.id)
    .eq("entity_type", "event")
    .eq("entity_id", id)
    .eq("entity_date", event.date)
    .single();

  const [{ count: yesCount }, { count: noCount }] = await Promise.all([
    supabase
      .from("attendances")
      .select("*", { count: "exact", head: true })
      .eq("entity_type", "event")
      .eq("entity_id", id)
      .eq("entity_date", event.date)
      .eq("status", "yes"),
    supabase
      .from("attendances")
      .select("*", { count: "exact", head: true })
      .eq("entity_type", "event")
      .eq("entity_id", id)
      .eq("entity_date", event.date)
      .eq("status", "no"),
  ]);

  const serviceClient = await createServiceClient();
  const [membersRes, attendancesRes] = await Promise.all([
    serviceClient.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    serviceClient
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
          <p className="mt-1.5 text-sm font-semibold text-foreground/90">
            {formatDateRange(event.date, event.end_date)}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/events/${id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-zinc-600 hover:text-foreground" aria-label={t("edit")}>
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <ArchiveButton type="event" id={id} isArchived={event.is_archived} />
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
            <span className="h-3.5 w-3.5 shrink-0" />
            <span className="text-muted w-28 shrink-0">{t("notes")}:</span>
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
