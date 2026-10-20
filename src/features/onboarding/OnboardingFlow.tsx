import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { LOVIA_GOALS, readLoviaGoal, type LoviaGoal } from '../../lib/loviaGoals'
import { useAuthStore } from '../../stores/authStore'
import './Onboarding.css'

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [selectedGoal, setSelectedGoal] = useState<LoviaGoal | null>(() => readLoviaGoal(user?.user_metadata))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selected = LOVIA_GOALS.find((option) => option.id === selectedGoal)

  const continueToApp = async () => {
    if (!selectedGoal || saving) return
    if (!user) {
      setError('Tu sesión terminó. Inicia sesión para continuar.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      // This is a personal UI preference, never an authorization or discovery consent flag.
      const { error: goalError } = await supabase.auth.updateUser({ data: { lovia_goal: selectedGoal } })
      if (goalError) throw goalError

      const { error: profileError } = await updateProfile({ onboarding_completed: true })
      if (profileError) throw new Error(profileError)

      navigate('/home', { replace: true })
    } catch {
      setError('No pudimos guardar tu elección. Comprueba tu conexión e inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="onboarding onboarding--welcome">
      <div className="onboarding__intro">
        <span className="onboarding__kicker">Tu camino en LovIA</span>
        <h1>¿Qué te gustaría hacer hoy?</h1>
        <p>Elige un punto de partida. Puedes cambiarlo después y explorar las demás herramientas cuando quieras.</p>
      </div>

      <div className="onboarding__goal-grid" role="group" aria-label="Elige tu objetivo inicial">
        {LOVIA_GOALS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`onboarding__goal ${selectedGoal === option.id ? 'onboarding__goal--selected' : ''}`}
            aria-pressed={selectedGoal === option.id}
            onClick={() => { setSelectedGoal(option.id); setError(null) }}
          >
            <span className="onboarding__goal-icon" aria-hidden="true">{option.icon}</span>
            <span className="onboarding__goal-text">
              <strong>{option.title}</strong>
              <span>{option.description}</span>
            </span>
            <span className="onboarding__goal-indicator" aria-hidden="true">{selectedGoal === option.id ? '✓' : '→'}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="onboarding__first-step" role="status">
          <span className="onboarding__first-step-label">Una pregunta para comenzar</span>
          <p>{selected.reflection}</p>
          <small>Puedes guardarla en Mi Diario más tarde. No es una prueba ni una calificación.</small>
        </div>
      )}

      <div className="onboarding__finish">
        {error && <p className="onboarding__error" role="alert">{error}</p>}
        <button type="button" className="onboarding__cta" onClick={continueToApp} disabled={!selectedGoal || saving}>
          {saving ? <><Loader2 className="animate-spin" size={18} /> Guardando…</> : <>Entrar a LovIA <ArrowRight size={18} /></>}
        </button>
        <p>Tu elección es privada y no activa tu visibilidad para otras personas. Las actividades son voluntarias.</p>
      </div>
    </main>
  )
}
