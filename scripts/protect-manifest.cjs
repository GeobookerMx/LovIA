/**
 * protect-manifest.cjs
 * 
 * Ejecutar después de `npx cap sync android` para asegurar que
 * el AndroidManifest.xml siempre apunte a la MainActivity correcta.
 * 
 * El problema: `npx cap sync` puede sobreescribir el manifest
 * y cambiar android:name a mx.lovia.app.MainActivity (que no existe).
 * La clase real está en com.lovia.ios.MainActivity.
 * 
 * Uso: node scripts/protect-manifest.cjs
 */

const fs = require('fs')
const path = require('path')

const MANIFEST_PATH = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml')
const WRONG_CLASS   = 'mx.lovia.app.MainActivity'
const CORRECT_CLASS = 'com.lovia.ios.MainActivity'

let content = fs.readFileSync(MANIFEST_PATH, 'utf-8')

if (content.includes(WRONG_CLASS)) {
  content = content.replace(new RegExp(WRONG_CLASS, 'g'), CORRECT_CLASS)
  fs.writeFileSync(MANIFEST_PATH, content, 'utf-8')
  console.log(`✅ AndroidManifest corregido: ${WRONG_CLASS} → ${CORRECT_CLASS}`)
} else if (content.includes(CORRECT_CLASS)) {
  console.log(`✅ AndroidManifest correcto: ${CORRECT_CLASS} (sin cambios)`)
} else {
  console.warn(`⚠️  No se encontró ninguna referencia a MainActivity en el manifest. Revisa manualmente.`)
}
