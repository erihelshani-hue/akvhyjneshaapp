"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cached-data";
import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { EventType } from "@/types/database";

export async function revalidateEvents(eventId?: string) {
  revalidateTag(CACHE_TAGS.events);
  revalidatePath("/");
  revalidatePath("/events");
  if (eventId) revalidatePath(`/events/${eventId}`);
}

export type EventUpdatePayload = {
  title: string;
  date: string;
  time: string;
  end_date: string | null;
  end_time: string | null;
  location: string;
  event_type: EventType;
  dress_code: string | null;
  meetup_time: string | null;
  location_url: string | null;
  notes: string | null;
};

/**
 * Updates an event and migrates attendance entity_date if the date changed.
 * This prevents votes from "disappearing" when an admin changes the event date.
 */
export async function updateEvent(
  id: string,
  payload: EventUpdatePayload
): Promise<{ error?: string }> {
  const user = await getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const supabase = await createServiceClient();

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Keine Berechtigung." };

  // Fetch current event date before updating
  const { data: current } = await supabase
    .from("events")
    .select("date")
    .eq("id", id)
    .single();

  const oldDate = current?.date;

  // Update the event
  const { error: updateError } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id);

  if (updateError) return { error: updateError.message };

  // If the date changed, migrate all attendance records to the new date
  if (oldDate && oldDate !== payload.date) {
    await supabase
      .from("attendances")
      .update({ entity_date: payload.date })
      .eq("entity_type", "event")
      .eq("entity_id", id)
      .eq("entity_date", oldDate);
  }

  await revalidateEvents(id);
  return {};
}
