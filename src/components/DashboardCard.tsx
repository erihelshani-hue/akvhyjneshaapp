import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Clock, ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import { RecurringTag } from "@/components/RecurringTag";
import { formatDate, formatTimeRange } from "@/lib/utils";

interface DashboardCardProps {
  type: "rehearsal" | "event";
  title: string;
  date: string | null;
  time: string | null;
  endTime?: string | null;
  location: string | null;
  isRecurring?: boolean;
  href: string;
}

export function DashboardCard({ type, title, date, time, endTime, location, isRecurring, href }: DashboardCardProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const label = type === "rehearsal" ? t("nextRehearsal") : t("nextEvent");
  const Icon = type === "rehearsal" ? Sparkles : CalendarDays;

  if (!date) {
    return (
      <div className="relative rounded-3xl glass p-6 overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10">
            <Icon className="h-4 w-4 text-muted" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
        </div>
        <p className="text-sm text-muted/80 leading-relaxed">
          {type === "rehearsal" ? t("noUpcomingRehearsal") : t("noUpcomingEvent")}
        </p>
      </div>
    );
  }

  const dayNum = new Date(date + "T00:00:00").getDate();
  const monthShort = new Date(date + "T00:00:00").toLocaleDateString("de-AT", { month: "short" });

  return (
    <Link href={href} className="block group">
      <div className="relative rounded-3xl glass p-6 overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-card-hover hover:-translate-y-0.5">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/12 border border-accent/25">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
        </div>
        <div className="relative flex items-start gap-4">
          <div className="flex flex-col items-center justify-center shrink-0 h-16 w-16 rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner-top">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent leading-none">{monthShort}</span>
            <span className="font-display text-3xl font-semibold text-foreground leading-none mt-1">{dayNum}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="font-display text-2xl font-semibold text-foreground leading-tight">{title}</h3>
              {isRecurring && <RecurringTag />}
            </div>
            <p className="mt-1 text-sm text-muted">{formatDate(date)}</p>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-4 flex-wrap">
          {time && (
            <div className="flex items-center gap-1.5 text-xs text-foreground/80">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span>{tCommon("at")} {formatTimeRange(time, endTime)}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-foreground/80">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        <div className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted group-hover:text-accent group-hover:border-accent/40 group-hover:bg-accent/10 group-hover:rotate-45 transition-all duration-300">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
