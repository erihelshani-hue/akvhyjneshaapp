import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const [user, supabase] = await Promise.all([getUser(), createClient()]);

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <SettingsForm
      userId={user.id}
      initialFullName={profile?.full_name ?? user.email?.split("@")[0] ?? ""}
      initialAvatarUrl={profile?.avatar_url ?? null}
    />
  );
}
