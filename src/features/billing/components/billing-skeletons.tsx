import { Skeleton } from "@/shared/components/ui/page";

export function SubscriptionSkeleton() {
  return (
    <div role="status" aria-label="Loading subscription" className="space-y-6">
      <span className="sr-only">Loading subscription…</span>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="panel flex flex-wrap items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-11" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="w-full space-y-3 sm:w-64">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {[0, 1].map((item) => (
          <div className="panel space-y-5 p-7" key={item}>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-11 w-44" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function PaymentSettingsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading payment settings"
      className="space-y-7"
    >
      <span className="sr-only">Loading payment settings…</span>
      <div className="panel space-y-4 p-6">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {[0, 1].map((item) => (
            <div className="panel space-y-4 p-5" key={item}>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-11 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export function PaymentHistorySkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading payment history"
      className="space-y-4"
    >
      <span className="sr-only">Loading payment history…</span>
      {[0, 1].map((item) => (
        <div
          className="flex items-center justify-between gap-5 py-3"
          key={item}
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56 max-w-full" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}

export function PaymentModalSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading payment options"
      className="space-y-5"
    >
      <span className="sr-only">Loading payment options…</span>
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-6 md:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((item) => (
              <Skeleton className="h-14 w-full" key={item} />
            ))}
          </div>
          <Skeleton className="aspect-square min-h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-3 w-36" />
          {[0, 1, 2].map((item) => (
            <Skeleton className="h-16 w-full" key={item} />
          ))}
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton className="h-10 w-full" key={item} />
            ))}
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
