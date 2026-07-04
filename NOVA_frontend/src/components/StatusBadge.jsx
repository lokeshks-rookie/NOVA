import { cn } from "@/lib/utils"

/*
  StatusBadge — pill badge for item + claim states.
  Item states: Lost (black), Found (yellow), Claimed (grey), Open, Pending (pulsing), Closed.
  Claim states: Pending review, Approved, Rejected.
*/
const MAP = {
  // item type
  lost: { label: "Lost", cls: "bg-cf-black text-cf-white" },
  found: { label: "Found", cls: "bg-cf-yellow text-cf-black" },
  // item status
  open: { label: "Open", cls: "border border-cf-black text-cf-black" },
  pending: { label: "Pending", cls: "bg-cf-yellow text-cf-black cf-pulse" },
  claimed: { label: "Claimed", cls: "bg-cf-cream text-cf-muted" },
  closed: { label: "Closed", cls: "bg-cf-cream text-cf-muted" },
  // claim status
  "pending-review": { label: "Pending review", cls: "bg-cf-yellow text-cf-black cf-pulse" },
  approved: { label: "Approved", cls: "text-cf-success", style: { backgroundColor: "rgba(46,125,70,0.12)" } },
  rejected: { label: "Rejected", cls: "text-cf-danger", style: { backgroundColor: "rgba(192,57,43,0.12)" } },
}

export function StatusBadge({ status, className }) {
  const cfg = MAP[status] || { label: status, cls: "bg-cf-cream text-cf-muted" }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        cfg.cls,
        className,
      )}
      style={cfg.style}
    >
      {cfg.label}
    </span>
  )
}
