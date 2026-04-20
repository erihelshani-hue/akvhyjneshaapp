"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail } from "lucide-react";

type Mode = "password" | "magic";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSent(false);
  }

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(t("passwordError"));
      setLoading(false);
    } else {
      router.replace("/");
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signInError) {
      setError(signInError.message || t("error"));
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5"
      style={{ minHeight: "-webkit-fill-available" }}
    >
      {/* Editorial frame lines — matches website grid overlay aesthetic */}
      <div className="absolute inset-8 pointer-events-none border border-[rgba(245,237,226,0.06)]" />
      <div className="absolute inset-16 pointer-events-none border border-[rgba(245,237,226,0.035)]" />

      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
            alt="AKV Hyjnesha"
            width={88}
            height={88}
            className="relative rounded-full object-cover ring-1 ring-border-strong shadow-card"
            priority
          />
          <div className="space-y-1.5 text-center">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              Ansambli i Këngëve dhe Valleve
            </p>
            <h1 className="font-display text-4xl font-medium text-foreground tracking-tight leading-none">
              <em className="italic">&ldquo;Hyjnesha&rdquo;</em>
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80 pt-1">
              Graz · Austria · Est. 2022
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-sm glass-strong p-7">
          {mode === "magic" && sent ? (
            <div className="space-y-5 py-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm glass-accent">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-medium text-foreground">{t("checkEmail")}</h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">{t("checkEmailDesc", { email })}</p>
              </div>
              <button
                onClick={() => {
                  setSent(false);
                  setMode("password");
                }}
                className="text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-all hover:text-foreground hover:decoration-foreground"
              >
                {t("backToLogin")}
              </button>
            </div>
          ) : mode === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="mb-2">
                <h2 className="font-display text-2xl font-medium text-foreground">Willkommen zurück</h2>
                <p className="text-xs text-muted mt-1">Mirë se erdhe përsëri</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                  {t("emailLabel")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60 pointer-events-none" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")} required autoComplete="email" autoFocus className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                  {t("passwordLabel")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60 pointer-events-none" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")} required autoComplete="current-password" className="pl-10" />
                </div>
              </div>
              {error && <p className="text-sm text-red-300 bg-red-500/8 rounded-sm px-3.5 py-2.5 border border-red-500/25">{error}</p>}
              <Button type="submit" disabled={loading} size="lg" className="w-full group">
                {loading ? t("signingIn") : t("signIn")}
                {!loading && <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />}
              </Button>
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => switchMode("magic")}
                  className="text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-all hover:text-foreground hover:decoration-foreground"
                >
                  {t("switchToMagicLink")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div className="mb-2">
                <h2 className="font-display text-2xl font-medium text-foreground">Magic Link</h2>
                <p className="text-xs text-muted mt-1">Anmeldung per E-Mail-Link</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-magic" className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                  {t("emailLabel")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60 pointer-events-none" />
                  <Input id="email-magic" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")} required autoComplete="email" autoFocus className="pl-10" />
                </div>
              </div>
              {error && <p className="text-sm text-red-300 bg-red-500/8 rounded-sm px-3.5 py-2.5 border border-red-500/25">{error}</p>}
              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? t("sending") : t("sendLink")}
              </Button>
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => switchMode("password")}
                  className="text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-all hover:text-foreground hover:decoration-foreground"
                >
                  {t("switchToPassword")}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-muted/50 mt-6 uppercase tracking-[0.18em]">
          Ansambël · Tradita · Pasion
        </p>
      </div>
    </div>
  );
}
