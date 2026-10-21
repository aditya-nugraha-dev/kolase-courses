import { twMerge } from "tailwind-merge";

// Gabungkan class Tailwind dan selesaikan konflik utility (bg, border, text, radius).
export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
