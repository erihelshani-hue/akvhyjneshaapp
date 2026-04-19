import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Cached per-request: vermeidet doppelten Supabase-Auth-Roundtrip
 * wenn Layout und Page beide den User brauchen.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

/**
 * Cached per-request: liest Rolle aus profiles.
 * Ruft getUser() intern auf – kein zweiter Auth-Roundtrip.
 */
export const getUserRole = cache(async (): Promise<"admin" | "member"> => {
  const user = await getUser();
  if (!user) return "member";
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return (data?.role ?? "member") as "admin" | "member";
});
