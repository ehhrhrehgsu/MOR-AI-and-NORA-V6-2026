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

function normalizeCommand(raw) {
  if (!raw || !raw.config) return null;
  const isGoatBot = typeof raw.onStart === 'function';
  const isFcat = typeof raw.run === 'function';
  if (!isGoatBot && !isFcat) return null;
  return {
    config: {
      name: raw.config.name,
      aliases: raw.config.aliases || [],
      description: raw.config.description || raw.config.guide || '',
      usage: raw.config.usage || raw.config.guide || raw.config.name,
      category: raw.config.category || 'General',
      role: raw.config.role || 0,
      cooldown: raw.config.cooldown || 3
    },
    run: isGoatBot ? raw.onStart : raw.run
  };
}

function normalizeEvent(raw) {
  if (!raw || !raw.config) return null;
  const isGoatBot = typeof raw.onStart === 'function';
  const isStd = typeof raw.run === 'function';
  if (!isGoatBot && !isStd) return null;
  return {
    config: {
      name: raw.config.name,
      description: raw.config.description || '',
      eventType: raw.config.eventType || ['log:subscribe', 'log:unsubscribe'],
      category: raw.config.category || 'events'
    },
    run: isGoatBot ? raw.onStart : raw.run
  };
}

function loadCommands() {
  const commandsDir = path.join(__dirname, 'commands');
  const commands = new Map();
  if (!fs.existsSync(commandsDir)) { fs.mkdirSync(commandsDir, { recursive: true }); return commands; }
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(commandsDir, file))];
      const raw = require(path.join(commandsDir, file));
      const cmd = normalizeCommand(raw);
      if (cmd) {
        commands.set(cmd.config.name.toLowerCase(), cmd);
        if (cmd.config.aliases) {
          cmd.config.aliases.forEach(alias => commands.set(alias.toLowerCase(), cmd));
        }
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
  if (!fs.existsSync(eventsDir)) { fs.mkdirSync(eventsDir, { recursive: true }); return events; }
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(eventsDir, file))];
      const raw = require(path.join(eventsDir, file));
      const evt = normalizeEvent(raw);
      if (evt) {
        events.set(evt.config.name.toLowerCase(), evt);
        log('success', `Loaded event: ${evt.config.name}`);
      }
    } catch (e) {
      log('error', `Failed to load event ${file}: ${e.message}`);
    }
  }
  return events;
}

function saveAndLoadCommand(code) {
  const tempFile = path.join(__dirname, 'commands', '_temp_validate.js');
  fs.writeFileSync(tempFile, code);
  try {
    delete require.cache[require.resolve(tempFile)];
    const raw = require(tempFile);
    const cmd = normalizeCommand(raw);
    if (!cmd || !cmd.config.name) {
      fs.unlinkSync(tempFile);
      throw new Error('Invalid command format. Must have config.name and run/onStart function.');
    }
    const finalFile = path.join(__dirname, 'commands', `${cmd.config.name}.js`);
    fs.renameSync(tempFile, finalFile);
    return { success: true, name: cmd.config.name, category: cmd.config.category };
  } catch (e) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw new Error(`Command validation failed: ${e.message}`);
  }
}

function saveAndLoadEvent(code) {
  const tempFile = path.join(__dirname, 'events', '_temp_validate.js');
  fs.writeFileSync(tempFile, code);
  try {
    delete require.cache[require.resolve(tempFile)];
    const raw = require(tempFile);
    const evt = normalizeEvent(raw);
    if (!evt || !evt.config.name) {
      fs.unlinkSync(tempFile);
      throw new Error('Invalid event format. Must have config.name and run/onStart function.');
    }
    const finalFile = path.join(__dirname, 'events', `${evt.config.name}.js`);
    fs.renameSync(tempFile, finalFile);
    return { success: true, name: evt.config.name };
  } catch (e) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw new Error(`Event validation failed: ${e.message}`);
  }
}

function addSession(id, data) {
  activeSessions.set(id, { ...data, startTime: Date.now(), messageCount: 0, status: 'active' });
}
function removeSession(id) { activeSessions.delete(id); }
function updateSession(id, updates) {
  if (activeSessions.has(id)) activeSessions.set(id, { ...activeSessions.get(id), ...updates });
}
function getSessions() {
  const result = [];
  for (const [id, data] of activeSessions) {
    result.push({ id, botName: data.botName || 'NORA AI', prefix: data.prefix, adminUID: data.adminUID, startTime: data.startTime, messageCount: data.messageCount, status: data.status, uptime: getUptime(data.startTime) });
  }
  return result;
}
function getUptime(startTime) {
  const diff = Date.now() - startTime;
  return `${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m ${Math.floor((diff%60000)/1000)}s`;
}
function generateSessionId() { return 'nora_' + Math.random().toString(36).substr(2,9) + '_' + Date.now(); }
function parseAppState(input) {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.appState) return parsed.appState;
    if (parsed.cookies) return parsed.cookies;
    return parsed;
  } catch (e) { throw new Error('Invalid AppState/FBSTATE format. Must be valid JSON.'); }
}

module.exports = {
  log, loadCommands, loadEvents, saveAndLoadCommand, saveAndLoadEvent,
  addSession, removeSession, updateSession, getSessions,
  generateSessionId, parseAppState, activeSessions
};
