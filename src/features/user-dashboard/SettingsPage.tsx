import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, User, Shield, Trash2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { parseDeletionRequestReceipt, type DeletionRequestReceipt } from './accountDeletionStatus'
import './ProfilePages.css'
import LegalPreferences from './LegalPreferences'
import AppVersion from './AppVersion'

export default function SettingsPage() {
    const userId = useAuthStore(state => state.user?.id)
    return <SettingsContent key={userId ?? 'anonymous'} userId={userId} />
}

function SettingsContent({ userId }: { userId: string | undefined }) {
    const navigate = useNavigate()
    const settings = useSettingsStore()
    const [confirmation, setConfirmation] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [receipt, setReceipt] = useState<DeletionRequestReceipt | null>(null)
    const [error, setError] = useState('')
    const [checking, setChecking] = useState(Boolean(userId))
    const [checkAttempt, setCheckAttempt] = useState(0)

    useEffect(() => {
        let active = true
        if (!userId) return
        void supabase.from('account_deletion_requests').select('status, requested_at').eq('user_id', userId).maybeSingle()
            .then(({ data, error: readError }) => {
                if (!active) return
                if (readError) setError('No pudimos consultar solicitudes anteriores. Puedes reintentar o utilizar el canal de soporte indicado abajo.')
                else if (data) {
                    try { setReceipt(parseDeletionRequestReceipt(data)) }
                    catch { setError('No pudimos confirmar el estado de tu solicitud. Contacta a soporte.') }
                }
                setChecking(false)
            })
        return () => { active = false }
    }, [userId, checkAttempt])

    const requestDeletion = async () => {
        if (confirmation !== 'ELIMINAR' || isSending || !userId) return
        setIsSending(true)
        setError('')
        try {
            const { data, error: requestError } = await supabase.rpc('request_account_deletion', { p_confirmation: confirmation })
            if (requestError) throw requestError
            setReceipt(parseDeletionRequestReceipt(data))
            setConfirmation('')
            setShowDelete(false)
        } catch {
            setError('No pudimos confirmar el registro de tu solicitud. Reintenta; si persiste, usa el canal de soporte. No hemos confirmado la eliminación de tu cuenta.')
        } finally { setIsSending(false) }
    }

    return <main className="profile-sub">
        <header className="profile-sub__header"><button type="button" className="profile-sub__back" onClick={() => navigate('/profile')} aria-label="Volver al perfil"><ArrowLeft size={20} /></button><h2>Configuración</h2></header>
        <section className="settings-section" aria-label="Privacidad">
            <h3 className="settings-section__title">Privacidad</h3>
            {userId && <LegalPreferences userId={userId} />}
            <div className="settings-item glass"><div className="settings-item__left"><Eye size={18} className="settings-item__icon" /><div><div className="settings-item__label">Visibilidad del perfil</div><p className="settings-item__desc">El control de visibilidad requiere verificación en el servidor y aún no está disponible aquí. Contacta a soporte si necesitas ocultar tu perfil.</p></div></div></div>
            <div className="settings-item glass"><div className="settings-item__left"><Shield size={18} className="settings-item__icon" /><div><div className="settings-item__label">Enviar métricas de uso</div><p className="settings-item__desc">Eventos básicos asociados a tu cuenta, sin contenido íntimo. Se guarda en este dispositivo y está desactivado por defecto.</p></div></div><button type="button" className={`toggle ${settings.anonymousData ? 'toggle--active' : ''}`} onClick={() => settings.toggle('anonymousData')} aria-label="Enviar métricas de uso" aria-pressed={settings.anonymousData}><span className="toggle__knob" /></button></div>
        </section>
        <section className="settings-section" aria-label="Cuenta">
            <h3 className="settings-section__title">Cuenta</h3>
            <button type="button" className="settings-item glass" onClick={() => navigate('/profile/edit')} style={{ width: '100%', textAlign: 'left' }}><span className="settings-item__left"><User size={18} className="settings-item__icon" /><span><span className="settings-item__label">Editar perfil</span><span className="settings-item__desc">Nombre, alias, ciudad y foto</span></span></span></button>
            <section className="glass-strong" style={{ padding: '1rem', marginTop: '1rem', borderRadius: '1rem' }} aria-labelledby="account-deletion-title">
                <h3 id="account-deletion-title"><Trash2 size={18} aria-hidden="true" /> Eliminar mi cuenta</h3>
                <p>Desde aquí puedes iniciar una solicitud de eliminación de tu cuenta y los datos asociados. Actualmente requiere atención del equipo; registrar la solicitud no elimina la cuenta de inmediato. Te confirmaremos el resultado por el correo de tu cuenta.</p>
                {checking && <p role="status">Consultando el estado de tu solicitud…</p>}
                {receipt && <div role="status"><p><strong>Solicitud registrada: {receipt.status === 'processing' ? 'en revisión' : 'pendiente de atención'}.</strong></p><p>Fecha: {new Date(receipt.requested_at).toLocaleString('es-MX')}. Tu cuenta sigue activa hasta completar el proceso. Conserva esta fecha para dar seguimiento con soporte.</p></div>}
                {error && <div role="alert"><p>{error}</p><button type="button" className="btn btn-secondary" disabled={isSending || checking} onClick={() => { setError(''); setChecking(true); setCheckAttempt(value => value + 1) }}>Consultar de nuevo</button></div>}
                {!receipt && !checking && !showDelete && <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(true)}>Iniciar solicitud de eliminación</button>}
                {showDelete && !receipt && <div>
                    <p>Solicitas la eliminación permanente del perfil y los datos asociados. Al completarse no podrás recuperar la cuenta. Soporte te informará de cualquier retención que resulte aplicable.</p>
                    <label htmlFor="deletion-confirmation">Escribe ELIMINAR para confirmar</label>
                    <input id="deletion-confirmation" type="text" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" disabled={isSending} style={{ display: 'block', margin: '.7rem 0', padding: '.7rem', width: '100%', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.7rem' }}><button type="button" className="btn btn-secondary" disabled={isSending} onClick={() => { setShowDelete(false); setConfirmation('') }}>Cancelar</button><button type="button" className="btn btn-primary" disabled={confirmation !== 'ELIMINAR' || isSending} onClick={() => void requestDeletion()}>{isSending ? <><Loader2 size={16} className="animate-spin" /> Registrando…</> : 'Confirmar solicitud'}</button></div>
                </div>}
                <p>Para solicitar o dar seguimiento también puedes escribir a <a href="mailto:clienteslovia@gmail.com?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta">clienteslovia@gmail.com</a> desde el correo de tu cuenta, o consultar <a href="https://lovia.com.mx/delete-account" target="_blank" rel="noopener noreferrer">el procedimiento de eliminación</a>. No envíes contraseñas.</p>
            </section>
        </section>
        <AppVersion />
    </main>
}
