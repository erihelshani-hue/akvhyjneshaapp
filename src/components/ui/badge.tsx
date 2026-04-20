import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-white shadow-[0_2px_8px_-2px_rgba(211,22,34,0.5)]",
        secondary: "bg-white/[0.06] text-foreground/80 border border-white/10 backdrop-blur-sm",
        destructive: "bg-destructive/15 text-red-300 border border-destructive/30",
        outline: "border border-white/15 text-foreground/80",
        gold: "bg-gold/12 text-gold border border-gold/30",
        unread: "bg-accent text-white shadow-[0_0_12px_rgba(211,22,34,0.6)]",
        success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
