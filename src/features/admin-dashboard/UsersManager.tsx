import { useState, useEffect } from 'react'
import { Search, Filter, Ban, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface UserData {
    id: string
    email: string
    full_name: string
    onboarding_completed: boolean
    created_at: string
    status?: string
}

export default function UsersManager() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all')
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('profiles').select('id, email, full_name, onboarding_completed, created_at, status')

        if (!error && data) {
            const list: UserData[] = data.map((row: any) => ({
                id: row.id,
                email: row.email,
                full_name: row.full_name || 'Desconocido',
                onboarding_completed: row.onboarding_completed,
                created_at: row.created_at,
                status: row.status || 'active'
            }))
            // sort descending
            list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setUsers(list)
        }
        setLoading(false)
    }

    useEffect(() => { fetchUsers() }, [])

    const handleAction = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned'
        const confirmMsg = newStatus === 'banned' ? '¿Estás seguro de banear a este usuario permanentemente?' : '¿Quieres quitarle el baneo de la plataforma?'
        
        if (!window.confirm(confirmMsg)) return

        const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
        
        if (error) {
            alert('Error al actualizar el usuario. Ejecuta el script SQL para la columna "status".')
        } else {
            fetchUsers()
        }
    }

    const filteredUsers = users.filter((u) => {
        const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
        return matchSearch
    })

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1>Gestión de Usuarios</h1>
                    <p>{users.length} usuarios registrados en la plataforma</p>
                </div>
                <button className="admin-refresh-btn" onClick={fetchUsers} title="Recargar">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar glass">
                <div className="admin-toolbar__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por alias..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="admin-toolbar__filters">
                    <Filter size={14} />
                    {(['all', 'active', 'suspended', 'banned'] as const).map((f) => (
                        <button
                            key={f}
                            className={`admin-toolbar__filter ${filter === f ? 'admin-toolbar__filter--active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : f === 'suspended' ? 'Suspendidos' : 'Baneados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users table */}
            <div className="admin-table-wrap glass">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Onboarding</th>
                            <th>Registro</th>
                            <th>Backend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={4} style={{textAlign:'center', padding: '20px'}}>Cargando...</td></tr>}
                        {!loading && filteredUsers.length === 0 && <tr><td colSpan={4} style={{textAlign:'center', padding: '20px'}}>No hay resultados</td></tr>}
                        {!loading && filteredUsers.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div className="admin-user-cell">
                                        <div className="admin-user-cell__avatar">{u.full_name[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}</div>
                                        <div>
                                            <strong>{u.full_name}</strong>
                                            <span className="admin-user-cell__email" style={{fontSize: '0.65rem'}}>{u.email} ({u.id.substring(0,8)})</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="admin-freq-badge" data-level={u.onboarding_completed ? 'high' : 'low'}>
                                        {u.onboarding_completed ? 'Completado' : 'Pendiente'}
                                    </span>
                                    {u.status === 'banned' && <span className="admin-freq-badge" style={{ background: 'var(--danger)', color: 'white', marginLeft: '8px' }}>Baneado</span>}
                                </td>
                                <td style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>{new Date(u.created_at).toLocaleDateString('es-MX')}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button title={u.status === 'banned' ? "Desbanear" : "Banear"} onClick={() => handleAction(u.id, u.status || 'active')}>
                                            <Ban size={16} color={u.status === 'banned' ? "var(--danger)" : "var(--text-tertiary)"}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
