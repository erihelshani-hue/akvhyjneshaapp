"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cached-data";

export async function revalidateEvents(eventId?: string) {
  revalidateTag(CACHE_TAGS.events);
  revalidatePath("/");
  revalidatePath("/events");
  if (eventId) revalidatePath(`/events/${eventId}`);
}
