"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LogOut, Settings, Home, ShieldCheck } from "lucide-react";
import { UnreadBadge } from "@/components/UnreadBadge";
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
    { href: "/rehearsals",    label: t("rehearsals") },
    { href: "/events",        label: t("events") },
    { href: "/announcements", label: t("announcements"), badge: unreadCount },
    { href: "/members",       label: t("members") },
    ...(isAdmin ? [{ href: "/admin", label: t("admin"), badge: undefined }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        {/* Logo – klickbar zur Startseite */}
        <Link href="/" title="Zur Startseite" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <Image
              src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
              alt="AKV Hyjnesha Logo"
              width={30}
              height={30}
              className="rounded-full object-cover ring-1 ring-border group-hover:ring-accent/40 transition-all"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background ring-1 ring-border opacity-0 group-hover:opacity-100 transition-opacity">
              <Home className="h-2 w-2 text-muted" />
            </span>
          </div>
          <span className="font-playfair text-sm sm:text-[15px] font-semibold tracking-tight text-foreground group-hover:text-accent/80 transition-colors">
            AKV <em className="italic">&ldquo;Hyjnesha&rdquo;</em>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "text-foreground bg-surface-2 font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-2/60"
                }`}
              >
                {href === "/admin" && <ShieldCheck className="h-3 w-3" />}
                {label}
                {badge !== undefined && badge > 0 && <UnreadBadge count={badge} />}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label={t("settings")}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
