import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [{ count: totalCount }, { count: readCount }] = await Promise.all([
    supabase.from("announcements").select("*", { count: "exact", head: true }),
    supabase
      .from("announcement_reads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const unreadCount = Math.max(0, (totalCount ?? 0) - (readCount ?? 0));

  return (
    <div className="min-h-screen bg-background">
      <Header unreadCount={unreadCount} />
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-safe-nav sm:px-6">
        {children}
      </main>
      <BottomNav unreadCount={unreadCount} />
    </div>
  );
}
