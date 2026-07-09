import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 container py-6 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-2/4" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
          <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
