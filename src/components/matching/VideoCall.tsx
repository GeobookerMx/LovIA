import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Phone, PhoneOff, Mic, MicOff, Video, VideoOff,
    AlertTriangle, Clock, MessageCircle
} from 'lucide-react'
import './Matching.css'

const suggestedTopics = [
    '¿Qué valor es innegociable para ti en una relación?',
    '¿Cuál es tu meta #1 para este año?',
    '¿Cómo te gusta que te demuestren cariño?',
    '¿Qué libro o serie te cambió la vida?',
]

export default function VideoCall() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [connected, setConnected] = useState(false)
    const [muted, setMuted] = useState(false)
    const [videoOff, setVideoOff] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [maxMinutes] = useState(5)   // Initial duration
    const [showTopics, setShowTopics] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

    // Simulate connection
    useEffect(() => {
        const timeout = setTimeout(() => setConnected(true), 2000)
        return () => clearTimeout(timeout)
    }, [])

    // Timer
    useEffect(() => {
        if (connected) {
            timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [connected])

    const formatTime = useCallback((s: number) => {
        const min = Math.floor(s / 60)
        const sec = s % 60
        return `${min}:${sec.toString().padStart(2, '0')}`
    }, [])

    const remaining = maxMinutes * 60 - seconds
    const timerClass =
        remaining <= 30 ? 'video-call__timer--critical' :
            remaining <= 60 ? 'video-call__timer--warning' : ''

    const handleEndCall = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        navigate(`/matches/${id}`)
    }

    const handlePanic = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        // TODO: trigger report modal + block
        navigate('/matches')
    }

    return (
        <div className="video-call video-call--no-capture">
            {/* Header */}
            <div className="video-call__header">
                <div className={`video-call__timer ${timerClass}`}>
                    <Clock size={16} />
                    <span>{formatTime(seconds)}</span>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                        / {maxMinutes}:00
                    </span>
                </div>

                <button
                    className="video-call__btn video-call__btn--panic"
                    onClick={handlePanic}
                    title="Botón de pánico — terminar y reportar"
                >
                    <AlertTriangle size={20} />
                </button>
            </div>

            {/* Video area */}
            <div className="video-call__videos">
                {connected ? (
                    <div className="video-call__remote video-call__placeholder">
                        <Video size={48} />
                        <p>Videollamada activa</p>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
                            Match #{id?.slice(-6)}
                        </p>
                    </div>
                ) : (
                    <div className="video-call__remote video-call__placeholder">
                        <div className="animate-pulse-soft">
                            <Phone size={48} />
                        </div>
                        <p>Conectando...</p>
                    </div>
                )}

                {/* Local video preview */}
                <div className="video-call__local">
                    <div className="video-call__placeholder" style={{ height: '100%' }}>
                        {videoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </div>
                </div>

                {/* Suggested topics */}
                {showTopics && (
                    <div className="video-call__topics animate-fade-in-up">
                        {suggestedTopics.map((t, i) => (
                            <button key={i} className="video-call__topic">
                                💬 {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="video-call__controls">
                <button
                    className={`video-call__btn ${muted ? 'video-call__btn--danger' : 'video-call__btn--default'}`}
                    onClick={() => setMuted(!muted)}
                >
                    {muted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <button
                    className={`video-call__btn ${videoOff ? 'video-call__btn--danger' : 'video-call__btn--default'}`}
                    onClick={() => setVideoOff(!videoOff)}
                >
                    {videoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>

                <button
                    className={`video-call__btn video-call__btn--default`}
                    onClick={() => setShowTopics(!showTopics)}
                    title="Temas sugeridos"
                >
                    <MessageCircle size={20} />
                </button>

                <button className="video-call__btn video-call__btn--danger" onClick={handleEndCall}>
                    <PhoneOff size={20} />
                </button>
            </div>
        </div>
    )
}
