import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-white",
        secondary: "bg-surface-2 text-foreground/80 border border-border",
        destructive: "bg-destructive/15 text-red-300 border border-destructive/30",
        outline: "border border-border-strong text-foreground/80",
        gold: "bg-gold/10 text-gold border border-gold/25",
        unread: "bg-accent text-white",
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
