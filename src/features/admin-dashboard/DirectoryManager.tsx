import { useState, useEffect } from 'react'
import { Building2, Search, CheckCircle2, XCircle, Clock, MapPin, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

interface Specialist {
    id: string
    first_name: string
    last_name: string
    specialities: string[]
    location_state: string
    professional_license: string
    status: 'pending' | 'active' | 'suspended' | 'rejected'
    created_at: string
}

export default function DirectoryManager() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [specialists, setSpecialists] = useState<Specialist[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSpecialists = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('specialists').select('*').order('created_at', { ascending: false })
        if (!error && data) setSpecialists(data as any)
        setLoading(false)
    }

    useEffect(() => { fetchSpecialists() }, [])

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!confirm(`¿Seguro que deseas cambiar el profesional a ${status}?`)) return
        await supabase.from('specialists').update({ status }).eq('id', id)
        fetchSpecialists()
    }

    const filtered = specialists.filter(p => {
        const nameMatch = `${p.first_name} ${p.last_name}`.toLowerCase()
        const matchesSearch = !searchTerm || nameMatch.includes(searchTerm.toLowerCase()) || (p.specialities && p.specialities.some(sp => sp.toLowerCase().includes(searchTerm.toLowerCase())))
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1>Directorio Profesional</h1>
                    <p>Gestión de terapeutas y profesionales de salud clínica</p>
                </div>
                <button className="admin-refresh-btn" onClick={fetchSpecialists} title="Recargar">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* KPIs */}
            <div className="admin-kpi-grid stagger-children" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Registros Totales', value: String(specialists.length), icon: Building2, color: 'var(--line-realization)' },
                    { label: 'Verificados', value: String(specialists.filter(p => p.status === 'active').length), icon: CheckCircle2, color: 'var(--success)' },
                    { label: 'Pendientes', value: String(specialists.filter(p => p.status === 'pending').length), icon: Clock, color: 'var(--warning)' },
                ].map((kpi, idx) => (
                    <div key={idx} className="admin-kpi glass">
                        <div className="admin-kpi__icon" style={{ background: `${kpi.color}18` }}>
                            <kpi.icon size={20} color={kpi.color} />
                        </div>
                        <div className="admin-kpi__data">
                            <span className="admin-kpi__label">{kpi.label}</span>
                            <span className="admin-kpi__value">{kpi.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar glass">
                <div className="admin-toolbar__search">
                    <Search size={16} />
                    <input placeholder="Buscar por nombre o especialidad…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                {['all', 'active', 'pending', 'suspended'].map(s => (
                    <button key={s} className={`admin-toolbar__filter ${statusFilter === s ? 'admin-toolbar__filter--active' : ''}`} onClick={() => setStatusFilter(s)}>
                        {s === 'all' ? 'Todos' : s === 'active' ? 'Aprobados' : s === 'pending' ? 'Pendientes' : 'Suspendidos'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="admin-table-wrap glass">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Profesional</th>
                            <th>Especialidad</th>
                            <th>Ciudad</th>
                            <th>Cédula</th>
                            <th>Estado</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} style={{textAlign:'center', padding: '20px'}}>Cargando...</td></tr>}
                        {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{textAlign:'center', padding: '20px'}}>No hay registros</td></tr>}
                        {!loading && filtered.map(pro => (
                            <tr key={pro.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <strong>{pro.first_name} {pro.last_name}</strong>
                                        {pro.status === 'active' && <CheckCircle2 size={12} color="var(--success)" />}
                                    </div>
                                </td>
                                <td style={{ fontSize: 'var(--fs-xs)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {pro.specialities?.join(', ') || 'General'}
                                </td>
                                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{pro.location_state}</span></td>
                                <td><code style={{ fontSize: '0.6rem' }}>{pro.professional_license}</code></td>
                                <td>
                                    <span className={`admin-status admin-status--${pro.status === 'active' ? 'active' : pro.status === 'pending' ? 'draft' : 'suspended'}`}>
                                        {pro.status === 'active' ? 'Aprobado' : pro.status === 'pending' ? 'Pendiente' : 'Revocado'}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        {pro.status === 'pending' && <button title="Aprobar" onClick={() => handleUpdateStatus(pro.id, 'active')}><CheckCircle2 size={16} color="var(--success)" /></button>}
                                        {pro.status === 'pending' && <button title="Rechazar" onClick={() => handleUpdateStatus(pro.id, 'rejected')}><XCircle size={16} color="var(--danger)" /></button>}
                                        {pro.status === 'active' && <button title="Suspender" onClick={() => handleUpdateStatus(pro.id, 'suspended')}><XCircle size={16} color="var(--warning)" /></button>}
                                        {pro.status === 'suspended' && <button title="Reactivar" onClick={() => handleUpdateStatus(pro.id, 'active')}><CheckCircle2 size={16} color="var(--success)" /></button>}
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
