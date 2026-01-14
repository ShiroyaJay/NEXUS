/**
 * NEXUS Peer Mode
 * 
 * Handles all peer-to-peer conversation logic
 * Privacy-first: Uses Socket.io for real-time communication
 */

class PeerMode {
    constructor() {
        this.socket = null;
        this.conversationId = null;
        this.isConnected = false;
        this.feeling = null;
        this.onMessageCallback = null;
        this.onAIGuidanceCallback = null;
        this.onStatusCallback = null;
        this.onReflectionCallback = null;
    }

    /**
     * Initialize connection to peer server
     */
    connect() {
        return new Promise((resolve, reject) => {
            // Connect to Socket.io server
            this.socket = io('http://localhost:3000', {
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('[Peer Mode] Connected to server');
                this.isConnected = true;
                this.attachSocketListeners();
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('[Peer Mode] Connection error:', error);
                reject(new Error('Could not connect to peer server. Make sure the server is running (npm start).'));
            });
        });
    }

    /**
     * Attach socket event listeners
     */
    attachSocketListeners() {
        // Match found
        this.socket.on('match-found', (data) => {
            console.log('[Peer Mode] Match found!', data);
            this.conversationId = data.conversationId;
            this.feeling = data.feeling;

            if (this.onStatusCallback) {
                this.onStatusCallback('matched', data);
            }
        });

        // Waiting for match
        this.socket.on('waiting-for-match', (data) => {
            console.log('[Peer Mode] Waiting for match...', data);

            if (this.onStatusCallback) {
                this.onStatusCallback('waiting', data);
            }
        });

        // Peer message received
        this.socket.on('peer-message', (data) => {
            console.log('[Peer Mode] Message from peer:', data);

            if (this.onMessageCallback) {
                this.onMessageCallback(data.message, data.timestamp);
            }
        });

        // AI guidance received
        this.socket.on('ai-guidance', (data) => {
            console.log('[Peer Mode] AI guidance:', data);

            if (this.onAIGuidanceCallback) {
                this.onAIGuidanceCallback(data.message);
            }
        });

        // Peer ended conversation
        this.socket.on('peer-ended-conversation', () => {
            console.log('[Peer Mode] Peer ended conversation');

            if (this.onStatusCallback) {
                this.onStatusCallback('peer-ended');
            }
        });

        // Peer disconnected
        this.socket.on('peer-disconnected', () => {
            console.log('[Peer Mode] Peer disconnected');

            if (this.onStatusCallback) {
                this.onStatusCallback('peer-disconnected');
            }
        });

        // Start reflection
        this.socket.on('start-reflection', (data) => {
            console.log('[Peer Mode] Starting reflection', data);

            if (this.onReflectionCallback) {
                this.onReflectionCallback(data);
            }
        });

        // Error
        this.socket.on('error', (data) => {
            console.error('[Peer Mode] Error:', data);

            if (this.onStatusCallback) {
                this.onStatusCallback('error', data);
            }
        });
    }

    /**
     * Request a match
     * @param {string} feeling - 'random', 'calm', 'lonely', 'stressed', 'anxious', 'overwhelmed', 'curious'
     */
    requestMatch(feeling) {
        if (!this.isConnected) {
            throw new Error('Not connected to server');
        }

        this.feeling = feeling;
        this.socket.emit('request-match', { feeling });
        console.log('[Peer Mode] Requesting match:', feeling);
    }

    /**
     * Cancel matching request
     */
    cancelMatching() {
        if (!this.isConnected) {
            return;
        }

        this.socket.emit('cancel-matching');
        console.log('[Peer Mode] Cancelled matching');
    }

    /**
     * Send message to peer
     * @param {string} message
     */
    sendMessage(message) {
        if (!this.conversationId) {
            throw new Error('Not in a conversation');
        }

        this.socket.emit('peer-message', { message });
        console.log('[Peer Mode] Sent message to peer');
    }

    /**
     * Send AI guidance to both users (personalized for each)
     * @param {string} messageForUser - Personalized message for current user
     * @param {string} messageForPeer - Personalized message for peer
     */
    sendAIGuidance(messageForUser, messageForPeer) {
        if (!this.conversationId) {
            return;
        }

        this.socket.emit('ai-guidance', {
            userMessage: messageForUser,
            peerMessage: messageForPeer
        });
        console.log('[Peer Mode] Sent personalized AI guidance');
    }

    /**
     * End conversation
     */
    endConversation() {
        if (!this.conversationId) {
            return;
        }

        this.socket.emit('end-conversation');
        console.log('[Peer Mode] Ended conversation');

        this.conversationId = null;
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            this.conversationId = null;
            console.log('[Peer Mode] Disconnected from server');
        }
    }

    /**
     * Set callback for when messages are received
     */
    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    /**
     * Set callback for AI guidance
     */
    onAIGuidance(callback) {
        this.onAIGuidanceCallback = callback;
    }

    /**
     * Set callback for status changes
     */
    onStatus(callback) {
        this.onStatusCallback = callback;
    }

    /**
     * Set callback for reflection start
     */
    onReflection(callback) {
        this.onReflectionCallback = callback;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PeerMode;
}
