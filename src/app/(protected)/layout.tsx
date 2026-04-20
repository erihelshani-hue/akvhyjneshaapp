import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, getUserRole } from "@/lib/auth";
import { getAnnouncementCount } from "@/lib/cached-data";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [role, supabase, totalCount] = await Promise.all([
    getUserRole(),
    createClient(),
    getAnnouncementCount(),
  ]);

  const { count: readCount } = await supabase
    .from("announcement_reads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const unreadCount = Math.max(0, totalCount - (readCount ?? 0));
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <Header unreadCount={unreadCount} isAdmin={isAdmin} />
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-safe-nav sm:px-6">
        {children}
      </main>
      <BottomNav unreadCount={unreadCount} isAdmin={isAdmin} />
    </div>
  );
}
