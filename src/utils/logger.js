// Simple logger utility
const debug = process.env.DEBUG === 'true';

const logger = {
  info: (message, ...args) => {
    if (debug) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (debug) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};

module.exports = logger;