# NEXUS – Emotional Guide

**Real AI-powered emotional conversations** that help reduce loneliness through meaningful dialogue.

---

## 🚀 Quick Start

### 1. Install Ollama

NEXUS uses [Ollama](https://ollama.ai) to run AI conversations **locally** on your machine (100% private).

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai
```

### 2. Download the AI Model

```bash
ollama pull llama3.1:8b
```

### 3. Setup & Run NEXUS

```bash
# Clone the repo
git clone https://github.com/ShiroyaJay/NEXUS.git
cd NEXUS

# Install dependencies
npm install

# Create your environment config
cp .env.example .env

# Start the server
npm start
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
NEXUS/
├── public/                  # Client-side (served by Express)
│   ├── index.html
│   ├── css/
│   │   ├── styles.css
│   │   └── peer-mode-styles.css
│   └── js/
│       ├── app.js           # Main app controller
│       ├── peer-app.js      # Peer mode controller
│       ├── peer-mode.js     # Socket.io peer client
│       ├── ai-guide.js      # AI intervention engine
│       ├── conversation-engine.js  # Ollama chat engine
│       ├── reflection-engine.js    # Post-chat reflection
│       └── safety.js        # Crisis detection & resources
├── src/                     # Server-side
│   ├── server.js            # Express + Socket.io server
│   └── config.js            # Centralized env config
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `llama3.1:8b` | AI model to use |

---

## 💬 How It Works

NEXUS guides you through conversations from surface-level to meaningful emotional dialogue:

1. **Opening** – Start with how you're feeling
2. **Follow your thread** – NEXUS listens and follows what matters to you
3. **Deepen naturally** – Gentle questions invite reflection
4. **Body awareness** – Notice physical sensations
5. **Insights emerge** – Recognize realizations without judgment
6. **Close gently** – What are you taking from this moment?

---

## 🔒 Privacy First

- ✅ **100% Local** – Ollama runs on your machine
- ✅ **No external APIs** – No data leaves your computer
- ✅ **Session only** – Conversations clear on tab close
- ✅ **No tracking** – Zero analytics, cookies, or logging
- ✅ **No secrets in repo** – API config in `.env` (gitignored)

---

## 🎯 What NEXUS Is (and Isn't)

**NEXUS is:** An empathetic conversation guide · A space for emotional reflection · A tool to build self-awareness

**NEXUS is NOT:** A therapist or counselor · A replacement for professional help · A diagnostic or treatment tool

If you're in crisis, please contact:
- **988 Suicide & Crisis Lifeline**: Call or text 988
- **Crisis Text Line**: Text HOME to 741741

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| "Ollama not detected" | Run `ollama serve` and refresh |
| Slow responses | Try `ollama pull phi3:mini` and set `OLLAMA_MODEL=phi3:mini` in `.env` |
| Connection errors | Check Ollama at `http://localhost:11434`, restart browser |

---

## 📜 License

MIT License – Free to use, modify, and distribute.
