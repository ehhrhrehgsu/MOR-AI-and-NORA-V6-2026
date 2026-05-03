const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

let login;
try { login = require('stfca'); } catch(e) {
  try { login = require('fca-unofficial'); } catch(e2) { login = null; }
}

const {
  log, loadCommands, loadEvents, saveAndLoadCommand, saveAndLoadEvent,
  addSession, removeSession, updateSession, getSessions,
  generateSessionId, parseAppState, getUniqueCommands
} = require('./utils');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 5000;
const VERSION = 'v12';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let commands = loadCommands();
let events = loadEvents();
const botStartTime = Date.now();

const liveCommands = new Map();
const liveEvents = new Map();
const sessionAppStates = new Map();
const botApis = new Map();
const sessionThreads = new Map(); // sessionId -> Set of threadIDs

// AI usage limit: userID -> { count, date }
const aiUsage = new Map();
const AI_DAILY_LIMIT = 10;

function checkAiLimit(uid) {
  const today = new Date().toDateString();
  const rec = aiUsage.get(uid) || { count: 0, date: today };
  if (rec.date !== today) { rec.count = 0; rec.date = today; }
  if (rec.count >= AI_DAILY_LIMIT) return false;
  rec.count++;
  aiUsage.set(uid, rec);
  return true;
}

function getAiUsage(uid) {
  const today = new Date().toDateString();
  const rec = aiUsage.get(uid) || { count: 0, date: today };
  if (rec.date !== today) return 0;
  return rec.count;
}

function syncLiveMaps() {
  liveCommands.clear();
  commands.forEach((v, k) => liveCommands.set(k, v));
  liveCommands._nameMap = commands._nameMap; // Preserve for dedup
  liveEvents.clear();
  events.forEach((v, k) => liveEvents.set(k, v));
}
syncLiveMaps();

const uniqueCount = getUniqueCommands(liveCommands).length;
log('info', `Loaded ${uniqueCount} unique commands, ${events.size} events`);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/api/sessions', (req, res) => res.json({ sessions: getSessions() }));
app.get('/api/version', (req, res) => res.json({ version: VERSION }));

app.get('/api/ai-usage', (req, res) => {
  const { uid } = req.query;
  res.json({ used: getAiUsage(uid || 'web'), limit: AI_DAILY_LIMIT, remaining: Math.max(0, AI_DAILY_LIMIT - getAiUsage(uid || 'web')) });
});

app.get('/api/commands', (req, res) => {
  res.json({ commands: getCommandList() });
});
app.get('/api/events', (req, res) => {
  res.json({ events: getEventList() });
});

function getCommandList() {
  const list = [], seen = new Set();
  const source = commands._nameMap || commands;
  for (const [, cmd] of source) {
    if (!seen.has(cmd.config.name)) {
      seen.add(cmd.config.name);
      list.push({ name: cmd.config.name, description: cmd.config.description, category: cmd.config.category, usage: cmd.config.usage });
    }
  }
  return list;
}
function getEventList() {
  return [...events.values()].map(e => ({ name: e.config.name, description: e.config.description, eventType: e.config.eventType }));
}

app.post('/api/add-command', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided.' });
  try {
    const result = saveAndLoadCommand(code);
    commands = loadCommands();
    syncLiveMaps();
    io.emit('commands-updated', { commands: getCommandList() });
    log('success', `Dynamic command added & auto-synced: ${result.name}`);
    res.json({ success: true, name: result.name, category: result.category });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/add-event', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided.' });
  try {
    const result = saveAndLoadEvent(code);
    events = loadEvents();
    syncLiveMaps();
    io.emit('events-updated', { events: getEventList() });
    log('success', `Dynamic event added & auto-synced: ${result.name}`);
    res.json({ success: true, name: result.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/simple-ai', (req, res) => {
  const { message, prefix, uid } = req.body;
  const p = prefix || '/';
  if (!message) return res.json({ reply: 'Please type a message.' });
  const body = message.trim();
  if (!body.startsWith(p)) return res.json({ reply: `🤖 Commands start with "${p}". Try ${p}help` });
  const args = body.slice(p.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  // AI limit check for 'ai' command
  if (cmdName === 'ai' || cmdName === 'ask' || cmdName === 'nora') {
    const webUid = uid || 'web_user';
    if (!checkAiLimit(webUid)) {
      return res.json({ reply: `❌ 𝗔𝗜 𝗟𝗶𝗺𝗶𝘁 𝗥𝗲𝗮𝗰𝗵𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━\n📊 Daily limit: ${AI_DAILY_LIMIT} requests/day\n🕐 Resets at midnight (PHT)\n━━━━━━━━━━━━━━━━━━━\n✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗡𝗼𝗿𝗮 𝗩𝟭𝟮`, aiUsage: { used: AI_DAILY_LIMIT, limit: AI_DAILY_LIMIT } });
    }
  }
  const cmd = liveCommands.get(cmdName);
  if (!cmd) return res.json({ reply: `❌ Command "${cmdName}" not found.\n\nType ${p}help to see all commands.` });
  const replies = [];
  const fakeApi = {
    sendMessage: (msg, tid, cb) => { replies.push(typeof msg === 'object' ? (msg.body || '[attachment]') : String(msg)); if (typeof cb === 'function') cb(null, { messageID: 'fake_' + Date.now() }); },
    unsendMessage: () => {}
  };
  const fakeEvent = { threadID: 'web', messageID: 'web_msg', senderID: 'web_user', body };
  try {
    const result = cmd.run({ api: fakeApi, event: fakeEvent, args, commands: liveCommands, prefix: p, adminUID: 'web', botStartTime });
    if (result && typeof result.then === 'function') {
      result.then(() => res.json({ reply: replies.join('\n\n') || '✅ Done!', aiUsage: { used: getAiUsage(uid || 'web_user'), limit: AI_DAILY_LIMIT } })).catch(e => res.json({ reply: `❌ Error: ${e.message}` }));
    } else {
      setTimeout(() => res.json({ reply: replies.join('\n\n') || '✅ Done!', aiUsage: { used: getAiUsage(uid || 'web_user'), limit: AI_DAILY_LIMIT } }), 400);
    }
  } catch (e) {
    res.json({ reply: `❌ Error: ${e.message}` });
  }
});

// ===== TIMECHECK: PH Time auto messages =====
let { MESSAGES: timeMsgs } = require('./events/timecheck');
let lastTimeSent = {};

function getPHTime() {
  const now = new Date();
  const ph = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  return { hour: ph.getHours(), min: ph.getMinutes(), dateStr: ph.toDateString() };
}

function runTimeCheck() {
  const { hour, min, dateStr } = getPHTime();
  for (const msg of timeMsgs) {
    const key = `${msg.hour}:${msg.min}:${dateStr}`;
    if (msg.hour === hour && msg.min === min && !lastTimeSent[key]) {
      lastTimeSent[key] = true;
      // Send to all active threads across all sessions
      for (const [sessionId, threads] of sessionThreads) {
        const api = botApis.get(sessionId);
        if (!api) continue;
        for (const tid of threads) {
          try { api.sendMessage(msg.text, tid); } catch(e) {}
        }
      }
      log('info', `TimeCheck sent: ${hour}:${String(min).padStart(2,'0')} PHT`);
    }
  }
  // Clean old keys
  const today = new Date().toDateString();
  Object.keys(lastTimeSent).forEach(k => { if (!k.endsWith(today)) delete lastTimeSent[k]; });
}
setInterval(runTimeCheck, 60000);

function startBotSession(sessionId, parsedAppState, prefix, adminUID, selectedCommands, selectedEvents, isRestart) {
  if (!login) { io.emit('bot-error', { sessionId, error: 'Facebook login library not available.' }); return; }
  sessionAppStates.set(sessionId, { parsedAppState, prefix, adminUID, selectedCommands, selectedEvents });
  sessionThreads.set(sessionId, new Set());

  login({ appState: parsedAppState }, (err, api) => {
    if (err) {
      log('error', `Bot login failed [${sessionId}]: ${err.message}`);
      io.emit('bot-error', { sessionId, error: err.message });
      return;
    }
    api.setOptions({ listenEvents: true, selfListen: false, logLevel: 'silent' });
    const botUID = api.getCurrentUserID();
    botApis.set(sessionId, api);

    if (!isRestart) {
      addSession(sessionId, { botName: 'NORA AI V12', prefix, adminUID, uid: botUID, selectedCommands, selectedEvents });
    } else {
      updateSession(sessionId, { status: 'active', uid: botUID });
    }
    io.emit('bot-started', { sessionId, botName: 'NORA AI V12', prefix, adminUID, uid: botUID, isRestart });
    log('success', `Bot ${isRestart ? 'restarted' : 'online'} [${sessionId}]`);

    api.listenMqtt((err, event) => {
      if (err) { log('error', `Listen [${sessionId}]: ${err.message}`); return; }
      updateSession(sessionId, { lastActivity: Date.now() });

      // Track active threads for time-check
      if (event.threadID) sessionThreads.get(sessionId)?.add(event.threadID);

      if (event.type === 'message' || event.type === 'message_reply') {
        const body = event.body || '';
        if (body.startsWith(prefix)) {
          const args = body.slice(prefix.length).trim().split(/\s+/);
          const cmdName = args.shift().toLowerCase();
          const cmd = liveCommands.get(cmdName);
          if (cmd) {
            // AI limit check in FB chat too
            if (cmdName === 'ai' || cmdName === 'ask' || cmdName === 'nora' || cmdName === 'gpt') {
              if (!checkAiLimit(event.senderID)) {
                api.sendMessage(`❌ 𝗔𝗜 𝗟𝗶𝗺𝗶𝘁 𝗥𝗲𝗮𝗰𝗵𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━\n📊 Daily limit: ${AI_DAILY_LIMIT} requests/day\n🕐 Resets at midnight (PHT)\n✨ 𝗡𝗢𝗥𝗔 𝗔𝗜 𝗩𝟭𝟮`, event.threadID, event.messageID);
                return;
              }
            }
            try {
              cmd.run({ api, event, args, commands: liveCommands, prefix, adminUID, botStartTime });
              const sess = getSessions().find(s => s.id === sessionId);
              updateSession(sessionId, { messageCount: (sess?.messageCount || 0) + 1 });
              io.emit('bot-message', { sessionId, type: 'command', command: cmdName, from: event.senderID, time: Date.now() });
            } catch(e) { log('error', `Cmd error ${cmdName}: ${e.message}`); }
          }
        }
      } else {
        for (const [, evt] of liveEvents) {
          if (evt.config.eventType && evt.config.eventType.includes(event.type)) {
            try { evt.run({ api, event, adminUID }); } catch(e) {}
          }
        }
      }
      io.emit('session-update', { sessions: getSessions() });
    });
  });
}

app.post('/api/start-bot', async (req, res) => {
  if (!login) return res.status(500).json({ error: 'Facebook login library not available.' });
  const { appState, prefix, adminUID, selectedCommands, selectedEvents } = req.body;
  if (!appState) return res.status(400).json({ error: 'AppState is required.' });
  if (!prefix) return res.status(400).json({ error: 'Prefix is required.' });
  if (!adminUID) return res.status(400).json({ error: 'Admin UID is required.' });
  let parsedAppState;
  try { parsedAppState = parseAppState(appState); } catch (e) { return res.status(400).json({ error: e.message }); }
  const sessionId = generateSessionId();
  res.json({ success: true, sessionId, message: 'Bot is starting...' });
  setTimeout(() => startBotSession(sessionId, parsedAppState, prefix, adminUID, selectedCommands, selectedEvents, false), 500);
});

app.post('/api/restart-bot', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });
  const stored = sessionAppStates.get(sessionId);
  if (!stored) return res.status(404).json({ error: 'Session not found or expired.' });
  updateSession(sessionId, { status: 'restarting' });
  io.emit('bot-restarting', { sessionId });
  res.json({ success: true, message: 'Restarting bot...' });
  setTimeout(() => startBotSession(sessionId, stored.parsedAppState, stored.prefix, stored.adminUID, stored.selectedCommands, stored.selectedEvents, true), 800);
});

app.post('/api/stop-bot', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });
  removeSession(sessionId);
  sessionAppStates.delete(sessionId);
  botApis.delete(sessionId);
  sessionThreads.delete(sessionId);
  io.emit('bot-stopped', { sessionId });
  res.json({ success: true });
});

io.on('connection', (socket) => {
  socket.emit('session-update', { sessions: getSessions() });
  socket.emit('commands-updated', { commands: getCommandList() });
  socket.emit('events-updated', { events: getEventList() });
  socket.emit('version', { version: VERSION });
});

setInterval(() => { io.emit('session-update', { sessions: getSessions() }); }, 5000);

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    log('error', `Port ${PORT} in use, retrying in 3s...`);
    setTimeout(() => server.listen(PORT, '0.0.0.0'), 3000);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log('success', `NORA AI V12 Dashboard → http://0.0.0.0:${PORT}`);
});
