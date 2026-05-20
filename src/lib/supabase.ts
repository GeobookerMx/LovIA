import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

// Real project URL and key as fallbacks — safe to commit (anon key is public by design).
// This prevents the iOS Capacitor build from connecting to 'placeholder.supabase.co'
// when VITE_ env vars are not injected at build time.
const REAL_SUPABASE_URL = 'https://nbpidjpkanwynlhdxowx.supabase.co'
const REAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icGlkanBrYW53eW5saGR4b3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDg3ODIsImV4cCI6MjA4NzgyNDc4Mn0.v2plBPSTabpYQReeQ-Mq9cG4-LXzKRbwuRTBks6WW18'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || REAL_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  REAL_ANON_KEY

// En Capacitor iOS, detectSessionInUrl puede colgar la inicialización
// porque el scheme capacitor:// no soporta hash fragments de OAuth.
const isNative = Capacitor.isNativePlatform()

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: !isNative, // false en Capacitor iOS/Android — evita bug de pantalla blanca
  },
})