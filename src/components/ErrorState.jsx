export default function ErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center" role="alert">
      <p className="font-display text-lg text-ink">Something did not load</p>
      <p className="mt-2 text-sm text-inkSoft">{message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
        >
          Try again
        </button>
      )}
    </div>
  );
}
