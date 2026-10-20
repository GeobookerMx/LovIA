import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, PlayCircle, BookOpen, Clock, Award, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { trackEvent } from '../../lib/analytics'
import './ModulesPages.css'

interface Lesson {
    id: string
    module_id: string
    title: string
    duration: string
    type: 'theory' | 'exercise' | 'reflection'
    content_type: 'video' | 'article' | 'audio' | 'reflection'
    content_url?: string
    description: string
    rich_content?: string
    completed?: boolean
}

interface ModuleData {
    id: string
    title: string
    subtitle: string
    color: string
    author: string
    science_basis: string
    key_research: string
}

const typeIcons = {
    theory: <BookOpen size={16} />,
    exercise: <PlayCircle size={16} />,
    reflection: <Award size={16} />,
}

const typeLabels = {
    theory: 'Teoría',
    exercise: 'Ejercicio',
    reflection: 'Reflexión',
}

export default function ModuleDetail() {
    const navigate = useNavigate()
    const { moduleId } = useParams<{ moduleId: string }>()
    const { user, loadProfile } = useAuthStore()
    
    const [module, setModule] = useState<ModuleData | null>(null)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
    
    // Estados para reproductores de contenido
    const [reflectionInput, setReflectionInput] = useState('')
    const [savedReflection, setSavedReflection] = useState<string | null>(null)

    const fetchModuleDetails = useCallback(async () => {
        if (!user || !moduleId) return
        setLoading(true)
        try {
            // 1. Cargar módulo
            const { data: dbMod, error: modErr } = await supabase
                .from('growth_modules')
                .select('*')
                .eq('id', moduleId)
                .maybeSingle()
                
            if (modErr) throw modErr
            if (dbMod) setModule(dbMod as ModuleData)

            // 2. Cargar lecciones
            const { data: dbLessons, error: lessonsErr } = await supabase
                .from('growth_module_lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index', { ascending: true })
                
            if (lessonsErr) throw lessonsErr
            
            // 3. Cargar progreso del usuario
            const { data: dbProgress, error: progressErr } = await supabase
                .from('growth_progress')
                .select('*')
                .eq('user_id', user.id)
                
            if (progressErr) throw progressErr

            const completedIds = new Set(dbProgress?.map(p => p.lesson_id) || [])
            
            // Las lecciones se pueden explorar en cualquier orden.
            const mappedLessons = (dbLessons || []).map((les) => {
                const completed = completedIds.has(les.id)
                return {
                    ...les,
                    completed
                }
            })
            
            setLessons(mappedLessons)
        } catch (err) {
            console.error('[ModuleDetail] Error loading detail:', err)
        } finally {
            setLoading(false)
        }
    }, [user, moduleId])

    useEffect(() => {
        void fetchModuleDetails()
    }, [fetchModuleDetails])

    // Cargar respuesta de reflexión previa si la lección ya está completada
    useEffect(() => {
        if (activeLesson && activeLesson.completed) {
            supabase
                .from('growth_progress')
                .select('reflection_answer')
                .eq('user_id', user!.id)
                .eq('lesson_id', activeLesson.id)
                .maybeSingle()
                .then(({ data }) => {
                    if (data?.reflection_answer) {
                        setSavedReflection(data.reflection_answer)
                    }
                })
        } else {
            setSavedReflection(null)
            setReflectionInput('')
        }
    }, [activeLesson, user])

    const handleCompleteLesson = async () => {
        if (!user || !activeLesson) return
        setSaving(true)
        try {
            // Guardar progreso en growth_progress
            const { error } = await supabase
                .from('growth_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: activeLesson.id,
                    completed: true,
                    reflection_answer: activeLesson.content_type === 'reflection' ? reflectionInput : null,
                    completed_at: new Date().toISOString()
                })
                
            if (error) throw error

            // Registrar evento de analítica
            trackEvent('module_completed', { moduleId: activeLesson.module_id, lessonId: activeLesson.id })

            // Actualizar el progreso personal después de guardar la lección.
            await loadProfile()
            
            // Recargar detalles de lecciones en la vista
            await fetchModuleDetails()
            
            // Cerrar reproductor modal
            setActiveLesson(null)
        } catch (err) {
            console.error('[ModuleDetail] Error al guardar lección:', err)
            alert('Error al guardar tu progreso. Revisa tu conexión.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="module-detail flex-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin text-tertiary" size={32} />
            </div>
        )
    }

    if (!module) {
        return (
            <div className="module-detail">
                <div className="module-detail__header">
                    <button className="modules-page__back" onClick={() => navigate('/modules')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Módulo no encontrado</h2>
                </div>
            </div>
        )
    }

    const completedLessons = lessons.filter((l) => l.completed).length
    const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0
    const totalDuration = lessons.reduce((acc, l) => {
        const mins = parseInt(l.duration)
        return acc + (isNaN(mins) ? 0 : mins)
    }, 0)

    return (
        <div className="module-detail">
            {/* Header */}
            <div className="module-detail__header">
                <button className="modules-page__back" onClick={() => navigate('/modules')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>{module.title}</h2>
            </div>

            {/* Hero */}
            <div className="module-detail__hero glass-strong animate-fade-in-up" style={{ borderLeft: `3px solid ${module.color}` }}>
                <div className="module-detail__hero-meta">
                    <span><Clock size={14} /> {totalDuration} min total</span>
                    <span><BookOpen size={14} /> {lessons.length} lecciones</span>
                    <span><CheckCircle size={14} /> {completedLessons}/{lessons.length}</span>
                </div>

                {/* Progress */}
                <div className="module-detail__progress">
                    <div className="module-detail__progress-bar">
                        <div className="module-detail__progress-fill" style={{ width: `${progress}%`, background: module.color }} />
                    </div>
                    <span className="module-detail__progress-text">{progress}%</span>
                </div>
            </div>

            {/* Editorial context pending source review */}
            <div className="module-detail__science glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3>Sobre este módulo</h3>
                <p>Explora las lecciones que te resulten útiles. Completarlas es opcional y el porcentaje solo indica tu avance aquí.</p>
            </div>

            {/* Lessons */}
            <div className="module-detail__lessons">
                <h3>Lecciones</h3>
                {lessons.map((lesson, i) => {
                    const isExpanded = expandedLesson === lesson.id

                    return (
                        <div
                            key={lesson.id}
                            className={`module-detail__lesson glass ${lesson.completed ? 'module-detail__lesson--completed' : ''}`}
                            style={{ animationDelay: `${0.05 * i}s` }}
                        >
                            <button
                                className="module-detail__lesson-header"
                                onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                            >
                                <div className="module-detail__lesson-left">
                                    <div className="module-detail__lesson-status" style={{ color: lesson.completed ? 'var(--success)' : module.color }}>
                                        {lesson.completed ? <CheckCircle size={18} /> : (typeIcons[lesson.type] || <BookOpen size={18} />)}
                                    </div>
                                    <div>
                                        <span className="module-detail__lesson-title">{lesson.title}</span>
                                        <span className="module-detail__lesson-meta">
                                            {typeLabels[lesson.type] || 'Teoría'} · {lesson.duration}
                                        </span>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {isExpanded && (
                                <div className="module-detail__lesson-body animate-fade-in-up">
                                    <p>{lesson.description}</p>
                                    <button
                                        className="module-detail__start-btn"
                                        style={{ background: module.color }}
                                        onClick={() => {
                                            setActiveLesson(lesson)
                                            trackEvent('module_started', { moduleId: lesson.module_id, lessonId: lesson.id })
                                        }}
                                    >
                                        {lesson.completed ? 'Revisar lección' : lesson.type === 'exercise' ? 'Comenzar ejercicio' : lesson.type === 'reflection' ? 'Reflexionar' : 'Estudiar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Lesson Modal (Dynamic Content Player) */}
            {activeLesson && (
                <div className="legal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
                    <div className="legal-modal glass-strong animate-slide-up" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        
                        {/* Media Header Player */}
                        <div style={{ background: '#000', width: '100%', height: activeLesson.content_type === 'video' ? '220px' : '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {activeLesson.content_type === 'video' && activeLesson.content_url ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={activeLesson.content_url} 
                                    title={activeLesson.title} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    style={{ border: 'none' }}
                                />
                            ) : activeLesson.content_type === 'audio' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <PlayCircle size={36} color="var(--love-rose)" />
                                    <span style={{ color: 'white', fontSize: '0.85rem' }}>Audio de Introspección</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BookOpen size={24} color="var(--love-warm)" />
                                    <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Contenido educativo</span>
                                </div>
                            )}
                            <button 
                                onClick={() => setActiveLesson(null)} 
                                style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div style={{color: module.color, fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase'}}>
                                {typeLabels[activeLesson.type]} · {activeLesson.duration}
                            </div>
                            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.4rem' }}>{activeLesson.title}</h2>
                            
                            {/* Rich text / Article Content */}
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', fontSize: '0.92rem' }}>
                                {activeLesson.rich_content ? (
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{activeLesson.rich_content}</p>
                                ) : (
                                    <p>{activeLesson.description}</p>
                                )}
                            </div>

                            {/* Reflection Input Form */}
                            {activeLesson.content_type === 'reflection' && (
                                <div style={{ margin: '20px 0' }}>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                                        Escribe tus pensamientos / respuestas aquí:
                                    </label>
                                    {activeLesson.completed ? (
                                        <div style={{
                                            padding: 16, background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--border-subtle)', borderRadius: 12,
                                            color: 'var(--text-secondary)', fontSize: '0.88rem', fontStyle: 'italic',
                                            lineHeight: 1.5
                                        }}>
                                            "{savedReflection || 'Sin respuesta guardada.'}"
                                        </div>
                                    ) : (
                                        <textarea
                                            value={reflectionInput}
                                            onChange={e => setReflectionInput(e.target.value)}
                                            placeholder="Tómate unos minutos para profundizar en ti..."
                                            rows={4}
                                            style={{
                                                width: '100%', padding: '12px 16px', borderRadius: 12,
                                                background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
                                                color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem',
                                                lineHeight: 1.5, resize: 'none'
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Completion Action Button */}
                            {!activeLesson.completed ? (
                                <button 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: 12 }}
                                    onClick={handleCompleteLesson}
                                    disabled={saving || (activeLesson.content_type === 'reflection' && !reflectionInput.trim())}
                                >
                                    {saving ? (
                                        <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                                    ) : (
                                        <><CheckCircle size={18} /> Completar lección y marcar avance</>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-secondary" 
                                    style={{ width: '100%', padding: '14px', borderRadius: 12 }}
                                    onClick={() => setActiveLesson(null)}
                                >
                                    Cerrar Vista Previa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
