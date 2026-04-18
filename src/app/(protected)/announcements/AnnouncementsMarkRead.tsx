"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

interface AnnouncementsMarkReadProps {
  unreadIds: string[];
  userId: string;
}

export function AnnouncementsMarkRead({ unreadIds, userId }: AnnouncementsMarkReadProps) {
  useEffect(() => {
    async function markRead() {
      const supabase = createClient();
      const rows = unreadIds.map((id) => ({
        user_id: userId,
        announcement_id: id,
      })) as unknown as Database["public"]["Tables"]["announcement_reads"]["Insert"][];
      await (supabase as any)
        .from("announcement_reads")
        .upsert(rows as any, {
          onConflict: "user_id,announcement_id",
          ignoreDuplicates: true,
        });
    }
    markRead();
  }, [unreadIds, userId]);

  return null;
}
