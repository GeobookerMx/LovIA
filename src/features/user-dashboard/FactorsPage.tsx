/**
 * LovIA! — Mis Factores (27+ factors detail)
 *
 * Each factor with score bar, icon, and scientific source.
 * Grouped by: Comunes (11), Positivos (10), Negativos (6).
 *
 * Sources: Gottman, Chapman, Sternberg, Bowlby, Maslow, and others.
 */

import { useState } from 'react'
import { ArrowLeft, BookOpen, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ProfilePages.css'

interface Factor {
    name: string
    emoji: string
    score: number        // 0-4
    description: string
    source: string
}

const commonFactors: Factor[] = [
    { name: 'Comunicación', emoji: '💬', score: 3.2, description: 'Capacidad de expresar y escuchar', source: 'Gottman, 1999' },
    { name: 'Valores compartidos', emoji: '⚖️', score: 3.5, description: 'Alineación ética y moral', source: 'Schwartz, 2012' },
    { name: 'Metas de vida', emoji: '🎯', score: 2.8, description: 'Compatibilidad en objetivos', source: 'Deci & Ryan, 1985' },
    { name: 'Sexualidad', emoji: '🔥', score: 2.5, description: 'Compatibilidad sexual', source: 'Masters & Johnson, 1966' },
    { name: 'Familia', emoji: '👨‍👩‍👧', score: 3.0, description: 'Visión de familia y crianza', source: 'Bowen, 1978' },
    { name: 'Finanzas', emoji: '💰', score: 2.7, description: 'Compatibilidad financiera', source: 'Dew et al., 2012' },
    { name: 'Religión/espiritualidad', emoji: '🙏', score: 3.1, description: 'Alineación espiritual', source: 'Mahoney, 2010' },
    { name: 'Humor', emoji: '😄', score: 3.4, description: 'Compatibilidad de humor', source: 'Gottman, 2011' },
    { name: 'Distancia/lugar', emoji: '📍', score: 2.9, description: 'Proximidad geográfica', source: 'Haversine, geo-filtro' },
    { name: 'Intereses', emoji: '🎨', score: 3.0, description: 'Actividades y hobbies', source: 'Factor propio' },
    { name: 'Muerte/duelo', emoji: '🕊️', score: 2.6, description: 'Manejo de pérdidas', source: 'Kübler-Ross, 1969' },
]

const positiveFactors: Factor[] = [
    { name: 'Empatía', emoji: '🤲', score: 3.3, description: 'Comprensión emocional', source: 'Goleman, 1995' },
    { name: 'Respeto', emoji: '🏛️', score: 3.6, description: 'Respeto mutuo', source: 'Gottman, 1999' },
    { name: 'Inteligencia Emocional', emoji: '🧠', score: 2.8, description: 'Reconocer y gestionar emociones', source: 'Goleman, 1995' },
    { name: 'Confianza', emoji: '🤝', score: 3.1, description: 'Confianza interpersonal', source: 'Johnson, 2008 (EFT)' },
    { name: 'Apoyo emocional', emoji: '💪', score: 3.0, description: 'Soporte en momentos difíciles', source: 'Bowlby, 1969' },
    { name: 'Autodisciplina', emoji: '🏋️', score: 2.5, description: 'Autocontrol y constancia', source: 'Duckworth, 2016' },
    { name: 'Crecimiento personal', emoji: '🌱', score: 3.4, description: 'Disposición a mejorar', source: 'Dweck, 2006' },
    { name: 'Tolerancia a la frustración', emoji: '🛡️', score: 2.7, description: 'Manejo de frustración', source: 'ICI — UNAM' },
    { name: 'Generosidad', emoji: '🎁', score: 3.2, description: 'Dar sin esperar', source: 'Chapman, 1992' },
    { name: 'Autocrítica constructiva', emoji: '🔍', score: 2.9, description: 'Capacidad de reflexión', source: 'Neff, 2011' },
]

const negativeFactors: Factor[] = [
    { name: 'Codependencia', emoji: '🔗', score: 1.2, description: 'Dependencia emocional excesiva', source: 'Beattie, 1986' },
    { name: 'Celos patológicos', emoji: '😤', score: 0.8, description: 'Celos destructivos', source: 'Marazziti et al., 2010' },
    { name: 'Agresividad', emoji: '🌋', score: 0.5, description: 'Tendencia agresiva', source: 'Gottman — 4 Jinetes' },
    { name: 'Egoísmo relacional', emoji: '👑', score: 1.0, description: 'Priorizar yo sobre nosotros', source: 'Gottman, 1999' },
    { name: 'Historial de violencia', emoji: '🚫', score: 0.0, description: 'Indicadores de violencia', source: 'Ley Gral. Acceso Mujeres' },
    { name: 'Adicciones activas', emoji: '⚠️', score: 0.3, description: 'Sustancias o conductas', source: 'DSM-5, APA' },
]

type FilterType = 'all' | 'common' | 'positive' | 'negative'

export default function FactorsPage() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState<FilterType>('all')

    const filters: { key: FilterType; label: string; count: number }[] = [
        { key: 'all', label: 'Todos', count: commonFactors.length + positiveFactors.length + negativeFactors.length },
        { key: 'common', label: 'Comunes', count: commonFactors.length },
        { key: 'positive', label: 'Positivos', count: positiveFactors.length },
        { key: 'negative', label: 'Negativos', count: negativeFactors.length },
    ]

    const renderFactors = (factors: Factor[], color: string) => (
        factors.map((f) => (
            <div key={f.name} className="factor-card glass">
                <div className="factor-card__icon">{f.emoji}</div>
                <div className="factor-card__info">
                    <div className="factor-card__name">{f.name}</div>
                    <div className="factor-card__source">
                        <BookOpen size={9} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                        {f.source}
                    </div>
                    <div className="factor-card__bar">
                        <div
                            className="factor-card__fill"
                            style={{ width: `${(f.score / 4) * 100}%`, background: color }}
                        />
                    </div>
                </div>
                <div className="factor-card__score" style={{ color }}>
                    {f.score.toFixed(1)}
                </div>
            </div>
        ))
    )

    return (
        <div className="profile-sub">
            <div className="profile-sub__header">
                <button className="profile-sub__back" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Mis Factores</h2>
            </div>

            <p className="profile-sub__subtitle">
                Tu perfil de <strong>27+ factores</strong> evaluados a partir de investigación publicada.
                Cada factor tiene una fuente científica que lo respalda.
            </p>

            {/* Filters */}
            <div className="legal-tabs">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        className={`legal-tab ${filter === f.key ? 'legal-tab--active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        <Filter size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {/* Factor Groups */}
            <div className="factors-grid stagger-children">
                {(filter === 'all' || filter === 'common') && (
                    <>
                        <div className="factors-group__title">
                            ⚙️ Factores Comunes ({commonFactors.length})
                        </div>
                        {renderFactors(commonFactors, 'var(--line-realization)')}
                    </>
                )}

                {(filter === 'all' || filter === 'positive') && (
                    <>
                        <div className="factors-group__title">
                            ✅ Factores Positivos ({positiveFactors.length})
                        </div>
                        {renderFactors(positiveFactors, 'var(--freq-high)')}
                    </>
                )}

                {(filter === 'all' || filter === 'negative') && (
                    <>
                        <div className="factors-group__title">
                            ⚠️ Factores Negativos ({negativeFactors.length}) — menor es mejor
                        </div>
                        {renderFactors(negativeFactors, 'var(--danger)')}
                    </>
                )}
            </div>

            {/* Info */}
            <div className="info-box">
                <strong>¿De dónde vienen estos factores?</strong><br />
                Los factores se seleccionaron a partir de meta-análisis y teorías validadas:
                Gottman (Universidad de Washington), Sternberg (Yale), Chapman, Johnson (EFT),
                Goleman, Maslow, Bowlby, y validaciones en poblaciones mexicanas (ICI-UNAM, ERQ adaptado).
            </div>
        </div>
    )
}
