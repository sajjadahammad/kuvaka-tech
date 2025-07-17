import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChatSkeletonProps {
  count?: number
}

export default function ChatSkeleton({ count = 5 }: ChatSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn("flex items-start gap-3", index % 2 === 0 ? "justify-start" : "justify-end")}>
          {index % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className={cn("flex flex-col gap-2", index % 2 === 0 ? "items-start" : "items-end")}>
            <Skeleton className={cn("h-4 rounded-md", index % 2 === 0 ? "w-48" : "w-32")} />
            <Skeleton className={cn("h-4 rounded-md", index % 2 === 0 ? "w-64" : "w-40")} />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          {index % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
        </div>
      ))}
    </div>
  )
}
