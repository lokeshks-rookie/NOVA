import { cn } from "@/lib/utils"

// Shimmer skeleton loader for data-driven sections
export function Skeleton({ className }) {
  return <div className={cn("cf-skeleton rounded-lg", className)} />
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-cf-line bg-cf-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
