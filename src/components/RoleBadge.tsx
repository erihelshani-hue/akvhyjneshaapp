import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role !== "admin") return null;
  return (
    <Badge variant="gold" className="text-[10px] uppercase tracking-wider font-semibold">
      Admin
    </Badge>
  );
}
