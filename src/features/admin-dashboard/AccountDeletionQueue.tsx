import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface RequestRow { user_id: string; requested_at: string; status: string }

export default function AccountDeletionQueue() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    void supabase.from('account_deletion_requests').select('user_id, requested_at, status')
      .order('requested_at', { ascending: true }).limit(100).then(({ data, error }) => {
        if (!active) return
        if (error) setState('error')
        else { setRequests(data ?? []); setState('ready') }
      })
    return () => { active = false }
  }, [attempt])
  return <section className="glass" style={{ padding: '1rem', marginBottom: '1rem' }} aria-labelledby="deletion-queue-title">
    <h2 id="deletion-queue-title">Solicitudes de eliminación</h2>
    <p>Atención operativa pendiente. Registrar una solicitud no borra la cuenta. Sigue el procedimiento de baja y verifica Storage, referencias y revocación del proveedor antes de confirmar la eliminación.</p>
    {state === 'loading' && <p role="status">Consultando solicitudes…</p>}
    {state === 'error' && <p role="alert">No se pudo consultar la cola. Comprueba la migración y los permisos; no se puede asumir que esté vacía.</p>}
    <button type="button" onClick={() => { setState('loading'); setAttempt(value => value + 1) }} disabled={state === 'loading'}>Actualizar solicitudes</button>
    {state === 'ready' && (requests.length === 0 ? <p>No hay solicitudes pendientes.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Cuenta</th><th>Fecha de solicitud</th><th>Estado</th></tr></thead><tbody>{requests.map(request => <tr key={request.user_id}><td><code>{request.user_id}</code></td><td>{new Date(request.requested_at).toLocaleString('es-MX')}</td><td>{request.status === 'processing' ? 'En revisión' : 'Pendiente'}</td></tr>)}</tbody></table>{requests.length === 100 && <p>Se muestran las 100 solicitudes más antiguas. Atiéndelas y consulta el resto desde la operación del servicio.</p>}</div>)}
  </section>
}
