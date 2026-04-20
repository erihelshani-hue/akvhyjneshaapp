"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Bell, Calendar, PersonStanding, ShieldCheck, Users } from "lucide-react";

const BASE_NAV_ITEMS = [
  { href: "/rehearsals", labelKey: "rehearsals", Icon: PersonStanding },
  { href: "/events", labelKey: "events", Icon: Calendar },
  { href: "/announcements", labelKey: "announcements", Icon: Bell },
  { href: "/members", labelKey: "members", Icon: Users },
] as const;

const ADMIN_NAV_ITEM = { href: "/admin", labelKey: "admin", Icon: ShieldCheck } as const;

interface BottomNavProps {
  unreadCount: number;
  isAdmin: boolean;
}

export function BottomNav({ unreadCount, isAdmin }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const navItems = isAdmin ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-40 md:hidden h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(11,11,12,0.94), transparent)" }}
      />
      <nav
        className="fixed bottom-0 inset-x-0 z-50 md:hidden glass-nav border-t"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around h-[4.25rem] px-1">
          {navItems.map(({ href, labelKey, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const showBadge = labelKey === "announcements" && unreadCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 relative transition-all duration-200 active:scale-95 tap-target ${
                  isActive ? "text-accent" : "text-muted"
                }`}
                aria-label={t(labelKey)}
              >
                {isActive && (
                  <>
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full bg-accent" />
                    <span className="absolute inset-x-3 top-2 bottom-2 rounded-lg bg-accent/8 -z-10" />
                  </>
                )}
                <span className="relative">
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.3 : 1.85} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-white ring-2 ring-background">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                <span className={`font-mono text-[9px] font-medium uppercase tracking-[0.08em] mt-0.5 ${isActive ? "text-accent" : "text-muted"}`}>
                  {t(labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
