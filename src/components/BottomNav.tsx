"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Footprints, Calendar, Bell, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/rehearsals",    labelKey: "rehearsals",    Icon: Footprints },
  { href: "/events",        labelKey: "events",        Icon: Calendar },
  { href: "/announcements", labelKey: "announcements", Icon: Bell },
  { href: "/members",       labelKey: "members",       Icon: Users },
] as const;

interface BottomNavProps {
  unreadCount: number;
}

export function BottomNav({ unreadCount }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border/60 bg-background/98 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around h-[3.5rem]">
        {NAV_ITEMS.map(({ href, labelKey, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 relative transition-colors duration-150 ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-accent" />
              )}
              <span className="relative">
                <Icon
                  className="h-[20px] w-[20px]"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {labelKey === "announcements" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold leading-none text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[9px] font-semibold uppercase tracking-wide ${
                  isActive ? "text-accent" : "text-muted"
                }`}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
