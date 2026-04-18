"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4">
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(211, 22, 34, 0.18), transparent 42%), linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 56px)",
        }}
      />

      <div className="relative w-full max-w-sm space-y-8 rounded-md border border-white/15 bg-black/88 p-6 shadow-2xl shadow-black backdrop-blur">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
            alt="AKV Hyjnesha"
            width={84}
            height={84}
            className="rounded-full border border-accent/60 object-cover"
            priority
          />
          <div className="text-center">
            <h1 className="font-playfair text-2xl font-semibold text-white">
              AKV &ldquo;<em className="italic">Hyjnesha</em>&rdquo;
            </h1>
            <p className="mt-1 text-sm text-white/85">{t("subtitle")}</p>
          </div>
        </div>

        <div className="h-px bg-white/15" />

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-accent/50 bg-accent/15">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-playfair text-lg font-semibold text-white">{t("checkEmail")}</h2>
              <p className="mt-2 text-sm text-white/85">{t("checkEmailDesc", { email })}</p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-white/85 underline underline-offset-4 transition-colors hover:text-white"
            >
              {t("backToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white">
                {t("emailLabel")}
              </Label>
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
            {error && <p className="text-sm text-red-200">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("sending") : t("sendLink")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
