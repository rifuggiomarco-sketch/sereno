# 🌿 Sereno — Digital Detox App

Prototipo interattivo di un'app di disconnessione digitale, ispirata alle migliori app virali del settore (Forest, One Sec, Opal, Freedom) e arricchita con funzionalità originali.

---

## ✨ Funzionalità

### Onboarding completo (8 step)
- Splash screen animata
- Nome utente
- Relazione con il telefono
- Momenti di vulnerabilità (multi-select)
- App da monitorare (multi-select)
- Scelta intensità (Gentile / Bilanciato / Determinato)
- Permessi privacy
- Schermata di benvenuto

### 🌳 Giardino (Garden)
- Illustrazione artistica del giardino con 5 specie di alberi animati
- Nuvole, uccelli (sbloccati con streak), particelle dorate
- **"Pianta una pausa"** → scelta tra Respirazione o Fiore che sboccia
- Scelta fiore: Rosa / Loto / Girasole / Ciliegio
- Scelta durata: 5 / 15 / 25 / 45 min
- **"La tua foresta"** — galleria 15 giorni con 5 specie di alberi in miniatura
- **"Foreste degli amici"** — scroll orizzontale con stato online e streak
- **Eden Reforestation** — card con paesi reali (Madagascar, Kenya) e link a edenprojects.org
- AI insight con contatore aperture app
- Demo pausa Instagram

### 🌸 Sessione Focus (FocusSession)
- Timer compresso (demo: 1s reale = 30s sessione)
- **Fiore che sboccia** — 4 specie con palette uniche, petali animati, glow, polline
- **Respirazione guidata** — cerchi concentrici con ciclo inspira/espira
- Completamento con messaggio e ritorno al giardino

### 🔒 Pausa Mindful (PauseOverlay)
- Respirazione adattiva: 1 / 3 / 5 cicli (in base all'intensità scelta)
- Fase riflessione: 5 motivi per aprire l'app con consigli personalizzati
- "Torno al mio momento" (resiste) → aggiunge tempo recuperato
- "Apri app" (slip) → disponibile solo se il motivo è "Mi serve davvero"

### 📊 Pattern (Insights)
- 3 tab: Settimana / Mese / Anno
- Grafico a barre del tempo recuperato
- Correlazione Umore × Schermo
- Momenti fragili con barre di intensità
- Card impatto Eden Reforestation

### 🌙 Modalità (Modes)
- 4 modalità tappabili: Lavoro profondo, Famiglia, Sonno, Respiro libero
- Crea modalità personalizzata
- Sezione Giardino condiviso con amici

### 👥 Modale Amici (FriendsModal)
- **Tab Amici** — lista completa con streak, alberi, ore recuperate, stato online
  - Bottone "🐝 Invia" → foglio gesti (Ape, Farfalla, Foglia, Seme)
- **Tab Classifica** — leaderboard settimanale con posizione personale
- **Tab Invita** — codice invito univoco + guida 4 step + reward 7 giorni

### ⚙️ Settings
- Cambio intensità pausa (funzionale)
- 4 toggle: Notifiche, Grayscale, Alberi reali, Giardino condiviso

---

## 🚀 Avvio

```bash
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Struttura

```
sereno/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Componente principale (tutto il codice)
│   ├── main.jsx         # Entry point React
│   └── index.css        # Tailwind + reset globale
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🎨 Design

- **Font**: sans-serif (sistemino)
- **Palette**:
  - Verde: `#2d4a3e`
  - Crema: `#f4efe6`
  - Terra: `#c97b5c`
  - Inchiostro: `#2d3a2e`
  - Earth: `#d4c5a9`

---

## 🌍 Integrazione reale suggerita

- **Eden Reforestation Projects** → [edenprojects.org](https://edenprojects.org)
- **Ecologi** (verifica impatto) → [ecologi.com](https://ecologi.com)
- **ScreenTime API** (iOS) / **Digital Wellbeing API** (Android)
- **HealthKit** (per correlazione umore)

---

## 📝 Note per lo sviluppo

- Il timer della sessione focus è compresso per la demo (SCALE=30). In produzione rimuovere la costante `SCALE` o impostarla a 1.
- I dati degli amici e il contatore aperture sono hardcoded. In produzione collegare a backend/Supabase.
- L'intensità della pausa è funzionale (cambia il numero di respiri richiesti).

---

*Made with care — Sereno v1.0*
