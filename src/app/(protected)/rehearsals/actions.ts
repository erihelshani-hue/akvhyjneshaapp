"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cached-data";

export async function revalidateRehearsals(rehearsalId?: string) {
  revalidateTag(CACHE_TAGS.rehearsals);
  revalidatePath("/");
  revalidatePath("/rehearsals");
  if (rehearsalId) revalidatePath(`/rehearsals/${rehearsalId}`);
}
