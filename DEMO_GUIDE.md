# NEXUS Peer Mode - Presentation Demo Guide

## 🎯 Quick Demo Setup (5 minutes)

### Method 1: Split-Screen Demo (EASIEST)

**Perfect for presentations where you control both users**

1. **Start Server**:
   ```bash
   npm start
   ```
   Wait for: ✅ "NEXUS Peer Server Running" at `http://localhost:3000`

2. **Open Two Browser Windows**:
   - **Left Window**: Regular Chrome → `http://localhost:3000`
   - **Right Window**: Incognito Chrome (Cmd+Shift+N) → `http://localhost:3000`
   
   > 💡 **Tip**: Use Cmd+` to switch between windows quickly

3. **Arrange Side-by-Side**:
   - Resize both to 50% width
   - Position left and right
   - Zoom out if needed (Cmd+-)

4. **Demo Flow**:

   **Step 1: Mode Selection**
   - Both windows: Click **"Peer Mode (Talk with Someone)"**
   
   **Step 2: Feeling Selection**
   - Both windows: Click **"Lonely"** (or same feeling)
   - Show the pulse animation while matching
   
   **Step 3: Matched!**
   - Both screens switch to chat instantly
   - Point out: "You've been connected with someone"
   
   **Step 4: Conversation**
   - Left window: "Hi, I've been feeling isolated lately"
   - Right window: See message appear on left side
   - Right window: "I understand that feeling. What's been going on?"
   - Left window: See response appear
   
   **Step 5: AI Intervention (Optional)**
   - Exchange 5-6 short messages quickly
   - If Ollama is running, AI may suggest deeper connection
   
   **Step 6: End Conversation**
   - Left window: Click "Leave Conversation"
   - Both enter reflection screen
   - Show individual prompts and insights

---

### Method 2: Two Devices (If Available)

- **Your Laptop**: `http://localhost:3000`
- **Your Phone** (on same WiFi): `http://YOUR_IP:3000`
  
  Find your IP:
  ```bash
  ifconfig | grep "inet " | grep -v 127.0.0.1
  ```

---

### Method 3: Pre-Record a Demo Video

Use QuickTime or screen recording:
1. Record split-screen demo
2. Show video during presentation
3. Then do live demo of solo mode

---

## 🎬 Presentation Script

**Opening**:
> "NEXUS now supports peer-to-peer conversations where two real people can connect while AI acts as an emotional guide."

**Demo**:
> "Here I have two browser windows representing two users. Both select 'Peer Mode' and choose how they're feeling—let's say 'Lonely'. Watch how they're instantly matched..."

*[Show matching and connection]*

> "Now they can have a real conversation. Notice how messages appear in real-time..."

*[Type a few messages back and forth]*

> "The AI monitors the conversation and may gently offer guidance if needed..."

*[Show AI intervention if it appears]*

> "When the conversation ends, each user gets individual reflection prompts and AI-generated insights..."

*[Show reflection screen]*

---

## 🔧 Fixing Ollama Connection

### Solo Mode Not Working?

**Check if Ollama is running**:
```bash
ollama list
```

**If not installed**:
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Then download the model
ollama pull llama3.1:8b
```

**If installed but not running**:
```bash
ollama serve
```

Then refresh the browser and try Solo Mode again.

---

## 📸 Screenshots for Presentation

Capture these key moments:

1. **Mode Selection Screen** - Shows both options
2. **Feeling Selection** - The 6 feeling cards
3. **Matching Screen** - Pulse animation
4. **Peer Chat** - Side-by-side messages
5. **AI Guidance** - Centered intervention message
6. **Reflection Screen** - Individual prompts

---

## ⚡ Quick Troubleshooting

**Problem**: "Could not connect to peer server"
- **Solution**: Make sure `npm start` is running

**Problem**: Both windows show same user
- **Solution**: Use incognito/private mode for second window

**Problem**: AI not intervening
- **Solution**: 
  - AI requires Ollama running
  - Has 1-minute cooldown between interventions
  - Needs 4+ messages to analyze

**Problem**: Messages not appearing
- **Solution**: Check server terminal for errors, refresh both windows

---

## 🎯 Key Points to Highlight

✅ **Privacy-First**: All data in-memory only, no persistence  
✅ **Real-Time**: Instant message delivery via WebSockets  
✅ **Feeling-Based Matching**: Connects people with shared emotions  
✅ **AI Guidance**: Non-intrusive, helpful, optional  
✅ **Safe Space**: Crisis detection, respectful boundaries  

---

## 📱 Remote Demo (Friend as Second User)

If you want your friend to join:

1. **Find Your IP Address**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Example output: 192.168.1.100
   ```

2. **Share the URL**:
   ```
   http://192.168.1.100:3000
   ```
   (Make sure your friend is on the same WiFi network)

3. **Both Select Peer Mode** → Choose same feeling

4. **Demo the conversation** together!

> ⚠️ **Note**: This only works on local network. For internet access, you'd need to deploy to a server (Heroku, Railway, etc.)

---

Good luck with your presentation! 🎉
