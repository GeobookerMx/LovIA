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

    // ✅ Apple 4.3(b): Gate de readiness — diferenciador clave de LovIA
    // Si no completó el onboarding, mostrar pantalla explicativa en lugar de lista vacía
    if (!profile?.onboarding_completed) {
        return (
            <div className="matches-page">
                <header className="matches-page__header">
                    <div>
                        <h1>Descubrimiento</h1>
                        <p className="matches-page__subtitle">Basado en tu momento de vida</p>
                    </div>
                </header>
                <div className="matches-page__empty glass animate-scale-in" style={{ padding: '2rem 1.5rem' }}>
                    <div className="matches-page__empty-icon animate-float" style={{ fontSize: 48, marginBottom: 16 }}>
                        🔓
                    </div>
                    <h2 style={{ marginBottom: 8 }}>Desbloquea el Descubrimiento</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        LovIA te conecta con personas según tu <strong>momento de vida y readiness relacional</strong>.
                        Antes de ver matches, necesitas completar estos pasos:
                    </p>

                    {/* Pasos requeridos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, textAlign: 'left' }}>
                        {[
                            { icon: '📋', title: 'Mapa de Momento de Vida', desc: 'Completa el onboarding inicial (5-7 min)', done: !!profile?.onboarding_completed, action: '/onboarding' },
                            { icon: '🧠', title: 'Al menos 1 Evaluación', desc: 'Regulación emocional, Stroop o Tolerancia', done: false, action: '/evaluations/regulation' },
                            { icon: '🤳', title: 'Foto de perfil', desc: 'Agrega tu selfie para generar confianza', done: !!profile?.avatar_url, action: '/profile' },
                        ].map((step, i) => (
                            <div key={i}
                                onClick={() => navigate(step.action)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                                    borderRadius: 14, cursor: 'pointer',
                                    background: step.done ? 'rgba(0,200,100,0.08)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${step.done ? 'rgba(0,200,100,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                    transition: 'all 0.2s'
                                }}>
                                <span style={{ fontSize: 28, flexShrink: 0 }}>{step.done ? '✅' : step.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: step.done ? 'var(--success)' : 'var(--text-primary)' }}>
                                        {step.title}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                        {step.done ? '¡Completado!' : step.desc}
                                    </div>
                                </div>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>{step.done ? '' : '›'}</span>
                            </div>
                        ))}
                    </div>

                    <button className="matches-page__cta" onClick={() => navigate('/onboarding')}>
                        Comenzar mi Perfil Relacional ✨
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 16 }}>
                        LovIA garantiza conexiones reales basadas en compatibilidad genuina,<br />no en swipe aleatorio.
                    </p>
                </div>
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
