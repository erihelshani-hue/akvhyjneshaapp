"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { revalidateAnnouncements } from "../../actions";
import type { Announcement } from "@/types/database";

export default function EditAnnouncementPage() {
  const t = useTranslations("announcement");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: loadError } = await supabase.from("announcements").select("*").eq("id", id).single();
      if (loadError || !data) {
        setError("Die Ankündigung konnte nicht geladen werden.");
      } else {
        const announcement = data as Announcement;
        setForm({ title: announcement.title, body: announcement.body });
      }
      setLoadingInitial(false);
    }
    load();
  }, [id]);

  function update(field: "title" | "body", value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("announcements")
      .update({ title: form.title, body: form.body })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message || "Die Ankündigung konnte nicht gespeichert werden.");
      setLoading(false);
      return;
    }

    await revalidateAnnouncements();
    router.push("/announcements");
    router.refresh();
  }

  if (loadingInitial) {
    return <p className="text-sm text-muted">{t("title")}...</p>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/announcements" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-foreground">{t("edit")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>{t("form.title")}</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>{t("form.body")}</Label>
          <Textarea value={form.body} onChange={(e) => update("body", e.target.value)} rows={8} required />
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? t("creating") : t("edit")}</Button>
      </form>
    </div>
  );
}
