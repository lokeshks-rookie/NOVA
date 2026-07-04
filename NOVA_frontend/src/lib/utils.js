import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn — merge conditional class names, dedupe conflicting Tailwind utilities
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Relative "time ago" formatter for mock timestamps
export function timeAgo(dateString) {
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const intervals = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "week", secs: 604800 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`
  }
  return "just now"
}

// Format a date like "Mon, 12 Feb 2025"
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
