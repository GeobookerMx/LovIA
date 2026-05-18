const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('.env'));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.replace(/['"`]+/g, '');

const supabase = createClient(url, key);

async function fixProfile() {
  console.log('Verificando perfil en LOVIA...');
  const userId = '993291cf-24dc-4686-8dee-77131932be27'; // ID del demo
  
  // Como usamos la clave pública, iniciaremos sesión primero para tener permisos de insertar/actualizar su propio perfil
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo@lovia.com.mx',
    password: 'Demo1234'
  });
  
  if (authError) {
    console.log('Error auth:', authError.message);
    return;
  }
  
  // Insertar/Upsert el perfil
  const { data, error } = await supabase.from('profiles').upsert({
    id: userId,
    alias: 'Demo Apple',
    email: 'demo@lovia.com.mx',
    onboarding_completed: true,
    tier: 'free',
    visibility_mode: 'classic'
  });
  
  if (error) console.log('❌ Error al crear perfil:', error);
  else console.log('✅ Perfil de LovIA reparado y listo!');
}

fixProfile();
