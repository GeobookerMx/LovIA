import { useEffect, useState } from 'react'
import { BookOpen, ShieldCheck, Wallet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './AdminPages.css'

export default function FinanceDashboard() {
  const [saveEnabled, setSaveEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    void supabase.from('lovia_feature_flags').select('enabled').eq('key', 'finance_private_save').maybeSingle()
      .then(({ data, error }) => { if (active) setSaveEnabled(!error && data?.enabled === true) })
    return () => { active = false }
  }, [])

  return <main className="admin-page">
    <header className="admin-page__header">
      <h1>Dinero y proyecto de vida</h1>
      <p>El mismo recorrido educativo que ve cada usuario: cuatro sesiones y 18 preguntas.</p>
    </header>
    <section className="admin-section glass" aria-labelledby="finance-admin-content">
      <h2 id="finance-admin-content"><BookOpen size={20} /> Contenido publicado</h2>
      <p>El módulo se encuentra en Inicio, Guía y Mi recorrido. Puedes revisarlo como usuario desde la Guía. Sus respuestas son una reflexión privada, no una calificación de solvencia o compatibilidad.</p>
      <a href="/guide/finance" className="admin-btn admin-btn--primary"><Wallet size={17} /> Abrir el módulo</a>
    </section>
    <section className="admin-section glass" aria-labelledby="finance-admin-privacy">
      <h2 id="finance-admin-privacy"><ShieldCheck size={20} /> Privacidad y avances</h2>
      <p>Guardado privado: {saveEnabled === null ? 'comprobando…' : saveEnabled ? 'activo' : 'desactivado mientras se verifican permisos'}.</p>
      <p>Los conteos por usuario y el acceso de Admin a respuestas están suspendidos. Antes de mostrar datos individuales o proponer conexiones, cada persona deberá aceptar qué información comparte y para qué. Un futuro visto bueno de Admin requerirá aceptación de ambas personas.</p>
    </section>
  </main>
}
