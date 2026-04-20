"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { getUserRole, getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const role = await getUserRole();
  if (role !== "admin") throw new Error("Keine Berechtigung");
}

export async function uploadDocument(formData: FormData) {
  await assertAdmin();
  const user = await getUser();
  const supabase = await createServiceClient();

  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const isAdminOnly = formData.get("is_admin_only") === "true";

  if (!file || !title || !category) throw new Error("Fehlende Felder");

  const ext = file.name.split(".").pop();
  const path = `${category}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

  const { error: storageError } = await supabase.storage.from("documents").upload(path, file);
  if (storageError) throw new Error(storageError.message);

  const { error: dbError } = await supabase.from("documents").insert({
    title,
    category,
    file_path: path,
    file_name: file.name,
    mime_type: file.type,
    is_admin_only: isAdminOnly,
    uploaded_by: user!.id,
  });

  if (dbError) {
    await supabase.storage.from("documents").remove([path]);
    throw new Error(dbError.message);
  }

  revalidatePath("/documents");
  revalidatePath("/admin/documents");
}

export async function deleteDocument(id: string, filePath: string) {
  await assertAdmin();
  const supabase = await createServiceClient();

  await supabase.storage.from("documents").remove([filePath]);
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/documents");
  revalidatePath("/admin/documents");
}
