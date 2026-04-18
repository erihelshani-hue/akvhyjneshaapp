"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Camera, Check, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

interface SettingsFormProps {
  userId: string;
  initialFullName: string;
  initialAvatarUrl: string | null;
}

export function SettingsForm({ userId, initialFullName, initialAvatarUrl }: SettingsFormProps) {
  const t = useTranslations("settings");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSaved, setAvatarSaved] = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Nur Bilddateien erlaubt (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Bild darf maximal 5 MB groß sein.");
      return;
    }

    setAvatarLoading(true);
    setAvatarError(null);
    setAvatarSaved(false);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(storagePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setAvatarError(`Upload fehlgeschlagen: ${uploadError.message}`);
      setAvatarLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(storagePath);

    // Cache-buster so the browser reloads the new image
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      setAvatarError("Profil konnte nicht aktualisiert werden.");
    } else {
      setAvatarUrl(publicUrl);
      setAvatarSaved(true);
      router.refresh();
    }

    setAvatarLoading(false);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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

      {/* Avatar section */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 border border-border">
            <Camera className="h-3.5 w-3.5 text-muted" />
          </div>
          <p className="text-sm font-medium text-foreground">Profilbild</p>
        </div>

        <div className="flex items-center gap-5">
          {/* Clickable avatar */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className="relative group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full"
            aria-label="Profilbild ändern"
          >
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-border group-hover:border-accent/50 transition-colors">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-surface-2">
                  <span className="font-playfair text-xl font-semibold text-foreground">
                    {initials}
                  </span>
                </div>
              )}

              {/* Overlay on hover / loading */}
              <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity bg-black/50 ${
                avatarLoading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}>
                {avatarLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
            </div>

            {/* Saved checkmark badge */}
            {avatarSaved && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-surface">
                <Check className="h-3 w-3 text-white" />
              </span>
            )}
          </button>

          <div className="space-y-1.5">
            <p className="text-sm text-foreground font-medium">
              {avatarUrl ? "Bild ändern" : "Bild hochladen"}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              JPG, PNG oder WebP · max. 5 MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="text-xs text-accent hover:underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              {avatarLoading ? "Wird hochgeladen…" : "Datei auswählen"}
            </button>
          </div>
        </div>

        {avatarError && (
          <p className="text-sm text-red-400 bg-red-400/8 rounded-lg px-3 py-2 border border-red-400/20">
            {avatarError}
          </p>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Name section */}
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
