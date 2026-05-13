import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbpidjpkanwynlhdxowx.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icGlkanBrYW53eW5saGR4b3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDg3ODIsImV4cCI6MjA4NzgyNDc4Mn0.v2plBPSTabpYQReeQ-Mq9cG4-LXzKRbwuRTBks6WW18'

if (!supabaseUrl || !supabaseKey) {
  // En producción nativa no lanzamos excepción — dejamos que React monte
  // y el ErrorBoundary o ProtectedRoute maneje el error de autenticación.
  console.error('[LovIA] ADVERTENCIA: Variables de entorno de Supabase no encontradas. Verifica el build.')
}

// En Capacitor iOS, detectSessionInUrl puede colgar la inicialización
// porque el scheme capacitor:// no soporta hash fragments de OAuth.
const isNative = Capacitor.isNativePlatform()

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNative, // false en Capacitor iOS/Android — evita bug de pantalla blanca
  },
})