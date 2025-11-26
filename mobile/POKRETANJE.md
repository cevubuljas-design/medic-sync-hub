# 🚀 POKRETANJE PULSMEDIC MOBILNE APLIKACIJE

## ✅ Sve je Spremno!

Aplikacija je kompletno instalirana i spremna za testiranje.

---

## 📱 METODA 1: Testiranje na Telefonu (Preporučeno)

### Korak 1: Instalirajte Expo Go na telefonu

**Android:**
https://play.google.com/store/apps/details?id=host.exp.exponent

**iOS:**
https://apps.apple.com/app/expo-go/id982107779

### Korak 2: Pokrenite Development Server

Otvorite terminal i pokrenite:

```bash
cd /tmp/cc-agent/60762064/project/mobile
npm start
```

ili koristite skript:

```bash
./start.sh
```

### Korak 3: Skenirajte QR Kod

1. Otvorite **Expo Go** aplikaciju na telefonu
2. Na Android: Pritisnite "Scan QR Code"
3. Na iOS: Otvorite kameru i skenirajte QR kod
4. Aplikacija će se automatski učitati!

**VAŽNO:** Telefon i računar moraju biti na istoj WiFi mreži!

---

## 💻 METODA 2: Testiranje u Web Browseru

Možete testirati aplikaciju direktno u browseru:

```bash
cd /tmp/cc-agent/60762064/project/mobile
npm run web
```

Aplikacija će se otvoriti u browseru na `http://localhost:8081`

---

## 🔧 Ako QR Kod Ne Radi

Pokušajte tunnel mod:

```bash
cd /tmp/cc-agent/60762064/project/mobile
npm run tunnel
```

Ovo kreira tunnel koji radi čak i ako telefon i računar nisu na istoj mreži.

---

## 🎯 Brze Komande

```bash
# Pokretanje
cd /tmp/cc-agent/60762064/project/mobile
npm start

# Pokretanje sa tunnel-om (ako QR ne radi)
npm run tunnel

# Pokretanje u browseru
npm run web

# Čišćenje cache-a
npx expo start --clear
```

---

## 📋 Šta Očekivati

Kada se aplikacija učita, videćete:

1. **Login ekran** - Prijavite se sa istim kredencijalima kao na webu
2. **Dashboard** - Statistika i nedavne aktivnosti
3. **Navigacija** - Sve opcije (Pacijenti, Termini, Izveštaji...)

Sve funkcionalnosti rade identično kao na web verziji!

---

## 🐛 Troubleshooting

### Problem: "Port 8081 is already in use"

**Rešenje:**
```bash
npx expo start --port 8082
```

### Problem: "Cannot connect to Metro bundler"

**Rešenje:**
```bash
npx expo start --clear
```

### Problem: "QR kod ne radi"

**Rešenje:**
```bash
npm run tunnel
```

### Problem: "Aplikacija crashuje"

**Rešenje:**
1. Proverite da li je telefon na istoj WiFi mreži
2. Restartujte Expo Go aplikaciju
3. Pokrenite: `npx expo start --clear`

---

## 📱 Login Kredencijali

Koristite **iste kredencijale** kao za web aplikaciju!

Sve promene koje napravite na mobilnoj aplikaciji će se videti i na web verziji (i obrnuto) jer koriste istu bazu podataka.

---

## ✅ Kada Ste Spremni za APK

Kada želite da kreirate APK fajl za instalaciju na Android uređajima:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Više informacija u **INSTALACIJA.md** fajlu.

---

## 🎉 Uživajte!

Aplikacija je potpuno funkcionalna i spremna za testiranje!

Za dodatna pitanja pogledajte:
- `README.md` - Osnovna dokumentacija
- `INSTALACIJA.md` - Detaljne instrukcije
- `QUICK_START.md` - Brzi vodič
- `KOMANDE.txt` - Sve komande

---

**Status**: ✅ Spremno za testiranje
**Framework**: React Native + Expo
**Baza podataka**: Ista kao web verzija
