"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message || t("error"));
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-background overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(211,22,34,0.10) 0%, transparent 65%)",
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative">
            <Image
              src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
              alt="AKV Hyjnesha"
              width={72}
              height={72}
              className="rounded-full object-cover ring-2 ring-border"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="font-playfair text-2xl font-semibold text-foreground tracking-tight">
              AKV <em className="italic">&ldquo;Hyjnesha&rdquo;</em>
            </h1>
            <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-surface shadow-[0_8px_40px_rgba(0,0,0,0.5)] inset-highlight p-6">
          {sent ? (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-playfair text-lg font-semibold text-foreground">{t("checkEmail")}</h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">{t("checkEmailDesc", { email })}</p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-muted hover:text-foreground underline underline-offset-4 transition-colors"
              >
                {t("backToLogin")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t("emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/8 rounded-lg px-3 py-2 border border-red-400/20">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11">
                {loading ? t("sending") : t("sendLink")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
