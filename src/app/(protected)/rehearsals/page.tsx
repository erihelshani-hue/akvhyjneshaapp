import { getTranslations } from "next-intl/server";
import { getUserRole } from "@/lib/auth";
import { getAllRehearsals } from "@/lib/cached-data";
import { getUpcomingOccurrences } from "@/lib/recurring";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RecurringTag } from "@/components/RecurringTag";
import { formatTimeRange } from "@/lib/utils";
import { Plus, MapPin, Clock, ChevronRight, PersonStanding } from "lucide-react";

export default async function RehearsalsPage({}: Record<string, never>) {
  const t = await getTranslations("rehearsal");
  const [role, rehearsals] = await Promise.all([getUserRole(), getAllRehearsals()]);
  const isAdmin = role === "admin";
  const occurrences = getUpcomingOccurrences(rehearsals, 16);

  return (
    <div className="space-y-7 animate-fade-in-up">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-1.5">Provat e ansamblit</p>
          <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight">{t("title")}</h1>
        </div>
        {isAdmin && (
          <Link href="/rehearsals/new" aria-label={t("new")}>
            <Button size="icon" className="rounded-full shadow-glass-accent"><Plus className="h-5 w-5" /></Button>
          </Link>
        )}
      </header>
      {occurrences.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 mb-4">
            <PersonStanding className="h-6 w-6 text-muted" />
          </div>
          <p className="text-sm text-muted">{t("noUpcoming")}</p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {occurrences.map((occ) => {
            const d = new Date(occ.date + "T00:00:00");
            return (
              <Link key={`${occ.rehearsal.id}-${occ.date}`} href={`/rehearsals/${occ.rehearsal.id}`}
                className="group flex items-start gap-4 p-4 rounded-2xl glass hover:border-accent/25 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="shrink-0 flex flex-col items-center justify-center h-[60px] w-[60px] rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner-top">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent leading-none">
                    {d.toLocaleDateString("de-AT", { month: "short" })}
                  </span>
                  <span className="font-display text-2xl font-semibold text-foreground leading-none mt-1">{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-lg font-semibold text-foreground leading-tight">{occ.rehearsal.title}</h2>
                    {occ.isRecurring && <RecurringTag />}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" />{formatTimeRange(occ.rehearsal.time, occ.rehearsal.end_time)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />{occ.rehearsal.location}
                    </span>
                  </div>
                  {occ.rehearsal.notes && <p className="text-xs text-muted/80 mt-2 line-clamp-1">{occ.rehearsal.notes}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-muted/40 shrink-0 mt-4 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
