import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // ── Identidad de la app ───────────────────────────────────────────────────
  appId: 'com.lovia.ios',
  appName: 'LovIA!',

  // ── Vite genera el build en /dist ─────────────────────────────────────────
  webDir: 'dist',

  // ── Servidor (solo para live-reload en desarrollo con cap run) ────────────
  server: {
    androidScheme: 'https',
    // Para desarrollo local con `npx cap run android --livereload`:
    // url: 'http://TU_IP_LOCAL:5173',
    // cleartext: true,
  },

  // ── iOS ───────────────────────────────────────────────────────────────────
  ios: {
    scheme: 'LovIA',
    contentInset: 'automatic',
    // Mínimo iOS 14 para APIs modernas (URLSession, SwiftUI compatible)
    minVersion: '14.0',
  },

  // ── Android ───────────────────────────────────────────────────────────────
  android: {
    // Mínimo Android 7 (API 24) — cubre 97%+ de dispositivos activos
    minSdkVersion: 24,
    // Target más reciente requerido por Google Play desde 2024
    targetSdkVersion: 34,
    // Permite mixed content solo en debug (desactivado en release)
    allowMixedContent: false,
    // Soporte para teclado que empuja el contenido (evita superposición)
    adjustResize: true,
    // Ocultar barra inferior de Android para pantalla completa
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },

  // ── Plugins nativos ───────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0E0B2A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#FF4D6D',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0E0B2A',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
