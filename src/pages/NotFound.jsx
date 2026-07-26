import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-display text-2xl text-ink">Page not found</p>
      <p className="mt-2 text-sm text-inkSoft">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-5 rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink">
        Back home
      </Link>
    </div>
  );
}
