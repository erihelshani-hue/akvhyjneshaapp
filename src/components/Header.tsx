"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { LogOut, Settings, ShieldCheck, PersonStanding, Calendar, Bell, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

interface HeaderProps {
  unreadCount: number;
  isAdmin: boolean;
}

export function Header({ unreadCount, isAdmin }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/rehearsals", label: t("rehearsals"), Icon: PersonStanding },
    { href: "/events", label: t("events"), Icon: Calendar },
    { href: "/announcements", label: t("announcements"), Icon: Bell, badge: unreadCount },
    { href: "/members", label: t("members"), Icon: Users },
    ...(isAdmin ? [{ href: "/admin", label: t("admin"), Icon: ShieldCheck, badge: undefined }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-40 glass-nav border-b border-white/[0.07]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="relative max-w-6xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-4">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-40 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <Link href="/" title="Zur Startseite" aria-label="Zur Startseite" className="group flex items-center gap-2.5 shrink-0">
          <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-accent/40 transition-all duration-300">
            <Image
              src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
              alt="AKV Hyjnesha"
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              AKV <em className="italic text-gold">&ldquo;Hyjnesha&rdquo;</em>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted/80">Graz · Austria</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, Icon, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "text-foreground bg-white/[0.08] font-semibold border border-white/10"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
                {badge !== undefined && badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_0_10px_rgba(211,22,34,0.6)]">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted border border-white/8 bg-white/[0.03] hover:text-foreground hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
            aria-label={t("settings")}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted border border-white/8 bg-white/[0.03] hover:text-accent hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
