import { useEffect, useRef } from 'react';

const ESTATE_COORDS = {
  Westlands: [-1.2673, 36.8079],
  Kilimani: [-1.2921, 36.7820],
  Kileleshwa: [-1.2833, 36.7833],
  Lavington: [-1.2793, 36.7659],
};

export default function ListingsMap({ listings, onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.L || !mapRef.current || mapInstance.current) return;
    mapInstance.current = window.L.map(mapRef.current, { scrollWheelZoom: false }).setView([-1.283, 36.79], 12);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    listings.forEach((listing) => {
      const coords = ESTATE_COORDS[listing.estate];
      if (!coords) return;
      const marker = window.L.marker(coords).addTo(mapInstance.current);
      marker.bindPopup(`<strong>${listing.title}</strong>`);
      if (onSelect) {
        marker.on('click', () => onSelect(listing));
      }
      markersRef.current.push(marker);
    });
  }, [listings, onSelect]);

  return (
    <div
      ref={mapRef}
      className="mb-8"
      style={{ height: '280px', borderRadius: '16px', border: '1px solid rgba(31,42,36,0.1)', zIndex: 0 }}
    />
  );
}
