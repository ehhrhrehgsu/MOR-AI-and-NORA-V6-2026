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

function resolveStr(val, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'object') return val.en || val.vi || Object.values(val)[0] || fallback;
  return String(val);
}

function normalizeCommand(raw) {
  if (!raw || !raw.config) return null;
  const isGoatBot = typeof raw.onStart === 'function';
  const isStd = typeof raw.run === 'function';
  if (!isGoatBot && !isStd) return null;
  const desc = resolveStr(raw.config.description, resolveStr(raw.config.guide, ''));
  const usage = resolveStr(raw.config.usage, resolveStr(raw.config.guide, raw.config.name || ''));
  return {
    config: {
      name: raw.config.name,
      aliases: Array.isArray(raw.config.aliases) ? raw.config.aliases : [],
      description: desc,
      usage: usage,
      category: raw.config.category || 'General',
      role: raw.config.role || 0,
      cooldown: raw.config.cooldown || raw.config.countDown || 3
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
      description: resolveStr(raw.config.description, ''),
      eventType: raw.config.eventType || ['log:subscribe', 'log:unsubscribe'],
      category: raw.config.category || 'events'
    },
    run: isGoatBot ? raw.onStart : raw.run
  };
}

function loadCommands() {
  const commandsDir = path.join(__dirname, 'commands');
  // nameMap: canonical name → cmd (for listing, no duplicates)
  const nameMap = new Map();
  if (!fs.existsSync(commandsDir)) { fs.mkdirSync(commandsDir, { recursive: true }); return nameMap; }
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(commandsDir, file))];
      const raw = require(path.join(commandsDir, file));
      const cmd = normalizeCommand(raw);
      if (cmd && cmd.config.name) {
        nameMap.set(cmd.config.name.toLowerCase(), cmd);
        log('success', `Loaded command: ${cmd.config.name}`);
      }
    } catch (e) {
      log('error', `Failed to load command ${file}: ${e.message}`);
    }
  }
  // Build full map with aliases pointing to same cmd object
  const fullMap = new Map();
  for (const [name, cmd] of nameMap) {
    fullMap.set(name, cmd);
    for (const alias of cmd.config.aliases) {
      fullMap.set(alias.toLowerCase(), cmd);
    }
  }
  // Attach nameMap on fullMap for dedup listing
  fullMap._nameMap = nameMap;
  return fullMap;
}

function loadEvents() {
  const eventsDir = path.join(__dirname, 'events');
  const events = new Map();
  if (!fs.existsSync(eventsDir)) { fs.mkdirSync(eventsDir, { recursive: true }); return events; }
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(eventsDir, file))];
      const raw = require(path.join(eventsDir, file));
      const evt = normalizeEvent(raw);
      if (evt && evt.config.name) {
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
    if (!cmd || !cmd.config.name) { fs.unlinkSync(tempFile); throw new Error('Invalid: must have config.name and run/onStart.'); }
    const finalFile = path.join(__dirname, 'commands', `${cmd.config.name}.js`);
    fs.renameSync(tempFile, finalFile);
    return { success: true, name: cmd.config.name, category: cmd.config.category };
  } catch (e) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw new Error(`Validation failed: ${e.message}`);
  }
}

function saveAndLoadEvent(code) {
  const tempFile = path.join(__dirname, 'events', '_temp_validate.js');
  fs.writeFileSync(tempFile, code);
  try {
    delete require.cache[require.resolve(tempFile)];
    const raw = require(tempFile);
    const evt = normalizeEvent(raw);
    if (!evt || !evt.config.name) { fs.unlinkSync(tempFile); throw new Error('Invalid: must have config.name and run/onStart.'); }
    const finalFile = path.join(__dirname, 'events', `${evt.config.name}.js`);
    fs.renameSync(tempFile, finalFile);
    return { success: true, name: evt.config.name };
  } catch (e) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw new Error(`Validation failed: ${e.message}`);
  }
}

function getUniqueCommands(commandsMap) {
  const source = commandsMap._nameMap || commandsMap;
  return [...source.values()];
}

function addSession(id, data) { activeSessions.set(id, { ...data, startTime: Date.now(), messageCount: 0, status: 'active' }); }
function removeSession(id) { activeSessions.delete(id); }
function updateSession(id, updates) { if (activeSessions.has(id)) activeSessions.set(id, { ...activeSessions.get(id), ...updates }); }
function getSessions() {
  const result = [];
  for (const [id, data] of activeSessions) {
    result.push({ id, botName: data.botName || 'NORA AI', prefix: data.prefix, adminUID: data.adminUID, startTime: data.startTime, messageCount: data.messageCount, status: data.status, uptime: getUptime(data.startTime) });
  }
  return result;
}
function getUptime(s) { const d = Date.now()-s; return `${Math.floor(d/3600000)}h ${Math.floor((d%3600000)/60000)}m ${Math.floor((d%60000)/1000)}s`; }
function generateSessionId() { return 'nora_'+Math.random().toString(36).substr(2,9)+'_'+Date.now(); }
function parseAppState(input) {
  try {
    const p = JSON.parse(input);
    if (Array.isArray(p)) return p;
    if (p.appState) return p.appState;
    if (p.cookies) return p.cookies;
    return p;
  } catch(e) { throw new Error('Invalid AppState/FBSTATE format. Must be valid JSON.'); }
}

module.exports = {
  log, loadCommands, loadEvents, saveAndLoadCommand, saveAndLoadEvent,
  addSession, removeSession, updateSession, getSessions,
  generateSessionId, parseAppState, activeSessions, getUniqueCommands
};
