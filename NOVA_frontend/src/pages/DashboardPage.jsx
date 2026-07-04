import { Link } from "react-router-dom"
import { PlusCircle, PackageSearch, Search, FileCheck, ArrowRight, Bell } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { mockItems, mockClaims } from "@/data/mock"
import { ItemCard } from "@/components/ItemCard"
import { StatusBadge } from "@/components/StatusBadge"
import { Eyebrow } from "@/components/Eyebrow"
import { formatDate, timeAgo } from "@/lib/utils"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const quickActions = [
  { label: "Report Lost Item", desc: "Tell us what you misplaced", icon: PlusCircle, to: "/report" },
  { label: "Report Found Item", desc: "Log something you found", icon: PackageSearch, to: "/report" },
  { label: "Search Items", desc: "Browse the campus feed", icon: Search, to: "/search" },
  { label: "My Claims", desc: "Track your submissions", icon: FileCheck, to: "/my-claims" },
]

export default function DashboardPage() {
  const { user, savedSearches, toggleSavedSearch } = useApp()

  // The current user's own reports + claims for the activity list
  const myActivity = mockClaims
    .filter((c) => c.claimantName === user.name)
    .map((c) => ({ id: c.id, title: c.itemTitle, kind: "Claim", status: c.status, date: c.claimDate }))
  const feed = mockItems.slice(0, 6)
  const alertSearch = savedSearches.find((s) => s.enabled && s.newMatches > 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting header */}
      <header className="flex flex-col items-center justify-center text-center py-8 sm:py-12">
        <h1 
          className="font-black tracking-tighter"
          style={{
            fontSize: "clamp(3rem, 5vw, 10rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em"
          }}
        >
          {greeting()},<br className="sm:hidden" /> {user.name.split(" ")[0]}
        </h1>
        <p className="mt-4 text-lg font-small text-black/50 sm:text-xl">{formatDate(new Date().toISOString())}</p>
      </header>

      {/* Yellow alert banner — saved search has new matches */}
      {alertSearch && (
        <div className="flex flex-col gap-3 border border-black/10 bg-[#EFD556] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} aria-hidden="true" />
            <p className="text-sm font-medium">
              {alertSearch.newMatches} new items match your saved search for &ldquo;{alertSearch.query}&rdquo;.
            </p>
          </div>
          {/* NAV → /search — jump to the matching results */}
          <Link
            to={`/search?q=${encodeURIComponent(alertSearch.query)}`}
            className="inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
          >
            View <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Quick action cards */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((a) => (
            // NAV → a.to — quick action shortcut
            <Link
              key={a.label}
              to={a.to}
              className="cf-hover-lift group flex items-center gap-4 border border-black/10 bg-white p-5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#EFD556]/40"
            >
              <span className="flex h-11 w-11 items-center justify-center bg-black text-white">
                <a.icon size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">{a.label}</span>
                <span className="block text-sm text-black/50">{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* My recent activity */}
      <section>
        <Eyebrow>My recent activity</Eyebrow>
        <div className="mt-4 overflow-hidden border border-black/10 bg-white">
          {myActivity.length === 0 ? (
            <p className="p-5 text-sm text-black/50">No activity yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/40">
                <tr>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Type</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {myActivity.map((row) => (
                  <tr key={row.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3 font-medium">{row.title}</td>
                    <td className="hidden px-5 py-3 text-black/60 sm:table-cell">{row.kind}</td>
                    <td className="hidden px-5 py-3 text-black/60 sm:table-cell">{timeAgo(row.date)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Campus feed */}
      <section>
        <div className="flex items-center justify-between">
          <Eyebrow>Campus feed</Eyebrow>
          {/* NAV → /search — see all campus items */}
          <Link to="/search" className="text-sm font-semibold underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {feed.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Saved search alerts */}
      <section>
        <Eyebrow>Saved search alerts</Eyebrow>
        <div className="mt-4 flex flex-col gap-3">
          {savedSearches.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border border-black/10 bg-white px-5 py-4"
            >
              <div>
                <p className="font-medium">&ldquo;{s.query}&rdquo;</p>
                <p className="text-sm text-black/50">
                  {s.newMatches > 0 ? `${s.newMatches} new matches` : "No new matches"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleSavedSearch(s.id)}
                role="switch"
                aria-checked={s.enabled}
                aria-label={`Notifications for ${s.query}`}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EFD556] focus-visible:ring-offset-2 ${
                  s.enabled ? "bg-[#22c55e]" : "bg-[#d1d5db]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                    s.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
