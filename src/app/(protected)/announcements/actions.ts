"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cached-data";

export async function revalidateAnnouncements() {
  revalidateTag(CACHE_TAGS.announcements);
  revalidatePath("/");
  revalidatePath("/announcements");
}
