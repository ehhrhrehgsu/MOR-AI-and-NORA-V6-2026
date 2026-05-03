const fs = require('fs');
const path = require('path');
const moment = require('moment');

const activeSessions = new Map();

function log(type, message) {
  const time = moment().format('HH:mm:ss');
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    bot: '\x1b[35m[BOT]\x1b[0m'
  };
  console.log(`${prefix[type] || '[LOG]'} ${time} ${message}`);
}

function loadCommands() {
  const commandsDir = path.join(__dirname, 'commands');
  const commands = new Map();
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
    return commands;
  }
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const cmd = require(path.join(commandsDir, file));
      if (cmd.config && cmd.config.name) {
        commands.set(cmd.config.name.toLowerCase(), cmd);
        log('success', `Loaded command: ${cmd.config.name}`);
      }
    } catch (e) {
      log('error', `Failed to load command ${file}: ${e.message}`);
    }
  }
  return commands;
}

function loadEvents() {
  const eventsDir = path.join(__dirname, 'events');
  const events = new Map();
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
    return events;
  }
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const evt = require(path.join(eventsDir, file));
      if (evt.config && evt.config.name) {
        events.set(evt.config.name.toLowerCase(), evt);
        log('success', `Loaded event: ${evt.config.name}`);
      }
    } catch (e) {
      log('error', `Failed to load event ${file}: ${e.message}`);
    }
  }
  return events;
}

function addSession(id, data) {
  activeSessions.set(id, {
    ...data,
    startTime: Date.now(),
    messageCount: 0,
    status: 'active'
  });
}

function removeSession(id) {
  activeSessions.delete(id);
}

function updateSession(id, updates) {
  if (activeSessions.has(id)) {
    const session = activeSessions.get(id);
    activeSessions.set(id, { ...session, ...updates });
  }
}

function getSessions() {
  const result = [];
  for (const [id, data] of activeSessions) {
    result.push({
      id,
      botName: data.botName || 'NORA AI',
      prefix: data.prefix,
      adminUID: data.adminUID,
      startTime: data.startTime,
      messageCount: data.messageCount,
      status: data.status,
      uptime: getUptime(data.startTime)
    });
  }
  return result;
}

function getUptime(startTime) {
  const diff = Date.now() - startTime;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${hours}h ${mins}m ${secs}s`;
}

function generateSessionId() {
  return 'nora_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function parseAppState(input) {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.appState) return parsed.appState;
    if (parsed.cookies) return parsed.cookies;
    return parsed;
  } catch (e) {
    throw new Error('Invalid AppState/FBSTATE format. Must be valid JSON.');
  }
}

module.exports = {
  log,
  loadCommands,
  loadEvents,
  addSession,
  removeSession,
  updateSession,
  getSessions,
  generateSessionId,
  parseAppState,
  activeSessions
};
