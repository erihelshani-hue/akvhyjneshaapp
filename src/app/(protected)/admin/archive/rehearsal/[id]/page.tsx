import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getRehearsalById } from "@/lib/cached-data";
import { getOccurrencesForRehearsal } from "@/lib/recurring";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { AttendanceEditor } from "../../AttendanceEditor";
import { TitleEditor } from "../../TitleEditor";
import type { AttendanceStatus } from "@/types/database";

export default async function AdminRehearsalAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: queryDate } = await searchParams;

  const rehearsal = await getRehearsalById(id);
  if (!rehearsal) notFound();

  const occurrences = getOccurrencesForRehearsal(rehearsal, 20);
  const targetDate = queryDate ?? occurrences[0]?.date ?? rehearsal.date;

  const supabase = await createServiceClient();
  const [{ data: members }, { data: attendances }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    supabase
      .from("attendances")
      .select("user_id, status")
      .eq("entity_type", "rehearsal")
      .eq("entity_id", id)
      .eq("entity_date", targetDate),
  ]);

  const initialAttendance: Record<string, AttendanceStatus | null> = {};
  for (const a of attendances ?? []) {
    initialAttendance[a.user_id] = a.status as AttendanceStatus;
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/archive"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Zurück zum Archiv
      </Link>

      <div>
        <TitleEditor type="rehearsal" id={id} initialTitle={rehearsal.title} />
        <p className="text-sm text-muted mt-0.5">Anwesenheit bearbeiten</p>
      </div>

      {/* Date selector for recurring rehearsals */}
      {rehearsal.is_recurring && occurrences.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Datum auswählen</p>
          <div className="flex flex-wrap gap-2">
            {occurrences.map((occ) => (
              <Link
                key={occ.date}
                href={`/admin/archive/rehearsal/${id}?date=${occ.date}`}
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
      <p className="text-sm font-medium text-foreground">
        {formatDate(targetDate)} — {(members ?? []).length} Mitglieder
      </p>

      <AttendanceEditor
        entityType="rehearsal"
        entityId={id}
        entityDate={targetDate}
        members={members ?? []}
        initialAttendance={initialAttendance}
      />
    </div>
  );
}
