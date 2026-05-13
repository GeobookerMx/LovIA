#!/bin/bash
# =============================================================
# LovIA — Script Automático de Build para iOS
# Uso en la iMac: cd "~/APP PAREJAS" && bash build-ios.sh
# =============================================================
set -e

echo ""
echo "🚀 [LovIA] Iniciando proceso de build para iOS..."
echo "====================================================="

echo "1/4 📥 Descargando últimos cambios de GitHub..."
git pull origin main

echo "2/4 📦 Instalando dependencias (por si hay nuevas)..."
npm install

echo "3/4 🏗️ Compilando el proyecto Vite..."
npm run build

echo "4/4 🔄 Sincronizando con Capacitor iOS..."
npx cap sync ios

echo "====================================================="
echo "✅ ¡Build completado con éxito!"
echo ""
echo "Aperturando Xcode..."
npx cap open ios

echo ""
echo "⚠️ PASOS FINALES EN XCODE:"
echo "1. Selecciona 'Any iOS Device (arm64)'."
echo "2. Aumenta el 'Build Number'."
echo "3. En el menú, selecciona: Product → Clean Build Folder (CRÍTICO)."
echo "4. En el menú, selecciona: Product → Archive."
echo "5. Distribuye a App Store Connect."
echo "====================================================="
