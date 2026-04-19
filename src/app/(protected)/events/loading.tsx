function EventSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="h-12 w-12 shrink-0 rounded-lg bg-surface-2" />
      <div className="w-px self-stretch bg-border mx-1" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-surface-2" />
        <div className="flex gap-3">
          <div className="h-3 w-24 rounded bg-surface-2" />
          <div className="h-3 w-32 rounded bg-surface-2" />
        </div>
        <div className="h-3 w-1/2 rounded bg-surface-2" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-9 w-48 rounded bg-surface-2" />
        <div className="h-9 w-9 rounded-full bg-surface-2" />
      </div>
      <div className="space-y-2">
        <EventSkeleton />
        <EventSkeleton />
        <EventSkeleton />
      </div>
    </div>
  );
}
