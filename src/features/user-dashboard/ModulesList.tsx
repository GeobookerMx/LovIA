import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle, Clock, BookOpen, Brain, Heart, MessageCircle, Shield, Flame, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './ModulesPages.css'

export interface DBModule {
    id: string
    title: string
    subtitle: string
    icon_name: string
    color: string
    author: string
    duration: string
    benefit: string
    required_tier: string
    science_basis: string
    key_research: string
}

interface ModuleWithProgress extends DBModule {
    lessonsCount: number
    completed: boolean
    progress: number
    locked: boolean
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'brain': <Brain size={24} />,
    'message-circle': <MessageCircle size={24} />,
    'shield': <Shield size={24} />,
    'heart': <Heart size={24} />,
    'flame': <Flame size={24} />,
}

export default function ModulesList() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const [modules, setModules] = useState<ModuleWithProgress[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        async function fetchModulesAndProgress() {
            setLoading(true)
            try {
                // 1. Obtener módulos de la BD
                const { data: dbMods, error: modsError } = await supabase
                    .from('growth_modules')
                    .select('*')
                    .order('order_index', { ascending: true })

                if (modsError) throw modsError

                // 2. Obtener lecciones de la BD para contar lecciones por módulo
                const { data: dbLessons, error: lessonsError } = await supabase
                    .from('growth_module_lessons')
                    .select('id, module_id')

                if (lessonsError) throw lessonsError

                // 3. Obtener el progreso del usuario
                const { data: userProgress, error: progressError } = await supabase
                    .from('growth_progress')
                    .select('lesson_id')
                    .eq('user_id', user!.id)

                if (progressError) throw progressError

                const completedLessonIds = new Set(userProgress?.map(p => p.lesson_id) || [])

                // 4. Mapear y calcular progreso
                const mapped: ModuleWithProgress[] = (dbMods || []).map(mod => {
                    const lessons = dbLessons?.filter(l => l.module_id === mod.id) || []
                    const totalLessons = lessons.length
                    
                    const completedLessons = lessons.filter(l => completedLessonIds.has(l.id)).length
                    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
                    
                    // Lógica de bloqueo según Readiness Score
                    // ie, cnv y regulation son libres, attachment pide 40+, sexuality pide 60+
                    const readiness = profile?.readiness_score ?? 0
                    let locked = false
                    if (mod.id === 'attachment' && readiness < 40) locked = true
                    if (mod.id === 'sexuality' && readiness < 60) locked = true

                    return {
                        ...mod,
                        lessonsCount: totalLessons,
                        completed: progress === 100 && totalLessons > 0,
                        progress,
                        locked
                    }
                })

                setModules(mapped)
            } catch (err) {
                console.error('[ModulesList] Error al cargar datos:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchModulesAndProgress()
    }, [user, profile])

    const completedCount = modules.filter((m) => m.completed).length
    const inProgressCount = modules.filter((m) => m.progress > 0 && !m.completed).length

    if (loading) {
        return (
            <div className="modules-page flex-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-tertiary" size={32} />
            </div>
        )
    }

    return (
        <div className="modules-page">
            {/* Header */}
            <div className="modules-page__header">
                <button className="modules-page__back" onClick={() => navigate('/profile/improvement')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Módulos de Crecimiento</h2>
            </div>

            {/* Stats */}
            <div className="modules-page__stats animate-fade-in-up">
                <div className="modules-page__stat glass">
                    <span className="modules-page__stat-value">{modules.length}</span>
                    <span className="modules-page__stat-label">Módulos</span>
                </div>
                <div className="modules-page__stat glass">
                    <span className="modules-page__stat-value" style={{ color: 'var(--success)' }}>{completedCount}</span>
                    <span className="modules-page__stat-label">Completados</span>
                </div>
                <div className="modules-page__stat glass">
                    <span className="modules-page__stat-value" style={{ color: 'var(--love-warm)' }}>{inProgressCount}</span>
                    <span className="modules-page__stat-label">En progreso</span>
                </div>
            </div>

            {/* Intro */}
            <div className="modules-page__intro glass-strong animate-fade-in-up">
                <BookOpen size={20} color="var(--love-warm)" />
                <p>
                    Cada módulo está respaldado por investigación científica publicada.
                    Trabaja en las áreas que más impactan tu <strong>Frecuencia de Relación</strong>.
                </p>
            </div>

            {/* Module Cards */}
            <div className="modules-page__list stagger-children">
                {modules.map((mod) => (
                    <button
                        key={mod.id}
                        className={`modules-page__card glass ${mod.locked ? 'modules-page__card--locked' : ''} ${mod.completed ? 'modules-page__card--completed' : ''}`}
                        onClick={() => !mod.locked && navigate(`/modules/${mod.id}`)}
                        disabled={mod.locked}
                    >
                        <div className="modules-page__card-icon" style={{ color: mod.color, background: `${mod.color}15` }}>
                            {mod.locked ? <Lock size={24} /> : mod.completed ? <CheckCircle size={24} /> : (ICON_MAP[mod.icon_name] || <BookOpen size={24} />)}
                        </div>

                        <div className="modules-page__card-content">
                            <div className="modules-page__card-top">
                                <h3>{mod.title}</h3>
                                {mod.locked && (
                                    <span className="modules-page__tier-badge" style={{ background: 'var(--love-rose)', color: 'white' }}>
                                        Bloqueado
                                    </span>
                                )}
                            </div>
                            <p className="modules-page__card-subtitle">{mod.subtitle}</p>

                            <div className="modules-page__card-meta">
                                <span><Clock size={12} /> {mod.duration}</span>
                                <span><BookOpen size={12} /> {mod.lessonsCount} lecciones</span>
                            </div>

                            <div className="modules-page__card-author">
                                📚 {mod.author}
                            </div>

                            <div className="modules-page__card-benefit">
                                ✨ {mod.benefit}
                            </div>

                            {mod.progress > 0 && !mod.completed && (
                                <div className="modules-page__progress-bar" style={{ marginTop: '8px' }}>
                                    <div className="modules-page__progress-fill" style={{ width: `${mod.progress}%`, background: mod.color }} />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
