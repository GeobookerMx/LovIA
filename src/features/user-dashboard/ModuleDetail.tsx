import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Lock, PlayCircle, BookOpen, Clock, Award, ChevronDown, ChevronUp, X, Play } from 'lucide-react'
import './ModulesPages.css'

/**
 * LovIA! — Module Detail Page
 *
 * Shows lessons, progress, scientific basis and exercises for each module.
 * Each lesson includes: content, scientific justification, and a reflection exercise.
 */

interface Lesson {
    id: string
    title: string
    duration: string
    completed: boolean
    locked: boolean
    type: 'theory' | 'exercise' | 'reflection'
    description: string
}

interface ModuleData {
    id: string
    title: string
    author: string
    scienceBasis: string
    keyResearch: string
    color: string
    lessons: Lesson[]
}

const moduleDataMap: Record<string, ModuleData> = {
    ie: {
        id: 'ie',
        title: 'Inteligencia Emocional',
        author: 'Salovey & Mayer (1990)',
        scienceBasis: 'La inteligencia emocional es la capacidad de percibir, comprender, manejar y utilizar las emociones de manera efectiva. Las personas con alta IE tienen relaciones más satisfactorias (Brackett et al., 2005) y mayor bienestar psicológico (Mayer et al., 2008).',
        keyResearch: 'Las parejas donde ambos miembros tienen alta IE reportan un 36% más de satisfacción relacional y un 40% menos de conflictos destructivos.',
        color: 'var(--line-love)',
        lessons: [
            { id: 'ie-1', title: 'Reconocimiento emocional', duration: '15 min', completed: true, locked: false, type: 'theory', description: 'Identifica las 6 emociones básicas (Ekman, 1992) y cómo se manifiestan en tu cuerpo.' },
            { id: 'ie-2', title: 'Ejercicio: Diario emocional', duration: '10 min', completed: true, locked: false, type: 'exercise', description: 'Registra tus emociones durante 3 días y detecta patrones.' },
            { id: 'ie-3', title: 'Empatía y perspectiva', duration: '20 min', completed: true, locked: false, type: 'theory', description: 'Desarrolla la capacidad de "ponerse en los zapatos del otro" (Davis, 1983).' },
            { id: 'ie-4', title: 'Reflexión: Mi patrón empático', duration: '10 min', completed: false, locked: false, type: 'reflection', description: '¿Tiendes a empatizar cognitiva o emocionalmente? Ambas son válidas.' },
            { id: 'ie-5', title: 'Gestión de emociones intensas', duration: '20 min', completed: false, locked: false, type: 'theory', description: 'Técnicas de regulación: respiración 4-7-8, reappraisal cognitivo (Gross, 2002).' },
            { id: 'ie-6', title: 'Ejercicio: Técnica STOP', duration: '10 min', completed: false, locked: false, type: 'exercise', description: 'Practica la técnica STOP: Stop, Take a breath, Observe, Proceed.' },
            { id: 'ie-7', title: 'IE en la relación de pareja', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'Cómo aplicar IE para comunicar necesidades sin dañar la relación.' },
            { id: 'ie-8', title: 'Reflexión final: Mi plan IE', duration: '15 min', completed: false, locked: true, type: 'reflection', description: 'Define 3 acciones concretas para mejorar tu IE en los próximos 30 días.' },
        ],
    },
    cnv: {
        id: 'cnv',
        title: 'Comunicación No Violenta',
        author: 'Rosenberg (2015) + Gottman (1999)',
        scienceBasis: 'La CNV es un modelo de comunicación que separa observaciones de juicios, identifica sentimientos y necesidades, y formula peticiones claras. Gottman identificó los "4 Jinetes" (crítica, desdén, defensividad, evasión) como predictores del 94% de los divorcios.',
        keyResearch: 'Parejas que practican CNV reducen los conflictos destructivos en un 67% y reportan mayor intimidad emocional (Wacker & Dziobek, 2009).',
        color: 'var(--line-sex)',
        lessons: [
            { id: 'cnv-1', title: 'Los 4 Jinetes del Apocalipsis', duration: '20 min', completed: false, locked: false, type: 'theory', description: 'Identifica los 4 patrones tóxicos que predicen el fracaso relacional (Gottman, 1999).' },
            { id: 'cnv-2', title: 'Observar sin juzgar', duration: '15 min', completed: false, locked: false, type: 'theory', description: 'Aprende a separar hechos de interpretaciones.' },
            { id: 'cnv-3', title: 'Ejercicio: Reformula tus juicios', duration: '10 min', completed: false, locked: false, type: 'exercise', description: 'Toma 5 juicios del último mes y conviértelos en observaciones neutras.' },
            { id: 'cnv-4', title: 'Necesidades universales', duration: '15 min', completed: false, locked: false, type: 'theory', description: 'Las 9 necesidades humanas universales de Rosenberg.' },
            { id: 'cnv-5', title: 'Peticiones vs. exigencias', duration: '15 min', completed: false, locked: false, type: 'theory', description: 'Cómo formular peticiones que no generen resistencia.' },
            { id: 'cnv-6', title: 'Ejercicio: Diálogo CNV', duration: '15 min', completed: false, locked: false, type: 'exercise', description: 'Practica el modelo OSBD (Observación, Sentimiento, Necesidad, Demanda).' },
            { id: 'cnv-7', title: 'Los antídotos de Gottman', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'Los 4 antídotos contra los Jinetes: arranque suave, cultura de apreciación, responsabilidad, auto-regulación.' },
            { id: 'cnv-8', title: 'Escucha activa profunda', duration: '15 min', completed: false, locked: true, type: 'theory', description: 'Técnicas de escucha que generan conexión.' },
            { id: 'cnv-9', title: 'Ejercicio: Conversación difícil', duration: '20 min', completed: false, locked: true, type: 'exercise', description: 'Practica una conversación difícil usando el modelo completo de CNV.' },
            { id: 'cnv-10', title: 'Reflexión: Mi estilo comunicativo', duration: '10 min', completed: false, locked: true, type: 'reflection', description: 'Identifica tu estilo dominante y cómo mejorarlo.' },
        ],
    },
    regulation: {
        id: 'regulation',
        title: 'Regulación Emocional',
        author: 'Gross & John (2003)',
        scienceBasis: 'El modelo de proceso de Gross distingue entre estrategias de regulación emocional adaptativas (reappraisal) y desadaptativas (supresión). Las personas que usan predominantemente reappraisal tienen mejor bienestar y relaciones más satisfactorias.',
        keyResearch: 'La supresión emocional reduce la satisfacción relacional en un 25% y aumenta los síntomas depresivos (Gross & John, 2003).',
        color: 'var(--line-realization)',
        lessons: [
            { id: 'reg-1', title: 'El modelo de proceso emocional', duration: '20 min', completed: true, locked: false, type: 'theory', description: 'Comprende cómo se generan las emociones y dónde puedes intervenir (Gross, 1998).' },
            { id: 'reg-2', title: 'Reappraisal vs. Supresión', duration: '15 min', completed: true, locked: false, type: 'theory', description: 'Dos estrategias opuestas: reevaluar vs. reprimir.' },
            { id: 'reg-3', title: 'Ejercicio: Reappraisal cognitivo', duration: '10 min', completed: true, locked: false, type: 'exercise', description: 'Practica reevaluar 5 situaciones de tu última semana.' },
            { id: 'reg-4', title: 'Mindfulness y emociones', duration: '15 min', completed: true, locked: false, type: 'theory', description: 'La meditación mindfulness como herramienta de regulación (Kabat-Zinn, 1990).' },
            { id: 'reg-5', title: 'Ejercicio: Meditación guiada', duration: '10 min', completed: true, locked: false, type: 'exercise', description: 'Meditación de 10 minutos enfocada en observar emociones sin reaccionar.' },
            { id: 'reg-6', title: 'Reflexión final: Mi toolkit', duration: '15 min', completed: true, locked: false, type: 'reflection', description: 'Define tu caja de herramientas personal de regulación emocional.' },
        ],
    },
    attachment: {
        id: 'attachment',
        title: 'Estilos de Apego',
        author: 'Bowlby (1969) + Hazan & Shaver (1987)',
        scienceBasis: 'La teoría del apego describe cómo nuestros vínculos tempranos con cuidadores moldean nuestros patrones relacionales adultos. Existen 4 estilos: seguro, ansioso, evitativo, y desorganizado. El apego seguro se puede desarrollar a cualquier edad.',
        keyResearch: 'Las parejas con apego seguro reportan 50% más estabilidad relacional y menor incidencia de ruptura (Mikulincer & Shaver, 2003).',
        color: 'var(--love-warm)',
        lessons: [
            { id: 'att-1', title: '¿Qué es el apego?', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'La teoría del apego de Bowlby y su adaptación a relaciones adultas.' },
            { id: 'att-2', title: 'Los 4 estilos de apego', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'Seguro, ansioso-preocupado, evitativo-dismissing, desorganizado.' },
            { id: 'att-3', title: 'Ejercicio: Identifica tu estilo', duration: '15 min', completed: false, locked: true, type: 'exercise', description: 'Cuestionario ECR-R adaptado para identificar tu estilo predominante.' },
            { id: 'att-4', title: 'Apego y conflicto', duration: '15 min', completed: false, locked: true, type: 'theory', description: 'Cómo cada estilo reacciona ante el conflicto de pareja.' },
            { id: 'att-5', title: 'Hacia el apego seguro', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'Estrategias basadas en EFT (Johnson, 2008) para desarrollar seguridad.' },
            { id: 'att-6', title: 'Ejercicio: Diálogo de conexión', duration: '15 min', completed: false, locked: true, type: 'exercise', description: 'Practica un diálogo de vulnerabilidad constructiva.' },
            { id: 'att-7', title: 'Reflexión: Mi historia de apego', duration: '15 min', completed: false, locked: true, type: 'reflection', description: 'Reflexiona sobre cómo tu historia de apego influye en tus relaciones actuales.' },
        ],
    },
    sexuality: {
        id: 'sexuality',
        title: 'Sexualidad Consciente',
        author: 'Perel (2006) + Masters & Johnson',
        scienceBasis: 'La intimidad sexual es una dimensión fundamental de las relaciones adultas. Perel distingue entre el deseo de seguridad y el de aventura, ambos necesarios. La comunicación abierta sobre sexualidad predice mayor satisfacción relacional.',
        keyResearch: 'Las parejas que hablan abiertamente de su sexualidad reportan un 60% más de satisfacción tanto sexual como relacional (Frederick et al., 2017).',
        color: 'var(--love-coral)',
        lessons: [
            { id: 'sex-1', title: 'El espectro del deseo', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'Deseo espontáneo vs. responsivo (Basson, 2000). Ambos son normales.' },
            { id: 'sex-2', title: 'Seguridad vs. Aventura', duration: '15 min', completed: false, locked: true, type: 'theory', description: 'La paradoja de Perel: cómo mantener el deseo sin sacrificar la seguridad.' },
            { id: 'sex-3', title: 'Ejercicio: Mapa del deseo', duration: '15 min', completed: false, locked: true, type: 'exercise', description: 'Identifica tus fuentes de deseo y tus inhibidores.' },
            { id: 'sex-4', title: 'Comunicación sexual', duration: '20 min', completed: false, locked: true, type: 'theory', description: 'Vocabulario y técnicas para hablar de sexualidad sin vergüenza.' },
            { id: 'sex-5', title: 'Consentimiento afirmativo', duration: '15 min', completed: false, locked: true, type: 'theory', description: 'El modelo de consentimiento entusiasta y continuo.' },
            { id: 'sex-6', title: 'Ejercicio: Conversación de deseo', duration: '15 min', completed: false, locked: true, type: 'exercise', description: 'Practica iniciar una conversación sobre deseo con tu pareja.' },
            { id: 'sex-7', title: 'Intimidad más allá de lo físico', duration: '15 min', completed: false, locked: true, type: 'theory', description: 'Las 5 dimensiones de la intimidad (emocional, intelectual, experiencial, espiritual, física).' },
            { id: 'sex-8', title: 'Reflexión: Mi sexualidad consciente', duration: '10 min', completed: false, locked: true, type: 'reflection', description: 'Define tu visión de una vida sexual satisfactoria y consciente.' },
        ],
    },
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
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

    const mod = moduleDataMap[moduleId || '']

    if (!mod) {
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

    const completedLessons = mod.lessons.filter((l) => l.completed).length
    const progress = Math.round((completedLessons / mod.lessons.length) * 100)
    const totalDuration = mod.lessons.reduce((acc, l) => {
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
                <h2>{mod.title}</h2>
            </div>

            {/* Hero */}
            <div className="module-detail__hero glass-strong animate-fade-in-up" style={{ borderLeft: `3px solid ${mod.color}` }}>
                <div className="module-detail__hero-meta">
                    <span><Clock size={14} /> {totalDuration} min total</span>
                    <span><BookOpen size={14} /> {mod.lessons.length} lecciones</span>
                    <span><CheckCircle size={14} /> {completedLessons}/{mod.lessons.length}</span>
                </div>

                {/* Progress */}
                <div className="module-detail__progress">
                    <div className="module-detail__progress-bar">
                        <div className="module-detail__progress-fill" style={{ width: `${progress}%`, background: mod.color }} />
                    </div>
                    <span className="module-detail__progress-text">{progress}%</span>
                </div>
            </div>

            {/* Science Basis */}
            <div className="module-detail__science glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3>📚 Base Científica</h3>
                <p className="module-detail__author" style={{ color: mod.color }}>{mod.author}</p>
                <p>{mod.scienceBasis}</p>
                <div className="module-detail__key-research">
                    <strong>💡 Dato clave:</strong> {mod.keyResearch}
                </div>
            </div>

            {/* Lessons */}
            <div className="module-detail__lessons">
                <h3>Lecciones</h3>
                {mod.lessons.map((lesson, i) => {
                    const isExpanded = expandedLesson === lesson.id

                    return (
                        <div
                            key={lesson.id}
                            className={`module-detail__lesson glass ${lesson.completed ? 'module-detail__lesson--completed' : ''} ${lesson.locked ? 'module-detail__lesson--locked' : ''}`}
                            style={{ animationDelay: `${0.05 * i}s` }}
                        >
                            <button
                                className="module-detail__lesson-header"
                                onClick={() => !lesson.locked && setExpandedLesson(isExpanded ? null : lesson.id)}
                                disabled={lesson.locked}
                            >
                                <div className="module-detail__lesson-left">
                                    <div className="module-detail__lesson-status" style={{ color: lesson.completed ? 'var(--success)' : lesson.locked ? 'var(--text-tertiary)' : mod.color }}>
                                        {lesson.completed ? <CheckCircle size={18} /> : lesson.locked ? <Lock size={18} /> : typeIcons[lesson.type]}
                                    </div>
                                    <div>
                                        <span className="module-detail__lesson-title">{lesson.title}</span>
                                        <span className="module-detail__lesson-meta">
                                            {typeLabels[lesson.type]} · {lesson.duration}
                                        </span>
                                    </div>
                                </div>
                                {!lesson.locked && (
                                    isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="module-detail__lesson-body animate-fade-in-up">
                                    <p>{lesson.description}</p>
                                    {!lesson.completed && (
                                        <button
                                            className="module-detail__start-btn"
                                            style={{ background: mod.color }}
                                            onClick={() => setActiveLesson(lesson)}
                                        >
                                            {lesson.type === 'exercise' ? 'Comenzar ejercicio' : lesson.type === 'reflection' ? 'Reflexionar' : 'Estudiar'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Lesson Modal (Simulated Player) */}
            {activeLesson && (
                <div className="legal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
                    <div className="legal-modal glass-strong animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ background: '#000', width: '100%', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={48} color="rgba(255,255,255,0.5)" />
                            <button onClick={() => setActiveLesson(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{color: mod.color, fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase'}}>{typeLabels[activeLesson.type]}</div>
                            <h2 style={{ margin: '0 0 16px 0' }}>{activeLesson.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                                Esta es una vista previa del reproductor de contenido. En la versión final, aquí se desplegará el video, el audio o el artículo completo de la lección.
                            </p>
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={() => setActiveLesson(null)}
                            >
                                <CheckCircle size={18} /> Marcar como completado
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
