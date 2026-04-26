import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";
import { ContributionSummary } from "./ContributionSummary";
import type { MemberContribution } from "@/types/database";

export default async function SettingsPage() {
  const [user, supabase] = await Promise.all([getUser(), createClient()]);

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: contributions }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url, favorite_dance, member_since").eq("id", user.id).single(),
    supabase
      .from("member_contributions")
      .select("*")
      .eq("user_id", user.id)
      .order("contribution_month", { ascending: false }),
  ]);

  return (
    <SettingsForm
      userId={user.id}
      initialFullName={profile?.full_name ?? user.email?.split("@")[0] ?? ""}
      initialAvatarUrl={profile?.avatar_url ?? null}
      initialFavoriteDance={profile?.favorite_dance ?? null}
      initialMemberSince={profile?.member_since ?? null}
      contributionSummary={
        <ContributionSummary contributions={(contributions ?? []) as MemberContribution[]} />
      }
    />
  );
}
