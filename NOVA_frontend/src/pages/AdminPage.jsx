import { useState } from "react"
import { Check, X, Eye, Clock, Package, Users, BarChart3 } from "lucide-react"
import { Eyebrow } from "@/components/Eyebrow"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/Button"
import { Label, Select, Textarea } from "@/components/ui/Field"
import { Modal } from "@/components/ui/Modal"
import { useApp } from "@/context/AppContext"
import { mockClaims, mockItems } from "@/data/mock"
import { cn, timeAgo } from "@/lib/utils"

const TABS = [
  { key: "pending", label: "Pending Claims" },
  { key: "all", label: "All Items" },
  { key: "resolved", label: "Resolved" },
  { key: "analytics", label: "Analytics" },
]

const REJECT_REASONS = [
  "Answer does not match verification",
  "Insufficient proof of ownership",
  "Duplicate claim",
  "Fraudulent claim attempt",
  "Other",
]

export default function AdminPage() {
  const { addToast } = useApp()
  const [activeTab, setActiveTab] = useState("pending")
  const [claims, setClaims] = useState(mockClaims)

  // Modal state
  const [rejectModal, setRejectModal] = useState(null) // claim object
  const [approveModal, setApproveModal] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectNote, setRejectNote] = useState("")

  const pendingClaims = claims.filter((c) => c.status === "pending")
  const resolvedClaims = claims.filter((c) => c.status === "approved" || c.status === "rejected")

  const stats = [
    { label: "Total items", value: mockItems.length, icon: Package },
    { label: "Open claims", value: pendingClaims.length, icon: Clock },
    { label: "Items this week", value: mockItems.filter((i) => new Date(i.date) > Date.now() - 7 * 86400000).length, icon: BarChart3 },
    { label: "Avg resolution", value: "18h", icon: Users },
  ]

  const handleApprove = (claim) => {
    const pin = Math.floor(1000 + Math.random() * 9000)
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claim.id
          ? { ...c, status: "approved", pickupInfo: `Collect from Lost & Found desk, Main Block. PIN: ${pin}` }
          : c,
      ),
    )
    setApproveModal(null)
    addToast({ variant: "success", title: "Claim approved", message: `Pickup PIN: ${pin}` })
  }

  const handleReject = (claim) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claim.id
          ? { ...c, status: "rejected", adminNote: `${rejectReason}${rejectNote ? ". " + rejectNote : ""}` }
          : c,
      ),
    )
    setRejectModal(null)
    setRejectReason("")
    setRejectNote("")
    addToast({ variant: "info", title: "Claim rejected", message: `Claim for ${claim.itemTitle} has been rejected.` })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Eyebrow className="text-cf-muted">Admin panel</Eyebrow>
      <h1 className="cf-h1 mt-3 mb-8">Administration</h1>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-cf-line bg-cf-white p-5">
            <div className="flex items-center gap-2 text-cf-muted">
              <s.icon className="h-4 w-4" strokeWidth={1.75} />
              <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-cf-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "cf-focus-ring shrink-0 px-5 py-3 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-cf-black text-cf-black"
                : "text-cf-muted hover:text-cf-black",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Pending Claims ───────────────────────────────────────── */}
      {activeTab === "pending" && (
        <>
          {pendingClaims.length === 0 ? (
            <EmptyState title="No pending claims" message="All claims have been reviewed." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-cf-line text-xs uppercase tracking-wide text-cf-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Claimant</th>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Submitted</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">Challenge answer</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cf-line">
                  {pendingClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-cf-cream/50">
                      <td className="px-4 py-3 font-medium">{claim.claimantName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={claim.itemImage}
                            alt={claim.itemTitle}
                            className="hidden h-10 w-10 rounded-lg border border-cf-line object-cover sm:block"
                          />
                          <span className="max-w-[180px] truncate">{claim.itemTitle}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-cf-muted md:table-cell">{timeAgo(claim.claimDate)}</td>
                      <td className="hidden max-w-[200px] truncate px-4 py-3 text-cf-muted lg:table-cell">
                        {claim.challengeAnswer}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status="pending-review" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setApproveModal(claim)}
                            className="cf-focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-cf-success/10 text-cf-success hover:bg-cf-success/20"
                            aria-label="Approve claim"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setRejectModal(claim)}
                            className="cf-focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-cf-danger/10 text-cf-danger hover:bg-cf-danger/20"
                            aria-label="Reject claim"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── All Items ────────────────────────────────────────────── */}
      {activeTab === "all" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cf-line text-xs uppercase tracking-wide text-cf-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Location</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Reported</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cf-line">
              {mockItems.map((item) => (
                <tr key={item.id} className="hover:bg-cf-cream/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="hidden h-10 w-10 rounded-lg border border-cf-line object-cover sm:block"
                      />
                      <span className="max-w-[200px] truncate font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.type} />
                  </td>
                  <td className="hidden px-4 py-3 text-cf-muted sm:table-cell">{item.location}</td>
                  <td className="hidden px-4 py-3 text-cf-muted md:table-cell">{timeAgo(item.date)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Resolved ─────────────────────────────────────────────── */}
      {activeTab === "resolved" && (
        <>
          {resolvedClaims.length === 0 ? (
            <EmptyState title="No resolved claims" message="Resolved claims will appear here." />
          ) : (
            <div className="space-y-3">
              {resolvedClaims.map((claim) => (
                <div key={claim.id} className="flex items-center gap-4 rounded-2xl border border-cf-line bg-cf-white p-4">
                  <img
                    src={claim.itemImage}
                    alt={claim.itemTitle}
                    className="h-12 w-12 shrink-0 rounded-xl border border-cf-line object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{claim.itemTitle}</p>
                    <p className="text-xs text-cf-muted">{claim.claimantName} · {timeAgo(claim.claimDate)}</p>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Analytics (placeholder) ──────────────────────────────── */}
      {activeTab === "analytics" && (
        <EmptyState title="Analytics coming soon" message="Detailed analytics and reporting will be available in a future update." />
      )}

      {/* ── Approve modal ────────────────────────────────────────── */}
      <Modal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        title="Approve claim?"
      >
        <p className="text-sm leading-relaxed text-cf-muted">
          Approving this claim will generate a pickup PIN and notify the claimant ({approveModal?.claimantName}) to collect the item.
        </p>
        <div className="mt-2 rounded-xl border border-cf-line bg-cf-cream p-3">
          <p className="text-xs font-medium text-cf-muted">Item</p>
          <p className="text-sm font-medium">{approveModal?.itemTitle}</p>
          <p className="mt-2 text-xs font-medium text-cf-muted">Answer provided</p>
          <p className="text-sm">{approveModal?.challengeAnswer}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setApproveModal(null)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => handleApprove(approveModal)}>
            Approve & generate PIN
          </Button>
        </div>
      </Modal>

      {/* ── Reject modal ─────────────────────────────────────────── */}
      <Modal
        open={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectReason(""); setRejectNote("") }}
        title="Reject claim"
      >
        <p className="text-sm leading-relaxed text-cf-muted">
          Rejecting the claim by {rejectModal?.claimantName} for &ldquo;{rejectModal?.itemTitle}&rdquo;.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="admin-reason">Reason</Label>
            <Select id="admin-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}>
              <option value="">Select reason</option>
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="admin-note">Note (optional)</Label>
            <Textarea
              id="admin-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Add additional context for the claimant..."
              rows={2}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => { setRejectModal(null); setRejectReason(""); setRejectNote("") }}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" disabled={!rejectReason} onClick={() => handleReject(rejectModal)}>
            Reject claim
          </Button>
        </div>
      </Modal>
    </div>
  )
}
