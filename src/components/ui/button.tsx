import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-accent text-white border border-accent hover:bg-accent-hover hover:border-accent-hover shadow-[0_14px_30px_-24px_rgba(193,18,31,0.9)]",
        destructive: "bg-destructive text-white border border-destructive hover:bg-destructive/90",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-2 hover:border-warm/30",
        secondary: "bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-strong",
        ghost: "text-muted hover:text-foreground hover:bg-surface-2",
        link: "text-accent underline-offset-4 hover:underline",
        gold: "bg-gold text-background border border-gold font-bold hover:bg-gold/90",
      },
      size: {
        default: "h-12 px-5 py-2 text-sm",
        sm: "h-9 px-3.5 text-xs rounded-md",
        lg: "h-14 px-7 text-base rounded-lg",
        icon: "h-12 w-12 rounded-lg",
        "icon-sm": "h-10 w-10 rounded-md",
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
