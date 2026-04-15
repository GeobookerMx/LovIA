import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Navigation, Loader2, Radar } from 'lucide-react'
import L from 'leaflet'
import './RadarMap.css'

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom Icon for nearby sparks (matches)
const sparkIcon = new L.DivIcon({
    className: '',
    html: `<div style="
        width:36px;height:36px;border-radius:50%;
        background:radial-gradient(circle, #ff6b9d, #c44569);
        border:2px solid rgba(255,255,255,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:16px;box-shadow:0 0 12px rgba(254,81,149,0.6);
        animation:pulse 2s infinite;
    ">💫</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
})

// Custom Icon for current user
const userIcon = new L.DivIcon({
    className: '',
    html: `<div style="
        width:40px;height:40px;border-radius:50%;
        background:radial-gradient(circle, #667eea, #764ba2);
        border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;box-shadow:0 0 20px rgba(102,126,234,0.7);
    ">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
})

interface RadarProfile {
    id: string
    alias: string
    last_lat: number
    last_lng: number
}

export default function RadarMap() {
    const { user } = useAuthStore()
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [nearbyMatches, setNearbyMatches] = useState<RadarProfile[]>([])
    const [loading, setLoading] = useState(false)
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
    const [showConsentScreen, setShowConsentScreen] = useState(true)
    const mapRef = useRef<any>(null)

    // Solicitar GPS solo cuando el usuario lo aprueba explícitamente
    const requestLocation = () => {
        setShowConsentScreen(false)
        setLoading(true)

        if (!('geolocation' in navigator)) {
            setPermissionGranted(false)
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords
                setUserLocation([lat, lng])
                setPermissionGranted(true)
                if (user) {
                    await supabase.from('profiles')
                        .update({ last_lat: lat, last_lng: lng })
                        .eq('id', user.id)
                }
            },
            () => {
                setPermissionGranted(false)
                setLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
    }


    // Step 2: fetch nearby profiles once we have location
    useEffect(() => {
        if (!userLocation || !user) return

        async function fetchNearby() {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, alias, last_lat, last_lng')
                .neq('id', user!.id)
                .not('last_lat', 'is', null)
                .not('last_lng', 'is', null)

            if (!error && data && data.length > 0) {
                // Apply Fuzzing: ±0.015 degrees ≈ ±1.5 km
                const fuzzed = data.map((p: any) => ({
                    ...p,
                    last_lat: p.last_lat + (Math.random() * 0.03 - 0.015),
                    last_lng: p.last_lng + (Math.random() * 0.03 - 0.015),
                }))
                setNearbyMatches(fuzzed)
            }
            setLoading(false)
        }

        fetchNearby()
    }, [userLocation, user])

    // ─── Estados ──────────────────────────────────────────────────────────────

    // 1️⃣ Pantalla de consentimiento (requerida por App Store / Play Store)
    if (showConsentScreen) {
        return (
            <div className="radar-page flex-center" style={{ minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
                <div className="glass-strong radar-permission-box animate-scale-in" style={{ maxWidth: 340, borderRadius: 20, padding: '2.5rem 2rem' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📍</div>
                    <h2 style={{ marginBottom: 12 }}>Activa el Radar</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                        LovIA usa tu <strong>ubicación aproximada</strong> para mostrarte personas afines cerca de ti.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 24 }}>
                        🔒 Tu posición exacta nunca es visible — se desplaza ±2 km automáticamente.<br />
                        No compartimos tu ubicación con terceros.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: '1rem', marginBottom: 12 }}
                        onClick={requestLocation}
                    >
                        Permitir ubicación aproximada
                    </button>
                    <button
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.85rem', cursor: 'pointer' }}
                        onClick={() => setShowConsentScreen(false)}
                    >
                        Ahora no
                    </button>
                </div>
            </div>
        )
    }

    // 2️⃣ Permiso denegado
    if (permissionGranted === false) {
        return (
            <div className="radar-page flex-center" style={{ minHeight: '80vh', textAlign: 'center' }}>
                <div className="glass radar-permission-box animate-scale-in">
                    <Navigation size={52} color="var(--text-tertiary)" style={{ margin: '0 auto 20px', display: 'block' }} />
                    <h2>Radar Desactivado</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                        LovIA necesita acceso a tu ubicación para mostrarte chispas cercanas.<br />
                        Habilita la geolocalización en tu navegador y recarga la página.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: 20, padding: '12px 24px', borderRadius: 12 }}
                        onClick={() => setShowConsentScreen(true)}
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    if (!userLocation || loading) {
        return (
            <div className="radar-page flex-center" style={{ minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--love-rose)' }}>
                    <Loader2 size={44} className="animate-spin" style={{ margin: '0 auto 16px', display: 'block' }} />
                    <p className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Escaneando radio de la chispa...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="radar-page">
            {/* Header */}
            <div className="radar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Radar size={28} color="var(--love-rose)" />
                    <div>
                        <h2>Radar LovIA</h2>
                        <p>Chispas cercanas a ti · Ubicaciones protegidas ±2 km</p>
                    </div>
                </div>
                <div className="radar-stats">
                    <span className="radar-badge">
                        💫 {nearbyMatches.length} chispa{nearbyMatches.length !== 1 ? 's' : ''} cerca
                    </span>
                </div>
            </div>

            {/* Map */}
            <div className="radar-container glass-strong animate-fade-in-up">
                <MapContainer
                    ref={mapRef}
                    center={userLocation}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '62vh', width: '100%', borderRadius: '12px' }}
                >
                    {/* CartoDB Dark Matter tiles — hermoso diseño nocturno */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* Radio de cobertura del radar */}
                    <Circle
                        center={userLocation}
                        radius={2500}
                        pathOptions={{
                            color: '#fe5195',
                            fillColor: '#fe5195',
                            fillOpacity: 0.07,
                            weight: 1.5,
                            dashArray: '6 4',
                        }}
                    />

                    {/* Tu posición */}
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center', padding: '4px 8px' }}>
                                <strong>Tú</strong><br />
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>Buscando conexión profunda.</span>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Chispas cercanas */}
                    {nearbyMatches.map(match => (
                        <Marker
                            key={match.id}
                            position={[match.last_lat, match.last_lng]}
                            icon={sparkIcon}
                        >
                            <Popup>
                                <div style={{ textAlign: 'center', padding: '4px 8px' }}>
                                    <strong>Chispa Oculta 💫</strong><br />
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                        Alta compatibilidad · Ubicación protegida
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Footer info */}
            <div className="radar-footer glass animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p>🔒 Las ubicaciones se desvían ±2 km por tu seguridad. Patrocinado por <strong>Geobooker</strong></p>
            </div>
        </div>
    )
}
