import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { MapPin, Clock, Share2, Flag, ChevronRight, ArrowLeft } from "lucide-react"
import { StatusBadge } from "@/components/StatusBadge"
import { CategoryBadge } from "@/components/CategoryBadge"
import { Eyebrow } from "@/components/Eyebrow"
import { Button } from "@/components/ui/Button"
import { useApp } from "@/context/AppContext"
import { timeAgo, formatDate } from "@/lib/utils"
import api from "@/lib/api"

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, addToast } = useApp()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [userClaimStatus, setUserClaimStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    Promise.all([
      api.get(`/items/${id}`),
      user ? api.get(`/claims/check/${id}`).catch(() => null) : Promise.resolve(null)
    ])
      .then(([itemRes, claimRes]) => {
        if (cancelled) return
        const d = itemRes?.data
        setItem({
          id: d._id || d.id,
          type: d.type,
          category: d.category,
          title: d.title,
          description: d.description,
          location: d.location,
          date: d.date || d.createdAt,
          status: d.status,
          imageUrl: d.imageUrls?.[0] || null,
          reportedBy: d.reportedBy?.name || "a campus member",
          challengeQuestion: d.challengeQuestions?.[0] || null,
        })

        if (claimRes?.data?.hasClaim) {
          setUserClaimStatus(claimRes.data.claimStatus)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, user])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-cf-muted">Loading item...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="cf-h1">Item not found</h1>
        <p className="mt-2 text-cf-muted">This item may have been removed or does not exist.</p>
        {/* NAV → /search — go back to searching */}
        <Button as={Link} to="/search" className="mt-6" badge>
          Search items
        </Button>
      </div>
    )
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    addToast({ variant: "success", title: "Link copied", message: "Item URL copied to clipboard." })
  }

  const actionCard = () => {
    if (userClaimStatus === "pending" || userClaimStatus === "approved") {
      return (
        <div className="space-y-4 rounded-2xl border border-cf-yellow bg-cf-yellow/10 p-6">
          <h3 className="text-lg font-semibold">{userClaimStatus === "approved" ? "Claim approved" : "Claim under review"}</h3>
          <p className="text-sm leading-relaxed text-cf-muted">
            {userClaimStatus === "approved" 
              ? "Your claim for this item has been approved. Check your notifications for pickup details."
              : "Your claim for this item is currently being reviewed by the admin team."}
          </p>
          <Button disabled className="w-full">
            {userClaimStatus === "approved" ? "Claim approved" : "Claim under review"}
          </Button>
        </div>
      )
    }

    if (item.status === "open") {
      if (item.type === "lost") {
        return (
          <div className="space-y-4 rounded-2xl border border-cf-line bg-cf-white p-6">
            <h3 className="text-lg font-semibold">Did you find this item?</h3>
            <p className="text-sm leading-relaxed text-cf-muted">
              If you ever find this lost item, report the item here so that it could reach the owner.
            </p>
            {/* NAV → /claim/:itemId — begin report found flow */}
            <Button as={Link} to={`/claim/${item.id}?intent=found`} className="w-full" badge>
              Report found item
            </Button>
          </div>
        )
      }

      return (
        <div className="space-y-4 rounded-2xl border border-cf-line bg-cf-white p-6">
          <h3 className="text-lg font-semibold">Claim this item</h3>
          <p className="text-sm leading-relaxed text-cf-muted">
            If this belongs to you, start the claim process. You will need to verify ownership.
          </p>
          {/* NAV → /claim/:itemId — begin claim flow */}
          <Button as={Link} to={`/claim/${item.id}`} className="w-full" badge>
            Claim this item
          </Button>
        </div>
      )
    }
    if (item.status === "pending") {
      return (
        <div className="space-y-4 rounded-2xl border border-cf-yellow bg-cf-yellow/10 p-6">
          <h3 className="text-lg font-semibold">Claim under review</h3>
          <p className="text-sm leading-relaxed text-cf-muted">
            A claim for this item is currently being reviewed by the admin team.
          </p>
          <Button disabled className="w-full">
            Claim under review
          </Button>
        </div>
      )
    }
    return (
      <div className="space-y-4 rounded-2xl border border-cf-line bg-cf-cream p-6">
        <h3 className="text-lg font-semibold text-cf-muted">This item has been claimed</h3>
        <p className="text-sm leading-relaxed text-cf-muted">
          This item has been successfully returned to its owner.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-cf-muted">
        {/* NAV → /search — back to search results */}
        <Link to="/search" className="hover:text-cf-black">Search results</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-cf-black">Item detail</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left column — 60% */}
        <div className="flex-1 lg:max-w-[60%]">
          {/* Image gallery */}
          <div className="overflow-hidden rounded-2xl border border-cf-line bg-cf-cream">
            <img
              src={item.imageUrl || "/placeholder.svg"}
              alt={item.title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.type} />
              <StatusBadge status={item.status} />
            </div>

            <h1 className="cf-h1">{item.title}</h1>

            <p className="text-[15px] leading-relaxed text-cf-muted">{item.description}</p>

            <div className="flex flex-wrap gap-6 border-t border-cf-line pt-5 text-sm text-cf-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {item.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {timeAgo(item.date)}
              </span>
            </div>

            <p className="text-sm text-cf-muted">
              Reported by {item.reportedBy} · {formatDate(item.date)}
            </p>
          </div>
        </div>

        {/* Right column — 40% */}
        <div className="lg:w-[40%]">
          <div className="sticky top-24 space-y-4">
            {actionCard()}

            <button
              onClick={handleShare}
              className="cf-focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-cf-line py-3 text-sm font-medium text-cf-black hover:bg-cf-cream"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>

            <button className="flex w-full items-center justify-center gap-2 py-2 text-sm text-cf-muted hover:text-cf-danger">
              <Flag className="h-4 w-4" /> Report this listing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
