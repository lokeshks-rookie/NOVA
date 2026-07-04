import { Link } from "react-router-dom"
import { MapPin, Clock, ArrowRight } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import { CategoryBadge } from "./CategoryBadge"
import { timeAgo } from "@/lib/utils"

/*
  ItemCard — shared across landing carousel, dashboard feed, and search results.
  Card hover lifts translateY(-2px) with no added shadow (brand §8).
*/
export function ItemCard({ item }) {
  return (
    // NAV → /items/:id — open the full item detail view
    <Link
      to={`/items/${item.id}`}
      className="cf-card-hover group flex flex-col overflow-hidden rounded-2xl border border-cf-line bg-cf-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cf-black"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cf-cream">
        <img
          src={item.imageUrl || "/placeholder.svg"}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={item.type} />
        </div>
        {item.relevanceScore !== undefined && item.relevanceScore !== null && (
          <div className="absolute right-3 top-3 rounded-full bg-cf-black/75 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-cf-yellow">
            ✨ {item.relevanceScore}% Match
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <CategoryBadge category={item.category} />
          <StatusBadge status={item.status} />
        </div>
        <h3 className="line-clamp-2 text-[17px] font-medium leading-snug text-cf-black">{item.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-cf-muted">{item.description}</p>
        <div className="mt-auto flex items-center justify-between border-t border-cf-line pt-3 text-xs text-cf-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {item.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {timeAgo(item.date)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-cf-black">
          View details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
