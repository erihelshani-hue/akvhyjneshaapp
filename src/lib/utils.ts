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

export function formatDateRange(startDate: string, endDate?: string | null): string {
  if (!endDate || endDate === startDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatTimeRange(start: string, end?: string | null): string {
  const startTime = formatTime(start);
  return end ? `${startTime} - ${formatTime(end)} Uhr` : `${startTime} Uhr`;
}

export function isEndAfterStart(start: string, end: string): boolean {
  return end > start;
}

export function isEndDateTimeAfterStart(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): boolean {
  return `${endDate}T${endTime}` > `${startDate}T${startTime}`;
}
