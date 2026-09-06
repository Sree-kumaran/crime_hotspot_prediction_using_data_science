import { cn } from "../../../lib/utils";

export const Spinner = ({ className = "h-6 w-6" }) => (
  <div
    className={cn(
      "border-2 border-palette-almond border-t-transparent rounded-full animate-spin",
      className,
    )}
    aria-label="Loading"
  />
);

export const Skeleton = ({ className = "h-4 w-full" }) => (
  <div className={cn("animate-pulse rounded-md bg-[#1e2444]", className)} />
);

export const SkeletonCard = ({ className }) => (
  <div className={cn("card-base p-5 space-y-3 border-[#262c4d]", className)}>
    <Skeleton className="h-3 w-1/2 bg-[#1e2444]" />
    <Skeleton className="h-8 w-1/3 bg-[#242b52]" />
    <Skeleton className="h-3 w-2/3 bg-[#1e2444]" />
  </div>
);
