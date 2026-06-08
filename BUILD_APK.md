# 📦 Build APK per Sereno

Guida step-by-step per compilare l'APK dell'app Sereno.

## 📋 Prerequisiti

Assicurati di avere installati:
- **Node.js** (v16+) e npm
- **Java JDK 11** (o superiore)
- **Android SDK** (API 34 consigliato)
- **Android Studio** (opzionale ma consigliato)
- **Gradle** (incluso in Android Studio o standalone)

### Su macOS:
```bash
# Installa via Homebrew
brew install openjdk@11
brew install android-sdk
brew install gradle
```

### Su Linux (Ubuntu/Debian):
```bash
sudo apt-get install openjdk-11-jdk
sudo apt-get install android-sdk
sudo apt-get install gradle
```

### Su Windows:
- Scarica Android Studio da https://developer.android.com/studio
- Installa Java JDK 11 da https://www.oracle.com/java/technologies/javase-jdk11-downloads.html

---

## 🔧 Setup Ambiente

### 1. Configura le variabili d'ambiente

**macOS / Linux:**
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH
```

**Windows (PowerShell):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11"
$env:ANDROID_HOME = "$env:USERPROFILE\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

### 2. Scarica i componenti Android necessari

```bash
# Con Android Studio: Tools > SDK Manager
# O da terminale:
sdkmanager "platform-tools"
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
sdkmanager "system-images;android-34;google_apis;x86_64"
```

---

## 🚀 Build dell'APK

### Passo 1: Installa le dipendenze

```bash
npm install
```

### Passo 2: Build il progetto Vite

```bash
npm run build
```

Questo genererà una cartella `dist` con i file compilati.

### Passo 3: Sincronizza Capacitor con Android

```bash
# Installa Capacitor globalmente (se non lo è già)
npm install -g @capacitor/cli

# Aggiungi la piattaforma Android (se non presente)
npx cap add android

# Sincronizza i file web con il progetto Android
npx cap sync android
```

### Passo 4: Compila l'APK

#### Opzione A: Da linea di comando

```bash
cd android

# Build APK debug (più veloce, per testing)
./gradlew assembleDebug

# Build APK release (per distribuzione)
./gradlew assembleRelease
```

L'APK sarà salvato in:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

#### Opzione B: Con Android Studio

1. Apri il progetto: `File > Open > seleziona la cartella android/`
2. Attendi il sync di Gradle
3. Vai a `Build > Build Bundle(s) / APK(s) > Build APK(s)`
4. Android Studio genererà l'APK automaticamente

### Passo 5 (Facoltativo): Firma l'APK Release

Se vuoi distribuire l'app sul Play Store, devi firmare l'APK:

```bash
# 1. Crea un keystore (se non lo hai già)
keytool -genkey -v -keystore sereno-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias sereno-key

# 2. Firma l'APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore sereno-key.jks \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  sereno-key

# 3. Ottimizza l'APK (opzionale)
zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
```

---

## 📱 Test dell'APK

### Su dispositivo fisico:

```bash
# 1. Collega il dispositivo Android via USB
# 2. Abilita la modalità sviluppatore e USB Debugging sul dispositivo

# 3. Installa l'APK debug
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 4. Avvia l'app
adb shell am start -n com.sereno.app/.MainActivity

# 5. Visualizza i log
adb logcat
```

### Su emulatore:

```bash
# 1. Crea e avvia un emulatore Android
emulator -avd Pixel_5

# 2. Installa l'APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 3. Avvia l'app
adb shell am start -n com.sereno.app/.MainActivity
```

---

## 🐛 Troubleshooting

### Errore: "JAVA_HOME not set"
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
```

### Errore: "Android SDK not found"
- Scarica Android SDK da Android Studio
- Imposta `ANDROID_HOME` correttamente

### Errore: "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### APK è troppo grande
- Abilita ProGuard/R8 in `android/app/build.gradle`
- Riduci le dipendenze non utilizzate

---

## 📤 Distribuzione

### Play Store:
1. Firma l'APK release
2. Crea un account Google Play Console
3. Carica l'APK firmato
4. Compila i dettagli dell'app e pubblica

### Distribuzione diretta:
- Condividi il file `app-debug.apk` o `app-release-signed.apk`
- L'utente installa con: `adb install nomefile.apk`

---

## 📚 Risorse

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Android Build Guide](https://developer.android.com/build)
- [Google Play Console](https://play.google.com/console)

---

**Made with 🌿 Sereno v1.0**