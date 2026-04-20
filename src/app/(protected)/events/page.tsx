import { getTranslations } from "next-intl/server";
import { getUserRole } from "@/lib/auth";
import { getUpcomingEvents } from "@/lib/cached-data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange } from "@/lib/utils";
import { Plus, MapPin, Clock, ChevronRight, CalendarDays } from "lucide-react";

export default async function EventsPage({}: Record<string, never>) {
  const t = await getTranslations("event");
  const today = new Date().toISOString().substring(0, 10);
  const [role, events] = await Promise.all([getUserRole(), getUpcomingEvents(today)]);
  const isAdmin = role === "admin";

  return (
    <div className="space-y-7 animate-fade-in-up">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="brand-eyebrow mb-1.5">Paraqitjet e ansamblit</p>
          <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">{t("title")}</h1>
        </div>
        {isAdmin && (
          <Link href="/events/new" aria-label={t("new")}>
            <Button size="icon"><Plus className="h-5 w-5" /></Button>
          </Link>
        )}
      </header>
      {events.length === 0 ? (
        <div className="rounded-lg glass p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 border border-border mb-4">
            <CalendarDays className="h-6 w-6 text-muted" />
          </div>
          <p className="text-sm text-muted">{t("noUpcoming")}</p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {events.map((event) => {
            const d = new Date(event.date + "T00:00:00");
            return (
              <Link key={event.id} href={`/events/${event.id}`}
                className="group flex items-start gap-4 p-4 rounded-lg glass hover:border-gold/25 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="shrink-0 flex flex-col items-center justify-center h-[60px] w-[60px] rounded-lg border border-border-strong bg-surface-2 shadow-inner-top">
                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-gold leading-none">
                    {d.toLocaleDateString("de-AT", { month: "short" })}
                  </span>
                  <span className="font-display text-2xl font-medium text-foreground leading-none mt-1">{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg font-medium text-foreground leading-tight">{event.title}</h2>
                    <Badge variant="gold">{t(`type.${event.event_type}`)}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" />{formatTimeRange(event.time, event.end_time)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />{event.location}
                      </span>
                    )}
                  </div>
                  {event.notes && <p className="text-xs text-muted/80 mt-2 line-clamp-1">{event.notes}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-muted/40 shrink-0 mt-4 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
