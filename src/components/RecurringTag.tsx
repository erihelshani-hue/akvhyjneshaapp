import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";

export function RecurringTag() {
  const t = useTranslations("rehearsal");
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gold border border-gold/30 bg-gold/8 px-2 py-0.5 rounded-full">
      <RefreshCw className="h-2.5 w-2.5" />
      {t("recurring")}
    </span>
  );
}
