import { useState } from 'react'
import { Search, Filter, MoreVertical, Shield, Ban, Eye } from 'lucide-react'
import './AdminPages.css'

const mockUsers = [
    { id: '1', name: 'María García', email: 'maria@email.com', freq: 78, level: 'Constructor', tier: 'Arquitecto', verified: true, status: 'active', date: '2025-01-15' },
    { id: '2', name: 'Carlos Rodríguez', email: 'carlos@email.com', freq: 52, level: 'Explorador', tier: 'Free', verified: false, status: 'active', date: '2025-01-20' },
    { id: '3', name: 'Ana López', email: 'ana@email.com', freq: 89, level: 'Armonizador', tier: 'Diamante', verified: true, status: 'active', date: '2025-01-10' },
    { id: '4', name: 'Pedro Martínez', email: 'pedro@email.com', freq: 41, level: 'Buscador', tier: 'Free', verified: false, status: 'suspended', date: '2025-02-01' },
    { id: '5', name: 'Sofía Torres', email: 'sofia@email.com', freq: 65, level: 'Constructor', tier: 'Arquitecto', verified: true, status: 'active', date: '2025-02-10' },
    { id: '6', name: 'Diego Hernández', email: 'diego@email.com', freq: 73, level: 'Constructor', tier: 'Ingeniero', verified: true, status: 'active', date: '2025-02-12' },
    { id: '7', name: 'Valentina Ruiz', email: 'val@email.com', freq: 58, level: 'Explorador', tier: 'Free', verified: false, status: 'active', date: '2025-02-18' },
    { id: '8', name: 'Andrés Morales', email: 'andres@email.com', freq: 34, level: 'Despertar', tier: 'Free', verified: false, status: 'banned', date: '2025-02-20' },
]

export default function UsersManager() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all')

    const filteredUsers = mockUsers.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || u.status === filter
        return matchSearch && matchFilter
    })

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Gestión de Usuarios</h1>
                <p>{mockUsers.length} usuarios registrados</p>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar glass">
                <div className="admin-toolbar__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
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
                            <th>Frecuencia</th>
                            <th>Nivel</th>
                            <th>Tier</th>
                            <th>Verificado</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className={u.status !== 'active' ? 'admin-table__row--muted' : ''}>
                                <td>
                                    <div className="admin-user-cell">
                                        <div className="admin-user-cell__avatar">{u.name[0]}</div>
                                        <div>
                                            <strong>{u.name}</strong>
                                            <span className="admin-user-cell__email">{u.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="admin-freq-badge" data-level={u.freq >= 70 ? 'high' : u.freq >= 50 ? 'mid' : 'low'}>
                                        {u.freq}
                                    </span>
                                </td>
                                <td>{u.level}</td>
                                <td><span className={`admin-tier-badge admin-tier-badge--${u.tier.toLowerCase()}`}>{u.tier}</span></td>
                                <td>{u.verified ? <Shield size={16} color="var(--success)" /> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                                <td>
                                    <span className={`admin-status admin-status--${u.status}`}>
                                        {u.status === 'active' ? 'Activo' : u.status === 'suspended' ? 'Suspendido' : 'Baneado'}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button title="Ver detalle"><Eye size={16} /></button>
                                        <button title="Suspender"><Ban size={16} /></button>
                                        <button title="Más"><MoreVertical size={16} /></button>
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
