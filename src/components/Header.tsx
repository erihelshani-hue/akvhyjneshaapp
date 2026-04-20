"use client";

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
    { href: "/rehearsals", label: t("rehearsals") },
    { href: "/events", label: t("events") },
    { href: "/announcements", label: t("announcements"), badge: unreadCount },
    { href: "/members", label: t("members") },
    ...(isAdmin ? [{ href: "/admin", label: t("admin"), badge: undefined }] : []),
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link
          href="/"
          title="Zur Startseite"
          aria-label="Zur Startseite"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:border-zinc-600 hover:bg-surface-2 transition-colors"
        >
          <Home className="h-4 w-4 text-accent" />
          <span>Home</span>
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
