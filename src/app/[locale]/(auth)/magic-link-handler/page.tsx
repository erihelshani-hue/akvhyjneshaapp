"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function MagicLinkHandlerPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    async function handleMagicLink() {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        router.push(`/${locale}/login`);
        return;
      }

      // Parse hash parameters
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const expiresIn = params.get("expires_in");
      const type = params.get("type");

      if (!accessToken || type !== "magiclink") {
        router.push(`/${locale}/login?error=auth&error_code=invalid_token`);
        return;
      }

      // Set session manually
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });

      if (error) {
        router.push(`/${locale}/login?error=auth&error_code=session_error`);
        return;
      }

      // Auto-create profile on first login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Mitglied",
            email: user.email!,
            role: "member",
            language_preference: locale,
          });
        }
      }

      // Redirect to dashboard
      router.push(`/${locale}`);
    }

    handleMagicLink();
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted">Wird angemeldet...</p>
      </div>
    </div>
  );
}
