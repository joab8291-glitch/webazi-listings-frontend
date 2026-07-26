import { Link } from 'react-router-dom';

function formatPrice(price) {
  return new Intl.NumberFormat('en-KE').format(price);
}

export default function ListingCard({ listing }) {
  const cover = listing.photos?.find((p) => p.is_cover) || listing.photos?.[0];

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-ink/10 bg-white/40 transition hover:border-jade/40 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paperDark">
        {cover ? (
          <img
            src={cover.image_url}
            alt={listing.title}
            loading="lazy"
            width="400"
            height="300"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted">
            No photo yet
          </div>
        )}

        {listing.verified && (
          <div
            className="stamp absolute right-3 top-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-jade bg-paper/90 font-mono text-[9px] font-semibold uppercase leading-tight text-jade shadow-sm"
            aria-label="Verified listing"
          >
            <span className="text-center">
              Verified
              <br />✓
            </span>
          </div>
        )}

        {listing.status === 'rented' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="rounded-full bg-paper px-4 py-1 font-mono text-xs uppercase tracking-wide text-ink">
              Rented
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg leading-snug text-ink">{listing.title}</h3>
        <p className="mt-1 text-sm text-inkSoft">{listing.estate}</p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-mono text-base font-medium text-ochreDark">
            KSh {formatPrice(listing.price)}
            <span className="text-xs text-muted">/mo</span>
          </span>
          <span className="text-xs text-inkSoft">
            {listing.bedrooms} bd · {listing.bathrooms} ba
          </span>
        </div>
      </div>
    </Link>
  );
}
