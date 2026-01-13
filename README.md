# NEXUS – Emotional Guide

**Real AI-powered emotional conversations** that help reduce loneliness through meaningful dialogue.

## 🚀 Quick Start

### 1. Install Ollama

NEXUS uses Ollama to run AI conversations locally on your machine (100% private, no data sent to external servers).

**Install Ollama:**
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai
```

### 2. Download the AI Model

```bash
ollama pull llama3.1:8b
```

This downloads the AI model (about 4.7GB). It only needs to be done once.

### 3. Start NEXUS

Open `index.html` in your browser. That's it!

Ollama runs automatically in the background. NEXUS will connect to it and you can start your conversation.

---

## 💬 How It Works

NEXUS guides you through conversations from surface-level to meaningful emotional dialogue:

1. **Opening** - Start with how you're feeling
2. **Follow your thread** - NEXUS listens and follows what matters to you
3. **Deepen naturally** - Gentle questions invite reflection
4. **Body awareness** - Notice physical sensations
5. **Insights emerge** - Recognize realizations without judgment
6. **Close gently** - What are you taking from this moment?

---

## 🔒 Privacy First

- ✅ **100% Local** - Everything runs on your machine
- ✅ **No servers** - No data sent to external APIs
- ✅ **Session only** - Conversations clear when you close the tab
- ✅ **No tracking** - Zero analytics, cookies, or logging

---

## 🎯 What NEXUS Is (and Isn't)

**NEXUS is:**
- An empathetic conversation guide
- A space for emotional reflection
- A tool to build self-awareness

**NEXUS is NOT:**
- A therapist or counselor
- A replacement for professional help
- A diagnostic or treatment tool

If you're in crisis, please contact:
- **988 Suicide & Crisis Lifeline**: Call or text 988
- **Crisis Text Line**: Text HOME to 741741

---

## ⚙️ Technical Details

**Stack:**
- Pure HTML/CSS/JavaScript (no frameworks)
- Ollama (local AI)
- llama3.1:8b model

**Requirements:**
- Modern browser (Chrome, Firefox, Safari, Edge)
- 8GB RAM minimum
- ~5GB storage for AI model

**Ollama Models:**
- Default: `llama3.1:8b` (best quality/speed balance)
- Fast: `phi3:mini` (lighter, faster)
- Larger: `llama3.1:70b` (requires powerful hardware)

To change models, edit `conversation-engine.js`:
```javascript
this.model = 'phi3:mini'; // or your preferred model
```

---

## 🛠️ Troubleshooting

**"Ollama not detected"**
- Make sure Ollama is installed: `ollama --version`
- Check it's running: `ollama list`
- Restart Ollama: `ollama serve`

**Slow responses**
- Try a smaller model: `ollama pull phi3:mini`
- Update conversation-engine.js to use `phi3:mini`

**Connection errors**
- Check Ollama is at `http://localhost:11434`
- Restart your browser
- Check firewall settings

---

## 📜 License

MIT License - Free to use, modify, and distribute.

---

## ❤️ Philosophy

NEXUS believes that technology can facilitate genuine human connection when it:
- Respects privacy absolutely
- Creates space without rushing
- Validates without fixing
- Empowers without manipulating

Meaningful conversation is a human need. NEXUS makes it accessible, private, and safe.
