import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingOccurrences } from "@/lib/recurring";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RecurringTag } from "@/components/RecurringTag";
import { formatTimeRange } from "@/lib/utils";
import { Plus, MapPin, Clock, ChevronRight } from "lucide-react";

export default async function RehearsalsPage({
}: Record<string, never>) {
  const t = await getTranslations("rehearsal");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: rehearsals } = await supabase
    .from("rehearsals")
    .select("*")
    .order("date");

  const occurrences = getUpcomingOccurrences(rehearsals ?? [], 16);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground tracking-tight">
          {t("title")}
        </h1>
        {isAdmin && (
          <Link href="/rehearsals/new" aria-label={t("new")}>
            <Button size="icon" className="rounded-full h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {occurrences.length === 0 ? (
        <p className="text-sm text-muted">{t("noUpcoming")}</p>
      ) : (
        <div className="space-y-2">
          {occurrences.map((occ) => {
            const title = occ.rehearsal.title;
            const notes = occ.rehearsal.notes;
            return (
              <Link
                key={`${occ.rehearsal.id}-${occ.date}`}
                href={`/rehearsals/${occ.rehearsal.id}`}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface hover:border-border/80 hover:bg-surface/80 transition-colors group"
              >
                {/* Date column */}
                <div className="shrink-0 w-12 text-center pt-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {new Date(occ.date + "T00:00:00").toLocaleDateString("de-AT", { month: "short" })}
                  </p>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {new Date(occ.date + "T00:00:00").getDate()}
                  </p>
                </div>

                <div className="w-px self-stretch bg-border mx-1" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-playfair text-base font-semibold text-foreground">{title}</h2>
                    {occ.isRecurring && <RecurringTag />}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatTimeRange(occ.rehearsal.time, occ.rehearsal.end_time)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {occ.rehearsal.location}
                    </span>
                  </div>
                  {notes && (
                    <p className="text-xs text-muted mt-1.5 line-clamp-1">{notes}</p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-muted/30 shrink-0 mt-0.5 group-hover:text-muted transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
