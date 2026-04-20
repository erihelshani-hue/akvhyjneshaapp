import type { SVGProps } from "react";

export function DanceIcon({ className, strokeWidth = 1.8, ...props }: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Head */}
      <circle cx="12" cy="4" r="1.5" />
      {/* Body */}
      <line x1="12" y1="5.5" x2="12" y2="12" />
      {/* Left arm raised */}
      <line x1="12" y1="7.5" x2="8" y2="5" />
      {/* Right arm out */}
      <line x1="12" y1="7.5" x2="16" y2="9" />
      {/* Left leg out */}
      <line x1="12" y1="12" x2="8.5" y2="17" />
      {/* Right leg kicked */}
      <line x1="12" y1="12" x2="16.5" y2="15" />
    </svg>
  );
}
