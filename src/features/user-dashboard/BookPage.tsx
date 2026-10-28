/**
 * LovIA! — BookPage
 * Descarga gratuita del libro "Evolución de las Relaciones de Pareja"
 * Solo accesible para usuarios autenticados.
 * URL del PDF: configurar BOOK_PDF_URL con tu Supabase Storage URL
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, BookOpen, Download, Star, Lock,
    CheckCircle, Clock, Users, Heart, Share2
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import ShareCard from '../../components/shared/ShareCard'
import './BookPage.css'

// ─── URL del libro en Supabase Storage ───────────────────────────────────────
const BOOK_PDF_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/books/Evolucion%20de%20las%20Relaciones%20de%20Pareja%20PDF.pdf`
const BOOK_FILENAME = 'Evolucion-de-las-Relaciones-de-Pareja-JuanPablo-Pena.pdf'
// ─────────────────────────────────────────────────────────────────────────────


// 01/02/2027 00:00 en Ciudad de México. El acceso termina después del 31/01 inclusive.
const FREE_UNTIL = new Date('2027-02-01T06:00:00.000Z')

interface DownloadLog {
    downloaded: boolean
    downloadedAt?: string
}

export default function BookPage() {
    const navigate = useNavigate()
    const { user, profile } = useAuthStore()
    const [downloadLog, setDownloadLog] = useState<DownloadLog>({ downloaded: false })
    const [downloading, setDownloading] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [downloadCount, setDownloadCount] = useState<number | null>(null)

    const now = new Date()
    const isFreeActive = now < FREE_UNTIL
    const daysLeft = Math.max(0, Math.ceil((FREE_UNTIL.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    // Verificar si el usuario ya descargó el libro
    useEffect(() => {
        if (!user) return
        async function checkDownload() {
            // Verificar si este usuario ya descargó
            const { data } = await supabase
                .from('book_downloads')
                .select('id, created_at')
                .eq('user_id', user!.id)
                .maybeSingle()

            if (data) {
                setDownloadLog({ downloaded: true, downloadedAt: data.created_at })
            }

            // Contar total usando función RPC que bypasea RLS de forma segura
            const { data: countData } = await supabase
                .rpc('get_book_download_count')
            setDownloadCount(countData || 0)
        }
        checkDownload()
    }, [user])

    const handleDownload = async () => {
        if (!user || !isFreeActive) return
        setDownloading(true)

        try {
            // Registrar descarga en BD (si no existe ya)
            if (!downloadLog.downloaded) {
                await supabase.from('book_downloads').upsert({
                    user_id: user.id,
                    user_name: profile?.alias || 'Usuario',
                    created_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })
                setDownloadLog({ downloaded: true, downloadedAt: new Date().toISOString() })
                setDownloadCount(prev => (prev || 0) + 1)
            }

            // Iniciar descarga
            const link = document.createElement('a')
            link.href = BOOK_PDF_URL
            link.download = BOOK_FILENAME
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

        } catch (err) {
            console.error('Error al registrar descarga:', err)
            // Igual permitir la descarga aunque falle el registro
            window.open(BOOK_PDF_URL, '_blank')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="book-page">
            {/* Header */}
            <header className="book-page__header">
                <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Volver">
                    <ArrowLeft size={20} />
                </button>
                <h2>Mi Libro</h2>
                <button
                    className="book-page__share-icon"
                    onClick={() => setShowShare(true)}
                    aria-label="Compartir"
                >
                    <Share2 size={20} />
                </button>
            </header>

            <div className="book-page__body animate-fade-in-up">

                {/* Hero del libro */}
                <div className="book-hero glass-strong">
                    <div className="book-hero__glow-1" />
                    <div className="book-hero__glow-2" />

                    <div className="book-hero__cover">
                        <div className="book-cover">
                            <div className="book-cover__spine" />
                            <div className="book-cover__front">
                                <BookOpen size={48} color="rgba(255,255,255,0.9)" />
                                <div className="book-cover__title-wrap">
                                    <p className="book-cover__pre">Juan Pablo Peña García</p>
                                    <h3 className="book-cover__title">Evolución de las Relaciones de Pareja</h3>
                                    <p className="book-cover__sub">Psicología Evolutiva · 2023</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="book-hero__info">
                        {/* Badge período gratuito */}
                        {isFreeActive ? (
                            <div className="book-hero__free-badge">
                                <Star size={14} />
                                Descarga gratuita — {daysLeft} días restantes
                            </div>
                        ) : (
                            <div className="book-hero__expired-badge">
                                <Lock size={14} />
                                Período gratuito finalizado
                            </div>
                        )}

                        {/* Estadísticas */}
                        <div className="book-stats">
                            <div className="book-stat">
                                <Users size={14} />
                                <span>{downloadCount !== null ? downloadCount : '...'} descargas</span>
                            </div>
                            <div className="book-stat">
                                <Heart size={14} />
                                <span>Relaciones de pareja</span>
                            </div>
                            <div className="book-stat">
                                <Clock size={14} />
                                <span>Lectura: ~4 horas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div className="glass book-description">
                    <h4>Sobre este libro</h4>
                    <p>
                        <strong style={{ color: 'var(--love-rose)' }}>"Evolución de las Relaciones de Pareja"</strong>{' '}
                        es una obra de Juan Pablo Peña García que inspira parte del marco educativo de LovIA.
                    </p>
                    <p>
                        El texto propone conceptos y preguntas sobre los vínculos de pareja. Se presenta como
                        material del autor para lectura y reflexión; sus ideas no sustituyen una evaluación
                        profesional ni constituyen por sí mismas instrumentos psicológicos validados.
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: '8px' }}>
                        #relacionesdepareja · #autoconocimiento · #conversaciones
                    </p>
                </div>

                {/* Temas del libro */}
                <div className="book-topics">
                    {[
                        { emoji: '💞', label: 'Amor y vínculos', desc: 'Ideas del autor para pensar cómo nos relacionamos' },
                        { emoji: '🗣️', label: 'Conversaciones', desc: 'Preguntas para hablar de expectativas y límites' },
                        { emoji: '🔄', label: 'Ciclos relacionales', desc: 'Patrones que vale la pena observar con calma' },
                        { emoji: '📈', label: 'Evolución de la pareja', desc: 'Cambios y etapas descritos por el autor' },
                        { emoji: '🛡️', label: 'Cuidado personal', desc: 'Reflexiones para tomar decisiones con contexto' },
                        { emoji: '⚡', label: 'Frecuencia de relación', desc: 'Un concepto propio presentado para reflexión' },
                    ].map(topic => (
                        <div key={topic.label} className="book-topic glass">
                            <span className="book-topic__emoji">{topic.emoji}</span>
                            <div>
                                <strong>{topic.label}</strong>
                                <p>{topic.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 6 Tarjetas de Lectura y Reflexión (2-5 min) */}
                <div className="book-cards-section">
                    <div className="book-cards-section__header">
                        <h4>6 Lecturas y reflexiones del libro</h4>
                        <p>Píldoras breves de 2 a 5 minutos extraídas del libro para reflexionar a tu propio ritmo.</p>
                    </div>

                    <div className="book-cards-list">
                        {[
                            {
                                num: '01',
                                title: 'Autoconocimiento',
                                fragment: '«Es importante identificar, de manera individual, las características que se tienen al abordar la relación o comenzarla: cómo soy, qué necesito y qué puedo ofrecer en una relación.»',
                                synthesis: 'Antes de conectar con alguien, conviene mirar lo propio: cómo eres, qué necesitas y qué ofreces.',
                                question: '¿Qué necesito hoy en una relación y qué puedo ofrecer con honestidad?',
                                time: '3 min'
                            },
                            {
                                num: '02',
                                title: 'Intención y Momento de Vida',
                                fragment: '«Comprender las características individuales y los momentos de vida de las personas, con el objetivo de ayudar a crear relaciones de calidad.»',
                                synthesis: 'Tu momento de vida influye en lo que buscas. Nombrarlo ayuda a conversar con claridad y sin falsas expectativas.',
                                question: '¿Qué tipo de relación quiero construir en esta etapa de mi vida y por qué?',
                                time: '3 min'
                            },
                            {
                                num: '03',
                                title: 'Metas Individuales',
                                fragment: '«Es vital entender y comunicar las metas individuales; no deben ser calificadas como más o menos importantes.»',
                                synthesis: 'Las metas de cada persona valen igual. En una relación sana se conversan y respetan, no se jerarquizan.',
                                question: '¿Qué meta personal quiero cuidar y proteger mientras construyo un vínculo?',
                                time: '4 min'
                            },
                            {
                                num: '04',
                                title: 'Límites y Cuidado',
                                fragment: '«La tolerancia no es aguantar lo inaguantable, ni ceder hasta no reconocernos.»',
                                synthesis: 'Ser flexible no significa renunciar a tu identidad. Conocer y comunicar tus límites es parte del amor propio.',
                                question: '¿En qué aspectos puedo ser flexible y cuáles son mis límites innegociables?',
                                time: '3 min'
                            },
                            {
                                num: '05',
                                title: 'Confianza Continua',
                                fragment: '«La confianza debe renovarse continuamente, sin que necesariamente haya un conflicto.»',
                                synthesis: 'La confianza no se trabaja solo tras una crisis; se alimenta día a día con comunicación clara y acuerdos cumplidos.',
                                question: '¿Qué hábito diario o conversación pequeña puede fortalecer la confianza mutua?',
                                time: '3 min'
                            },
                            {
                                num: '06',
                                title: 'Diferencias entre Relaciones',
                                fragment: '«Todas las relaciones son diferentes, y en cada una existen factores y etapas de vida distintos.»',
                                synthesis: 'No existe un molde único ni obligatorio. Puedes definir y acordar tu relación según lo que ambos necesitan y eligen.',
                                question: '¿Qué visión de relación se adapta a mis valores reales, más allá de la presión social?',
                                time: '4 min'
                            }
                        ].map(card => (
                            <div key={card.num} className="book-card-item glass">
                                <div className="book-card-item__top">
                                    <span className="book-card-item__tag">{card.num} · {card.time}</span>
                                    <h5>{card.title}</h5>
                                </div>
                                <blockquote className="book-card-item__quote">{card.fragment}</blockquote>
                                <p className="book-card-item__synthesis"><strong>Enfoque:</strong> {card.synthesis}</p>
                                <div className="book-card-item__prompt">
                                    <strong>Pregunta para reflexionar:</strong>
                                    <p>{card.question}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Estado de descarga */}
                {downloadLog.downloaded && (
                    <div className="book-already-downloaded glass">
                        <CheckCircle size={20} color="var(--success)" />
                        <div>
                            <strong>¡Ya descargaste este libro!</strong>
                            <p>
                                {downloadLog.downloadedAt
                                    ? `Descargado el ${new Date(downloadLog.downloadedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : 'Puedes descargarlo de nuevo cuando gustes.'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Botón de descarga */}
                {isFreeActive ? (
                    <button
                        id="book-download-btn"
                        className="book-download-btn"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <>
                                <div className="book-download-btn__spinner" />
                                Preparando descarga...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                {downloadLog.downloaded ? 'Descargar de nuevo — Gratis' : '📖 Descargar libro — GRATIS'}
                            </>
                        )}
                    </button>
                ) : (
                    <div className="book-unavailable glass">
                        <Lock size={24} color="var(--text-tertiary)" />
                        <p>El período de descarga gratuita ha concluido.</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Próximamente disponible en tiendas digitales.
                        </p>
                    </div>
                )}

                {/* Countdown si está activo */}
                {isFreeActive && (
                    <div className="book-countdown glass">
                        <Clock size={14} color="var(--warning)" />
                        <span>La descarga gratuita está disponible por <strong>{daysLeft} días más</strong></span>
                    </div>
                )}

                {/* Autor mini-card */}
                <div className="book-author-card glass" onClick={() => navigate('/profile/creator')} style={{ cursor: 'pointer' }}>
                    <div className="book-author-card__avatar">
                        <BookOpen size={20} color="var(--love-rose)" />
                    </div>
                    <div>
                        <strong>Juan Pablo Peña García</strong>
                        <p>Psicólogo · Psicología Evolutiva · @psjuanpablopg</p>
                    </div>
                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--text-tertiary)' }} />
                </div>

                {/* Compartir */}
                <button
                    className="book-share-btn"
                    onClick={() => setShowShare(true)}
                    id="book-share-btn"
                >
                    <Share2 size={16} />
                    Compartir LovIA! con alguien
                </button>

            </div>

            {showShare && <ShareCard onClose={() => setShowShare(false)} />}
        </div>
    )
}
