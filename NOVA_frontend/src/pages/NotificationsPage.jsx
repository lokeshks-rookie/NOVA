import { useState } from "react"
import { Bell, GitCompareArrows, FileCheck, Info, CheckCheck } from "lucide-react"
import { Eyebrow } from "@/components/Eyebrow"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/Button"
import { useApp } from "@/context/AppContext"
import { cn, timeAgo } from "@/lib/utils"

const TABS = [
  { key: "all", label: "All" },
  { key: "match", label: "Matches" },
  { key: "claim", label: "Claims" },
  { key: "system", label: "System" },
]

const TYPE_CONFIG = {
  match: {
    icon: GitCompareArrows,
    borderColor: "border-l-cf-yellow",
    iconBg: "bg-cf-yellow text-cf-black",
  },
  claim: {
    icon: FileCheck,
    borderColor: "border-l-cf-black",
    iconBg: "bg-cf-black text-cf-white",
  },
  system: {
    icon: Info,
    borderColor: "border-l-cf-muted",
    iconBg: "bg-cf-cream text-cf-muted",
  },
}

export default function NotificationsPage() {
  const { notifications, markAllRead, markRead } = useApp()
  const [activeTab, setActiveTab] = useState("all")

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow className="text-cf-muted">Your notifications</Eyebrow>
          <h1 className="cf-h1 mt-3">Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button variant="ghost" onClick={markAllRead} size="sm">
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mt-6 mb-6 flex gap-1 border-b border-cf-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "cf-focus-ring px-5 py-3 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-cf-black text-cf-black"
                : "text-cf-muted hover:text-cf-black",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          message={activeTab === "all" ? "You're all caught up." : `No ${activeTab} notifications.`}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system
            const Icon = cfg.icon
            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => markRead(notif.id)}
                className={cn(
                  "cf-focus-ring flex w-full items-start gap-4 rounded-2xl border border-cf-line border-l-4 px-5 py-4 text-left transition-colors",
                  cfg.borderColor,
                  notif.read ? "bg-cf-white" : "bg-cf-cream",
                )}
              >
                <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", cfg.iconBg)}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", notif.read ? "text-cf-black" : "text-cf-black")}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cf-yellow" aria-label="Unread" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-cf-muted">{notif.body}</p>
                  <p className="mt-1.5 text-xs text-cf-muted">{timeAgo(notif.date)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
