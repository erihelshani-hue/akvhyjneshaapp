export default function Loading() {
  return (
    <div className="space-y-10" aria-busy="true">
      <div className="space-y-2">
        <div className="h-9 w-44 rounded bg-surface-2" />
        <div className="h-4 w-32 rounded bg-surface-2" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-xl border border-border bg-surface" />
        <div className="h-40 rounded-xl border border-border bg-surface" />
      </div>

      <div className="space-y-3">
        <div className="h-6 w-48 rounded bg-surface-2" />
        <div className="h-20 rounded-xl border border-border bg-surface" />
        <div className="h-20 rounded-xl border border-border bg-surface" />
      </div>
    </div>
  );
}
