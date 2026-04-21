import { supabase } from '../../lib/supabase'

// Siempre usa el dominio canónico con www en producción.
// Esto evita que el 301 redirect de lovia.com.mx → www.lovia.com.mx
// destruya el token OAuth (el hash fragment se pierde en redirects).
const getOAuthRedirectUrl = (path = '/auth/callback') => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.origin}${path}`
  }
  return `https://www.lovia.com.mx${path}`
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
