import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, uploadToCloudinary, ApiError } from '../lib/api';
import { resizeImageFile } from '../lib/image';
import { useAdminAuth } from '../context/AdminAuth';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const EMPTY_FORM = {
  title: '',
  price: '',
  estate: '',
  bedrooms: 1,
  bathrooms: 1,
  description: '',
  contact_phone: '',
  verified: false,
};

export default function AdminListingForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token, handleAuthError } = useAdminAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [photos, setPhotos] = useState([]);
  const [pageStatus, setPageStatus] = useState(isEditMode ? 'loading' : 'ready');
  const [pageError, setPageError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);

  const loadListing = useCallback(async () => {
    if (!isEditMode) return;
    setPageStatus('loading');
    try {
      const data = await api.getListing(id);
      setForm({
        title: data.title,
        price: data.price,
        estate: data.estate,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        description: data.description || '',
        contact_phone: data.contact_phone,
        verified: data.verified,
      });
      setPhotos(data.photos || []);
      setPageStatus('ready');
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to load this listing.');
      setPageStatus('error');
    }
  }, [id, isEditMode]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!form.title || !form.price || !form.estate || !form.contact_phone) {
      setSaveError('Please fill in title, price, estate, and contact phone.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      let listingId = id;

      if (isEditMode) {
        await api.updateListing(token, id, payload);
      } else {
        const created = await api.createListing(token, payload);
        listingId = created.id;
      }

      navigate(`/admin/listings/${listingId}/edit`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthError();
        return;
      }
      setSaveError(err instanceof ApiError ? err.message : 'Could not save this listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    if (!isEditMode) {
      setSaveError('Save the listing first, then add photos.');
      return;
    }

    setUploadingCount(files.length);

    for (const file of files) {
      try {
        const resized = await resizeImageFile(file);
        const url = await uploadToCloudinary(resized);
        const saved = await api.addPhoto(token, {
          listing_id: Number(id),
          image_url: url,
          is_cover: photos.length === 0,
          sort_order: photos.length,
        });
        setPhotos((prev) => [...prev, saved]);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleAuthError();
          return;
        }
        alert(`Failed to upload ${file.name}: ${err.message}`);
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1));
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await api.deletePhoto(token, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleAuthError();
        return;
      }
      alert('Could not delete photo. Try again.');
    }
  };

  if (pageStatus === 'loading') return <LoadingState label="Loading listing…" />;
  if (pageStatus === 'error') return <ErrorState message={pageError} onRetry={loadListing} />;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24">
      <h1 className="py-8 font-display text-2xl font-semibold text-ink">
        {isEditMode ? 'Edit listing' : 'Add a listing'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="2BR apartment in Kilimani"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (KSh/month)">
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Estate">
            <input
              value={form.estate}
              onChange={(e) => updateField('estate', e.target.value)}
              placeholder="Westlands"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Bedrooms">
            <input
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => updateField('bedrooms', Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Bathrooms">
            <input
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => updateField('bathrooms', Number(e.target.value))}
              className="input"
            />
          </Field>
        </div>

        <Field label="Contact phone (for tenant inquiries)">
          <input
            value={form.contact_phone}
            onChange={(e) => updateField('contact_phone', e.target.value)}
            placeholder="0712345678"
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="input"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(e) => updateField('verified', e.target.checked)}
            className="h-4 w-4 accent-jade"
          />
          I have personally visited/called and confirmed this listing
        </label>

        {saveError && (
          <p role="alert" className="text-sm text-ochreDark">
            {saveError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-jade px-6 py-3 text-sm font-medium text-paper hover:bg-jadeDark disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : isEditMode ? 'Save changes' : 'Create listing'}
        </button>
      </form>

      {isEditMode && (
        <div className="mt-10">
          <h2 className="font-display text-lg text-ink">Photos</h2>
          <p className="mt-1 text-sm text-inkSoft">First photo added becomes the cover automatically.</p>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-paperDark">
                <img src={photo.image_url} alt="" className="h-full w-full object-cover" />
                {photo.is_cover && (
                  <span className="absolute left-1 top-1 rounded bg-jade px-1.5 py-0.5 text-[9px] font-medium text-paper">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute inset-0 flex items-center justify-center bg-ink/0 text-transparent transition group-hover:bg-ink/50 group-hover:text-paper"
                  aria-label="Delete photo"
                >
                  Remove
                </button>
              </div>
            ))}

            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink/20 text-center text-xs text-inkSoft hover:border-jade">
              {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : '+ Add photos'}
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoUpload}
                disabled={uploadingCount > 0}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-inkSoft">{label}</label>
      {children}
    </div>
  );
}
