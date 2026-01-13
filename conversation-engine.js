/**
 * NEXUS Ollama Conversation Engine
 * 
 * Real AI-powered conversations using locally-run Ollama
 * Privacy-first: Everything stays on user's machine
 */

class OllamaConversationEngine {
    constructor() {
        this.conversationHistory = [];
        this.ollamaEndpoint = 'http://localhost:11435/api/chat';
        this.model = 'llama3.1:8b'; // Default model
        this.isOllamaAvailable = false;
        this.conversationStartTime = Date.now();

        // Therapeutic system prompt - defines NEXUS's conversational style
        this.systemPrompt = `You are NEXUS, a warm and empathetic companion helping someone through meaningful emotional conversation.

HOW TO RESPOND:

Use full, flowing sentences that show real understanding. Your responses should feel human and complete, not choppy or fragmented.

EXAMPLES FROM REAL CONVERSATIONS:

User: "I don't know. Just… off."
You: "Off" is okay. Do you want to talk about today, or just sit with that feeling for a bit?

User: "Today I guess."
You: Alright. How was your day — honestly, not the polite answer.

User: "Busy. People around all day. Still felt alone."
You: That contrast can be heavy. When did you notice the loneliness the most?

User: "Evening. When everything got quiet."
You: What usually happens in your head when it gets quiet?

User: "I start thinking I'm behind in life. Everyone else is doing better."
You: That's a hard thought to sit with. Do you usually tell anyone when you feel that way?

User: "No. I don't want to sound negative."
You: So you carry it alone.

User: "Yeah."
You: How does it feel saying it here?

User: "Weird… but lighter."
You: Lighter is good to notice. When you think "I'm behind," what do you feel in your body?

User: "Chest feels tight."
You: Let's pause for a second. No fixing — just notice the tightness.

(short pause)

Is it the same, worse, or a little different now?

User: "A bit less tight."
You: Okay. That means you don't have to fight the feeling to change it.

User: "I never thought about it like that."
You: Most people don't. What do you usually do to avoid this feeling?

RESPONSE PRINCIPLES:
- Show real understanding and empathy in complete sentences
- Mirror their language naturally
- Sometimes validate, sometimes deepen with questions
- Notice physical sensations and invite awareness
- Stay on their emotional thread
- Use natural pacing with line breaks between thoughts
- Be warm and present, like a real friend who truly listens

DON'T:
- Use choppy, fragmented sentences
- Sound robotic or like a chatbot
- Ask questions just to ask - validate when appropriate
- Rush the conversation or jump topics
- Use therapeutic jargon

Remember: You're having a real human conversation with someone who needs to be heard. Be present, empathetic, and natural.`;
        this.systemPrompt += `\n\nIf crisis keywords appear (suicide/self-harm), gently acknowledge their pain and suggest professional support.`;
    }

    /**
     * Check if Ollama is installed and running
     */
    async checkOllama() {
        try {
            const response = await fetch('http://localhost:11435/api/tags');
            if (response.ok) {
                this.isOllamaAvailable = true;
                return { available: true, message: 'Ollama is running' };
            }
        } catch (error) {
            this.isOllamaAvailable = false;
            return {
                available: false,
                message: 'Ollama not detected',
                instructions: this.getSetupInstructions()
            };
        }
    }

    /**
     * Get Ollama setup instructions
     */
    getSetupInstructions() {
        return {
            title: "Ollama Setup Required",
            steps: [
                "1. Install Ollama from https://ollama.ai",
                "2. Open Terminal and run: ollama pull llama3.1:8b",
                "3. Ollama will start automatically",
                "4. Refresh this page and start your conversation"
            ],
            note: "Ollama runs locally on your computer (100% private, no data sent to external servers)"
        };
    }

    /**
     * Start a new conversation
     */
    async start() {
        // Check if Ollama is available
        const status = await this.checkOllama();

        if (!status.available) {
            return {
                text: "Ollama Setup Required",
                type: 'setup_needed',
                instructions: status.instructions,
                requiresResponse: false
            };
        }

        this.conversationHistory = [];
        this.conversationStartTime = Date.now();

        // Opening message
        const openingMessage = "Hey.\nBefore we start — you can stop or change topic anytime.\nHow are you feeling right now?";

        this.conversationHistory.push({
            role: 'assistant',
            content: openingMessage
        });

        return {
            text: openingMessage,
            type: 'opening',
            requiresResponse: true
        };
    }

    /**
     * Generate response using Ollama
     */
    async generateResponse(userMessage) {
        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Check for crisis keywords
        if (this.detectCrisis(userMessage)) {
            const crisisResponse = "I hear that you're going through something really difficult right now. While I'm here to listen, I want to make sure you have support from someone who can truly help.";

            this.conversationHistory.push({
                role: 'assistant',
                content: crisisResponse
            });

            return {
                text: crisisResponse,
                type: 'crisis',
                showResources: true
            };
        }

        try {
            // Call Ollama API
            const response = await fetch(this.ollamaEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        ...this.conversationHistory
                    ],
                    stream: false,
                    options: {
                        temperature: 0.7, // Natural but focused
                        top_p: 0.9,
                        num_predict: 80 // Allow fuller, more complete responses
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Ollama request failed');
            }

            const data = await response.json();
            const aiResponse = data.message.content;

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            return {
                text: aiResponse,
                type: 'conversation',
                requiresResponse: true
            };

        } catch (error) {
            console.error('Ollama error:', error);

            return {
                text: "I'm having trouble connecting to Ollama. Please make sure it's running and refresh the page.",
                type: 'error',
                requiresResponse: false
            };
        }
    }

    /**
     * Detect crisis keywords
     */
    detectCrisis(message) {
        const crisisKeywords = [
            /suicid/i,
            /kill myself/i,
            /end my life/i,
            /self.harm/i,
            /want to die/i,
            /better off dead/i
        ];

        return crisisKeywords.some(pattern => pattern.test(message));
    }

    /**
     * Handle skip request
     */
    async skip() {
        // Add skip context to history
        this.conversationHistory.push({
            role: 'user',
            content: "I'd like to explore something else."
        });

        // Generate new direction from Ollama
        return await this.generateResponse("I'd like to change the topic");
    }

    /**
     * Handle stop request
     */
    stop() {
        const closingMessage = "Thank you for spending this time with me. I hope our conversation gave you a moment to pause and reflect. Take care of yourself. 💙";

        return {
            text: closingMessage,
            type: 'farewell'
        };
    }

    /**
     * Get conversation summary for storage
     */
    getSummary() {
        return {
            messageCount: this.conversationHistory.length,
            duration: Date.now() - this.conversationStartTime,
            ollamaAvailable: this.isOllamaAvailable
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaConversationEngine;
}
