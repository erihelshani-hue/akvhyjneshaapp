import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-accent text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_16px_-4px_rgba(211,22,34,0.5)] hover:bg-accent-hover hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_24px_-4px_rgba(211,22,34,0.7)]",
        destructive: "bg-destructive text-white shadow-[0_4px_16px_-4px_rgba(220,38,38,0.45)] hover:bg-destructive/90",
        outline: "border border-white/10 bg-white/[0.03] text-foreground backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/20",
        secondary: "bg-white/[0.06] text-foreground backdrop-blur-xl border border-white/8 shadow-inner-top hover:bg-white/[0.09] hover:border-white/15",
        ghost: "text-muted hover:text-foreground hover:bg-white/[0.05]",
        link: "text-accent underline-offset-4 hover:underline",
        gold: "bg-gradient-to-br from-gold to-gold-muted text-black font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_16px_-4px_rgba(212,175,55,0.5)] hover:brightness-110",
      },
      size: {
        default: "h-12 px-5 py-2 text-sm",
        sm: "h-9 px-3.5 text-xs rounded-lg",
        lg: "h-14 px-7 text-base rounded-2xl",
        icon: "h-12 w-12 rounded-xl",
        "icon-sm": "h-10 w-10 rounded-lg",
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
