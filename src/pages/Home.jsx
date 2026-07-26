import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import ListingCard from '../components/ListingCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const ESTATES = ['All', 'Westlands', 'Kilimani', 'Kileleshwa', 'Lavington'];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeEstate, setActiveEstate] = useState('All');

  const fetchListings = useCallback(async (estate) => {
    setStatus('loading');
    try {
      const filters = estate && estate !== 'All' ? { estate } : {};
      const data = await api.getListings(filters);
      setListings(data);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to load listings.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchListings(activeEstate);
  }, [activeEstate, fetchListings]);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24">
      <section className="py-14 text-center sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-jade">Nairobi rentals</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Every listing, walked and confirmed.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-inkSoft">
          No bots, no recycled photos, no fake ads. If it is on Webazi Homes, we have been there and
          spoken to the landlord ourselves.
        </p>
      </section>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {ESTATES.map((estate) => (
          <button
            key={estate}
            onClick={() => setActiveEstate(estate)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activeEstate === estate
                ? 'border-jade bg-jade text-paper'
                : 'border-ink/15 text-inkSoft hover:border-jade/40'
            }`}
          >
            {estate}
          </button>
        ))}
      </div>

      {status === 'loading' && <LoadingState label="Finding listings…" />}

      {status === 'error' && <ErrorState message={errorMessage} onRetry={() => fetchListings(activeEstate)} />}

      {status === 'success' && listings.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-display text-lg text-ink">No listings here yet</p>
          <p className="mt-2 text-sm text-inkSoft">
            We are still walking this area. Check back soon, or try another estate above.
          </p>
        </div>
      )}

      {status === 'success' && listings.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
