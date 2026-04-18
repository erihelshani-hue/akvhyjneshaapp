"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

interface SettingsFormProps {
  userId: string;
  initialFullName: string;
}

export function SettingsForm({ userId, initialFullName }: SettingsFormProps) {
  const t = useTranslations("settings");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(initialFullName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (updateError) {
      setError(t("error"));
    } else {
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleLogout() {
    setLogoutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-8">
      <h1 className="font-playfair text-3xl font-semibold text-foreground">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">{t("displayName")}</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("displayNamePlaceholder")}
            required
          />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
        {saved && <p className="text-sm text-green-300">{t("saved")}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? t("saving") : t("save")}
        </Button>
      </form>

      <section className="border-t border-border pt-6">
        <p className="text-xs uppercase tracking-widest text-muted">{t("account")}</p>
        <p className="mt-2 text-sm text-muted">{t("logoutHint")}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full justify-center sm:w-auto"
          onClick={handleLogout}
          disabled={logoutLoading}
        >
          <LogOut className="h-4 w-4" />
          {logoutLoading ? t("saving") : t("logout")}
        </Button>
      </section>
    </div>
  );
}
