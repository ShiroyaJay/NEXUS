/**
 * NEXUS - Peer Mode Application Controller
 * 
 * Handles UI and logic for peer-to-peer conversations
 */

class PeerModeApp {
    constructor() {
        this.peerMode = new PeerMode();
        this.aiGuide = null;
        this.reflectionEngine = null;
        this.ollamaEngine = new OllamaConversationEngine();
        this.safetyModule = new SafetyModule();

        this.userMessages = [];
        this.currentScreen = 'feeling';
    }

    /**
     * Initialize peer mode
     */
    async init() {
        try {
            // Connect to peer server
            await this.peerMode.connect();
            console.log('[Peer App] Connected to server');

            // Initialize AI guide with Ollama
            this.aiGuide = new AIGuide(this.ollamaEngine);
            this.reflectionEngine = new ReflectionEngine(this.aiGuide);

            // Setup event listeners
            this.setupSocketListeners();
            this.setupUIListeners();

            // Show feeling selection screen
            this.showFeelingScreen();

        } catch (error) {
            console.error('[Peer App] Initialization error:', error);
            alert('Could not connect to peer server. Make sure to run:\n\nnpm install\nnpm start\n\nThen refresh this page.');
            // Go back to welcome screen
            this.exitToWelcome();
        }
    }

    /**
     * Setup socket event listeners
     */
    setupSocketListeners() {
        // Message from peer
        this.peerMode.onMessage((message, timestamp) => {
            this.addMessage(message, 'peer');
            this.aiGuide.addMessage(message, 'peer');

            // Check for crisis
            if (this.aiGuide.detectCrisis(message)) {
                this.showCrisisModal();
            }

            // Check if AI should intervene
            this.checkForIntervention();
        });

        // AI guidance
        this.peerMode.onAIGuidance((message) => {
            this.addMessage(message, 'ai-guide');
        });

        // Status changes
        this.peerMode.onStatus((status, data) => {
            this.handleStatusChange(status, data);
        });

        // Reflection start
        this.peerMode.onReflection((data) => {
            this.startReflection(data);
        });
    }

    /**
     * Setup UI event listeners
     */
    setupUIListeners() {
        // Feeling selection
        document.querySelectorAll('.feeling-card').forEach(card => {
            card.addEventListener('click', () => {
                const feeling = card.dataset.feeling;
                this.requestMatch(feeling);
            });
        });

        // Random match
        document.getElementById('random-match-button').addEventListener('click', () => {
            this.requestMatch('random');
        });

        // Cancel matching
        document.getElementById('cancel-matching').addEventListener('click', () => {
            this.peerMode.cancelMatching();
            this.showFeelingScreen();
        });

        // Back to welcome
        document.getElementById('back-to-welcome').addEventListener('click', () => {
            this.exitToWelcome();
        });

        // Send message
        const peerInput = document.getElementById('peer-input');
        const peerSendBtn = document.getElementById('peer-send-button');

        peerSendBtn.addEventListener('click', () => this.sendMessage());
        peerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        peerInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Leave conversation
        document.getElementById('leave-peer-button').addEventListener('click', () => {
            if (confirm('Are you sure you want to leave this conversation?')) {
                this.peerMode.endConversation();
            }
        });

        // Finish reflection
        document.getElementById('finish-reflection').addEventListener('click', () => {
            this.exitToWelcome();
        });

        // Toggle AI panel
        document.getElementById('toggle-ai-panel').addEventListener('click', () => {
            const panel = document.querySelector('.ai-guidance-panel');
            panel.classList.toggle('minimized');

            const icon = document.querySelector('#toggle-ai-panel svg path');
            if (panel.classList.contains('minimized')) {
                icon.setAttribute('d', 'M5 15l7-7 7 7'); // Up arrow
                document.getElementById('toggle-ai-panel').title = 'Expand';
            } else {
                icon.setAttribute('d', 'M19 9l-7 7-7-7'); // Down arrow
                document.getElementById('toggle-ai-panel').title = 'Minimize';
            }
        });
    }

    /**
     * Request a match
     */
    requestMatch(feeling) {
        this.peerMode.requestMatch(feeling);
        this.showMatchingScreen(feeling);
    }

    /**
     * Handle status changes
     */
    handleStatusChange(status, data) {
        switch (status) {
            case 'matched':
                this.onMatched(data);
                break;
            case 'waiting':
                // Already showing matching screen
                break;
            case 'peer-ended':
                this.onPeerEnded();
                break;
            case 'peer-disconnected':
                this.onPeerDisconnected();
                break;
            case 'error':
                console.error('[Peer App] Error:', data);
                break;
        }
    }

    /**
     * When match is found
     */
    onMatched(data) {
        console.log('[Peer App] Matched!', data);
        this.showPeerChatScreen();

        // Start AI monitoring
        this.aiGuide.startMonitoring();

        // Add welcome message
        this.addMessage('You\'ve been connected with someone. Be yourself and enjoy the conversation. 💙', 'system');
    }

    /**
     * When peer ends conversation
     */
    onPeerEnded() {
        this.addMessage('The other person has ended the conversation. Thank you for connecting.', 'system');
        document.getElementById('peer-input').disabled = true;
        document.getElementById('peer-send-button').disabled = true;
    }

    /**
     * When peer disconnects
     */
    onPeerDisconnected() {
        this.addMessage('The other person has disconnected. The conversation has ended.', 'system');
        document.getElementById('peer-input').disabled = true;
        document.getElementById('peer-send-button').disabled = true;

        setTimeout(() => {
            this.exitToWelcome();
        }, 3000);
    }

    /**
     * Send message to peer
     */
    sendMessage() {
        const input = document.getElementById('peer-input');
        const message = input.value.trim();

        if (!message) return;

        // Add to UI
        this.addMessage(message, 'user');

        // Track for reflection
        this.userMessages.push({ text: message, timestamp: Date.now() });

        // Add to AI guide for monitoring
        this.aiGuide.addMessage(message, 'user');

        // Send to peer
        this.peerMode.sendMessage(message);

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Check for crisis
        if (this.aiGuide.detectCrisis(message)) {
            this.showCrisisModal();
        }

        // Check if AI should intervene
        this.checkForIntervention();
    }

    /**
     * Check if AI should intervene
     */
    async checkForIntervention() {
        const shouldIntervene = await this.aiGuide.shouldIntervene();

        if (shouldIntervene) {
            const intervention = await this.aiGuide.generateIntervention();

            if (intervention && intervention.forUser && intervention.forPeer) {
                // Send dual-perspective guidance to server
                this.peerMode.sendAIGuidance(intervention.forUser, intervention.forPeer);
            }
        }
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender) {
        // AI guidance goes to sidebar
        if (sender === 'ai-guide') {
            this.addAIGuidanceToPanel(text);
            return;
        }

        // Regular messages go to main chat
        const messagesContainer = document.getElementById('peer-messages');
        const messageDiv = document.createElement('div');

        if (sender === 'user') {
            messageDiv.className = 'message user-message';
            messageDiv.textContent = text;
        } else if (sender === 'peer') {
            messageDiv.className = 'message ai-message'; // Reuse styling
            messageDiv.innerHTML = `<strong>Peer:</strong> ${text}`;
        } else if (sender === 'system') {
            messageDiv.className = 'message system-message';
            messageDiv.innerHTML = `<em>${text}</em>`;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Add AI guidance to sidebar panel
     */
    addAIGuidanceToPanel(message) {
        console.log('[DEBUG] addAIGuidanceToPanel received:', message);
        console.log('[DEBUG] Type of message:', typeof message);

        const panelContent = document.getElementById('ai-guidance-messages');

        // Remove hint if present
        const hint = panelContent.querySelector('.ai-panel-hint');
        if (hint) {
            hint.remove();
        }

        // Create guidance item
        const guidanceDiv = document.createElement('div');
        guidanceDiv.className = 'ai-guidance-item';

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        guidanceDiv.innerHTML = `
            <div class="ai-timestamp">${timestamp}</div>
            <div class="ai-message-text">${message}</div>
        `;

        panelContent.appendChild(guidanceDiv);
        panelContent.scrollTop = panelContent.scrollHeight;

        // Briefly highlight the panel if it's minimized
        const panel = document.querySelector('.ai-guidance-panel');
        if (panel.classList.contains('minimized')) {
            panel.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                panel.style.animation = '';
            }, 500);
        }
    }

    /**
     * Start reflection phase
     */
    async startReflection(conversationData) {
        this.aiGuide.stopMonitoring();
        this.showReflectionScreen();

        // Render prompts
        const prompts = this.reflectionEngine.getPrompts();
        const promptsContainer = document.getElementById('reflection-prompts');
        promptsContainer.innerHTML = '';

        prompts.forEach((prompt, index) => {
            const promptDiv = document.createElement('div');
            promptDiv.className = 'reflection-prompt';
            promptDiv.innerHTML = `
        <label class="reflection-question">${prompt.question}</label>
        <textarea 
          id="reflection-${prompt.id}" 
          class="reflection-input" 
          placeholder="${prompt.placeholder}"
          rows="3"
        ></textarea>
      `;
            promptsContainer.appendChild(promptDiv);

            // Save answers as user types
            const textarea = promptDiv.querySelector('textarea');
            textarea.addEventListener('blur', () => {
                this.reflectionEngine.storeAnswer(prompt.id, textarea.value);
            });
        });

        // Generate insights
        setTimeout(async () => {
            const insights = await this.reflectionEngine.generateInsights(this.userMessages);

            document.getElementById('insights-content').textContent = insights;
            document.getElementById('reflection-insights').classList.remove('hidden');
        }, 2000); // Small delay to let user answer
    }

    /**
     * Show crisis modal
     */
    showCrisisModal() {
        document.getElementById('crisis-modal').classList.remove('hidden');
    }

    /**
     * Screen management
     */
    showFeelingScreen() {
        this.hideAllScreens();
        document.getElementById('feeling-screen').classList.remove('hidden');
    }

    showMatchingScreen(feeling) {
        this.hideAllScreens();
        const feelingLabel = feeling === 'random' ? 'anyone available' : `someone feeling ${feeling}`;
        document.getElementById('matching-feeling-label').textContent = `Looking for ${feelingLabel}...`;
        document.getElementById('matching-screen').classList.remove('hidden');
    }

    showPeerChatScreen() {
        this.hideAllScreens();
        document.getElementById('chat-screen-peer').classList.remove('hidden');
        document.getElementById('peer-input').focus();
    }

    showReflectionScreen() {
        this.hideAllScreens();
        document.getElementById('reflection-screen').classList.remove('hidden');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    /**
     * Exit to welcome screen
     */
    exitToWelcome() {
        // Disconnect
        this.peerMode.disconnect();

        // Clear AI guide
        if (this.aiGuide) {
            this.aiGuide.clear();
        }

        // Clear reflection
        if (this.reflectionEngine) {
            this.reflectionEngine.clear();
        }

        // Reset messages
        this.userMessages = [];
        document.getElementById('peer-messages').innerHTML = '';

        // Show welcome screen
        this.hideAllScreens();
        document.getElementById('welcome-screen').classList.remove('hidden');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PeerModeApp;
}
