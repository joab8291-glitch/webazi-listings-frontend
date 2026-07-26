export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16 text-inkSoft" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-jade animate-pulse" />
        <span className="font-mono text-sm">{label}</span>
      </div>
    </div>
  );
}
