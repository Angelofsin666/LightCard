# 💡 Light Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/Angelofsin666/light-card.svg)](https://github.com/Angelofsin666/light-card/releases)
[![GitHub stars](https://img.shields.io/github/stars/Angelofsin666/light-card.svg)](https://github.com/Angelofsin666/light-card/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🇮🇹 [Versione italiana](#-light-card--italiano) disponibile più in basso.

---

A custom [Home Assistant](https://www.home-assistant.io/) Lovelace card to control outdoor lights — animated SVG bulb, dynamic light list, global area toggle, and a full visual editor. **No dependencies required.**

---

## ✨ Features

- **Animated SVG bulb** — pulsing rays when any light is on, static when all off
- **Dynamic light counter** — `X/N lights on` updated in real time
- **Status badge** — 🌙 Off / ✨ Partial / 🌟 All on
- **Global toggle** — tap the header to toggle an entire floor or area
- **Individual buttons** — one button per light, turns blue when off and theme color when on
- **Fully dynamic list** — add or remove as many lights as you want from the visual editor
- **Custom theme color** — one color picker propagates everywhere
- **Full visual editor** — no YAML needed
- **Zero dependencies** — no Mushroom, no Button Card, no extra installs

---

## 📦 Installation via HACS

1. Open **HACS → Frontend**
2. Click the three dots (top right) → **Custom repositories**
3. Paste `https://github.com/Angelofsin666/light-card` and select category **Dashboard**
4. Search for **Light Card** and click **Download**
5. Reload your browser

---

## 🔧 Manual Installation

1. Copy `light-card.js` into your `config/www/` folder
2. Go to **Settings → Dashboards → Resources**
3. Add `/local/light-card.js` as a **JavaScript module**
4. Reload your browser

---

## ⚙️ Configuration

All options are available in the visual editor. YAML equivalent:

```yaml
type: custom:light-card
name: Esterni
subtitle: Luci esterne
floor_id: esterno
color: "#f59e0b"
lights:
  - entity: light.luce_fronte_casa
    name: Fronte Casa
    icon: mdi:home
  - entity: light.luce_fronte_gatti
    name: Fronte L.Ovest
    icon: mdi:tree
  - entity: light.luce_discesa
    name: Discesa
    icon: mdi:car-brake-parking
  - entity: light.luce_basculante
    name: Basculante
    icon: mdi:garage
  - entity: light.luce_lampioncino
    name: Lampioncino
    icon: mdi:post-lamp
  - entity: light.luce_lato_ovest
    name: Lato Ovest
    icon: mdi:coach-lamp
```

| Option | Type | Default | Description | Required |
|--------|------|---------|-------------|----------|
| `name` | `string` | `Esterni` | Card title | ❌ |
| `subtitle` | `string` | `Luci esterne` | Subtitle shown below title | ❌ |
| `floor_id` | `string` | — | Floor/area ID for global header toggle | ❌ |
| `color` | `string` | `#f59e0b` | Theme color (hex) | ❌ |
| `lights` | `list` | — | List of light entities (see below) | ✅ |
| `lights[].entity` | `string` | — | `light.*` entity ID | ✅ |
| `lights[].name` | `string` | — | Button label | ❌ |
| `lights[].icon` | `string` | `mdi:lightbulb` | Button icon | ❌ |

---

## 🖥️ Requirements

- Home Assistant **2023.9.0** or newer
- No external dependencies

---

## 🤝 Contributing

Issues and pull requests are welcome! If you find this card useful, a ⭐ on GitHub goes a long way.

---

## 📄 License

MIT © [Angelofsin666](https://github.com/Angelofsin666)

---
---

# 💡 Light Card — Italiano

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Card personalizzata per [Home Assistant](https://www.home-assistant.io/) per il controllo delle luci esterne — lampadina SVG animata, lista luci dinamica, toggle globale per area e editor visivo completo. **Nessuna dipendenza richiesta.**

---

## ✨ Funzionalità

- **Lampadina SVG animata** — raggi pulsanti quando almeno una luce è accesa, statica quando tutte spente
- **Contatore luci** — `X/N luci accese` aggiornato in tempo reale
- **Badge stato** — 🌙 Spento / ✨ Parziale / 🌟 Tutto acceso
- **Toggle globale** — tocca l'header per accendere/spegnere un intero piano o area
- **Bottoni individuali** — un bottone per ogni luce, blu quando spenta, colore tema quando accesa
- **Lista completamente dinamica** — aggiungi o rimuovi quante luci vuoi dall'editor visivo
- **Colore tema personalizzabile** — un solo color picker si propaga ovunque
- **Editor visivo completo** — nessun YAML necessario
- **Zero dipendenze** — non richiede Mushroom, Button Card o altri componenti

---

## 📦 Installazione via HACS

1. Vai su **HACS → Frontend**
2. Clicca i tre puntini → **Repository personalizzati**
3. Incolla `https://github.com/Angelofsin666/light-card` e seleziona categoria **Dashboard**
4. Cerca **Light Card** e clicca **Scarica**
5. Ricarica il browser

---

## 🔧 Installazione manuale

1. Copia `light-card.js` nella cartella `config/www/`
2. Vai su **Impostazioni → Dashboard → Risorse**
3. Aggiungi `/local/light-card.js` come **Modulo JavaScript**
4. Ricarica il browser

---

## ⚙️ Configurazione

Tutti i campi sono configurabili dall'editor visivo. Equivalente YAML:

```yaml
type: custom:light-card
name: Esterni
subtitle: Luci esterne
floor_id: esterno
color: "#f59e0b"
lights:
  - entity: light.luce_fronte_casa
    name: Fronte Casa
    icon: mdi:home
  - entity: light.luce_fronte_gatti
    name: Fronte L.Ovest
    icon: mdi:tree
```

| Opzione | Tipo | Default | Descrizione | Obbligatorio |
|---------|------|---------|-------------|:---:|
| `name` | `string` | `Esterni` | Titolo della card | ❌ |
| `subtitle` | `string` | `Luci esterne` | Sottotitolo | ❌ |
| `floor_id` | `string` | — | ID piano/area per toggle globale | ❌ |
| `color` | `string` | `#f59e0b` | Colore tema (esadecimale) | ❌ |
| `lights` | `list` | — | Lista delle luci | ✅ |
| `lights[].entity` | `string` | — | Entità `light.*` | ✅ |
| `lights[].name` | `string` | — | Etichetta del pulsante | ❌ |
| `lights[].icon` | `string` | `mdi:lightbulb` | Icona del pulsante | ❌ |

---

## 🖥️ Requisiti

- Home Assistant **2023.9.0** o superiore
- Nessuna dipendenza esterna

---

## 📄 Licenza

MIT © [Angelofsin666](https://github.com/Angelofsin666)
