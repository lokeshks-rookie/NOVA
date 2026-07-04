import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const inputBase =
  "cf-focus-ring w-full rounded-xl border border-cf-line bg-cf-white px-4 py-2.5 text-[15px] text-cf-black placeholder:text-cf-muted transition-colors"

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputBase, className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputBase, "min-h-28 resize-y leading-relaxed", className)} {...props} />
})

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(inputBase, "appearance-none bg-[right_1rem_center] pr-10", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2375797B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
      }}
      {...props}
    >
      {children}
    </select>
  )
})

export function Label({ className, children, ...props }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-cf-black", className)} {...props}>
      {children}
    </label>
  )
}

// Toggle switch used across settings + saved searches
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow focus-visible:ring-offset-2",
        checked ? "bg-[#22c55e]" : "bg-[#d1d5db] dark:bg-[#4b5563]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
