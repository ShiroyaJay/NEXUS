/**
 * NEXUS Configuration
 * 
 * Centralizes all environment variables with sensible defaults.
 * Loaded once at startup via dotenv.
 */

require('dotenv').config();

const config = {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    ollama: {
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
    },

    isDev() {
        return this.nodeEnv === 'development';
    }
};

module.exports = config;
