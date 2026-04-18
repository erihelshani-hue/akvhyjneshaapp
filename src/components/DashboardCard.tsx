import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
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

export function DashboardCard({
  type,
  title,
  date,
  time,
  endTime,
  location,
  isRecurring,
  href,
}: DashboardCardProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const label = type === "rehearsal" ? t("nextRehearsal") : t("nextEvent");

  if (!date) {
    return (
      <Card className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-3">{label}</p>
        <p className="text-sm text-muted">{type === "rehearsal" ? t("noUpcomingRehearsal") : t("noUpcomingEvent")}</p>
      </Card>
    );
  }

  return (
    <Link href={href} className="block group">
      <Card className="p-5 group-hover:border-accent/40 group-hover:shadow-card-hover transition-all duration-200">
        {/* Accent top stripe */}
        <div className={`h-[3px] rounded-full w-8 mb-4 ${type === "rehearsal" ? "bg-accent" : "bg-accent/70"}`} />

        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">{label}</p>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-playfair text-xl font-semibold text-foreground leading-tight">
            {title}
          </h3>
          {isRecurring && <RecurringTag />}
        </div>

        <p className="mt-2 text-sm font-semibold text-foreground/90">
          {formatDate(date)}
        </p>

        <div className="mt-3 space-y-1.5">
          {time && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted/70" />
              <span>{tCommon("at")} {formatTimeRange(time, endTime)}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted/70" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Details</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </Card>
    </Link>
  );
}
