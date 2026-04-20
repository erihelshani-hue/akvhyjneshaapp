import { createServiceClient, createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { DocumentsClient } from "./DocumentsClient";
import { CATEGORIES, type DocumentRow } from "./types";

export default async function DocumentsPage() {
  const [role, supabase, serviceClient] = await Promise.all([
    getUserRole(),
    createClient(),
    createServiceClient(),
  ]);
  const isAdmin = role === "admin";

  const { data: docs } = await (isAdmin
    ? serviceClient.from("documents").select("*").order("created_at", { ascending: false })
    : supabase.from("documents").select("*").eq("is_admin_only", false).order("created_at", { ascending: false })
  );

  const rows: DocumentRow[] = await Promise.all(
    (docs ?? []).map(async (doc) => {
      const { data } = await serviceClient.storage.from("documents").createSignedUrl(doc.file_path, 3600);
      return { ...doc, url: data?.signedUrl ?? "" };
    })
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header>
        <p className="brand-eyebrow mb-1.5">Vereinsdokumente</p>
        <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">Dokumente</h1>
        <p className="text-sm text-muted mt-1">{rows.length} Dateien verfügbar</p>
      </header>
      <DocumentsClient docs={rows} isAdmin={isAdmin} categories={CATEGORIES} />
    </div>
  );
}
