import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5);
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-AT", {
    day: "numeric",
    month: "short",
  });
}

export function formatTimeRange(start: string, end?: string | null): string {
  const startTime = formatTime(start);
  return end ? `${startTime} - ${formatTime(end)} Uhr` : `${startTime} Uhr`;
}

export function isEndAfterStart(start: string, end: string): boolean {
  return end > start;
}
