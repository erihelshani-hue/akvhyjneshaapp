export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
          <div className="absolute inset-2 rounded-full border-r-2 border-accent/50 animate-spin-reverse" />
        </div>
        <p className="text-sm text-foreground/70 font-playfair tracking-wider animate-pulse">
          Laden...
        </p>
      </div>
    </div>
  );
}