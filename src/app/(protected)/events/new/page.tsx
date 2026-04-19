"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { isEndAfterStart } from "@/lib/utils";
import { revalidateEvents } from "../actions";
import type { EventInsert, EventType } from "@/types/database";

const EVENT_TYPES: EventType[] = ["performance", "wedding", "festival", "other"];

export default function NewEventPage() {
  const t = useTranslations("event");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    end_time: "",
    location: "",
    event_type: "performance" as EventType,
    dress_code: "",
    meetup_time: "",
    location_url: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.end_time && !isEndAfterStart(form.time, form.end_time)) {
      setError(t("form.endAfterStart"));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
      setLoading(false);
      return;
    }

    const payload: EventInsert = {
      title: form.title,
      date: form.date,
      time: form.time,
      end_time: form.end_time || null,
      location: form.location,
      event_type: form.event_type,
      dress_code: form.dress_code || null,
      meetup_time: form.meetup_time || null,
      location_url: form.location_url || null,
      notes: form.notes || null,
      created_by: user?.id,
    };

    const { data, error: insertError } = await supabase
      .from("events")
      .insert(payload)
      .select()
      .single();

    if (insertError || !data) {
      setError(insertError?.message || "Die Veranstaltung konnte nicht erstellt werden.");
      setLoading(false);
      return;
    }

    // Fire-and-forget push notification
    fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Neue Veranstaltung",
        body: form.title,
        url: `/events/${data.id}`,
      }),
    }).catch(() => {});

    await revalidateEvents();
    router.push(`/events/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/events" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-foreground">{t("new")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>{t("form.title")}</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("form.date")}</Label>
            <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.time")}</Label>
            <Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.endTime")}</Label>
            <Input type="time" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("form.location")}</Label>
          <Input value={form.location} onChange={(e) => update("location", e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.eventType")}</Label>
            <Select value={form.event_type} onValueChange={(v) => update("event_type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{t(`type.${type}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.meetupTime")}</Label>
            <Input type="time" value={form.meetup_time} onChange={(e) => update("meetup_time", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.dressCode")}</Label>
            <Input value={form.dress_code} onChange={(e) => update("dress_code", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.locationUrl")}</Label>
            <Input type="url" value={form.location_url} onChange={(e) => update("location_url", e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("form.notes")}</Label>
          <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? t("creating") : t("create")}
        </Button>
      </form>
    </div>
  );
}
