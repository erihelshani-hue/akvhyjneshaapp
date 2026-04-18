"use client";

import { RSVPBar } from "@/components/RSVPBar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import type { AttendanceStatus } from "@/types/database";

interface EventRSVPProps {
  entityId: string;
  eventDate: string;
  currentStatus: AttendanceStatus | null;
  yesCount: number;
}

export function EventRSVP({ entityId, eventDate, currentStatus, yesCount }: EventRSVPProps) {
  const router = useRouter();

  async function handleRSVP(status: AttendanceStatus) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("attendances").upsert({
      user_id: user.id,
      entity_type: "event",
      entity_id: entityId,
      entity_date: eventDate,
      status,
    }, {
      onConflict: "user_id,entity_type,entity_id,entity_date",
    });

    if (error) throw error;
    router.refresh();
  }

  return (
    <RSVPBar
      entityType="event"
      entityId={entityId}
      entityDate={eventDate}
      currentStatus={currentStatus}
      yesCount={yesCount}
      onRSVP={handleRSVP}
    />
  );
}
