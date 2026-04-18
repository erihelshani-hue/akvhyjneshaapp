import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";

export function RecurringTag() {
  const t = useTranslations("rehearsal");
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted border border-border/80 bg-surface-2 px-2 py-0.5 rounded-full">
      <RefreshCw className="h-2.5 w-2.5" />
      {t("recurring")}
    </span>
  );
}
