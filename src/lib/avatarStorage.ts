/** Only a personal avatar from this project's public bucket may be retired. */
export function ownedAvatarPath(value: string | null | undefined, userId: string, trustedOrigin: string): string | null {
  if (!value || !userId) return null
  try {
    const url = new URL(value)
    if (url.origin !== new URL(trustedOrigin).origin) return null
    const prefix = '/storage/v1/object/public/avatars/'
    if (!url.pathname.startsWith(prefix)) return null
    const path = decodeURIComponent(url.pathname.slice(prefix.length))
    const [owner, file, ...extra] = path.split('/')
    if (owner !== userId || extra.length || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpe?g|png|webp)$/i.test(file ?? '')) return null
    return path
  } catch { return null }
}
