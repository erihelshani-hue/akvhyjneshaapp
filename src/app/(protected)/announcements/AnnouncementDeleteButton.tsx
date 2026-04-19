"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { revalidateAnnouncements } from "./actions";

export function AnnouncementDeleteButton({ announcementId }: { announcementId: string }) {
  const t = useTranslations("announcement");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("announcements").delete().eq("id", announcementId);
    await revalidateAnnouncements();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-red-400 hover:border-red-400/30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("delete")}
        description={t("deleteConfirm")}
        onConfirm={handleDelete}
      />
    </>
  );
}
