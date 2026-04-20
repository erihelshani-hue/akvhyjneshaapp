import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/cached-data";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { AttendanceEditor } from "../../AttendanceEditor";
import type { AttendanceStatus } from "@/types/database";

export default async function AdminEventAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await getEventById(id);
  if (!event) notFound();

  const supabase = await createServiceClient();
  const [{ data: members }, { data: attendances }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
    supabase
      .from("attendances")
      .select("user_id, status")
      .eq("entity_type", "event")
      .eq("entity_id", id)
      .eq("entity_date", event.date),
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
        <h2 className="font-playfair text-xl font-semibold text-foreground">{event.title}</h2>
        <p className="text-sm text-muted mt-0.5">Anwesenheit bearbeiten · {formatDate(event.date)}</p>
      </div>

      <div className="h-px bg-border" />
      <p className="text-sm font-medium text-foreground">
        {(members ?? []).length} Mitglieder
      </p>

      <AttendanceEditor
        entityType="event"
        entityId={id}
        entityDate={event.date}
        members={members ?? []}
        initialAttendance={initialAttendance}
      />
    </div>
  );
}
