import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />);
}

function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse", className)} {...props}>
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, cols = 4, className, ...props }) {
  return (
    <div className={cn("relative w-full overflow-auto animate-pulse", className)} {...props}>
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr>
            {Array.from({ length: cols + 1 }).map((_, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle">
                <Skeleton className="h-4 w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {Array.from({ length: cols + 1 }).map((_, colIndex) => (
                <td key={colIndex} className="p-4 align-middle">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable }