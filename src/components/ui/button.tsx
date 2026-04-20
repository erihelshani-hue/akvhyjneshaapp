import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        /* Primary CTA — matches website .btn exactly */
        default:
          "bg-accent text-white border border-accent rounded-sm text-[0.78rem] font-bold tracking-[0.2em] uppercase hover:bg-accent-hover hover:border-accent-hover shadow-btn-red hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(211,22,34,0.6)]",
        destructive:
          "bg-destructive text-white border border-destructive rounded-sm hover:bg-destructive/90",
        /* Outline — editorial, website-flavoured */
        outline:
          "border border-border-strong bg-transparent text-foreground rounded-sm hover:bg-surface-2 hover:border-[rgba(245,237,226,0.35)]",
        secondary:
          "bg-surface-2 text-foreground border border-border rounded-sm hover:bg-surface-3 hover:border-border-strong",
        ghost:
          "text-muted hover:text-foreground hover:bg-surface-2 rounded-sm",
        link:
          "text-accent underline-offset-4 hover:underline",
        gold:
          "bg-gold text-background border border-gold rounded-sm font-bold hover:bg-gold/90",
      },
      size: {
        default: "h-12 px-5 py-2 text-sm",
        sm:      "h-9 px-3.5 text-xs rounded-sm",
        lg:      "h-14 px-7 text-base",
        icon:    "h-12 w-12 rounded-sm",
        "icon-sm": "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
