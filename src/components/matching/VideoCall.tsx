import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Video as VideoIcon, Mic, PhoneOff, MicOff, VideoOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import './Matching.css'

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
}

export default function VideoCall() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [micOn, setMicOn] = useState(true)
    const [videoOn, setVideoOn] = useState(true)
    const [status, setStatus] = useState<string>('Obteniendo permisos de cámara...')
    const [isConnected, setIsConnected] = useState(false)

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    const channel = useRef<any>(null)

    useEffect(() => {
        if (!user || !id) return

        let mounted = true

        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                if (!mounted) {
                    stream.getTracks().forEach(t => t.stop())
                    return
                }
                
                localStream.current = stream
                if (localVideoRef.current) localVideoRef.current.srcObject = stream
                
                setStatus('Buscando al otro participante...')
                setupWebRTC()

            } catch (err) {
                console.error("Camera access denied", err)
                if (mounted) setStatus('Error: Permisos de cámara denegados.')
            }
        }

        const setupWebRTC = () => {
            const pc = new RTCPeerConnection(STUN_SERVERS)
            peerConnection.current = pc

            // Añadir mis envíos de audio/video al canal P2P
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => {
                    pc.addTrack(track, localStream.current!)
                })
            }

            // Recibir audio/video del otro participante
            pc.ontrack = (event) => {
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0]
                    setIsConnected(true)
                    setStatus('Conectados de forma segura')
                }
            }

            // Gestionar candidatos ICE (caminos de red)
            pc.onicecandidate = (event) => {
                if (event.candidate && channel.current) {
                    channel.current.send({
                        type: 'broadcast',
                        event: 'ice-candidate',
                        payload: { candidate: event.candidate }
                    })
                }
            }

            // Señalización vía Supabase Realtime
            channel.current = supabase.channel(`webrtc-${id}`)

            channel.current
                .on('broadcast', { event: 'join' }, async () => {
                    // El otro entró, soy el 'Llamador' (Creo Offer)
                    const offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    channel.current.send({
                        type: 'broadcast',
                        event: 'offer',
                        payload: { offer }
                    })
                    setStatus('Llamando...')
                })
                .on('broadcast', { event: 'offer' }, async ({ payload }: any) => {
                    // Recibo Offer, respondo con Answer
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.offer))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    channel.current.send({
                        type: 'broadcast',
                        event: 'answer',
                        payload: { answer }
                    })
                    setStatus('Conectando...')
                })
                .on('broadcast', { event: 'answer' }, async ({ payload }: any) => {
                    // Recibo Answer, establezco Remote Description
                    if (!pc.currentRemoteDescription) {
                        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
                    }
                })
                .on('broadcast', { event: 'ice-candidate' }, async ({ payload }: any) => {
                    // Agregar posibles caminos de red
                    try {
                        const candidate = new RTCIceCandidate(payload.candidate)
                        await pc.addIceCandidate(candidate)
                    } catch (e) {
                        console.error('Error addIceCandidate', e)
                    }
                })
                .subscribe(async (statusResponse: string) => {
                    if (statusResponse === 'SUBSCRIBED') {
                        // Avisar que entré a la sala
                        channel.current.send({
                            type: 'broadcast',
                            event: 'join',
                            payload: {}
                        })
                    }
                })
        }

        initializeMedia()

        return () => {
            mounted = false
            if (localStream.current) localStream.current.getTracks().forEach(t => t.stop())
            if (peerConnection.current) peerConnection.current.close()
            if (channel.current) supabase.removeChannel(channel.current)
        }
    }, [id, user])

    const toggleMic = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setMicOn(audioTrack.enabled)
            }
        }
    }

    const toggleVideo = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setVideoOn(videoTrack.enabled)
            }
        }
    }

    const endCall = () => {
        navigate(`/matches/${id}`)
    }

    return (
        <div className="video-call">
            <div className="video-call__grid">
                {/* Remote Video */}
                <div className="video-call__remote">
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    {!isConnected && (
                        <div className="video-call__waiting flex-center" style={{ position: 'absolute', inset: 0, flexDirection: 'column', gap: 16 }}>
                            <div className="pulse-ring">
                                <VideoIcon size={32} color="var(--love-rose)" />
                            </div>
                            <p>{status}</p>
                            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--success)', display: 'flex', gap: 4, alignItems: 'center' }}>
                                <ShieldCheck size={14}/> Cifrado Extremo a Extremo
                            </span>
                        </div>
                    )}
                </div>

                {/* Local Video */}
                <div className="video-call__local glass">
                    <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                </div>
            </div>

            <div className="video-call__controls glass-strong animate-fade-in-up">
                <button 
                    className={`video-call__btn ${!micOn ? 'video-call__btn--off' : ''}`} 
                    onClick={toggleMic}
                >
                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button 
                    className="video-call__btn video-call__btn--danger" 
                    onClick={endCall}
                >
                    <PhoneOff size={24} />
                </button>
                <button 
                    className={`video-call__btn ${!videoOn ? 'video-call__btn--off' : ''}`} 
                    onClick={toggleVideo}
                >
                    {videoOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
                </button>
            </div>

            <button className="video-call__back" onClick={endCall}>
                <ArrowLeft size={24} />
            </button>
        </div>
    )
}
