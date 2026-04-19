"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { isEndAfterStart, isEndDateTimeAfterStart } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { revalidateRehearsals } from "../../actions";
import type { RecurrenceDay, Rehearsal } from "@/types/database";

const DAYS: RecurrenceDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function EditRehearsalPage() {
  const t = useTranslations("rehearsal");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    end_date: "",
    end_time: "",
    location: "",
    notes: "",
    recurrence_day: "MON" as RecurrenceDay,
    recurrence_time: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: loadError } = await supabase
        .from("rehearsals")
        .select("*")
        .eq("id", id)
        .single();

      if (loadError || !data) {
        setError("Die Probe konnte nicht geladen werden.");
      } else {
        const rehearsal = data as Rehearsal;
        setIsRecurring(rehearsal.is_recurring);
        setForm({
          title: rehearsal.title,
          date: rehearsal.date,
          time: rehearsal.time?.substring(0, 5) ?? "",
          end_date: rehearsal.end_date ?? "",
          end_time: rehearsal.end_time?.substring(0, 5) ?? "",
          location: rehearsal.location,
          notes: rehearsal.notes ?? "",
          recurrence_day: rehearsal.recurrence_day ?? "MON",
          recurrence_time: rehearsal.recurrence_time?.substring(0, 5) ?? "",
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

    const startTime = isRecurring ? form.recurrence_time || form.time : form.time;

    if (isRecurring) {
      if (form.end_time && !isEndAfterStart(startTime, form.end_time)) {
        setError(t("form.endAfterStart"));
        setLoading(false);
        return;
      }
    } else {
      const resolvedEndDate = form.end_date || form.date;
      if (form.end_time && !isEndDateTimeAfterStart(form.date, startTime, resolvedEndDate, form.end_time)) {
        setError(t("form.endAfterStart"));
        setLoading(false);
        return;
      }
    }

    const resolvedEndDate = !isRecurring && form.end_date ? form.end_date : null;

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("rehearsals")
      .update({
        title: form.title,
        date: isRecurring ? new Date().toISOString().substring(0, 10) : form.date,
        time: startTime,
        end_date: resolvedEndDate !== form.date ? resolvedEndDate : null,
        end_time: form.end_time || null,
        location: form.location,
        notes: form.notes || null,
        is_recurring: isRecurring,
        recurrence_day: isRecurring ? form.recurrence_day : null,
        recurrence_time: isRecurring ? startTime : null,
      })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message || "Die Probe konnte nicht gespeichert werden.");
      setLoading(false);
      return;
    }

    await revalidateRehearsals(id);
    router.push(`/rehearsals/${id}`);
    router.refresh();
  }

  if (loadingInitial) {
    return <p className="text-sm text-muted">{t("details")}...</p>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/rehearsals/${id}`} className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-foreground">{t("edit")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>{t("form.title")}</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)} />
          <Label htmlFor="recurring" className="cursor-pointer text-foreground">
            {t("form.isRecurring")}
          </Label>
        </div>

        {isRecurring ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("form.recurrenceDay")}</Label>
              <Select value={form.recurrence_day} onValueChange={(v) => update("recurrence_day", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d} value={d}>{t(`days.${d}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.recurrenceTime")}</Label>
              <Input type="time" value={form.recurrence_time} onChange={(e) => update("recurrence_time", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.endTime")}</Label>
              <Input type="time" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} required />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("form.date")}</Label>
              <Input className="max-w-52" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.endDate")}</Label>
              <Input className="max-w-52" type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} min={form.date || undefined} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.time")}</Label>
              <Input className="max-w-40" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.endTime")}</Label>
              <Input className="max-w-40" type="time" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} required />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{t("form.location")}</Label>
          <Input value={form.location} onChange={(e) => update("location", e.target.value)} required />
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
