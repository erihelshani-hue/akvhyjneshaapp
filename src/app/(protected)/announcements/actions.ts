"use server";

import { revalidatePath } from "next/cache";

export async function revalidateAnnouncements() {
  revalidatePath("/announcements");
}
