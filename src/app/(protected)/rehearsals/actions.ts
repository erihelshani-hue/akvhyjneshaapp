"use server";

import { revalidatePath } from "next/cache";

export async function revalidateRehearsals() {
  revalidatePath("/rehearsals");
}
