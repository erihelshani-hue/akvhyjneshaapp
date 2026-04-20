import { createServiceClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTimeRange } from "@/lib/utils";
import { RestoreButton } from "./RestoreButton";
import { Clock, MapPin, Edit } from "lucide-react";
import type { Rehearsal, Event } from "@/types/database";

export default async function AdminArchivePage() {
  const supabase = await createServiceClient();

  const [{ data: rehearsals }, { data: events }] = await Promise.all([
    supabase
      .from("rehearsals")
      .select("*")
      .eq("is_archived", true)
      .order("date", { ascending: false }),
    supabase
      .from("events")
      .select("*")
      .eq("is_archived", true)
      .order("date", { ascending: false }),
  ]);

  const archivedRehearsals = (rehearsals ?? []) as Rehearsal[];
  const archivedEvents = (events ?? []) as Event[];

  return (
    <div className="space-y-8">
      {/* Archived rehearsals */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Archivierte Proben ({archivedRehearsals.length})
          </h2>
        </div>

        {archivedRehearsals.length === 0 ? (
          <p className="text-sm text-muted">Keine archivierten Proben.</p>
        ) : (
          <div className="space-y-2">
            {archivedRehearsals.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface">
                <div className="shrink-0 w-10 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {new Date(r.date + "T00:00:00").toLocaleDateString("de-AT", { month: "short" })}
                  </p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {new Date(r.date + "T00:00:00").getDate()}
                  </p>
                </div>

                <div className="w-px self-stretch bg-border mx-1" />

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-playfair text-sm font-semibold text-foreground">{r.title}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeRange(r.recurrence_time ?? r.time, r.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {r.location}
                    </span>
                  </div>
                  {r.archived_at && (
                    <p className="text-xs text-muted">
                      Archiviert am {formatDate(r.archived_at.split("T")[0])}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/admin/archive/rehearsal/${r.id}`}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-zinc-600 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Anwesenheit
                  </Link>
                  <RestoreButton type="rehearsal" id={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Archived events */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Archivierte Veranstaltungen ({archivedEvents.length})
        </h2>

        {archivedEvents.length === 0 ? (
          <p className="text-sm text-muted">Keine archivierten Veranstaltungen.</p>
        ) : (
          <div className="space-y-2">
            {archivedEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface">
                <div className="shrink-0 w-10 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {new Date(e.date + "T00:00:00").toLocaleDateString("de-AT", { month: "short" })}
                  </p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {new Date(e.date + "T00:00:00").getDate()}
                  </p>
                </div>

                <div className="w-px self-stretch bg-border mx-1" />

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-playfair text-sm font-semibold text-foreground">{e.title}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeRange(e.time, e.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </span>
                  </div>
                  {e.archived_at && (
                    <p className="text-xs text-muted">
                      Archiviert am {formatDate(e.archived_at.split("T")[0])}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/admin/archive/event/${e.id}`}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-zinc-600 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Anwesenheit
                  </Link>
                  <RestoreButton type="event" id={e.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
