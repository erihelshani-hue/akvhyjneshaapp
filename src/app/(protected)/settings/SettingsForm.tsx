"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, User } from "lucide-react";
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
      <h1 className="font-playfair text-3xl font-semibold text-foreground tracking-tight">
        {t("title")}
      </h1>

      {/* Profile section */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 border border-border">
            <User className="h-3.5 w-3.5 text-muted" />
          </div>
          <p className="text-sm font-medium text-foreground">{t("displayName")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name" className="text-xs text-muted font-medium">
              {t("displayName")}
            </Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("displayNamePlaceholder")}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/8 rounded-lg px-3 py-2 border border-red-400/20">
              {error}
            </p>
          )}
          {saved && (
            <p className="text-sm text-green-400 bg-green-400/8 rounded-lg px-3 py-2 border border-green-400/20">
              {t("saved")}
            </p>
          )}

          <Button type="submit" disabled={loading} size="sm">
            {loading ? t("saving") : t("save")}
          </Button>
        </form>
      </div>

      {/* Account section */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-1">
            {t("account")}
          </p>
          <p className="text-sm text-muted">{t("logoutHint")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          {logoutLoading ? t("saving") : t("logout")}
        </Button>
      </div>
    </div>
  );
}
