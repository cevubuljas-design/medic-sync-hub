#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════"
echo "  PULSMEDIC MOBILNA APLIKACIJA - POKRETANJE"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Pokrećem Expo development server..."
echo ""

cd /tmp/cc-agent/60762064/project/mobile

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Instaliram dependency-je..."
    npm install
fi

echo ""
echo "✅ Dependency-ji instalirani!"
echo ""
echo "🔄 Pokrećem Expo..."
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  KADA SE POJAVI QR KOD:"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "1. Instalirajte 'Expo Go' aplikaciju na telefonu:"
echo "   • Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo "   • iOS: https://apps.apple.com/app/expo-go/id982107779"
echo ""
echo "2. Otvorite Expo Go aplikaciju"
echo ""
echo "3. Skenirajte QR kod koji će se pojaviti ispod"
echo ""
echo "4. Aplikacija će se učitati na vašem telefonu!"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Start Expo
npx expo start --clear
