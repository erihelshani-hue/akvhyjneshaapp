import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { getAllAnnouncements } from "@/lib/cached-data";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnnouncementsMarkRead } from "./AnnouncementsMarkRead";
import { AnnouncementDeleteButton } from "./AnnouncementDeleteButton";
import { formatDate } from "@/lib/utils";
import { Edit, Plus, Bell } from "lucide-react";

export default async function AnnouncementsPage({}: Record<string, never>) {
  const t = await getTranslations("announcement");
  const tCommon = await getTranslations("common");
  const [user, role, supabase] = await Promise.all([getUser(), getUserRole(), createClient()]);
  const isAdmin = role === "admin";

  const [announcements, readsRes] = await Promise.all([
    getAllAnnouncements(),
    supabase.from("announcement_reads").select("announcement_id").eq("user_id", user!.id),
  ]);

  const readIds = new Set(readsRes.data?.map((r: { announcement_id: string }) => r.announcement_id) ?? []);
  const unreadIds = announcements.filter((a: { id: string }) => !readIds.has(a.id)).map((a: { id: string }) => a.id);

  return (
    <div className="space-y-7 animate-fade-in-up">
      {unreadIds.length > 0 && <AnnouncementsMarkRead unreadIds={unreadIds} userId={user!.id} />}
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="brand-eyebrow mb-1.5">Njoftimet e ansamblit</p>
          <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">{t("title")}</h1>
        </div>
        {isAdmin && (
          <Link href="/announcements/new" aria-label={t("new")}>
            <Button size="icon"><Plus className="h-5 w-5" /></Button>
          </Link>
        )}
      </header>
      {announcements.length === 0 ? (
        <div className="rounded-lg glass p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 border border-border mb-4">
            <Bell className="h-6 w-6 text-muted" />
          </div>
          <p className="text-sm text-muted">{t("noAnnouncements")}</p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {announcements.map((announcement: { id: string; title: string; body: string; created_at: string }) => {
            const isUnread = !readIds.has(announcement.id);
            return (
              <article key={announcement.id}
                className={`relative rounded-lg p-6 transition-all duration-200 ${isUnread ? "glass-accent" : "glass hover:border-border-strong"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {isUnread && (
                      <span className="mt-2 shrink-0 h-2.5 w-2.5 rounded-full bg-accent" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-medium text-foreground leading-tight">{announcement.title}</h2>
                      <p className="font-mono text-[10px] text-muted mt-1.5 font-medium uppercase tracking-[0.16em]">
                        {tCommon("postedOn")} {formatDate(announcement.created_at.substring(0, 10))}
                      </p>
                      <p className="text-sm text-foreground/85 mt-4 leading-relaxed whitespace-pre-wrap">{announcement.body}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/announcements/${announcement.id}/edit`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted transition-all hover:text-foreground hover:border-white/25 hover:bg-white/[0.08]"
                        aria-label={t("edit")}>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <AnnouncementDeleteButton announcementId={announcement.id} />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
