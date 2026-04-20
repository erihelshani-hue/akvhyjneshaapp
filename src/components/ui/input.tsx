import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-base text-foreground backdrop-blur-xl transition-all duration-200",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
          "placeholder:text-muted/50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "focus-visible:border-accent/70 focus-visible:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
