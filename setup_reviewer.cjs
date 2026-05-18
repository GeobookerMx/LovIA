const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('.env'));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.replace(/['"`]+/g, '');

const supabase = createClient(url, key);

async function setupReviewer() {
  console.log('Configurando reviewer@lovia.com...');
  
  // 1. Intentar crear
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'reviewer@lovia.com',
    password: 'LovIA2024!',
    options: { data: { alias: 'Apple Reviewer', full_name: 'Apple Review' } }
  });

  // 2. Iniciar sesión para tener sus permisos
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'reviewer@lovia.com',
    password: 'LovIA2024!'
  });

  if (authError) {
    console.log('❌ Error al iniciar sesión. Verifica que la contraseña sea correcta:', authError.message);
    return;
  }
  
  console.log('✅ Sesión iniciada con éxito para', authData.user.id);

  // 3. Actualizar perfil a onboarding completado
  const { data, error } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    alias: 'Apple Review',
    email: 'reviewer@lovia.com',
    onboarding_completed: true,
    tier: 'free',
    visibility_mode: 'classic'
  });
  
  if (error) console.log('❌ Error al actualizar perfil:', error);
  else console.log('✅ Perfil actualizado! reviewer@lovia.com ya tiene matches desbloqueados.');
}

setupReviewer();
