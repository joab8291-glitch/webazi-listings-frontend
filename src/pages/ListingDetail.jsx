import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

function formatPrice(price) {
  return new Intl.NumberFormat('en-KE').format(price);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

  const fetchListing = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await api.getListing(id);
      setListing(data);
      setActivePhoto(0);
      setStatus('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setErrorMessage('This listing no longer exists — it may have been rented or removed.');
      } else {
        setErrorMessage(err instanceof ApiError ? err.message : 'Failed to load this listing.');
      }
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  if (status === 'loading') return <LoadingState label="Loading listing…" />;
  if (status === 'error') return <ErrorState message={errorMessage} onRetry={fetchListing} />;
  if (!listing) return null;

  const photos = listing.photos || [];
  const whatsappMessage = encodeURIComponent(`Hi, I am interested in "${listing.title}" (KSh ${formatPrice(listing.price)}/mo) on House Hunter.`);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <Link to="/" className="mb-6 inline-block font-mono text-xs uppercase tracking-wide text-jade hover:underline">
        ← Back to listings
      </Link>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paperDark">
        <div className="aspect-[4/3] w-full">
          {photos.length > 0 ? (
            <img
              src={photos[activePhoto]?.image_url}
              alt={`${listing.title} — photo ${activePhoto + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-muted">
              No photos yet
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setActivePhoto(i)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activePhoto ? 'border-jade' : 'border-transparent'
                }`}
              >
                <img src={photo.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 text-inkSoft">{listing.estate}</p>
        </div>
        {listing.verified && (
          <span className="stamp flex-shrink-0 rounded-full border-2 border-jade px-3 py-1 font-mono text-[10px] font-semibold uppercase text-jade">
            Verified ✓
          </span>
        )}
      </div>

      {listing.verified && listing.updated_at && (
        <p className="mt-2 font-mono text-xs text-jade">
          Personally verified on {formatDate(listing.updated_at)}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="font-mono text-xl font-medium text-ochreDark">
          KSh {formatPrice(listing.price)}
          <span className="text-sm text-muted">/mo</span>
        </span>
        <span className="text-sm text-inkSoft">
          {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''} · {listing.bathrooms} bathroom
          {listing.bathrooms !== 1 ? 's' : ''}
        </span>
      </div>

      {listing.description && (
        <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink">{listing.description}</p>
      )}

      {listing.status === 'rented' ? (
        <div className="mt-8 rounded-xl bg-ink/5 px-5 py-4 text-center text-sm text-inkSoft">
          This unit has been rented.
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/254${listing.contact_phone.replace(/^0/, '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-full bg-jade px-6 py-3 text-center text-sm font-medium text-paper transition hover:bg-jadeDark"
          >
            Message on WhatsApp
          </a>
          <a
            href={`tel:${listing.contact_phone}`}
            className="flex-1 rounded-full border border-ink px-6 py-3 text-center text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
          >
            Call {listing.contact_phone}
          </a>
        </div>
      )}
    </div>
  );
}
