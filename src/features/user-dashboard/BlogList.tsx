/**
 * LovIA! — Blog List
 *
 * Articles from specialists, each with scientific sources.
 * Content based on Gottman, Perel, Johnson, Chapman, and more.
 */

import { ArrowLeft, Clock, User, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './CommunityPages.css'

export interface BlogArticle {
    id: string
    title: string
    excerpt: string
    author: string
    category: string
    categoryColor: string
    categoryBg: string
    readTime: number
    date: string
    source: string
}

export const blogArticles: BlogArticle[] = [
    {
        id: 'gottman-4-jinetes',
        title: 'Los 4 Jinetes de Gottman: señales de peligro en tu relación',
        excerpt: 'Aprende a identificar los patrones destructivos que predicen el fin de una relación: crítica, desprecio, actitud defensiva y evasión.',
        author: 'Equipo LovIA!',
        category: 'Gottman',
        categoryColor: 'var(--line-love)',
        categoryBg: 'rgba(255,107,138,0.12)',
        readTime: 5,
        date: '20 Feb 2026',
        source: 'Gottman, J. & Silver, N. (1999). Los 7 principios para hacer que el matrimonio funcione.',
    },
    {
        id: 'sternberg-triangular',
        title: 'La Teoría Triangular del Amor: las 3 líneas que definen tu relación',
        excerpt: 'Intimidad, pasión y compromiso — las 3 dimensiones que Robert Sternberg identificó como fundamentales. ¿En cuál destacas tú?',
        author: 'Equipo LovIA!',
        category: 'Sternberg',
        categoryColor: 'var(--line-realization)',
        categoryBg: 'rgba(34,211,238,0.12)',
        readTime: 7,
        date: '18 Feb 2026',
        source: 'Sternberg, R. (1986). A triangular theory of love. Psychological Review.',
    },
    {
        id: 'perel-deseo-intimidad',
        title: 'La Paradoja de Perel: ¿por qué el deseo necesita distancia?',
        excerpt: 'Esther Perel explica por qué la intimidad excesiva puede apagar la pasión y cómo mantener el deseo vivo en relaciones estables.',
        author: 'Equipo LovIA!',
        category: 'Perel',
        categoryColor: 'var(--line-sex)',
        categoryBg: 'rgba(168,85,247,0.12)',
        readTime: 6,
        date: '15 Feb 2026',
        source: 'Perel, E. (2006). Mating in Captivity: Unlocking Erotic Intelligence.',
    },
    {
        id: 'chapman-5-lenguajes',
        title: 'Los 5 Lenguajes del Amor: ¿cuál es el tuyo?',
        excerpt: 'Gary Chapman identificó 5 formas en que las personas expresan y reciben amor. Conocer tu lenguaje mejora drásticamente tu comunicación.',
        author: 'Equipo LovIA!',
        category: 'Chapman',
        categoryColor: 'var(--love-warm)',
        categoryBg: 'rgba(255,179,71,0.12)',
        readTime: 4,
        date: '12 Feb 2026',
        source: 'Chapman, G. (1992). Los 5 lenguajes del amor.',
    },
    {
        id: 'johnson-eft-apego',
        title: 'EFT: Cómo la Terapia Focalizada en Emociones transforma parejas',
        excerpt: 'Sue Johnson revolucionó la terapia de pareja con la EFT, basada en la teoría del apego de Bowlby. Descubre su enfoque.',
        author: 'Equipo LovIA!',
        category: 'Johnson',
        categoryColor: 'var(--success)',
        categoryBg: 'rgba(16,185,129,0.12)',
        readTime: 8,
        date: '10 Feb 2026',
        source: 'Johnson, S. (2008). Hold Me Tight: Seven Conversations for a Lifetime of Love.',
    },
    {
        id: 'estres-relaciones',
        title: 'Cómo el estrés destruye tu relación (y cómo medirlo)',
        excerpt: 'El PSS-4 de Cohen demuestra que el estrés percibido reduce la disposición al vínculo. Así lo usamos en LovIA! para protegerte.',
        author: 'Equipo LovIA!',
        category: 'Ciencia',
        categoryColor: 'var(--info)',
        categoryBg: 'rgba(59,130,246,0.12)',
        readTime: 5,
        date: '8 Feb 2026',
        source: 'Cohen, S. et al. (1983). A global measure of perceived stress. Journal of Health and Social Behavior.',
    },
]

export default function BlogList() {
    const navigate = useNavigate()

    return (
        <div className="community-sub">
            <div className="community-sub__header">
                <button className="community-sub__back" onClick={() => navigate('/community')}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Blog</h2>
            </div>

            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                Artículos basados en investigación publicada para fortalecer tus relaciones.
            </p>

            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {blogArticles.map((article) => (
                    <button
                        key={article.id}
                        className="blog-card glass"
                        onClick={() => navigate(`/community/blog/${article.id}`)}
                    >
                        <span
                            className="blog-card__category"
                            style={{ color: article.categoryColor, background: article.categoryBg }}
                        >
                            <BookOpen size={10} />
                            {article.category}
                        </span>
                        <div className="blog-card__title">{article.title}</div>
                        <div className="blog-card__excerpt">{article.excerpt}</div>
                        <div className="blog-card__meta">
                            <span className="blog-card__author">
                                <User size={12} /> {article.author}
                            </span>
                            <span>•</span>
                            <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {article.readTime} min</span>
                            <span>•</span>
                            <span>{article.date}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
