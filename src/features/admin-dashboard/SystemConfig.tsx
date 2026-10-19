import { Settings, ShieldAlert } from 'lucide-react'
import './AdminPages.css'

export default function SystemConfig() {
    return <div className="admin-page">
        <div className="admin-page__header">
            <h1>Sistema</h1>
            <p>Estado de la configuración de LovIA</p>
        </div>
        <div className="admin-section glass" role="status">
            <h3><ShieldAlert size={18} /> Configuración administrativa pendiente</h3>
            <p>Los controles de parámetros y publicación están desactivados hasta que exista una API administrativa autorizada, persistente y probada en staging.</p>
            <p>La exploración básica no depende de pruebas cognitivas, penalizaciones de estrés ni cooldown global.</p>
        </div>
        <div className="admin-section glass">
            <h3><Settings size={18} /> Datos del entorno</h3>
            <p>Consulta el distintivo del entorno en la aplicación. Este panel aún no recibe telemetría del servidor.</p>
        </div>
    </div>
}
