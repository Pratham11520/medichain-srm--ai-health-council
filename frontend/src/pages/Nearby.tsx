import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { AnimatedPage } from '../components/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Building2, Pill, Phone, Star, ExternalLink,
    Navigation, Loader2, AlertTriangle, RefreshCw, Search,
    Clock, ChevronRight, Landmark
} from 'lucide-react';
import { toast } from 'sonner';

interface NearbyProps {
    user: UserProfile;
}

interface Place {
    id: string;
    name: string;
    address: string;
    type: 'hospital' | 'pharmacy' | 'clinic';
    distance: string;
    rating: number | null;
    phone?: string;
    openNow?: boolean;
    lat: number;
    lng: number;
}

type TabType = 'all' | 'hospital' | 'pharmacy' | 'clinic';

const PLACE_ICONS = {
    hospital: { icon: Building2, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Hospital' },
    pharmacy: { icon: Pill, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Pharmacy' },
    clinic: { icon: Landmark, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Clinic' },
};

// Build an Overpass API query for healthcare near a location
function buildOverpassQuery(lat: number, lng: number, radiusMeters = 5000): string {
    return `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `.trim();
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

async function fetchNearbyPlaces(lat: number, lng: number): Promise<Place[]> {
    const query = buildOverpassQuery(lat, lng, 8000);
    const url = 'https://overpass-api.de/api/interpreter';

    const response = await fetch(url, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' }
    });

    if (!response.ok) throw new Error('Overpass API error: ' + response.status);
    const data = await response.json();

    const places: Place[] = (data.elements || [])
        .filter((el: any) => el.tags && el.tags.name)
        .map((el: any) => {
            const amenity = el.tags.amenity || '';
            const placeType: Place['type'] =
                amenity === 'hospital' ? 'hospital' :
                    amenity === 'pharmacy' ? 'pharmacy' : 'clinic';

            const elLat = el.lat ?? el.center?.lat;
            const elLng = el.lon ?? el.center?.lon;

            return {
                id: String(el.id),
                name: el.tags.name,
                address: [
                    el.tags['addr:housenumber'],
                    el.tags['addr:street'],
                    el.tags['addr:suburb'],
                    el.tags['addr:city']
                ].filter(Boolean).join(', ') || 'See on map for address',
                type: placeType,
                distance: haversineDistance(lat, lng, elLat, elLng),
                rating: null,
                phone: el.tags.phone || el.tags['contact:phone'],
                openNow: undefined,
                lat: elLat,
                lng: elLng,
            };
        })
        .sort((a: Place, b: Place) => {
            // Sort by distance (parse the numeric part)
            const aD = parseFloat(a.distance);
            const bD = parseFloat(b.distance);
            const aMult = a.distance.includes('km') ? 1000 : 1;
            const bMult = b.distance.includes('km') ? 1000 : 1;
            return aD * aMult - bD * bMult;
        });

    return places;
}

export const NearbyPage: React.FC<NearbyProps> = ({ user }) => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
        user.location?.lat ? { lat: user.location.lat, lng: user.location.lng } : null
    );
    const [gpsLoading, setGpsLoading] = useState(false);

    const loadNearbyPlaces = useCallback(async (lat: number, lng: number) => {
        setLoading(true);
        setError(null);
        try {
            const results = await fetchNearbyPlaces(lat, lng);
            setPlaces(results);
            if (results.length === 0) {
                toast.info('No pharmacies or hospitals found within 8 km. Try expanding your search.');
            } else {
                toast.success(`Found ${results.length} healthcare facilities nearby!`);
            }
        } catch (err: any) {
            setError('Failed to load nearby places. Please check your internet connection and try again.');
            toast.error('Could not load nearby places.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (coords?.lat) {
            void loadNearbyPlaces(coords.lat, coords.lng);
        }
    }, [coords, loadNearbyPlaces]);

    const detectMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsLoading(false);
                toast.success('Location detected!');
            },
            (err) => {
                setGpsLoading(false);
                toast.error('Could not detect location: ' + err.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const openInMaps = (place: Place) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.lat},${place.lng}`;
        window.open(url, '_blank');
    };

    const directionsTo = (place: Place) => {
        if (!coords) return;
        const url = `https://www.google.com/maps/dir/${coords.lat},${coords.lng}/${place.lat},${place.lng}`;
        window.open(url, '_blank');
    };

    const filtered = places.filter(p => {
        const matchTab = activeTab === 'all' || p.type === activeTab;
        const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTab && matchSearch;
    });

    const counts = {
        all: places.length,
        hospital: places.filter(p => p.type === 'hospital').length,
        pharmacy: places.filter(p => p.type === 'pharmacy').length,
        clinic: places.filter(p => p.type === 'clinic').length,
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-sky-600/10 to-blue-600/20" />
                    <div className="relative p-8 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-sky-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                                    <MapPin className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white">Nearby Healthcare</h1>
                                    <p className="text-green-300 text-sm font-mono">Pharmacies • Hospitals • Clinics</p>
                                </div>
                            </div>
                            <p className="text-slate-400 max-w-xl">
                                Find verified pharmacies, hospitals, and clinics near you — with directions, contact numbers, and real-time data from OpenStreetMap.
                            </p>
                        </div>
                        <Building2 className="text-green-500/20 hidden md:block flex-shrink-0" size={80} />
                    </div>
                </div>

                {/* Location bar */}
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${coords ? 'bg-green-500/20' : 'bg-white/5'}`}>
                            <MapPin size={20} className={coords ? 'text-green-400' : 'text-slate-500'} />
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold">
                                {coords ? 'Location Set' : 'No Location'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {coords ? `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E` : 'Detect your location to find nearby places'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {coords && (
                            <button
                                onClick={() => loadNearbyPlaces(coords.lat, coords.lng)}
                                disabled={loading}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                            >
                                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                            </button>
                        )}
                        <button
                            onClick={detectMyLocation}
                            disabled={gpsLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-medium transition-all shadow-lg shadow-green-500/20 disabled:opacity-60"
                        >
                            {gpsLoading ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
                            Detect My Location
                        </button>
                    </div>
                </div>

                {/* No location state */}
                {!coords && !loading && (
                    <div className="text-center py-16 glass-card rounded-2xl">
                        <div className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                            <MapPin size={40} className="text-green-400/60" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Enable Location Access</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                            We need your location to find pharmacies and hospitals near you. Your location is never stored on our servers.
                        </p>
                        <button
                            onClick={detectMyLocation}
                            disabled={gpsLoading}
                            className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold transition-all shadow-lg shadow-green-500/20"
                        >
                            {gpsLoading ? <Loader2 size={18} className="animate-spin" /> : '📍 Detect My Location'}
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-card p-5 rounded-2xl animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/5 rounded w-1/2" />
                                        <div className="h-3 bg-white/5 rounded w-3/4" />
                                        <div className="h-3 bg-white/5 rounded w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-red-500/20 bg-red-500/5">
                        <AlertTriangle className="text-red-400 flex-shrink-0" size={24} />
                        <div>
                            <p className="text-white font-medium">Failed to load nearby places</p>
                            <p className="text-sm text-slate-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {!loading && places.length > 0 && (
                    <>
                        {/* Search + Tab Filters */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-3.5 text-slate-500" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or area..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-green-500/40"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                {(['all', 'hospital', 'pharmacy', 'clinic'] as TabType[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                                            }`}
                                    >
                                        {tab === 'all' ? 'All' :
                                            tab === 'hospital' ? '🏥 Hospitals' :
                                                tab === 'pharmacy' ? '💊 Pharmacies' : '🏥 Clinics'}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-white/5'}`}>
                                            {counts[tab]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Place Cards */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filtered.map((place, i) => {
                                    const config = PLACE_ICONS[place.type];
                                    return (
                                        <motion.div
                                            key={place.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="glass-card p-5 rounded-2xl hover:bg-white/[0.06] transition-colors group"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0`}>
                                                    <config.icon size={22} className={config.color} />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors truncate">{place.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                                                                    {config.label}
                                                                </span>
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Navigation size={10} /> {place.distance}
                                                                </span>
                                                                {place.openNow !== undefined && (
                                                                    <span className={`text-[10px] flex items-center gap-1 ${place.openNow ? 'text-green-400' : 'text-red-400'}`}>
                                                                        <Clock size={10} /> {place.openNow ? 'Open' : 'Closed'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-1.5 truncate">{place.address}</p>
                                                        </div>

                                                        {/* Rating */}
                                                        {place.rating && (
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                                <span className="text-xs text-yellow-400 font-medium">{place.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions row */}
                                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                        {place.phone && (
                                                            <a
                                                                href={`tel:${place.phone}`}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-medium transition-all"
                                                            >
                                                                <Phone size={12} /> {place.phone}
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => directionsTo(place)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-medium transition-all"
                                                        >
                                                            <Navigation size={12} /> Get Directions
                                                        </button>
                                                        <button
                                                            onClick={() => openInMaps(place)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium transition-all"
                                                        >
                                                            <ExternalLink size={12} /> View on Map
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {filtered.length === 0 && (
                                <div className="text-center py-10 text-slate-500">
                                    <Search size={32} className="mx-auto mb-3 opacity-40" />
                                    No results for "{searchQuery}" — try a different search.
                                </div>
                            )}
                        </div>

                        {/* Emergency contacts strip */}
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 flex flex-wrap gap-4 items-center">
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency</span>
                            {[
                                { l: 'Ambulance', n: '108' },
                                { l: 'Emergency', n: '112' },
                                { l: 'AIIMS', n: '1800-11-1234' },
                                { l: 'Poisoning', n: '1800-116-117' },
                            ].map(c => (
                                <a key={c.n} href={`tel:${c.n}`} className="flex items-center gap-1.5 text-xs hover:opacity-80">
                                    <Phone size={11} className="text-red-400" />
                                    <span className="text-slate-400">{c.l}:</span>
                                    <span className="font-mono font-bold text-red-400">{c.n}</span>
                                </a>
                            ))}
                        </div>

                        <p className="text-center text-xs text-slate-700">
                            Data from OpenStreetMap contributors • Not affiliated with any healthcare provider
                        </p>
                    </>
                )}
            </div>
        </AnimatedPage>
    );
};
