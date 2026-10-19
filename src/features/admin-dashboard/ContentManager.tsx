import { FileText, BookOpen } from 'lucide-react'
import './AdminPages.css'

export default function ContentManager() {
    return <div className="admin-page">
        <div className="admin-page__header">
            <h1>Gestión de contenido</h1>
            <p>Flujo editorial pendiente de conexión al servidor</p>
        </div>
        <div className="admin-section glass" role="status">
            <h3><FileText size={18} /> Publicación en preparación</h3>
            <p>Crear, editar, publicar y retirar contenido requiere permisos de editor, persistencia y revisión de derechos. Esta pantalla no muestra artículos ni conteos de ejemplo como si fueran publicaciones reales.</p>
        </div>
        <div className="admin-section glass">
            <h3><BookOpen size={18} /> Biblioteca y libro</h3>
            <p>Los borradores del libro permanecen fuera de publicación hasta verificar fuente, ubicación y derechos.</p>
        </div>
    </div>
}
