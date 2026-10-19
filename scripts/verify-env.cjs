const fs   = require('fs')
const path = require('path')
const expectedRef = process.env.VITE_SUPABASE_EXPECTED_REF

if (!expectedRef || !/^[a-z0-9]{20}$/.test(expectedRef)) {
  console.error('ERROR: indica VITE_SUPABASE_EXPECTED_REF para verificar el artefacto.')
  process.exit(1)
}

const assetsDir = path.join(__dirname, '..', 'dist', 'assets')

if (!fs.existsSync(assetsDir)) {
  console.error('ERROR: dist/ no existe. Ejecuta npm run build primero.')
  process.exit(1)
}

const files = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'))

if (!files.length) {
  console.error('ERROR: No se encontro ningun index-*.js en dist/assets.')
  process.exit(1)
}

const found = files.some(f => {
  const content = fs.readFileSync(path.join(assetsDir, f), 'utf8')
  return content.includes(expectedRef)
})

if (found) {
  console.log('OK: el build contiene la referencia Supabase esperada.')
} else {
  console.error('ERROR: el build no contiene la referencia Supabase esperada.')
  process.exit(1)
}
