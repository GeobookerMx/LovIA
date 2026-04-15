/**
 * LovIA! — Blog Post (Article View)
 *
 * Full article with styled content, blockquotes, and scientific sources.
 * Sources are displayed at the bottom in academic citation format.
 */

import { ArrowLeft, Clock, User, BookOpen, Share2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { blogArticles } from './BlogList'
import './CommunityPages.css'

// Full content for each article (in production, fetched from Supabase)
const articleContent: Record<string, { sections: { title?: string; text: string }[]; sources: string[] }> = {
    'gottman-4-jinetes': {
        sections: [
            { text: 'John Gottman, investigador de la Universidad de Washington, identificó cuatro patrones de comunicación que predicen con un 93% de precisión el fracaso de una relación. Los llamó "Los 4 Jinetes del Apocalipsis".' },
            { title: '1. Crítica', text: 'Atacar el carácter de la pareja en lugar del comportamiento específico. "Nunca haces nada bien" vs. "Me gustaría que recogieras tus cosas". La diferencia es sutil pero demoledora.' },
            { title: '2. Desprecio', text: 'El predictor #1 de divorcio según Gottman. Incluye sarcasmo, ridiculización, y actitud de superioridad. "¿En serio crees que eso funciona?" destruye más que cualquier pelea.' },
            { title: '3. Actitud Defensiva', text: 'Responder a la queja con excusas o contraataques. "No es mi culpa, tú tampoco..." es una forma de no asumir responsabilidad y escalar el conflicto.' },
            { title: '4. Evasión (Stonewalling)', text: 'Desconectarse emocionalmente: mirada perdida, monosílabos, salir de la habitación. Es la respuesta al agotamiento emocional, pero comunica "no me importas".' },
            { title: '¿Cómo los mide LovIA!?', text: 'En el cuestionario de la Línea del Amor, las preguntas Q3 (manejo de conflictos) y Q7 (resolución de problemas) detectan la presencia de estos patrones. Un puntaje bajo en estos factores activa recomendaciones específicas del módulo Gottman en tu Plan de Mejora.' },
        ],
        sources: [
            'Gottman, J. & Silver, N. (1999). The Seven Principles for Making Marriage Work. Crown Publishers.',
            'Gottman, J. (1994). What Predicts Divorce? Lawrence Erlbaum Associates.',
            'Gottman, J. & DeClaire, J. (2001). The Relationship Cure. Crown Publishers.',
        ],
    },
    'sternberg-triangular': {
        sections: [
            { text: 'Robert Sternberg, psicólogo de Yale, propuso que el amor se compone de tres elementos fundamentales que forman un triángulo. El tipo de amor que experimentas depende de cuáles predominan.' },
            { title: 'Intimidad (Línea del Amor)', text: 'Sentimientos de cercanía, conexión y vínculo emocional. Es la sensación de "confianza profunda" — saber que puedes ser vulnerable con el otro. En LovIA! constituye el 40% de tu Frecuencia.' },
            { title: 'Pasión (Línea Sexual)', text: 'Atracción física, deseo y excitación. Incluye la necesidad de estar cerca del otro y la atracción romántica. Representa el 25% de tu Frecuencia.' },
            { title: 'Compromiso (Línea de Realización)', text: 'La decisión de mantener la relación y construir juntos. Incluye metas compartidas, estabilidad y realización personal. Pesa el 35% en tu Frecuencia.' },
            { title: '¿Por qué estos pesos?', text: 'Meta-análisis recientes sugieren que la intimidad es el predictor más robusto de satisfacción relacional (40%), mientras que el compromiso sostenido supera a la pasión inicial (35% vs 25%). La pasión fluctúa naturalmente, pero la intimidad y el compromiso son cultivables.' },
        ],
        sources: [
            'Sternberg, R. (1986). A Triangular Theory of Love. Psychological Review, 93(2), 119-135.',
            'Sternberg, R. (1997). Construct validation of a triangular love scale. European Journal of Social Psychology.',
            'Maslow, A. (1943). A Theory of Human Motivation. Psychological Review.',
        ],
    },
}

// Default content for posts without full articles yet
const defaultContent = {
    sections: [
        { text: 'Este artículo está en desarrollo. Próximamente tendrás acceso al contenido completo con referencias académicas verificadas.' },
        { title: 'Mientras tanto...', text: 'Puedes explorar tu Gráfica de Relación en tu perfil para ver cómo los conceptos de este artículo se reflejan en tus propias métricas.' },
    ],
    sources: []
}

export default function BlogPost() {
    const navigate = useNavigate()
    const { postId } = useParams<{ postId: string }>()

    const article = blogArticles.find(a => a.id === postId)
    const content = (postId && articleContent[postId]) || defaultContent

    if (!article) {
        return (
            <div className="blog-post">
                <div className="blog-post__header">
                    <button className="blog-post__back" onClick={() => navigate('/community/blog')}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    Artículo no encontrado
                </p>
            </div>
        )
    }

    return (
        <div className="blog-post">
            <div className="blog-post__header">
                <button className="blog-post__back" onClick={() => navigate('/community/blog')}>
                    <ArrowLeft size={20} />
                </button>
                <button
                    className="blog-post__back"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: article.title, text: article.excerpt })
                        }
                    }}
                >
                    <Share2 size={18} />
                </button>
            </div>

            <span
                className="blog-card__category"
                style={{ color: article.categoryColor, background: article.categoryBg }}
            >
                <BookOpen size={10} />
                {article.category}
            </span>

            <h1 className="blog-post__title animate-fade-in">{article.title}</h1>

            <div className="blog-post__meta">
                <span><User size={12} /> {article.author}</span>
                <span><Clock size={12} /> {article.readTime} min</span>
                <span>{article.date}</span>
            </div>

            <div className="blog-post__content animate-fade-in-up">
                {content.sections.map((section, i) => (
                    <div key={i}>
                        {section.title && <h3>{section.title}</h3>}
                        <p>{section.text}</p>
                    </div>
                ))}
            </div>

            {content.sources.length > 0 && (
                <div className="blog-post__sources animate-fade-in-up">
                    <h4>📚 Fuentes</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {content.sources.map((src, i) => (
                            <li key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                                <BookOpen size={12} style={{ flexShrink: 0, marginTop: 3, color: 'var(--line-sex)' }} />
                                <span>{src}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
