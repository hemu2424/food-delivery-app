import Skeleton from "./Skeleton";

export default function OrderCardSkeleton() {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  );
}