import { supabase } from '../../lib/supabase'

// Siempre usa el dominio canónico con www en producción.
// Esto evita que el 301 redirect de lovia.com.mx → www.lovia.com.mx
// destruya el token OAuth (el hash fragment se pierde en redirects).
const getOAuthRedirectUrl = (path = '/auth/callback') => {
  const host = window.location.hostname
  if (host === 'lovia.com.mx' || host === 'www.lovia.com.mx') return `https://www.lovia.com.mx${path}`
  return `${window.location.origin}${path}`
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getOAuthRedirectUrl('/auth/callback'),
    },
  })
  if (error) throw error
}

export async function signInWithApple() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: getOAuthRedirectUrl('/auth/callback'),
    },
  })
  if (error) throw error
}
