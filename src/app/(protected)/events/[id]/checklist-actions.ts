"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const role = await getUserRole();
  if (role !== "admin") throw new Error("Keine Berechtigung");
}

export async function addChecklistItem(eventId: string, label: string, sortOrder: number) {
  await assertAdmin();
  const supabase = await createServiceClient();
  const { error } = await supabase.from("event_checklist_items").insert({ event_id: eventId, label, sort_order: sortOrder });
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}

export async function toggleChecklistItem(itemId: string, isDone: boolean, eventId: string) {
  await assertAdmin();
  const supabase = await createServiceClient();
  const { error } = await supabase.from("event_checklist_items").update({ is_done: isDone }).eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}

export async function deleteChecklistItem(itemId: string, eventId: string) {
  await assertAdmin();
  const supabase = await createServiceClient();
  const { error } = await supabase.from("event_checklist_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}
