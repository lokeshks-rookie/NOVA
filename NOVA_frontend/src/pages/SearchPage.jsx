import { useState, useMemo, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search as SearchIcon, Mic, SlidersHorizontal, X } from "lucide-react"
import { ItemCard } from "@/components/ItemCard"
import { CategoryBadge } from "@/components/CategoryBadge"
import { Eyebrow } from "@/components/Eyebrow"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/Button"
import { Input, Label, Select } from "@/components/ui/Field"
import { ItemCardSkeleton } from "@/components/ui/Skeleton"
import { useApp } from "@/context/AppContext"
import { mockItems, CATEGORIES, LOCATIONS } from "@/data/mock"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const { addToast, addSavedSearch } = useApp()
  const [searchParams] = useSearchParams()
  const initialQ = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQ)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ)
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const debounceRef = useRef(null)

  // Debounced search — simulate 400ms delay
  useEffect(() => {
    setLoading(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
      setLoading(false)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const results = useMemo(() => {
    let items = [...mockItems]

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      )
    }

    if (statusFilter !== "all") {
      items = items.filter((item) => item.type === statusFilter)
    }

    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter)
    }

    if (dateFrom) {
      items = items.filter((item) => item.date >= dateFrom)
    }
    if (dateTo) {
      items = items.filter((item) => item.date <= dateTo + "T23:59:59")
    }

    if (locationFilter) {
      items = items.filter((item) => item.location === locationFilter)
    }

    return items
  }, [debouncedQuery, statusFilter, categoryFilter, dateFrom, dateTo, locationFilter])

  const clearAll = () => {
    setQuery("")
    setStatusFilter("all")
    setCategoryFilter(null)
    setDateFrom("")
    setDateTo("")
    setLocationFilter("")
  }

  const hasFilters = statusFilter !== "all" || categoryFilter || dateFrom || dateTo || locationFilter

  const handleSaveSearch = () => {
    addSavedSearch({
      id: `sch-${Date.now()}`,
      query: query || "all items",
      category: categoryFilter || "all",
      enabled: true,
      newMatches: 0,
    })
    addToast({
      variant: "success",
      title: "Search saved",
      message: "You'll be notified when new matching items are reported.",
    })
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* ── Search bar (pinned top feel) ───────────────────────────── */}
      <div className="mb-8 mt-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cf-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you lost — any detail helps"
              className="cf-focus-ring w-full rounded-full border border-cf-line bg-cf-white py-3.5 pl-12 pr-28 text-[15px] text-cf-black placeholder:text-cf-muted"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <span className="hidden rounded-full bg-cf-yellow px-2.5 py-1 text-[11px] font-semibold text-cf-black sm:inline">
                AI SEARCH
              </span>
              <button type="button" aria-label="Voice search (coming soon)" className="p-1 text-cf-muted">
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              "cf-focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors lg:hidden",
              filtersOpen ? "border-cf-black bg-cf-black text-cf-white" : "border-cf-line text-cf-muted hover:text-cf-black",
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ── Filters sidebar ─────────────────────────────────────── */}
        <aside
          className={cn(
            "shrink-0 space-y-6 lg:block lg:w-56",
            filtersOpen ? "block w-full" : "hidden",
          )}
        >
          {/* Status toggle */}
          <div>
            <Label>Status</Label>
            <div className="mt-2 flex gap-2">
              {["all", "lost", "found"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "cf-focus-ring rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
                    statusFilter === s
                      ? "bg-cf-black text-cf-white"
                      : "border border-cf-line text-cf-muted hover:text-cf-black",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div>
            <Label>Category</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                >
                  <CategoryBadge category={cat.id} active={categoryFilter === cat.id} />
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <Label>Date range</Label>
            <div className="mt-2 space-y-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label>Location</Label>
            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="mt-2">
              <option value="">All locations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </Select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-sm font-medium text-cf-muted hover:text-cf-black"
            >
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}
        </aside>

        {/* ── Results grid ─────────────────────────────────────────── */}
        <div className="flex-1">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-cf-muted">
                {results.length} item{results.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No items found"
              message="Save this search and we'll notify you if something shows up."
              action={
                <Button onClick={handleSaveSearch} variant="yellow" badge>
                  Save search
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
