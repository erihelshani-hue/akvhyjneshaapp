"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { getUserRole, getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const role = await getUserRole();
  if (role !== "admin") throw new Error("Keine Berechtigung");
}

export async function saveDocumentRecord(params: {
  title: string;
  category: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  isAdminOnly: boolean;
}) {
  await assertAdmin();
  const user = await getUser();
  const supabase = await createServiceClient();

  const { error } = await supabase.from("documents").insert({
    title: params.title,
    category: params.category,
    file_path: params.filePath,
    file_name: params.fileName,
    mime_type: params.mimeType,
    is_admin_only: params.isAdminOnly,
    uploaded_by: user!.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/documents");
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
