# PulsMedic - Mobilna Aplikacija

Medicinski informacioni sistem - React Native/Expo mobilna aplikacija.

## 🚀 Pokretanje projekta

### Preduslovi

- Node.js (v16 ili noviji)
- npm ili yarn
- Expo CLI
- Android Studio (za Android) ili Xcode (za iOS)

### Instalacija

1. Pozicionirajte se u mobile direktorijum:
```bash
cd mobile
```

2. Instalirajte dependency-je:
```bash
npm install
```

3. Pokrenite Expo development server:
```bash
npm start
```

4. Skenirajte QR kod pomoću Expo Go aplikacije na telefonu ili pritisnite:
   - `a` za Android emulator
   - `i` za iOS simulator

## 📱 Buildovanje APK fajla

### Korak 1: Instalacija EAS CLI

```bash
npm install -g eas-cli
```

### Korak 2: Login u Expo nalog

```bash
eas login
```

Ako nemate nalog, kreirajte ga na: https://expo.dev/signup

### Korak 3: Konfiguracija projekta

```bash
eas build:configure
```

### Korak 4: Kreiranje APK fajla

Za development build:
```bash
eas build --platform android --profile preview
```

Za production build:
```bash
eas build --platform android --profile production
```

Build proces će trajati 10-20 minuta. Nakon završetka, dobićete link za preuzimanje APK fajla.

### Alternativno: Lokalni Build

Za lokalni build (bez EAS):

1. Instalirajte Android Studio
2. Podesite ANDROID_HOME environment varijablu
3. Pokrenite:

```bash
npx expo run:android
```

## 🔧 Konfiguracija

### Environment Variables

Aplikacija koristi `.env` fajl sa sledećim promenljivama:

```env
EXPO_PUBLIC_SUPABASE_URL=https://yebhizmiluiizkfwjeew.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**VAŽNO**: Ove vrednosti su već podešene i koriste istu Supabase bazu kao web aplikacija.

## 📋 Funkcionalnosti

Aplikacija sadrži sve funkcionalnosti iz web verzije:

- ✅ **Autentifikacija** - Login sistem
- ✅ **Dashboard** - Statistika i pregled
- ✅ **Pacijenti** - CRUD operacije za pacijente
- ✅ **Termini** - Upravljanje terminima
- ✅ **Specijalistički izveštaji** - Kreiranje i pregled izveštaja
- ✅ **Istorija izveštaja** - Pregled svih izveštaja
- ✅ **Podešavanja** - Korisnički profil
- ✅ **Admin Panel** - Upravljanje korisnicima (samo za admin)

## 📂 Struktura projekta

```
mobile/
├── App.tsx                 # Glavni fajl aplikacije
├── app.json               # Expo konfiguracija
├── package.json           # Dependency-ji
├── .env                   # Environment variables
└── src/
    ├── contexts/          # React Context (Auth)
    │   └── AuthContext.tsx
    ├── lib/              # Biblioteke (Supabase client)
    │   └── supabase.ts
    └── screens/          # Ekrani aplikacije
        ├── AuthScreen.tsx
        ├── DashboardScreen.tsx
        ├── PatientsScreen.tsx
        ├── AppointmentsScreen.tsx
        ├── SpecialistReportScreen.tsx
        ├── ReportHistoryScreen.tsx
        ├── SettingsScreen.tsx
        └── AdminScreen.tsx
```

## 🔐 Baza podataka

Aplikacija koristi istu Supabase bazu kao web verzija:
- URL: `https://yebhizmiluiizkfwjeew.supabase.co`
- Sve tabele i podatki su deljeni između web i mobilne aplikacije
- **NEMA** potrebe za kreiranjem nove baze podataka

## 🎨 Dizajn

Aplikacija koristi:
- Tamnu temu (dark mode) kao default
- Zelena boja (#10b981) kao primarna boja
- Moderna, profesionalna UI sa animacijama
- Responsive design optimizovan za mobilne uređaje

## 🐛 Debugging

Za debugging koristite:

```bash
npx expo start --dev-client
```

Ili instalirajte React Native Debugger.

## 📝 Napomene

- Aplikacija NE zahteva Google Play ili App Store upload
- APK fajl možete direktno instalirati na Android uređaje
- Za iOS je potreban macOS i Xcode
- Svi podaci se sinhronizuju sa web aplikacijom u realnom vremenu

## 🆘 Pomoć

Za dodatnu pomoć pogledajte:
- [Expo dokumentacija](https://docs.expo.dev/)
- [EAS Build dokumentacija](https://docs.expo.dev/build/introduction/)
- [React Native dokumentacija](https://reactnative.dev/)

## ⚡ Quick Start za APK

Najbrži način za dobijanje APK fajla:

```bash
cd mobile
npm install
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Nakon završetka build-a, preuzmite APK sa linka koji dobijete.
