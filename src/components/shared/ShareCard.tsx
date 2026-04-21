import { useState } from 'react'
import { Share2, Copy, Check, X, MessageCircle, Instagram } from 'lucide-react'
import './ShareCard.css'

interface ShareCardProps {
    onClose: () => void
}

const SHARE_URL = 'https://lovia.com.mx'
const SHARE_TEXT = '🧠❤️ Descubrí LovIA! — La primera app de relaciones basada en ciencia y psicología evolutiva. ¡¡Acceso GRATIS por 4 meses!! Conéctate desde quien eres.'
const SHARE_HASHTAGS = '#LovIA #PsicologiaEvolutiva #RelacionesDeParejas'

const WA_TEXT = encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}\n\n${SHARE_HASHTAGS}`)
const WA_URL = `https://wa.me/?text=${WA_TEXT}`

const IG_CLIPBOARD = `${SHARE_TEXT}\n\n${SHARE_URL}\n\n${SHARE_HASHTAGS}`

export default function ShareCard({ onClose }: ShareCardProps) {
    const [copied, setCopied] = useState(false)
    const [igCopied, setIgCopied] = useState(false)

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(SHARE_URL)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch {
            // fallback — ya estamos en HTTPS
        }
    }

    const handleShareNative = async () => {
        if (!navigator.share) {
            handleCopyLink()
            return
        }
        try {
            await navigator.share({
                title: 'LovIA! — Relaciones basadas en ciencia',
                text: SHARE_TEXT,
                url: SHARE_URL,
            })
        } catch {
            // user cancelled
        }
    }

    const handleIgCopy = async () => {
        try {
            await navigator.clipboard.writeText(IG_CLIPBOARD)
            setIgCopied(true)
            setTimeout(() => setIgCopied(false), 2500)
        } catch { /* noop */ }
    }

    return (
        <div className="share-overlay" onClick={onClose}>
            <div className="share-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
                {/* Close btn */}
                <button className="share-modal__close" onClick={onClose} aria-label="Cerrar">
                    <X size={18} />
                </button>

                {/* Card visual */}
                <div className="share-card-visual">
                    <div className="share-card-visual__glow-1" />
                    <div className="share-card-visual__glow-2" />
                    <div className="share-card-visual__content">
                        <div className="share-card-visual__logo">
                            <span className="share-card-visual__heart">♥</span>
                            <span className="share-card-visual__title">LovIA!</span>
                        </div>
                        <p className="share-card-visual__tagline">Conecta desde quien eres</p>
                        <div className="share-card-visual__badge">🎉 4 meses GRATIS</div>
                        <p className="share-card-visual__url">lovia.com.mx</p>
                    </div>
                </div>

                {/* Mensaje */}
                <h3 className="share-modal__title">¡Invita a alguien especial!</h3>
                <p className="share-modal__subtitle">El amor basado en ciencia merece compartirse 🧠❤️</p>

                {/* Botones */}
                <div className="share-modal__actions">
                    {/* WhatsApp */}
                    <a
                        href={WA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn share-btn--whatsapp"
                        id="share-whatsapp-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Compartir por WhatsApp
                    </a>

                    {/* Instagram (copiar texto) */}
                    <button
                        className="share-btn share-btn--instagram"
                        onClick={handleIgCopy}
                        id="share-instagram-btn"
                    >
                        <Instagram size={20} />
                        {igCopied ? '✅ Texto copiado para IG' : 'Copiar para Instagram Stories'}
                    </button>

                    {/* Compartir nativo / copiar link */}
                    <button
                        className="share-btn share-btn--link"
                        onClick={handleShareNative}
                        id="share-native-btn"
                    >
                        <Share2 size={20} />
                        Compartir en otra red
                    </button>

                    {/* Copiar link */}
                    <button
                        className="share-btn share-btn--copy"
                        onClick={handleCopyLink}
                        id="share-copy-btn"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? '¡Link copiado!' : 'Copiar link'}
                    </button>
                </div>

                <p className="share-modal__note">
                    <MessageCircle size={12} />
                    Tu invitación ayuda a crecer la comunidad LovIA ❤️
                </p>
            </div>
        </div>
    )
}
