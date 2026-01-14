# How AI Guidance Works in Peer Mode

## 🤖 AI Features in Peer Conversations

The AI acts as a **silent emotional guide** that monitors the conversation between two users and occasionally offers helpful guidance.

### When Does the AI Intervene?

The AI analyzes the conversation and intervenes when it detects:

1. **High Emotional Intensity** 
   - Uses Ollama to analyze recent messages
   - Triggers when emotion rating > 0.7
   - Example: Rapid, intense emotional exchanges

2. **Misunderstanding**
   - Detects confusion keywords ("what do you mean", "I don't understand", "confused")
   - Triggers after 2+ confusion signals

3. **Shallow Conversation**
   - Messages consistently very short (< 20 characters average)
   - Suggests deepening the connection

4. **Imbalanced Participation**
   - One person dominates (80%+ of messages)
   - Encourages balanced dialogue

### AI Intervention Rules

✅ **What the AI Does:**
- Waits for **4-6 messages minimum** before analyzing
- **1-minute cooldown** between interventions
- Sends **short, neutral messages** (max 2 sentences)
- Messages appear **centered with special styling**
- Example: *"It sounds like this moment matters to both of you. Would you like to pause and let the other person finish?"*

❌ **What the AI Does NOT Do:**
- Doesn't take sides
- Doesn't diagnose emotions
- Doesn't give advice or solutions
- Doesn't dominate the conversation
- Doesn't intervene constantly

### How to See AI Guidance (Demo)

**Quick Test to Trigger AI:**

1. **Start a peer conversation** (two browser windows)
2. **Exchange 5-6 SHORT messages quickly** (under 15 characters each):
   - Window 1: "Hey"
   - Window 2: "Hi"
   - Window 1: "How are you"
   - Window 2: "Good"
   - Window 1: "Nice"
   - Window 2: "Yeah"
   
3. **Wait ~5 seconds**
4. **AI should detect "shallow conversation"** and send guidance

### AI Guidance Appearance

When AI intervenes, you'll see:
```
┌────────────────────────────────────┐
│  💡 AI Guide                       │
│  It looks like you're both keeping │
│  things brief. Would exploring     │
│  something more deeply help?       │
└────────────────────────────────────┘
```

The message appears:
- **Centered** in the chat
- **Bordered** with purple accent
- **Labeled** with "💡 AI Guide"
- **Optional** - users can ignore and continue

### Post-Conversation AI Insights

After the conversation ends, **each user separately** receives:
- **Individual reflection prompts**
- **AI-generated insights** about their experience
- **Non-judgmental observations**

Example insight:
> "You shared openly about feeling isolated, and listened carefully when the other person expressed similar feelings. Your willingness to be vulnerable created a space for genuine connection."

---

## 🔧 Troubleshooting

**"AI isn't intervening"**

Check:
1. **Is Ollama running?**
   ```bash
   ps aux | grep ollama
   ```
   
2. **Are there enough messages?** (Need 4-6+)

3. **Has 1 minute passed since last intervention?**

4. **Refresh the browser** after the Ollama port fix

**"Solo Mode not working"**

The Ollama port was incorrect (11435 instead of 11434). This is now fixed - refresh your browser and Solo Mode should work!

---

## 🎯 For Your Presentation

**To Demonstrate AI Guidance:**

1. **Start peer conversation** with two windows
2. **Exchange several short, rapid messages**  
3. **Point out when AI guidance appears** (centered, distinct style)
4. **Explain**: "The AI detected shallow conversation and offered gentle guidance"
5. **Show**: Users can continue chatting normally (AI doesn't force anything)

**To Show Post-Conversation Insights:**

1. **Have a short conversation** (8-10 messages)
2. **Click "Leave Conversation"**
3. **Show reflection screen** with prompts
4. **Wait for AI insights** to generate (2-3 seconds)
5. **Explain**: Each user gets personalized, private insights
