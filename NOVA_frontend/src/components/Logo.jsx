import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

/*
  Logo mark: "■ CampusFind" — square marker + wordmark (brand nav convention).
  `to` defaults to "/" so clicking the logo returns home.
*/
export function Logo({ to = "/", light = false, className, markClassName, name = "NOVA" }) {
  return (
    // NAV → / — logo always returns to the landing page
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 text-lg font-semibold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-cf-yellow",
        light ? "text-cf-white" : "text-cf-black",
        className,
      )}
    >
      <span className={cn("inline-block h-4 w-4 bg-cf-yellow", markClassName)} aria-hidden="true" />
      {name}
    </Link>
  )
}
