import { FileText, Zap, BookOpen, Bell, Plus, Edit3, Trash2, Eye } from 'lucide-react'
import './AdminPages.css'

const blogPosts = [
    { id: '1', title: 'Los 4 Jinetes de Gottman', author: 'Dra. Pérez', status: 'published', date: '22 Feb', views: 342 },
    { id: '2', title: 'Comunicación no violenta en pareja', author: 'Dr. López', status: 'published', date: '20 Feb', views: 218 },
    { id: '3', title: '¿Qué es la codependencia emocional?', author: 'Dra. Ruiz', status: 'draft', date: '19 Feb', views: 0 },
]

const sparkQuestions = [
    { id: '1', text: '¿Qué te hizo sonreír hoy?', factor: 'Bienestar', level: 1, active: true },
    { id: '2', text: '¿Cuál fue tu momento más difícil esta semana?', factor: 'Estrés', level: 1, active: true },
    { id: '3', text: '¿Qué cualidad admiras más en tu pareja ideal?', factor: 'Valores', level: 1, active: true },
    { id: '4', text: '¿Cómo manejas un desacuerdo importante?', factor: 'Comunicación', level: 2, active: false },
]

export default function ContentManager() {
    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <h1>Gestión de Contenido</h1>
                <p>Blog, Daily Spark, módulos y notificaciones</p>
            </div>

            {/* Quick stats */}
            <div className="admin-content-stats">
                <div className="admin-content-stat glass">
                    <FileText size={18} color="var(--line-love)" />
                    <span>{blogPosts.length}</span> Artículos
                </div>
                <div className="admin-content-stat glass">
                    <Zap size={18} color="var(--love-rose)" />
                    <span>{sparkQuestions.length}</span> Sparks
                </div>
                <div className="admin-content-stat glass">
                    <BookOpen size={18} color="var(--line-realization)" />
                    <span>0</span> Módulos
                </div>
                <div className="admin-content-stat glass">
                    <Bell size={18} color="var(--warning)" />
                    <span>0</span> Notificaciones
                </div>
            </div>

            {/* Blog */}
            <section className="admin-section glass">
                <div className="admin-section__header">
                    <h3><FileText size={16} /> Blog</h3>
                    <button className="admin-btn admin-btn--primary"><Plus size={14} /> Nuevo artículo</button>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Vistas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogPosts.map((post) => (
                            <tr key={post.id}>
                                <td><strong>{post.title}</strong></td>
                                <td>{post.author}</td>
                                <td>
                                    <span className={`admin-status admin-status--${post.status === 'published' ? 'active' : 'draft'}`}>
                                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                </td>
                                <td>{post.date}</td>
                                <td>{post.views}</td>
                                <td>
                                    <div className="admin-actions">
                                        <button title="Ver"><Eye size={14} /></button>
                                        <button title="Editar"><Edit3 size={14} /></button>
                                        <button title="Eliminar"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Daily Spark */}
            <section className="admin-section glass">
                <div className="admin-section__header">
                    <h3><Zap size={16} /> Daily Spark</h3>
                    <button className="admin-btn admin-btn--primary"><Plus size={14} /> Nueva pregunta</button>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Pregunta</th>
                            <th>Factor</th>
                            <th>Nivel</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sparkQuestions.map((sq) => (
                            <tr key={sq.id}>
                                <td>{sq.text}</td>
                                <td><span className="admin-factor-badge">{sq.factor}</span></td>
                                <td>Nivel {sq.level}</td>
                                <td>
                                    <span className={`admin-status admin-status--${sq.active ? 'active' : 'draft'}`}>
                                        {sq.active ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button title="Editar"><Edit3 size={14} /></button>
                                        <button title="Eliminar"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    )
}
