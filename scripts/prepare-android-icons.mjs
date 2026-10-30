import sharp from 'sharp'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const assets = join(root, 'assets')
const mark = join(assets, 'lovia-ios-mark-source.png')
const fullLogo = join(assets, 'lovia-full-logo-source.png')

// The store graphic is the author's complete logo. Play Console requires
// a separate 512 x 512 PNG; it is not taken from the Android bundle.
await sharp(fullLogo)
  .resize(512, 512)
  .ensureAlpha(1)
  .toColourspace('srgb')
  .png({ compressionLevel: 9 })
  .toFile(join(assets, 'play-store-icon.png'))

// The launcher uses the same heart and circuit without its wordmark, so the
// mark remains legible when Android applies a circular or shaped icon mask.
await sharp(mark)
  .resize(1024, 1024)
  .flatten({ background: '#1c0a30' })
  .toColourspace('srgb')
  .png({ compressionLevel: 9 })
  .toFile(join(assets, 'icon-only.png'))

const { data, info } = await sharp(mark)
  .resize(1024, 1024)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// The source has a dark violet backdrop. Its warm heart pixels are separated
// into an alpha foreground; a solid violet layer sits underneath it.
for (let i = 0; i < data.length; i += info.channels) {
  const red = data[i]
  data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, (red - 90) / 70)))
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
  .png({ compressionLevel: 9 })
  .toFile(join(assets, 'icon-foreground.png'))

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#1c0a30' } })
  .png({ compressionLevel: 9 })
  .toFile(join(assets, 'icon-background.png'))

console.log('LovIA Android: icon-only, icon-foreground, icon-background y play-store-icon preparados.')
