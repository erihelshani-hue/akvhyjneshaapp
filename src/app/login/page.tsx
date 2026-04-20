"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight } from "lucide-react";

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
      className="relative flex min-h-screen flex-col items-center justify-center px-5 overflow-hidden"
      style={{ minHeight: "-webkit-fill-available" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 20%, rgba(211,22,34,0.22) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 20% 80%, rgba(212,175,55,0.08) 0%, transparent 60%)" }}
      />
      <div className="absolute top-1/4 -left-24 h-64 w-64 rounded-full bg-accent/15 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-56 w-56 rounded-full bg-gold/8 blur-[90px] pointer-events-none" />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/30 blur-xl animate-pulse-glow" />
            <Image
              src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
              alt="AKV Hyjnesha"
              width={88}
              height={88}
              className="relative rounded-full object-cover ring-2 ring-white/10 shadow-[0_8px_32px_rgba(211,22,34,0.3)]"
              priority
            />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Ansambli Kulturor Vendor</p>
            <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight leading-none">
              <em className="italic">&ldquo;Hyjnesha&rdquo;</em>
            </h1>
            <p className="text-xs text-muted/80 pt-1">Graz · Austria · Est. 2022</p>
          </div>
        </div>
        <div className="rounded-3xl glass-strong p-7 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          {mode === "magic" && sent ? (
            <div className="space-y-5 text-center py-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl glass-accent">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">{t("checkEmail")}</h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">{t("checkEmailDesc", { email })}</p>
              </div>
              <button onClick={() => { setSent(false); setMode("password"); }}
                className="text-sm text-muted hover:text-foreground underline underline-offset-4 decoration-muted/30 hover:decoration-foreground transition-all">
                {t("backToLogin")}
              </button>
            </div>
          ) : mode === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div className="mb-2">
                <h2 className="font-display text-2xl font-semibold text-foreground">Willkommen zurück</h2>
                <p className="text-xs text-muted mt-1">Mirë se erdhe përsëri</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted">{t("emailLabel")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60 pointer-events-none" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")} required autoComplete="email" autoFocus className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted">{t("passwordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60 pointer-events-none" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")} required autoComplete="current-password" className="pl-10" />
                </div>
              </div>
              {error && <p className="text-sm text-red-300 bg-red-500/8 rounded-xl px-3.5 py-2.5 border border-red-500/25">{error}</p>}
              <Button type="submit" disabled={loading} size="lg" className="w-full group">
                {loading ? t("signingIn") : t("signIn")}
                {!loading && <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />}
              </Button>
              <div className="text-center pt-1">
                <button type="button" onClick={() => switchMode("magic")}
                  className="text-sm text-muted hover:text-gold underline underline-offset-4 decoration-muted/30 hover:decoration-gold transition-all">
                  {t("switchToMagicLink")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div className="mb-2">
                <h2 className="font-display text-2xl font-semibold text-foreground">Magic Link</h2>
                <p className="text-xs text-muted mt-1">Anmeldung per E-Mail-Link</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-magic" className="text-xs font-semibold uppercase tracking-wider text-muted">{t("emailLabel")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60 pointer-events-none" />
                  <Input id="email-magic" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")} required autoComplete="email" autoFocus className="pl-10" />
                </div>
              </div>
              {error && <p className="text-sm text-red-300 bg-red-500/8 rounded-xl px-3.5 py-2.5 border border-red-500/25">{error}</p>}
              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? t("sending") : t("sendLink")}
              </Button>
              <div className="text-center pt-1">
                <button type="button" onClick={() => switchMode("password")}
                  className="text-sm text-muted hover:text-foreground underline underline-offset-4 decoration-muted/30 hover:decoration-foreground transition-all">
                  {t("switchToPassword")}
                </button>
              </div>
            </form>
          )}
        </div>
        <p className="text-center text-[10px] text-muted/50 mt-6 uppercase tracking-[0.25em]">
          Ansambël · Tradita · Pasion
        </p>
      </div>
    </div>
  );
}
