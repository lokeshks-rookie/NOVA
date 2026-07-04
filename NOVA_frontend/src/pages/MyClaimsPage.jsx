import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Eyebrow } from "@/components/Eyebrow"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/Button"
import { useApp } from "@/context/AppContext"
import { cn, timeAgo } from "@/lib/utils"
import api from "@/lib/api"

const TABS = ["My Claims", "My Reports"]

export default function MyClaimsPage() {
  const { user } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  const [myClaims, setMyClaims] = useState([])
  const [myReports, setMyReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      api.get("/claims/mine").catch(() => ({ data: [] })),
      api.get("/items?reportedBy=me").catch(() => ({ data: [] })),
    ]).then(([claimsRes, reportsRes]) => {
      if (cancelled) return

      setMyClaims(
        (claimsRes?.data || []).map((c) => ({
          id: c._id || c.id,
          itemId: c.item?._id || c.item?.id || c.itemId,
          itemTitle: c.item?.title || "Unknown item",
          itemImage: c.item?.imageUrls?.[0] || "/placeholder.svg",
          claimDate: c.createdAt || c.claimDate,
          status: c.status,
          challengeAnswer: c.challengeAnswer,
          adminNote: c.adminNote || null,
          pickupInfo: c.pickupInfo || null,
        }))
      )

      setMyReports(
        (reportsRes?.data || []).map((item) => ({
          id: item._id || item.id,
          title: item.title,
          location: item.location,
          date: item.date || item.createdAt,
          status: item.status,
          imageUrl: item.imageUrls?.[0] || "/placeholder.svg",
        }))
      )
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const claimStatus = (s) => {
    if (s === "pending") return "pending-review"
    return s
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Eyebrow className="text-cf-muted">Your activity</Eyebrow>
        <h1 className="cf-h1 mt-3 mb-8">Claims & Reports</h1>
        <p className="text-sm text-cf-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Eyebrow className="text-cf-muted">Your activity</Eyebrow>
      <h1 className="cf-h1 mt-3 mb-8">Claims & Reports</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-cf-line">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i)}
            className={cn(
              "cf-focus-ring px-5 py-3 text-sm font-medium transition-colors",
              activeTab === i
                ? "border-b-2 border-cf-black text-cf-black"
                : "text-cf-muted hover:text-cf-black",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab 0: My Claims ─────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="space-y-3">
          {myClaims.length === 0 ? (
            <EmptyState
              title="No claims yet"
              message="You haven't claimed any items yet. Start by searching."
              action={
                // NAV → /search — go find items
                <Button as={Link} to="/search" badge>
                  Search items
                </Button>
              }
            />
          ) : (
            myClaims.map((claim) => {
              const isOpen = expandedId === claim.id
              return (
                <div key={claim.id} className="overflow-hidden rounded-2xl border border-cf-line bg-cf-white">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : claim.id)}
                    className="cf-focus-ring flex w-full items-center gap-4 p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <img
                      src={claim.itemImage}
                      alt={claim.itemTitle}
                      className="h-14 w-14 shrink-0 rounded-xl border border-cf-line object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-cf-black">{claim.itemTitle}</p>
                      <p className="text-xs text-cf-muted">Claimed {timeAgo(claim.claimDate)}</p>
                    </div>
                    <StatusBadge status={claimStatus(claim.status)} />
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-cf-muted" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-cf-muted" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="cf-fade-in space-y-3 border-t border-cf-line px-5 py-4 text-sm">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-cf-muted">Your answer</p>
                        <p className="mt-1 text-cf-black">{claim.challengeAnswer}</p>
                      </div>
                      {claim.status === "rejected" && claim.adminNote && (
                        <div className="rounded-xl border border-cf-danger/20 bg-cf-danger/5 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-cf-danger">Admin notes</p>
                          <p className="mt-1 text-cf-black">{claim.adminNote}</p>
                        </div>
                      )}
                      {claim.status === "approved" && claim.pickupInfo && (
                        <div className="rounded-xl border border-cf-success/20 bg-cf-success/5 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-cf-success">Pickup instructions</p>
                          <p className="mt-1 text-cf-black">{claim.pickupInfo}</p>
                        </div>
                      )}
                      {/* NAV → /items/:id — view the claimed item */}
                      <Link
                        to={`/items/${claim.itemId}`}
                        className="inline-flex text-sm font-medium text-cf-black underline underline-offset-4"
                      >
                        View item details
                      </Link>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Tab 1: My Reports ────────────────────────────────────── */}
      {activeTab === 1 && (
        <div className="space-y-3">
          {myReports.length === 0 ? (
            <EmptyState
              title="No reports yet"
              message="You haven't reported any items. Report a lost or found item to get started."
              action={
                // NAV → /report — go report an item
                <Button as={Link} to="/report" badge>
                  Report an item
                </Button>
              }
            />
          ) : (
            myReports.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="cf-card-hover flex items-center gap-4 rounded-2xl border border-cf-line bg-cf-white p-4"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-14 w-14 shrink-0 rounded-xl border border-cf-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-cf-black">{item.title}</p>
                  <p className="text-xs text-cf-muted">{item.location} · {timeAgo(item.date)}</p>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
