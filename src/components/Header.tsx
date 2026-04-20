"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { Bell, Calendar, LogOut, PersonStanding, Settings, ShieldCheck, Users } from "lucide-react";
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
    { href: "/rehearsals",   label: t("rehearsals"),   Icon: PersonStanding },
    { href: "/events",       label: t("events"),        Icon: Calendar },
    { href: "/announcements",label: t("announcements"), Icon: Bell, badge: unreadCount },
    { href: "/members",      label: t("members"),       Icon: Users },
    ...(isAdmin ? [{ href: "/admin", label: t("admin"), Icon: ShieldCheck, badge: undefined }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-40 glass-nav border-b"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="relative max-w-6xl mx-auto px-4 h-[4.25rem] flex items-center justify-between gap-4">

        {/* Brand — mirrors website .nav-brand */}
        <Link
          href="/"
          title="Zur Startseite"
          aria-label="Zur Startseite"
          className="group flex items-center gap-3 shrink-0"
        >
          <div
            className="relative h-[54px] w-[54px] shrink-0 rounded-full overflow-hidden border border-border-strong group-hover:border-accent/40 transition-all duration-300"
            style={{ boxShadow: "0 0 0 3px rgba(245,237,226,0.08)" }}
          >
            <Image
              src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
              alt="AKV Hyjnesha"
              fill
              className="object-cover"
              sizes="54px"
              priority
            />
          </div>
          <span className="hidden sm:block font-display text-[1.125rem] font-semibold text-foreground">
            AKV <em className="italic text-foreground">&ldquo;Hyjnesha&rdquo;</em>
          </span>
        </Link>

        {/* Desktop nav — mirrors website .nav-links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ href, label, Icon, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 text-[0.78rem] font-medium tracking-[0.02em] transition-colors duration-200 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
                {badge !== undefined && badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold leading-none text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted border border-border bg-[rgba(245,237,226,0.05)] hover:text-foreground hover:bg-[rgba(245,237,226,0.09)] hover:border-border-strong transition-all duration-200"
            aria-label={t("settings")}
            style={{ boxShadow: "0 0 0 0 transparent" }}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted border border-border bg-[rgba(245,237,226,0.05)] hover:text-white hover:bg-accent hover:border-accent transition-all duration-200"
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
