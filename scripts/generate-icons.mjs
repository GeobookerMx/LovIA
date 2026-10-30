/**
 * generate-icons.mjs
 * Genera todos los íconos PNG requeridos por PWA, iOS App Store y Google Play
 * desde el favicon.svg de LovIA!
 *
 * Uso: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public', 'favicon.svg')
const svgBuffer = readFileSync(svgPath)
const iosMarkPath = join(root, 'assets', 'lovia-ios-mark-source.png')
const iosIconSource = existsSync(iosMarkPath) ? readFileSync(iosMarkPath) : svgBuffer
const iosFullLogoPath = join(root, 'assets', 'lovia-full-logo-source.png')

async function writeIosIcon(outPath, source = iosIconSource) {
  await sharp(source)
    .resize(1024, 1024)
    .flatten({ background: '#0E0B2A' })
    .toColourspace('srgb')
    .withIccProfile('srgb')
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

// ── Directorios de salida ────────────────────────────────────────────────────
const dirs = [
  join(root, 'public', 'icons'),
  join(root, 'assets'),            // fuente para @capacitor/assets
  join(root, 'assets', 'ios'),     // icono completo exclusivo del proyecto iOS
]
dirs.forEach(d => mkdirSync(d, { recursive: true }))

// Recurso exclusivo de iOS: evita regenerar los iconos PWA y Android.
if (process.argv.includes('--ios-only')) {
  if (!existsSync(iosMarkPath)) throw new Error('Falta assets/lovia-ios-mark-source.png')
  if (!existsSync(iosFullLogoPath)) throw new Error('Falta assets/lovia-full-logo-source.png')
  await writeIosIcon(join(root, 'assets', 'ios', 'icon.png'), readFileSync(iosFullLogoPath))
  await writeIosIcon(join(root, 'public', 'icons', 'icon-1024.png'))
  console.log('Ícono LovIA iOS completo: 1024 × 1024, sRGB, sin transparencia.')
  process.exit(0)
}

// ── Tamaños PWA / Web ────────────────────────────────────────────────────────
const webSizes = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512]

// ── Tamaños iOS (App Store + Xcode) ─────────────────────────────────────────
const iosSizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024]

// ── Tamaños Android (Play Store + Capacitor) ────────────────────────────────
const androidSizes = [48, 72, 96, 144, 192, 512]

// Combinados sin duplicados
const allSizes = [...new Set([...webSizes, ...iosSizes, ...androidSizes])].sort((a, b) => a - b)

console.log('\n🎨 LovIA! — Generador de íconos\n')
console.log(`📄 Fuente SVG: ${svgPath}\n`)

// ── Generar íconos en public/icons/ ─────────────────────────────────────────
console.log('📱 Generando íconos para PWA / tiendas...')
for (const size of allSizes) {
  if (size === 1024) continue // el recurso iOS se escribe por separado
  const outPath = join(root, 'public', 'icons', `icon-${size}.png`)
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath)
  console.log(`  ✅ icon-${size}.png`)
}

// ── Recurso 1024 de la UI; AppIcon iOS usa assets/ios/icon.png ─────────────
console.log('\n🍎 Generando marca 1024×1024 para la interfaz...')
await writeIosIcon(join(root, 'public', 'icons', 'icon-1024.png'))
console.log('  ✅ icon-1024.png')

// ── Generar assets/ para @capacitor/assets ───────────────────────────────────
// @capacitor/assets espera:
//   assets/icon-only.png        (1024×1024, sin transparencia para iOS)
//   assets/icon-foreground.png  (1024×1024, con transparencia para Android adaptive)
//   assets/splash.png           (2732×2732, centrado, padding mínimo)

console.log('\n⚡ Generando assets/ para @capacitor/assets...')

// icon-only compartido; assets/ios/icon.png sustituye sólo el icono iOS.
await writeIosIcon(join(root, 'assets', 'icon-only.png'))
console.log('  ✅ assets/icon-only.png      (marca compartida sin transparencia)')
if (!existsSync(iosFullLogoPath)) throw new Error('Falta assets/lovia-full-logo-source.png')
await writeIosIcon(join(root, 'assets', 'ios', 'icon.png'), readFileSync(iosFullLogoPath))
console.log('  ✅ assets/ios/icon.png       (icono iOS con logo completo)')

// icon-foreground: con canal alfa (Android adaptive foreground layer)
await sharp(svgBuffer)
  .resize(1024, 1024)
  .png()
  .toFile(join(root, 'assets', 'icon-foreground.png'))
console.log('  ✅ assets/icon-foreground.png (Android adaptive — con alfa)')

// icon-background: color sólido del fondo para Android adaptive
await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 14, g: 11, b: 42, alpha: 1 }, // #0E0B2A
  },
})
  .png()
  .toFile(join(root, 'assets', 'icon-background.png'))
console.log('  ✅ assets/icon-background.png (Android adaptive — color fondo)')

// splash.png: 2732×2732 (máx resolución de pantalla en tiendas)
// Ícono de 512px centrado sobre fondo oscuro
const splashSize = 2732
const iconInSplash = 512
const offset = Math.floor((splashSize - iconInSplash) / 2)

const iconPng = await sharp(svgBuffer)
  .resize(iconInSplash, iconInSplash)
  .flatten({ background: { r: 14, g: 11, b: 42 } })
  .png()
  .toBuffer()

await sharp({
  create: {
    width: splashSize,
    height: splashSize,
    channels: 4,
    background: { r: 14, g: 11, b: 42, alpha: 1 },
  },
})
  .composite([{ input: iconPng, top: offset, left: offset }])
  .png()
  .toFile(join(root, 'assets', 'splash.png'))
console.log('  ✅ assets/splash.png          (2732×2732 splash screen)')

// splash-dark.png (idéntico para dark mode)
await sharp({
  create: {
    width: splashSize,
    height: splashSize,
    channels: 4,
    background: { r: 14, g: 11, b: 42, alpha: 1 },
  },
})
  .composite([{ input: iconPng, top: offset, left: offset }])
  .png()
  .toFile(join(root, 'assets', 'splash-dark.png'))
console.log('  ✅ assets/splash-dark.png     (splash dark mode)')

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Íconos generados exitosamente.

Próximos pasos:
  1. Revisa public/icons/ — todos los PNGs están listos para PWA/web
  2. Revisa assets/       — fuente para Capacitor nativo
  3. En la Mac ejecuta: npx @capacitor/assets generate --ios
     (usa assets/ios/icon.png como AppIcon de Xcode)
  4. Revisa AppIcon en Xcode antes de archivar la app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
