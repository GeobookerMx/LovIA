const fs   = require('fs')
const path = require('path')

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
  return content.includes('nbpidjpkanwynlhdxowx')
})

if (found) {
  console.log('OK: Supabase URL embedida correctamente en el build.')
} else {
  console.error('ERROR: Supabase URL NO esta en el bundle. Verifica que .env tenga VITE_SUPABASE_URL correcto.')
  process.exit(1)
}
