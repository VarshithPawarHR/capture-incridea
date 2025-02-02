import { Skeleton } from "~/components/ui/skeleton"

export function SkeletonLoader() {
  return (
    <div className="flex flex-col md:flex-row space-x-3">
      <Skeleton className="h-96 w-full rounded-xl" /> 
      <Skeleton className="h-96 w-full rounded-xl" /> 
      </div>
  );
}
