import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getAllRehearsals, getRecentAnnouncements, getUpcomingEvents } from "@/lib/cached-data";
import { DashboardCard } from "@/components/DashboardCard";
import { getNextOccurrence } from "@/lib/recurring";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { ChevronRight, Bell } from "lucide-react";
import type { AnnouncementRead } from "@/types/database";

export default async function DashboardPage({}: Record<string, never>) {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const [user, supabase] = await Promise.all([getUser(), createClient()]);

  const [rehearsals, events, announcements] = await Promise.all([
    getAllRehearsals(),
    getUpcomingEvents(new Date().toISOString().substring(0, 10)),
    getRecentAnnouncements(3),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Tungjatjeta" : "Guten Abend";

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const announcementIds = announcements.map((a) => a.id);
  const { data: readsData } = announcementIds.length > 0
    ? await supabase.from("announcement_reads").select("announcement_id").eq("user_id", user!.id).in("announcement_id", announcementIds)
    : { data: [] };

  const reads = (readsData ?? []) as Pick<AnnouncementRead, "announcement_id">[];
  const readIds = new Set(reads.map((r) => r.announcement_id));
  const nextRehearsal = getNextOccurrence(rehearsals);
  const nextEvent = events[0] ?? null;

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="space-y-2.5 pt-2">
        <p className="brand-eyebrow">{greeting}</p>
        <h1 className="font-display text-[2.5rem] md:text-5xl font-semibold text-foreground tracking-tight leading-[1.05]">
          {firstName ? (
            <>Willkommen, <em className="italic text-gradient-accent">{firstName}</em></>
          ) : (
            t("title")
          )}
        </h1>
        <p className="text-sm text-muted pt-1">
          AKV <span className="hyjnesha-italic text-muted">&ldquo;Hyjnesha&rdquo;</span> · Graz · Tradition trifft Leidenschaft
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 stagger">
        <DashboardCard
          type="rehearsal"
          title={nextRehearsal?.rehearsal.title ?? ""}
          date={nextRehearsal?.date ?? null}
          time={nextRehearsal?.rehearsal.time ?? null}
          endTime={nextRehearsal?.rehearsal.end_time ?? null}
          location={nextRehearsal?.rehearsal.location ?? null}
          isRecurring={nextRehearsal?.isRecurring}
          href={nextRehearsal ? `/rehearsals/${nextRehearsal.rehearsal.id}` : "/rehearsals"}
        />
        <DashboardCard
          type="event"
          title={nextEvent?.title ?? ""}
          date={nextEvent?.date ?? null}
          time={nextEvent?.time ?? null}
          endTime={nextEvent?.end_time ?? null}
          location={nextEvent?.location ?? null}
          href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
              <Bell className="h-4 w-4 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-medium text-foreground">{t("recentAnnouncements")}</h2>
          </div>
          <Link href="/announcements" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground transition-colors">
            {t("viewAll")}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {announcements.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center">
            <p className="text-sm text-muted">{t("noAnnouncements")}</p>
          </div>
        ) : (
          <div className="space-y-2.5 stagger">
            {announcements.map((announcement) => {
              const isUnread = !readIds.has(announcement.id);
              return (
                <Link
                  key={announcement.id}
                  href="/announcements"
                  className={`group flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${
                    isUnread ? "glass-accent hover:shadow-card-hover" : "glass hover:border-white/20"
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {isUnread
                      ? <span className="block h-2.5 w-2.5 rounded-full bg-accent" />
                      : <span className="block h-2.5 w-2.5 rounded-full border border-white/20" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold text-foreground leading-tight">{announcement.title}</p>
                    <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">{announcement.body}</p>
                    <p className="mt-2 text-[10px] text-muted/70 font-semibold uppercase tracking-wider">
                      {tCommon("postedOn")} {formatDate(announcement.created_at.substring(0, 10))}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted/40 shrink-0 mt-1 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
