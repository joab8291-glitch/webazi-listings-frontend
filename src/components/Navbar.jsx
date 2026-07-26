import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          Webazi <span className="text-jade">Homes</span>
        </Link>
        <nav className="font-mono text-xs uppercase tracking-wide text-inkSoft">
          <a href="tel:0729914983" className="hover:text-ink">
            0729 914 983
          </a>
        </nav>
      </div>
    </header>
  );
}
