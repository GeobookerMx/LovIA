#!/usr/bin/env bash
# Prepara los recursos web nativos y abre el proyecto iOS existente en Xcode.
# Ejecutar en la iMac desde el repositorio: bash build-ios.sh
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -d ios/App ]]; then
  echo "No se encontro ios/App. Recupera el proyecto iOS de la iMac antes de sincronizar." >&2
  echo "Si esta es una instalacion nueva, usa 'npx cap add ios' y configura firma y enlaces nativos en Xcode." >&2
  exit 1
fi

for tool in node npm xcodebuild; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Falta $tool en la iMac." >&2
    exit 1
  fi
done

echo "Instalando las dependencias fijadas en package-lock.json..."
npm ci --legacy-peer-deps

echo "Compilando la version nativa de produccion..."
npm run build:native

VITE_SUPABASE_EXPECTED_REF=nbpidjpkanwynlhdxowx npm run verify:env
if [[ -e dist/sw.js || -e dist/registerSW.js ]]; then
  echo "El build nativo contiene archivos PWA. Se detuvo la sincronizacion." >&2
  exit 1
fi

echo "Sincronizando los recursos con iOS..."
npx cap sync ios

echo "Abriendo Xcode para revisar firma, version y generar el Archive..."
npx cap open ios
