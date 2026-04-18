import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
