"use client";

import { RSVPBar } from "@/components/RSVPBar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import type { AttendanceStatus } from "@/types/database";

interface RehearsalRSVPProps {
  entityId: string;
  entityDate: string;
  currentStatus: AttendanceStatus | null;
  yesCount: number;
  noCount: number;
}

export function RehearsalRSVP({ entityId, entityDate, currentStatus, yesCount, noCount }: RehearsalRSVPProps) {
  const router = useRouter();

  async function handleRSVP(status: AttendanceStatus) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("attendances").upsert({
      user_id: user.id,
      entity_type: "rehearsal",
      entity_id: entityId,
      entity_date: entityDate,
      status,
    }, {
      onConflict: "user_id,entity_type,entity_id,entity_date",
    });

    if (error) throw error;
    router.refresh();
  }

  return (
    <RSVPBar
      entityType="rehearsal"
      entityId={entityId}
      entityDate={entityDate}
      currentStatus={currentStatus}
      yesCount={yesCount}
      noCount={noCount}
      onRSVP={handleRSVP}
    />
  );
}
