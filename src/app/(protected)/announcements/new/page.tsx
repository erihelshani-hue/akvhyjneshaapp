"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { revalidateAnnouncements } from "../actions";
import type { AnnouncementInsert } from "@/types/database";

export default function NewAnnouncementPage() {
  const t = useTranslations("announcement");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
      setLoading(false);
      return;
    }

    const payload: AnnouncementInsert = {
      title: form.title,
      body: form.body,
      created_by: user?.id,
    };

    const { error: insertError } = await supabase.from("announcements").insert(payload);

    if (insertError) {
      setError(insertError.message || "Die Ankündigung konnte nicht erstellt werden.");
      setLoading(false);
      return;
    }

    // Fire-and-forget push notification
    fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Neue Ankündigung",
        body: form.title,
        url: "/announcements",
      }),
    }).catch(() => {});

    await revalidateAnnouncements();
    router.push("/announcements");
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/announcements" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-foreground">{t("new")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>{t("form.title")}</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label>{t("form.body")}</Label>
          <Textarea
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
            rows={8}
            required
          />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? t("creating") : t("create")}
        </Button>
      </form>
    </div>
  );
}
