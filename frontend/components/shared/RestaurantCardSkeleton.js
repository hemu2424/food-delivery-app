import Skeleton from "./Skeleton";

export default function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}