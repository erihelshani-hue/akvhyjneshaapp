import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { AdminTabs } from "./AdminTabs";
import { ShieldCheck } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <h1 className="font-playfair text-2xl font-semibold text-foreground tracking-tight">
          Admin
        </h1>
      </div>

      <AdminTabs />

      <div>{children}</div>
    </div>
  );
}
