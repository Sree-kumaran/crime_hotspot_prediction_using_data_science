export const Spinner = () => (
  <div
    className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"
    aria-label="Loading"
  />
);
export const Skeleton = ({ className = "h-4 w-full" }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);
export const SkeletonCard = () => (
  <div className="card-base p-5 space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);
