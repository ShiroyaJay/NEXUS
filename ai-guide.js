/**
 * NEXUS AI Guide
 * 
 * AI intervention system for peer-to-peer conversations
 * Monitors conversation and provides thoughtful guidance
 */

class AIGuide {
    constructor(ollamaEngine) {
        this.ollamaEngine = ollamaEngine;
        this.conversationMessages = [];
        this.lastInterventionTime = 0;
        this.interventionCooldown = 60000; // 1 minute minimum between interventions
        this.emotionalIntensityThreshold = 0.7;
        this.isMonitoring = false;
    }

    /**
     * Start monitoring conversation
     */
    startMonitoring() {
        this.isMonitoring = true;
        this.conversationMessages = [];
        this.lastInterventionTime = Date.now();
        console.log('[AI Guide] Started monitoring conversation');
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('[AI Guide] Stopped monitoring conversation');
    }

    /**
     * Add message to conversation history
     */
    addMessage(message, sender) {
        if (!this.isMonitoring) return;

        this.conversationMessages.push({
            text: message,
            sender: sender, // 'user' or 'peer'
            timestamp: Date.now()
        });

        // Keep last 20 messages for analysis
        if (this.conversationMessages.length > 20) {
            this.conversationMessages.shift();
        }
    }

    /**
     * Analyze conversation and determine if intervention is needed
     */
    async shouldIntervene() {
        if (!this.isMonitoring) return false;

        // Respect cooldown period
        const timeSinceLastIntervention = Date.now() - this.lastInterventionTime;
        if (timeSinceLastIntervention < this.interventionCooldown) {
            return false;
        }

        // Need at least 4 messages to analyze
        if (this.conversationMessages.length < 4) {
            return false;
        }

        // Analyze last few messages
        const recentMessages = this.conversationMessages.slice(-6);

        // Check for intervention triggers
        const triggers = {
            emotionalIntensity: await this.detectEmotionalIntensity(recentMessages),
            misunderstanding: this.detectMisunderstanding(recentMessages),
            shallow: this.detectShallowConversation(recentMessages),
            imbalanced: this.detectImbalance(recentMessages)
        };

        console.log('[AI Guide] Intervention triggers:', triggers);

        return triggers.emotionalIntensity ||
            triggers.misunderstanding ||
            triggers.shallow ||
            triggers.imbalanced;
    }

    async detectEmotionalIntensity(messages) {
        try {
            const context = messages.map(m => m.text).join('\n');

            const prompt = `Analyze the emotional intensity of this conversation excerpt. Rate from 0.0 (calm) to 1.0 (very intense). Respond with ONLY a number.

Conversation:
${context}

Emotional intensity (0.0-1.0):`;

            const response = await this.ollamaEngine.generateResponse(prompt);
            // Extract text from response object
            const responseText = response.text || response;
            const intensity = parseFloat(responseText.trim());

            if (isNaN(intensity)) return false;

            return intensity > this.emotionalIntensityThreshold;
        } catch (error) {
            console.error('[AI Guide] Error detecting intensity:', error);
            return false;
        }
    }

    /**
     * Detect potential misunderstanding (simple heuristic)
     */
    detectMisunderstanding(messages) {
        // Look for repeated clarifications or confusion words
        const confusionKeywords = ['what do you mean', 'i dont understand', 'confused', 'clarify', 'explain', 'wait what'];

        let confusionCount = 0;
        messages.forEach(msg => {
            const lowerText = msg.text.toLowerCase();
            if (confusionKeywords.some(keyword => lowerText.includes(keyword))) {
                confusionCount++;
            }
        });

        return confusionCount >= 2;
    }

    /**
     * Detect shallow conversation (simple heuristic)
     */
    detectShallowConversation(messages) {
        // Check if messages are too short consistently
        const avgLength = messages.reduce((sum, m) => sum + m.text.length, 0) / messages.length;

        // If average message is < 20 characters, might be too shallow
        return avgLength < 20;
    }

    /**
     * Detect imbalanced participation
     */
    detectImbalance(messages) {
        const userMessages = messages.filter(m => m.sender === 'user').length;
        const peerMessages = messages.filter(m => m.sender === 'peer').length;

        const total = userMessages + peerMessages;
        if (total < 4) return false;

        const ratio = Math.max(userMessages, peerMessages) / total;

        // If one person has 80%+ of messages, it's imbalanced
        return ratio > 0.8;
    }

    async generateIntervention() {
        if (!this.isMonitoring) return null;

        const recentMessages = this.conversationMessages.slice(-6);
        const context = recentMessages.map(m => `${m.sender === 'user' ? 'You' : 'Peer'}: ${m.text}`).join('\n');

        // Generate personalized message for the current user
        const promptForUser = `You are a supportive AI companion observing a peer conversation. Generate ONE brief message (1-2 sentences) that feels natural and helpful.

Your message should:
- First, acknowledge or validate what they're expressing (if emotional)
- Then either: ask a gentle, open question OR offer a brief insight/suggestion (vary between both styles)
- Sound conversational and warm, not robotic or clinical
- Use natural language: "It sounds like...", "I notice...", "How does it feel...", "Sometimes it helps to..."
- Keep it SHORT and genuine - like a supportive friend, not a therapist

Recent conversation (from their perspective):
${context}

Brief supportive message:`

            ;

        try {
            const responseForUser = await this.ollamaEngine.generateResponse(promptForUser);
            const interventionForUser = responseForUser.text || responseForUser;

            // Now generate message for their peer (from peer's perspective)
            const contextFromPeerView = recentMessages.map(m => `${m.sender === 'peer' ? 'You' : 'Peer'}: ${m.text}`).join('\n');

            const promptForPeer = `You are a supportive AI companion observing a peer conversation. Generate ONE brief message (1-2 sentences) that feels natural and helpful.

Your message should:
- First, acknowledge what their peer just shared (if significant)
- Then either: ask a gentle, open question OR offer a brief insight about how to respond supportively (vary between both)
- Sound conversational and warm, not robotic or clinical
- Use natural language: "Your peer seems...", "I notice...", "What might help them...", "Sometimes just listening..."
- Keep it SHORT and genuine - like a supportive friend, not a therapist

Recent conversation (from their perspective):
${contextFromPeerView}

Brief supportive message:`;

            const responseForPeer = await this.ollamaEngine.generateResponse(promptForPeer);
            const interventionForPeer = responseForPeer.text || responseForPeer;

            this.lastInterventionTime = Date.now();

            console.log('[AI Guide] Generated dual interventions:', {
                forUser: interventionForUser.trim(),
                forPeer: interventionForPeer.trim()
            });

            return {
                forUser: interventionForUser.trim(),
                forPeer: interventionForPeer.trim()
            };
        } catch (error) {
            console.error('[AI Guide] Error generating intervention:', error);
            return null;
        }
    }

    async generateInsights(userMessages, conversationSummary) {
        const messagesText = userMessages.map(m => m.text).join('\n');

        const prompt = `Based on this person's messages in a conversation, provide 2-3 short, non-judgmental emotional insights about their experience.

Guidelines:
- Be supportive and validating
- Focus on what they expressed, not diagnosis
- Highlight emotional moments
- Be brief (3-4 sentences total)
- Use "you" language

Their messages:
${messagesText}

Insights:`;

        try {
            const response = await this.ollamaEngine.generateResponse(prompt);
            // Extract text from response object
            const insights = response.text || response;
            console.log('[AI Guide] Generated insights');
            return insights.trim();
        } catch (error) {
            console.error('[AI Guide] Error generating insights:', error);
            return 'Thank you for being open in this conversation. Your willingness to share created space for connection.';
        }
    }

    /**
     * Detect crisis situations
     */
    detectCrisis(message) {
        return this.ollamaEngine.detectCrisis(message);
    }

    /**
     * Clear conversation history
     */
    clear() {
        this.conversationMessages = [];
        this.lastInterventionTime = 0;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIGuide;
}
