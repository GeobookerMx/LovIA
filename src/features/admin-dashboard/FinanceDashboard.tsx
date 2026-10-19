import { CreditCard } from 'lucide-react'
import './AdminPages.css'

export default function FinanceDashboard() {
    return <div className="admin-page">
        <div className="admin-page__header">
            <h1>Finanzas</h1>
            <p>Conciliación de cobros pendiente</p>
        </div>
        <div className="admin-section glass" role="status">
            <h3><CreditCard size={18} /> Sin métricas de cobro verificadas</h3>
            <p>El nivel de un perfil no acredita un pago. MRR, ARR e ingresos cobrados aparecerán cuando se concilien transacciones reales del proveedor de pagos con derechos de acceso del servidor.</p>
            <p>LovIA permanece gratis hasta el 31 de enero de 2027 inclusive. El fin de ese periodo no inicia cobros automáticos.</p>
        </div>
    </div>
}
