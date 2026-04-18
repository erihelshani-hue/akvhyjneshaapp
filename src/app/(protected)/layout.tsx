import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import type { AnnouncementRead, Announcement } from "@/types/database";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRes, announcementsRes, readsRes] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("announcements").select("id"),
    supabase.from("announcement_reads").select("announcement_id").eq("user_id", user.id),
  ]);

  const announcements = (announcementsRes.data ?? []) as Pick<Announcement, "id">[];
  const reads = (readsRes.data ?? []) as Pick<AnnouncementRead, "announcement_id">[];
  const readIds = new Set(reads.map((r) => r.announcement_id));
  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;
  const isAdmin = profileRes.data?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <Header unreadCount={unreadCount} isAdmin={isAdmin} />
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-safe-nav sm:px-6">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
}
