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
const BOOK_PDF_URL = 'https://nbpidjpkanwynlhdxowx.supabase.co/storage/v1/object/public/books/Evolucion%20de%20las%20Relaciones%20de%20Pareja%20PDF.pdf'
const BOOK_FILENAME = 'Evolucion-de-las-Relaciones-de-Pareja-JuanPablo-Pena.pdf'
// ─────────────────────────────────────────────────────────────────────────────


// Fecha de fin del período gratuito (6 meses desde lanzamiento)
const FREE_UNTIL = new Date('2026-10-20')

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
                                <span>Psicología Evolutiva</span>
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
                        es la obra que fundamenta científicamente todo el ecosistema de LovIA!
                    </p>
                    <p>
                        En sus páginas encontrarás la Teoría de los <strong>Apegos Paralelos</strong>,
                        la <strong>Frustración Periférica</strong> y las <strong>Dinámicas de Intercambio Energético</strong> —
                        los tres pilares que explican por qué algunas relaciones prosperan y otras se desgastan,
                        desde una perspectiva de la psicología evolutiva moderna.
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: '8px' }}>
                        #terapiadepareja · #psicologiaevolutiva · #relacionesdepareja
                    </p>
                </div>

                {/* Temas del libro */}
                <div className="book-topics">
                    {[
                        { emoji: '🧠', label: 'Neurociencia del apego', desc: 'Cómo el cerebro construye vínculos duraderos' },
                        { emoji: '💞', label: 'Compatibilidad profunda', desc: 'Más allá del atractivo superficial' },
                        { emoji: '🔄', label: 'Ciclos relacionales', desc: 'Patrones que se repiten y cómo romperlos' },
                        { emoji: '📈', label: 'Evolución de la pareja', desc: 'Etapas y puntos críticos de toda relación' },
                        { emoji: '🛡️', label: 'Resiliencia emocional', desc: 'Herramientas concretas de terapia de pareja' },
                        { emoji: '⚡', label: 'Frecuencia de relación', desc: 'El concepto detrás del algoritmo de LovIA!' },
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
