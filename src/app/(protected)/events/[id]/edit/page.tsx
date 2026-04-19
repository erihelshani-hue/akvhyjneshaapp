"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { isEndDateTimeAfterStart } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Event, EventType } from "@/types/database";

const EVENT_TYPES: EventType[] = ["performance", "festival", "other"];

export default function EditEventPage() {
  const t = useTranslations("event");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    end_date: "",
    end_time: "",
    location: "",
    event_type: "performance" as EventType,
    dress_code: "",
    meetup_time: "",
    location_url: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: loadError } = await supabase.from("events").select("*").eq("id", id).single();
      if (loadError || !data) {
        setError("Die Veranstaltung konnte nicht geladen werden.");
      } else {
        const event = data as Event;
        setForm({
          title: event.title,
          date: event.date,
          time: event.time?.substring(0, 5) ?? "",
          end_date: event.end_date ?? "",
          end_time: event.end_time?.substring(0, 5) ?? "",
          location: event.location,
          event_type: event.event_type === "wedding" ? "other" : event.event_type,
          dress_code: event.dress_code ?? "",
          meetup_time: event.meetup_time?.substring(0, 5) ?? "",
          location_url: event.location_url ?? "",
          notes: event.notes ?? "",
        });
      }
      setLoadingInitial(false);
    }
    load();
  }, [id]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const resolvedEndDate = form.end_date || form.date;
    if (form.end_time && !isEndDateTimeAfterStart(form.date, form.time, resolvedEndDate, form.end_time)) {
      setError(t("form.endAfterStart"));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: form.title,
        date: form.date,
        time: form.time,
        end_date: resolvedEndDate !== form.date ? resolvedEndDate : null,
        end_time: form.end_time || null,
        location: form.location,
        event_type: form.event_type,
        dress_code: form.dress_code || null,
        meetup_time: form.meetup_time || null,
        location_url: form.location_url || null,
        notes: form.notes || null,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message || "Die Veranstaltung konnte nicht gespeichert werden.");
      setLoading(false);
      return;
    }

    router.push(`/events/${id}`);
    router.refresh();
  }

  if (loadingInitial) {
    return <p className="text-sm text-muted">{t("details")}...</p>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/events/${id}`} className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-foreground">{t("edit")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>{t("form.title")}</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.date")}</Label>
            <Input className="sm:max-w-52" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.endDate")}</Label>
            <Input className="sm:max-w-52" type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} min={form.date || undefined} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.time")}</Label>
            <Input className="sm:max-w-40" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.endTime")}</Label>
            <Input className="sm:max-w-40" type="time" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} required />
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
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => <SelectItem key={type} value={type}>{t(`type.${type}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.meetupTime")}</Label>
            <Input className="sm:max-w-40" type="time" value={form.meetup_time} onChange={(e) => update("meetup_time", e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.dressCode")}</Label>
            <Input value={form.dress_code} onChange={(e) => update("dress_code", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.locationUrl")}</Label>
            <Input type="url" value={form.location_url} onChange={(e) => update("location_url", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t("form.notes")}</Label>
          <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? t("creating") : t("edit")}</Button>
      </form>
    </div>
  );
}
