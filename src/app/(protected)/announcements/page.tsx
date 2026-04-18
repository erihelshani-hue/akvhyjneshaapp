import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnnouncementsMarkRead } from "./AnnouncementsMarkRead";
import { AnnouncementDeleteButton } from "./AnnouncementDeleteButton";
import { formatDate } from "@/lib/utils";
import { Edit, Plus } from "lucide-react";

export default async function AnnouncementsPage({
}: Record<string, never>) {
  const t = await getTranslations("announcement");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const [announcementsRes, readsRes] = await Promise.all([
    supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    supabase.from("announcement_reads").select("announcement_id").eq("user_id", user!.id),
  ]);

  const announcements = announcementsRes.data ?? [];
  const readIds = new Set(readsRes.data?.map((r: { announcement_id: string }) => r.announcement_id) ?? []);
  const unreadIds = announcements
    .filter((a: { id: string }) => !readIds.has(a.id))
    .map((a: { id: string }) => a.id);

  return (
    <div className="space-y-6">
      {unreadIds.length > 0 && <AnnouncementsMarkRead unreadIds={unreadIds} userId={user!.id} />}

      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground tracking-tight">
          {t("title")}
        </h1>
        {isAdmin && (
          <Link href="/announcements/new" aria-label={t("new")}>
            <Button size="icon" className="rounded-full h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <p className="text-sm text-muted">{t("noAnnouncements")}</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement: {
            id: string;
            title: string;
            body: string;
            created_at: string;
          }) => {
            const isUnread = !readIds.has(announcement.id);
            const title = announcement.title;
            const body = announcement.body;
            return (
              <div
                key={announcement.id}
                className={`rounded-xl border p-5 transition-colors duration-200 ${
                  isUnread
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {isUnread && (
                      <span className="mt-[6px] shrink-0 h-2 w-2 bg-accent rounded-full" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-playfair text-lg font-semibold text-foreground leading-tight">
                        {title}
                      </h2>
                      <p className="text-[11px] text-muted mt-1">
                        {tCommon("postedOn")} {formatDate(announcement.created_at.substring(0, 10))}
                      </p>
                      <p className="text-sm text-foreground/80 mt-3 leading-relaxed whitespace-pre-wrap">
                        {body}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/announcements/${announcement.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-foreground hover:border-zinc-600"
                        aria-label={t("edit")}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <AnnouncementDeleteButton announcementId={announcement.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
