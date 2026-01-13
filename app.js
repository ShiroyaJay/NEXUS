/**
 * NEXUS - Emotional Guide
 * Main Application Controller
 */

class NexusApp {
    constructor() {
        this.conversationEngine = new OllamaConversationEngine();
        this.safetyModule = new SafetyModule();
        this.isActive = false;
        this.lastActivityTime = Date.now();

        // UI elements (will be set on init)
        this.elements = {};

        // Session storage key
        this.STORAGE_KEY = 'nexus_session';
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.showWelcomeScreen();
        this.checkSessionTimeout();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            welcomeScreen: document.getElementById('welcome-screen'),
            chatScreen: document.getElementById('chat-screen'),
            messagesContainer: document.getElementById('messages'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-button'),
            skipButton: document.getElementById('skip-button'),
            stopButton: document.getElementById('stop-button'),
            newChatButton: document.getElementById('new-chat-button'),
            infoButton: document.getElementById('info-button'),
            startButton: document.getElementById('start-button'),
            crisisModal: document.getElementById('crisis-modal'),
            closeModalButton: document.getElementById('close-modal'),
            infoModal: document.getElementById('info-modal'),
            closeInfoButton: document.getElementById('close-info'),
            stageIndicator: document.getElementById('stage-indicator')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.elements.startButton.addEventListener('click', () => this.startConversation());
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.elements.skipButton.addEventListener('click', () => this.skipTopic());
        this.elements.stopButton.addEventListener('click', () => this.stopConversation());
        this.elements.newChatButton.addEventListener('click', () => this.resetConversation());
        this.elements.infoButton.addEventListener('click', () => this.showInfo());
        this.elements.closeModalButton.addEventListener('click', () => this.hideModal());
        this.elements.closeInfoButton.addEventListener('click', () => this.hideInfoModal());

        // Session timeout check
        setInterval(() => this.checkSessionTimeout(), 60000); // Check every minute
    }

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        this.elements.welcomeScreen.classList.remove('hidden');
        this.elements.chatScreen.classList.add('hidden');
    }

    /**
     * Start conversation
     */
    async startConversation() {
        this.isActive = true;
        this.elements.welcomeScreen.classList.add('hidden');
        this.elements.chatScreen.classList.remove('hidden');

        // Get first prompt from conversation engine
        const firstPrompt = await this.conversationEngine.start();

        if (firstPrompt.type === 'setup_needed') {
            // Show Ollama setup instructions
            this.showOllamaSetup(firstPrompt.instructions);
            return;
        }

        this.addMessage(firstPrompt.text, 'nexus');
        this.updateActivity();
        this.saveSession();

        // Focus on input
        this.elements.userInput.focus();
    }

    /**
     * Send user message
     */
    async sendMessage() {
        const message = this.elements.userInput.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');

        // Clear input
        this.elements.userInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get response from Ollama (async)
            const response = await this.conversationEngine.generateResponse(message);

            this.hideTypingIndicator();

            if (response.showResources) {
                this.addMessage(response.text, 'nexus');
                this.showCrisisModal();
            } else if (response.type === 'error') {
                this.addMessage(response.text, 'nexus');
                this.disableInput();
            } else if (response.type === 'farewell') {
                this.addMessage(response.text, 'nexus');
                // Allow continuing if user wants
            } else {
                this.addMessage(response.text, 'nexus');
            }

            this.updateActivity();
            this.saveSession();

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("I'm having trouble right now. Please check that Ollama is running.", 'nexus');
            console.error('Conversation error:', error);
        }
    }

    /**
     * Skip to next topic
     */
    skipTopic() {
        const response = this.conversationEngine.skip();
        this.addMessage("I'd like to explore something else.", 'user');

        setTimeout(() => {
            this.addMessage(response.text, 'nexus');
            this.updateActivity();
            this.saveSession();
        }, 500);
    }

    /**
     * Stop conversation
     */
    stopConversation() {
        const response = this.conversationEngine.stop();
        this.addMessage(response.text, 'nexus');
        this.disableInput();
        this.updateActivity();
        this.saveSession();
    }

    /**
     * Reset and start new conversation
     */
    resetConversation() {
        this.elements.messagesContainer.innerHTML = '';
        this.enableInput();
        this.clearSession();
        this.startConversation();
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender, stageName = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        // Handle multi-line text (for emotion suggestions in reflection)
        bubble.textContent = text;
        bubble.style.whiteSpace = 'pre-wrap'; // Preserve newlines

        messageDiv.appendChild(bubble);
        this.elements.messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message nexus-message typing-indicator';
        indicator.id = 'typing';
        indicator.innerHTML = '<div class="message-bubble"><span></span><span></span><span></span></div>';
        this.elements.messagesContainer.appendChild(indicator);
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Update stage indicator
     */
    updateStageIndicator(stageName) {
        const stageLabels = {
            opening: 'Opening',
            emotionalCheckIn: 'Emotional Check-in',
            reflection: 'Reflection',
            deeperMeaning: 'Deeper Meaning',
            closure: 'Closure',
            reflection: 'Post-Conversation Reflection',
            farewell: 'Complete'
        };

        this.elements.stageIndicator.textContent = stageLabels[stageName] || '';
    }

    /**
     * Disable input controls
     */
    disableInput() {
        this.elements.userInput.disabled = true;
        this.elements.sendButton.disabled = true;
        this.elements.skipButton.disabled = true;
        this.elements.stopButton.disabled = true;
    }

    /**
     * Enable input controls
     */
    enableInput() {
        this.elements.userInput.disabled = false;
        this.elements.sendButton.disabled = false;
        this.elements.skipButton.disabled = false;
        this.elements.stopButton.disabled = false;
    }

    /**
     * Show crisis modal
     */
    showCrisisModal() {
        this.elements.crisisModal.classList.remove('hidden');
    }

    /**
     * Hide modal
     */
    hideModal() {
        this.elements.crisisModal.classList.add('hidden');
    }

    /**
     * Show info modal
     */
    showInfo() {
        this.elements.infoModal.classList.remove('hidden');
    }

    /**
     * Hide info modal
     */
    hideInfoModal() {
        this.elements.infoModal.classList.add('hidden');
    }

    /**
     * Show Ollama setup instructions
     */
    showOllamaSetup(instructions) {
        // Create setup modal content
        const setupHTML = `
            <div class="modal" id="ollama-setup-modal">
                <div class="modal-content">
                    <h3>${instructions.title}</h3>
                    <div class="info-section">
                        ${instructions.steps.map(step => `<p>${step}</p>`).join('')}
                    </div>
                    <div class="disclaimer">
                        <p><strong>Privacy Note:</strong> ${instructions.note}</p>
                    </div>
                    <button id="refresh-after-setup" class="primary-button">I've Installed Ollama - Start Conversation</button>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', setupHTML);

        // Add event listener
        document.getElementById('refresh-after-setup').addEventListener('click', () => {
            location.reload();
        });
    }

    /**
     * Update last activity time
     */
    updateActivity() {
        this.lastActivityTime = Date.now();
    }

    /**
     * Check for session timeout
     */
    checkSessionTimeout() {
        if (this.isActive && this.safetyModule.shouldTimeout(this.lastActivityTime)) {
            this.addMessage("It's been a while since we last talked. I'm here whenever you'd like to continue.", 'nexus', 'timeout');
            this.disableInput();
        }
    }

    /**
     * Save session to sessionStorage (privacy-first)
     */
    saveSession() {
        const session = {
            summary: this.conversationEngine.getSummary(),
            lastActivity: this.lastActivityTime,
            timestamp: Date.now()
        };

        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    }

    /**
     * Clear session
     */
    clearSession() {
        sessionStorage.removeItem(this.STORAGE_KEY);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new NexusApp();
    app.init();
});
