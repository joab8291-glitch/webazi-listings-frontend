import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuth';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const STATUSES = ['available', 'rented', 'inactive'];

function formatPrice(price) {
  return new Intl.NumberFormat('en-KE').format(price);
}

export default function AdminDashboard() {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [busyId, setBusyId] = useState(null);
  const { token, logout, handleAuthError } = useAdminAuth();

  const fetchAll = useCallback(async () => {
    setStatus('loading');
    try {
      const results = await Promise.all(STATUSES.map((s) => api.getListings({ status: s })));
      const merged = results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setListings(merged);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to load listings.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleStatusChange = async (id, newStatus) => {
    setBusyId(id);
    try {
      await api.updateListing(token, id, { status: newStatus });
      await fetchAll();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthError();
        return;
      }
      alert(err instanceof ApiError ? err.message : 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24">
      <div className="flex items-center justify-between py-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Manage listings</h1>
        <div className="flex gap-3">
          <Link
            to="/admin/listings/new"
            className="rounded-full bg-jade px-5 py-2 text-sm font-medium text-paper hover:bg-jadeDark"
          >
            + Add listing
          </Link>
          <button
            onClick={logout}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm text-inkSoft hover:border-ink"
          >
            Log out
          </button>
        </div>
      </div>

      {status === 'loading' && <LoadingState label="Loading your listings…" />}
      {status === 'error' && <ErrorState message={errorMessage} onRetry={fetchAll} />}

      {status === 'success' && listings.length === 0 && (
        <p className="py-16 text-center text-inkSoft">No listings yet. Add your first one above.</p>
      )}

      {status === 'success' && listings.length > 0 && (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-white/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-paperDark">
                  {listing.photos?.[0] && (
                    <img src={listing.photos[0].image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-display text-base text-ink">{listing.title}</p>
                  <p className="text-xs text-inkSoft">
                    {listing.estate} · KSh {formatPrice(listing.price)}/mo · {listing.status}
                    {listing.verified ? ' · verified' : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/admin/listings/${listing.id}/edit`}
                  className="rounded-full border border-ink/20 px-4 py-1.5 text-xs font-medium text-ink hover:border-jade"
                >
                  Edit
                </Link>
                {listing.status !== 'rented' && (
                  <button
                    disabled={busyId === listing.id}
                    onClick={() => handleStatusChange(listing.id, 'rented')}
                    className="rounded-full border border-ink/20 px-4 py-1.5 text-xs font-medium text-inkSoft hover:border-ink disabled:opacity-50"
                  >
                    Mark rented
                  </button>
                )}
                {listing.status !== 'available' && (
                  <button
                    disabled={busyId === listing.id}
                    onClick={() => handleStatusChange(listing.id, 'available')}
                    className="rounded-full border border-jade/40 px-4 py-1.5 text-xs font-medium text-jade hover:border-jade disabled:opacity-50"
                  >
                    Mark available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
