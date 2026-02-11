/**
 * NEXUS Peer-to-Peer Server
 * 
 * WebSocket server for real-time peer-to-peer conversations
 * Privacy-first: All data in-memory only, no persistence
 */

const config = require('./config');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ===== IN-MEMORY DATA STORAGE (Ephemeral) =====
// All data cleared when server restarts - privacy-first

const waitingUsers = {
    random: [],        // Users waiting for random match
    calm: [],          // Users feeling calm
    lonely: [],        // Users feeling lonely
    stressed: [],      // Users feeling stressed
    anxious: [],       // Users feeling anxious
    overwhelmed: [],   // Users feeling overwhelmed
    curious: []        // Users feeling curious
};

const activeConversations = new Map(); // conversationId -> { user1, user2, messages, startTime }
const userSessions = new Map();        // socketId -> { feeling, conversationId, peerId }

// ===== UTILITY FUNCTIONS =====

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function cleanupStaleWaitingUsers() {
    // Remove waiting users if their socket is disconnected
    for (const feeling in waitingUsers) {
        waitingUsers[feeling] = waitingUsers[feeling].filter(user => {
            const socket = io.sockets.sockets.get(user.socketId);
            return socket && socket.connected;
        });
    }
}

function findMatch(feeling, currentSocketId) {
    cleanupStaleWaitingUsers();

    const queue = waitingUsers[feeling];
    // Find first user that's not the current user
    const matchIndex = queue.findIndex(user => user.socketId !== currentSocketId);

    if (matchIndex !== -1) {
        return queue.splice(matchIndex, 1)[0];
    }
    return null;
}

// ===== SOCKET.IO EVENTS =====

io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);

    // Initialize user session
    userSessions.set(socket.id, {
        feeling: null,
        conversationId: null,
        peerId: null
    });

    // ===== MATCHING SYSTEM =====

    socket.on('request-match', (data) => {
        const { feeling } = data; // 'random', 'calm', 'lonely', etc.
        console.log(`[${new Date().toISOString()}] ${socket.id} requesting match: ${feeling}`);

        if (!waitingUsers[feeling]) {
            socket.emit('error', { message: 'Invalid feeling type' });
            return;
        }

        // Update user session
        const session = userSessions.get(socket.id);
        session.feeling = feeling;

        // Try to find a match
        const match = findMatch(feeling, socket.id);

        if (match) {
            // Match found! Create conversation
            const conversationId = generateId();
            const user1 = match;
            const user2 = {
                socketId: socket.id,
                feeling: feeling
            };

            // Create conversation
            activeConversations.set(conversationId, {
                user1: user1.socketId,
                user2: user2.socketId,
                messages: [],
                startTime: Date.now(),
                feeling: feeling
            });

            // Update sessions
            userSessions.get(user1.socketId).conversationId = conversationId;
            userSessions.get(user1.socketId).peerId = user2.socketId;
            userSessions.get(user2.socketId).conversationId = conversationId;
            userSessions.get(user2.socketId).peerId = user1.socketId;

            // Notify both users
            io.to(user1.socketId).emit('match-found', {
                conversationId,
                feeling
            });
            io.to(user2.socketId).emit('match-found', {
                conversationId,
                feeling
            });

            console.log(`[${new Date().toISOString()}] Match created: ${conversationId} (${user1.socketId} + ${user2.socketId})`);

        } else {
            // No match found, add to waiting queue
            waitingUsers[feeling].push({
                socketId: socket.id,
                feeling: feeling,
                timestamp: Date.now()
            });

            socket.emit('waiting-for-match', { feeling });
            console.log(`[${new Date().toISOString()}] ${socket.id} waiting for match in queue: ${feeling}`);
        }
    });

    // ===== MESSAGING =====

    socket.on('peer-message', (data) => {
        const { message } = data;
        const session = userSessions.get(socket.id);

        if (!session || !session.conversationId || !session.peerId) {
            socket.emit('error', { message: 'Not in a conversation' });
            return;
        }

        const conversation = activeConversations.get(session.conversationId);
        if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
        }

        // Store message (in-memory only, temporary)
        const messageData = {
            from: socket.id,
            text: message,
            timestamp: Date.now()
        };
        conversation.messages.push(messageData);

        // Forward to peer
        io.to(session.peerId).emit('peer-message', {
            message: message,
            timestamp: messageData.timestamp
        });

        console.log(`[${new Date().toISOString()}] Message in ${session.conversationId}: ${socket.id} -> ${session.peerId}`);
    });

    // ===== AI GUIDANCE SYSTEM =====

    socket.on('ai-guidance', (data) => {
        const { userMessage, peerMessage } = data;
        const session = userSessions.get(socket.id);

        if (!session || !session.conversationId || !session.peerId) {
            return;
        }

        // Send personalized AI guidance to each user
        io.to(socket.id).emit('ai-guidance', { message: userMessage });
        io.to(session.peerId).emit('ai-guidance', { message: peerMessage });

        console.log(`[${new Date().toISOString()}] Personalized AI guidance in ${session.conversationId}`);
    });

    // ===== CONVERSATION ENDING =====

    socket.on('end-conversation', () => {
        const session = userSessions.get(socket.id);

        if (!session || !session.conversationId || !session.peerId) {
            return;
        }

        const conversation = activeConversations.get(session.conversationId);

        // Notify peer
        io.to(session.peerId).emit('peer-ended-conversation');

        // Prepare reflection data for both users
        const conversationData = {
            duration: Date.now() - conversation.startTime,
            messageCount: conversation.messages.length,
            feeling: conversation.feeling
        };

        // Send to both users
        io.to(socket.id).emit('start-reflection', conversationData);
        io.to(session.peerId).emit('start-reflection', conversationData);

        console.log(`[${new Date().toISOString()}] Conversation ended: ${session.conversationId}`);

        // Clean up conversation (privacy-first: delete everything)
        activeConversations.delete(session.conversationId);

        // Reset sessions
        userSessions.get(socket.id).conversationId = null;
        userSessions.get(socket.id).peerId = null;
        userSessions.get(session.peerId).conversationId = null;
        userSessions.get(session.peerId).peerId = null;
    });

    // ===== LEAVE WAITING QUEUE =====

    socket.on('cancel-matching', () => {
        const session = userSessions.get(socket.id);
        if (session && session.feeling) {
            const feeling = session.feeling;
            waitingUsers[feeling] = waitingUsers[feeling].filter(
                user => user.socketId !== socket.id
            );
            session.feeling = null;
            console.log(`[${new Date().toISOString()}] ${socket.id} cancelled matching`);
        }
    });

    // ===== DISCONNECT HANDLING =====

    socket.on('disconnect', () => {
        console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}`);

        const session = userSessions.get(socket.id);

        if (session) {
            // Remove from waiting queues
            if (session.feeling) {
                waitingUsers[session.feeling] = waitingUsers[session.feeling].filter(
                    user => user.socketId !== socket.id
                );
            }

            // Notify peer if in conversation
            if (session.peerId) {
                io.to(session.peerId).emit('peer-disconnected');

                // Clean up peer's session
                const peerSession = userSessions.get(session.peerId);
                if (peerSession) {
                    peerSession.conversationId = null;
                    peerSession.peerId = null;
                }
            }

            // Clean up conversation
            if (session.conversationId) {
                activeConversations.delete(session.conversationId);
            }

            // Remove user session
            userSessions.delete(socket.id);
        }
    });
});

// ===== API ROUTES =====

// Client config endpoint (non-sensitive values only)
app.get('/api/config', (req, res) => {
    res.json({
        ollamaHost: config.ollama.host,
        ollamaModel: config.ollama.model,
    });
});

// ===== STATIC FILE SERVING =====

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ===== CLEANUP TASK =====

// Periodically clean up stale waiting users (every 30 seconds)
setInterval(() => {
    cleanupStaleWaitingUsers();
}, 30000);

// ===== START SERVER =====

httpServer.listen(config.port, () => {
    console.log('\n=================================');
    console.log('🚀 NEXUS Peer Server Running');
    console.log('=================================');
    console.log(`📍 URL: http://localhost:${config.port}`);
    console.log(`🧠 Ollama: ${config.ollama.host} (${config.ollama.model})`);
    console.log(`🔒 Privacy: In-memory only, no persistence`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    console.log('=================================\n');
});
