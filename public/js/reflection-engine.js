/**
 * NEXUS Reflection Engine
 * 
 * Handles post-conversation reflection and insights
 */

class ReflectionEngine {
    constructor(aiGuide) {
        this.aiGuide = aiGuide;
        this.reflectionData = {
            currentFeeling: '',
            conversationFeelings: '',
            learnings: '',
            insights: ''
        };
    }

    /**
     * Get reflection prompts
     */
    getPrompts() {
        return [
            {
                id: 'current-feeling',
                question: 'How do you feel right now?',
                placeholder: 'Share what you\'re feeling in this moment...'
            },
            {
                id: 'conversation-feelings',
                question: 'What did you feel during the conversation?',
                placeholder: 'Describe the emotions you experienced as you talked...'
            },
            {
                id: 'learnings',
                question: 'What did you notice or learn?',
                placeholder: 'Any insights, realizations, or observations...'
            }
        ];
    }

    /**
     * Store reflection answer
     */
    storeAnswer(promptId, answer) {
        switch (promptId) {
            case 'current-feeling':
                this.reflectionData.currentFeeling = answer;
                break;
            case 'conversation-feelings':
                this.reflectionData.conversationFeelings = answer;
                break;
            case 'learnings':
                this.reflectionData.learnings = answer;
                break;
        }
    }

    /**
     * Generate AI insights based on conversation and reflection
     */
    async generateInsights(userMessages) {
        try {
            const insights = await this.aiGuide.generateInsights(
                userMessages,
                this.reflectionData
            );

            this.reflectionData.insights = insights;
            return insights;
        } catch (error) {
            console.error('[Reflection] Error generating insights:', error);
            return 'Thank you for taking time to reflect on this conversation. Your openness creates space for meaningful connection.';
        }
    }

    /**
     * Get complete reflection summary
     */
    getReflectionSummary() {
        return {
            currentFeeling: this.reflectionData.currentFeeling,
            conversationFeelings: this.reflectionData.conversationFeelings,
            learnings: this.reflectionData.learnings,
            insights: this.reflectionData.insights
        };
    }

    /**
     * Clear reflection data
     */
    clear() {
        this.reflectionData = {
            currentFeeling: '',
            conversationFeelings: '',
            learnings: '',
            insights: ''
        };
    }

    /**
     * Format insights for display
     */
    formatInsights() {
        return {
            title: 'Your Reflection & Insights',
            sections: [
                {
                    label: 'How you feel now',
                    content: this.reflectionData.currentFeeling || 'Not shared'
                },
                {
                    label: 'What you felt during the conversation',
                    content: this.reflectionData.conversationFeelings || 'Not shared'
                },
                {
                    label: 'What you noticed',
                    content: this.reflectionData.learnings || 'Not shared'
                },
                {
                    label: 'AI Insights (optional)',
                    content: this.reflectionData.insights || 'Generating...',
                    isAI: true
                }
            ]
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReflectionEngine;
}
