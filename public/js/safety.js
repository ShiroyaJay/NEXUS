/**
 * NEXUS Safety Module
 * 
 * Handles crisis detection, resource suggestions, and user safety
 */

class SafetyModule {
    constructor() {
        this.crisisResources = [
            {
                name: "988 Suicide & Crisis Lifeline",
                contact: "Call or text 988",
                description: "24/7 support for people in crisis",
                url: "https://988lifeline.org"
            },
            {
                name: "Crisis Text Line",
                contact: "Text HOME to 741741",
                description: "Free 24/7 crisis support via text",
                url: "https://www.crisistextline.org"
            },
            {
                name: "International Association for Suicide Prevention",
                contact: "Visit website for global resources",
                description: "Find help worldwide",
                url: "https://www.iasp.info/resources/Crisis_Centres"
            }
        ];
    }

    /**
     * Get crisis resources
     */
    getCrisisResources() {
        return this.crisisResources;
    }

    /**
     * Check if session should timeout (30 minutes of inactivity)
     */
    shouldTimeout(lastActivityTimestamp) {
        const THIRTY_MINUTES = 30 * 60 * 1000;
        return Date.now() - lastActivityTimestamp > THIRTY_MINUTES;
    }

    /**
     * Detect emotional pressure or manipulation attempts
     * (This is a simple check - in production would be more sophisticated)
     */
    detectEmotionalPressure(conversationHistory) {
        // Check for too many questions in a row without user opt-out
        const recentMessages = conversationHistory.slice(-10);
        const consecutiveSystemMessages = recentMessages.filter(
            msg => msg.role === 'system'
        ).length;

        // If more than 7 out of last 10 are system messages, might be too pushy
        return consecutiveSystemMessages > 7;
    }

    /**
     * Generate privacy notice
     */
    getPrivacyNotice() {
        return {
            title: "Your Privacy Matters",
            points: [
                "This conversation stays in your browser only",
                "Nothing is sent to a server or saved permanently",
                "When you close this tab, everything is deleted",
                "No tracking, no cookies, no analytics",
                "You have full control - skip or stop anytime"
            ]
        };
    }

    /**
     * Generate disclaimer
     */
    getDisclaimer() {
        return {
            title: "Important Notice",
            content: "NEXUS is a conversation guide, NOT a therapist, counselor, or medical professional. This tool does not diagnose mental health conditions or provide treatment. If you're experiencing a mental health crisis or need professional support, please contact a qualified healthcare provider or crisis service."
        };
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafetyModule;
}
