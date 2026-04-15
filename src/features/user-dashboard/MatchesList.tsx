import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Search, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './MatchesList.css'

interface MatchData {
    match_id: string;
    target_user_id: string;
    alias: string;
    age: number;
    city: string;
    avatar_url: string;
    visibility_mode: 'classic' | 'gradual' | 'essence';
    compatibility_score: number;
    current_level: number;
}

export default function MatchesList() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const [matches, setMatches] = useState<MatchData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMatches() {
            if (!user) return
            
            // Buscar matches donde el usuario es user_a o user_b
            const { data, error } = await supabase
                .from('matches')
                .select(`
                    id, 
                    current_level,
                    compatibility_score,
                    user_a:profiles!matches_user_a_id_fkey(id, alias, age, city, avatar_url, visibility_mode),
                    user_b:profiles!matches_user_b_id_fkey(id, alias, age, city, avatar_url, visibility_mode)
                `)
                .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
                .eq('status', 'active')

            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            const formatted: MatchData[] = data.map((m: any) => {
                // Determinar quién es 'el otro' en el match
                const isUserA = m.user_a.id === user.id
                const other = isUserA ? m.user_b : m.user_a

                return {
                    match_id: m.id,
                    target_user_id: other.id,
                    alias: other.alias || 'Anónimo',
                    age: other.age,
                    city: other.city || 'Ubicación oculta',
                    avatar_url: other.avatar_url || 'https://via.placeholder.com/150',
                    visibility_mode: other.visibility_mode || 'gradual',
                    compatibility_score: m.compatibility_score,
                    current_level: m.current_level
                }
            })

            // Sort by compatibility descending
            formatted.sort((a,b) => b.compatibility_score - a.compatibility_score)
            setMatches(formatted)
            setLoading(false)
        }

        fetchMatches()
    }, [user])

    // Determinar la clase CSS de la foto según el modo y el nivel del match
    const getPhotoClass = (mode: string, level: number) => {
        if (mode === 'classic') return 'match-card__photo'
        if (mode === 'essence') return 'match-card__visibility--essence'
        
        // Gradual: Si están en nivel 1, muy difuso. Nivel 2 menos, etc.
        // Nivel 3 o > se considera 'Classic' (sin blur)
        if (mode === 'gradual') {
            if (level === 1) return 'match-card__photo match-card__visibility--gradual'
            // Si level > 1, podríamos hacer un blur intermedio o quitarlo
            return 'match-card__photo'
        }
        return 'match-card__photo'
    }

    if (loading) {
        return (
            <div className="matches-page flex-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-tertiary" />
            </div>
        )
    }

    return (
        <div className="matches-page">
            <header className="matches-page__header">
                <div>
                    <h1>Descubrimiento</h1>
                    <p className="matches-page__subtitle">Basado en tu momento de vida</p>
                </div>
                {/* Trigger Manual Matching para pruebas */}
                <button 
                    className="icon-btn glass" 
                    title="Buscar nuevos matches (Solo dev)"
                    onClick={async () => {
                        setLoading(true)
                        await supabase.functions.invoke('run-matching')
                        window.location.reload()
                    }}
                >
                    <Search size={18}/>
                </button>
            </header>

            {matches.length === 0 ? (
                <div className="matches-page__empty glass animate-scale-in">
                    <div className="matches-page__empty-icon animate-float">
                        <Heart size={32} color="var(--text-secondary)" />
                    </div>
                    <h2>No hay perfiles disponibles</h2>
                    <p>
                        {!profile?.onboarding_completed 
                            ? 'Debes completar tu Mapa de Momento de Vida para ver otros perfiles.' 
                            : 'No encontramos perfiles en tu misma frecuencia o distancia actual.'}
                    </p>
                    {!profile?.onboarding_completed && (
                        <button className="matches-page__cta" onClick={() => navigate('/onboard')} style={{ marginTop: 20 }}>
                            Hacer Introspección
                        </button>
                    )}
                </div>
            ) : (
                <div className="matches-grid">
                    {matches.map(m => (
                        <div key={m.match_id} className="match-card animate-fade-in-up" onClick={() => navigate(`/matches/${m.match_id}`)}>
                            
                            {m.visibility_mode === 'essence' && m.current_level < 3 && (
                                <div className="match-card__essence-bg">
                                    <span className="match-card__badge-essence">🔮</span>
                                    <span className="match-card__text-essence">Conexión por Esencia</span>
                                </div>
                            )}

                            <img 
                                src={m.avatar_url} 
                                alt={m.alias} 
                                className={getPhotoClass(m.visibility_mode, m.current_level)}
                            />

                            <div className="match-card__score">
                                {m.compatibility_score}%
                            </div>
                            
                            <div className="match-card__info">
                                <div className="match-card__name">{m.alias}, {m.age || '?'}</div>
                                <div className="match-card__meta">
                                    {m.city}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
