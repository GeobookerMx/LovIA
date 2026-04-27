/**
 * platform.ts — Utilidad central para detección de plataforma
 *
 * Con Capacitor, `Capacitor.isNativePlatform()` detecta si estamos
 * corriendo como app nativa (iOS o Android) vs. navegador web.
 *
 * USAR SIEMPRE ESTA FUNCIÓN en lugar de navigator.userAgent o similares.
 */
import { Capacitor } from '@capacitor/core'

/** True cuando la app corre como binario nativo (iOS o Android) */
export const isNative = (): boolean => Capacitor.isNativePlatform()

/** True solo en iOS nativo */
export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios'

/** True solo en Android nativo */
export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android'

/** True en navegador web (Netlify/PWA) */
export const isWeb = (): boolean => Capacitor.getPlatform() === 'web'
