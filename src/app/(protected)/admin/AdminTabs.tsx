"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { BarChart2, Archive, CreditCard, LayoutDashboard } from "lucide-react";

const TABS = [
  { href: "/admin",              label: "Übersicht",   Icon: LayoutDashboard },
  { href: "/admin/attendance",   label: "Anwesenheit", Icon: BarChart2 },
  { href: "/admin/archive",      label: "Archiv",      Icon: Archive },
  { href: "/admin/contributions",label: "Beiträge",    Icon: CreditCard },
] as const;

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border pb-0 -mb-px">
      {TABS.map(({ href, label, Icon }) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground hover:border-border"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
