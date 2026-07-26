import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import ListingCard from '../components/ListingCard';
import ListingsMap from '../components/ListingsMap';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const COUNTIES = [
  "Nairobi", "Kiambu",
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir","Mandera",
  "Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua",
  "Nyeri","Kirinyaga","Murang'a","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado",
  "Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay",
  "Migori","Kisii","Nyamira"
];

const COUNTY_CONSTITUENCIES = {
  Nairobi: [
    "Westlands", "Dagoretti North", "Dagoretti South", "Langata", "Kibra", "Roysambu",
    "Kasarani", "Ruaraka", "Embakasi South", "Embakasi North", "Embakasi Central",
    "Embakasi East", "Embakasi West", "Makadara", "Kamukunji", "Starehe", "Mathare"
  ],
  Kiambu: [
    "Gatundu South", "Gatundu North", "Juja", "Thika Town", "Ruiru", "Githunguri",
    "Kiambu", "Kiambaa", "Kabete", "Kikuyu", "Limuru", "Lari"
  ],
};

const ESTATE_CONSTITUENCY = {
  "Westlands": "Westlands",
  "Kilimani": "Dagoretti North",
  "Kileleshwa": "Dagoretti North",
  "Lavington": "Dagoretti North",
};

const ESTATES = ['All', 'Westlands', 'Kilimani', 'Kileleshwa', 'Lavington'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('Nairobi');
  const [selectedConstituency, setSelectedConstituency] = useState('All');
  const [activeEstate, setActiveEstate] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchListings = useCallback(async () => {
    setStatus('loading');
    try {
      const filters = activeEstate && activeEstate !== 'All' ? { estate: activeEstate } : {};
      const data = await api.getListings(filters);
      setStatus('success');
      setListings(data);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to load listings.');
      setStatus('error');
    }
  }, [activeEstate]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const visibleListings = useMemo(() => {
    let result = listings.filter((l) => {
      if (selectedConstituency !== 'All' && ESTATE_CONSTITUENCY[l.estate] !== selectedConstituency) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const haystack = `${l.title} ${l.estate} ${l.description || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  }, [listings, selectedConstituency, searchTerm, sortBy]);

  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    setSelectedConstituency('All');
  };

  const constituencyOptions = COUNTY_CONSTITUENCIES[selectedCounty] || [];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24">
      <section className="py-14 text-center sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-jade">Nairobi &amp; Kiambu rentals</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Every listing, walked and confirmed.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-inkSoft">
          No bots, no recycled photos, no fake ads. If it is on Webazi Homes, we have been there and
          spoken to the landlord ourselves.
        </p>
      </section>

      <div className="mb-5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, estate, or keyword…"
          className="w-full rounded-full border border-ink/20 bg-white px-5 py-3 text-sm text-ink outline-none focus:border-jade"
        />
      </div>

      <div className="mb-7 rounded-2xl border border-ink/10 bg-white/50 p-5">
        <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-inkSoft">
          Find rentals near you
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={selectedCounty}
            onChange={(e) => handleCountyChange(e.target.value)}
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm text-ink"
          >
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c} County</option>
            ))}
          </select>
          <select
            value={selectedConstituency}
            onChange={(e) => setSelectedConstituency(e.target.value)}
            disabled={constituencyOptions.length === 0}
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-sm text-ink disabled:opacity-50"
          >
            <option value="All">All constituencies</option>
            {constituencyOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-xs text-muted">
          Constituency data from IEBC. Piloting in Nairobi &amp; Kiambu — growing area by area.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-full border border-ink/20 bg-white px-4 py-1.5 text-sm text-inkSoft"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <ListingsMap listings={visibleListings} onSelect={(l) => navigate(`/listings/${l.id}`)} />

      {status === 'loading' && <LoadingState label="Finding listings…" />}

      {status === 'error' && <ErrorState message={errorMessage} onRetry={fetchListings} />}

      {status === 'success' && visibleListings.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-display text-lg text-ink">No listings match right now</p>
          <p className="mt-2 text-sm text-inkSoft">
            Try a different search term, constituency, or estate above.
          </p>
        </div>
      )}

      {status === 'success' && visibleListings.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
