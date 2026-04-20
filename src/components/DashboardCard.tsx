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
      <div className="relative rounded-sm glass p-6 overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-surface-2 border border-border">
            <Icon className="h-4 w-4 text-muted" />
          </div>
          <p className="font-inter text-[0.7rem] font-bold uppercase tracking-[0.3em] text-muted">{label}</p>
        </div>
        <p className="text-sm text-muted/80 leading-relaxed">
          {type === "rehearsal" ? t("noUpcomingRehearsal") : t("noUpcomingEvent")}
        </p>
      </div>
    );
  }

  const dayNum    = new Date(date + "T00:00:00").getDate();
  const monthShort = new Date(date + "T00:00:00").toLocaleDateString("de-AT", { month: "short" });

  return (
    <Link href={href} className="block group">
      <div className="relative rounded-sm glass p-6 overflow-hidden transition-all duration-300 hover:border-[rgba(245,237,226,0.25)] hover:shadow-card-hover hover:-translate-y-0.5">

        {/* Eyebrow — matches website .section-eyebrow pattern */}
        <div className="relative flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent/10 border border-accent/25">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div className="flex items-center gap-3">
            <span className="block w-7 h-px bg-accent flex-shrink-0" />
            <p className="font-inter text-[0.7rem] font-bold uppercase tracking-[0.3em] text-muted">{label}</p>
          </div>
        </div>

        {/* Date + Title */}
        <div className="relative flex items-start gap-4">
          {/* Date block — editorial style like website .event-date */}
          <div className="flex flex-col items-center justify-center shrink-0 h-16 w-14 border-r border-border pr-4">
            <span className="font-inter text-[0.72rem] font-bold uppercase tracking-[0.25em] text-accent leading-none">{monthShort}</span>
            <span className="font-display text-[2.8rem] font-normal text-foreground leading-none mt-0.5">{dayNum}</span>
          </div>
          <div className="flex-1 min-w-0 pl-1">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="font-display text-2xl font-medium text-foreground leading-tight">{title}</h3>
              {isRecurring && <RecurringTag />}
            </div>
            <p className="mt-1 text-sm text-muted">{formatDate(date)}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="relative mt-5 flex items-center gap-4 flex-wrap pt-4 border-t border-border">
          {time && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{tCommon("at")} {formatTimeRange(time, endTime)}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>

        {/* Arrow — website-like hover */}
        <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-[rgba(245,237,226,0.04)] text-muted group-hover:text-white group-hover:border-accent group-hover:bg-accent transition-all duration-300">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
