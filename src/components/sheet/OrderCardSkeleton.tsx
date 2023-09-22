import { Card, Skeleton } from "@nextui-org/react";

interface OrderCardSkeletonProps {
  size: number;
}

export const OrderCardSkeleton = ({ size }: OrderCardSkeletonProps) => {
  return (
    <>
      {Array(size)
        .fill(0)
        .map((_, index) => (
          <Card className="space-y-5 p-4" radius="lg" key={index}>
            <div className="space-y-2">
              <Skeleton className="w-1/5 rounded-lg">
                <div className="h-3 rounded-lg bg-default-300"></div>
              </Skeleton>

              <Skeleton className="w-1/6 rounded-lg">
                <div className="h-3 rounded-lg bg-default-300"></div>
              </Skeleton>

              <Skeleton className="w-1/5 rounded-lg">
                <div className="h-3 rounded-lg bg-default-300"></div>
              </Skeleton>
            </div>

            <Skeleton className="rounded-lg">
              <div className="h-24 rounded-lg bg-default-300"></div>
            </Skeleton>

            <Skeleton className="w-1/6 rounded-lg">
              <div className="h-6 rounded-lg bg-default-300"></div>
            </Skeleton>

            <Skeleton className="w-1/3 rounded-lg">
              <div className="h-9 rounded-lg bg-default-300"></div>
            </Skeleton>
          </Card>
        ))}
    </>
  );
};
