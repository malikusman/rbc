import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VAT_RATE = 0.05;

export function aed(n: number, opts: { decimals?: boolean } = {}) {
  const { decimals = false } = opts;
  return (
    "AED " +
    n.toLocaleString("en-GB", {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    })
  );
}

export function compactAed(n: number) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}m`;
  if (n >= 1_000) return `AED ${Math.round(n / 1_000)}k`;
  return aed(n);
}

/** A date relative to today, at a given local time. Keeps the demo evergreen. */
export function rel(days: number, hh = 9, mm = 0) {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function fmtDate(iso: string, style: "short" | "long" | "day" | "weekday" = "short") {
  const d = new Date(iso);
  if (style === "long")
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  if (style === "day") return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (style === "weekday") return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function daysFromNow(iso: string) {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(iso);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function relLabel(iso: string) {
  const n = daysFromNow(iso);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n > 1) return `In ${n} days`;
  return `${Math.abs(n)} days ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
