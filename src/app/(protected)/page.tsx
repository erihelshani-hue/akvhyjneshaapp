import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { DashboardCard } from "@/components/DashboardCard";
import { getNextOccurrence } from "@/lib/recurring";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { Rehearsal, Event, Announcement, AnnouncementRead } from "@/types/database";

export default async function DashboardPage({
}: Record<string, never>) {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const [user, supabase] = await Promise.all([getUser(), createClient()]);

  const [rehearsalsRes, eventsRes, announcementsRes] = await Promise.all([
    supabase.from("rehearsals").select("*").order("date"),
    supabase.from("events").select("*").order("date").gte("date", new Date().toISOString().substring(0, 10)),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
  ]);

  const rehearsals: Rehearsal[] = rehearsalsRes.data ?? [];
  const events: Event[] = eventsRes.data ?? [];
  const announcements: Announcement[] = announcementsRes.data ?? [];
  const announcementIds = announcements.map((announcement) => announcement.id);
  const { data: readsData } = announcementIds.length > 0
    ? await supabase
      .from("announcement_reads")
      .select("announcement_id")
      .eq("user_id", user!.id)
      .in("announcement_id", announcementIds)
    : { data: [] };

  const reads = (readsData ?? []) as Pick<AnnouncementRead, "announcement_id">[];
  const readIds = new Set(reads.map((r) => r.announcement_id));

  const nextRehearsal = getNextOccurrence(rehearsals);
  const nextEvent = events[0] ?? null;

  const rehearsalTitle = nextRehearsal ? nextRehearsal.rehearsal.title : null;
  const eventTitle = nextEvent ? nextEvent.title : null;

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="font-playfair text-3xl font-semibold text-foreground tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted">
          AKV <em className="italic font-playfair">&ldquo;Hyjnesha&rdquo;</em> · Graz
        </p>
      </div>

      {/* Next rehearsal + event */}
      <section className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          type="rehearsal"
          title={rehearsalTitle ?? ""}
          date={nextRehearsal?.date ?? null}
          time={nextRehearsal?.rehearsal.time ?? null}
          endTime={nextRehearsal?.rehearsal.end_time ?? null}
          location={nextRehearsal?.rehearsal.location ?? null}
          isRecurring={nextRehearsal?.isRecurring}
          href={nextRehearsal ? `/rehearsals/${nextRehearsal.rehearsal.id}` : "/rehearsals"}
        />
        <DashboardCard
          type="event"
          title={eventTitle ?? ""}
          date={nextEvent?.date ?? null}
          time={nextEvent?.time ?? null}
          endTime={nextEvent?.end_time ?? null}
          location={nextEvent?.location ?? null}
          href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
        />
      </section>

      {/* Recent announcements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground">
            {t("recentAnnouncements")}
          </h2>
          <Link
            href="/announcements"
            className="flex items-center gap-0.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            {t("viewAll")}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {announcements.length === 0 ? (
          <p className="text-sm text-muted">{t("noAnnouncements")}</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((announcement) => {
              const isUnread = !readIds.has(announcement.id);
              const title = announcement.title;
              const body = announcement.body;
              return (
                <Link
                  key={announcement.id}
                  href="/announcements"
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface hover:border-border/80 hover:bg-surface/80 active:bg-surface/60 transition-colors group"
                >
                  {isUnread ? (
                    <span className="mt-[5px] shrink-0 h-2 w-2 rounded-full bg-accent" />
                  ) : (
                    <span className="mt-[5px] shrink-0 h-2 w-2 rounded-full bg-transparent border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{title}</p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">{body}</p>
                    <p className="mt-1.5 text-[10px] text-muted/70 font-medium">
                      {tCommon("postedOn")} {formatDate(announcement.created_at.substring(0, 10))}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted/40 shrink-0 mt-0.5 group-hover:text-muted transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
