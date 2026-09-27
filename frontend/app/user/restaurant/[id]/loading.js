import Skeleton from "@/components/shared/Skeleton";

export default function RestaurantDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-1/3" />

      <div className="space-y-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border rounded-lg p-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}