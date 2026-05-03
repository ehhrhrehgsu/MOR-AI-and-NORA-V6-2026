const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const login = require('fca-unofficial');
const {
  log,
  loadCommands,
  loadEvents,
  addSession,
  removeSession,
  updateSession,
  getSessions,
  generateSessionId,
  parseAppState
} = require('./utils');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const commands = loadCommands();
const events = loadEvents();
const botStartTime = Date.now();

log('info', `Loaded ${commands.size} commands, ${events.size} events`);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/sessions', (req, res) => {
  res.json({ sessions: getSessions() });
});

app.get('/api/commands', (req, res) => {
  const list = [...commands.values()].map(c => ({
    name: c.config.name,
    description: c.config.description,
    category: c.config.category,
    usage: c.config.usage
  }));
  res.json({ commands: list });
});

app.get('/api/events', (req, res) => {
  const list = [...events.values()].map(e => ({
    name: e.config.name,
    description: e.config.description,
    eventType: e.config.eventType
  }));
  res.json({ events: list });
});

app.post('/api/start-bot', async (req, res) => {
  const { appState, prefix, adminUID, selectedCommands, selectedEvents } = req.body;

  if (!appState) return res.status(400).json({ error: 'AppState is required.' });
  if (!prefix) return res.status(400).json({ error: 'Prefix is required.' });
  if (!adminUID) return res.status(400).json({ error: 'Admin UID is required.' });

  let parsedAppState;
  try {
    parsedAppState = parseAppState(appState);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const sessionId = generateSessionId();

  res.json({ success: true, sessionId, message: 'Bot is starting up...' });

  setTimeout(() => {
    login({ appState: parsedAppState }, (err, api) => {
      if (err) {
        log('error', `Bot login failed [${sessionId}]: ${err.message}`);
        io.emit('bot-error', { sessionId, error: err.message });
        return;
      }

      log('success', `Bot logged in successfully [${sessionId}]`);

      api.setOptions({
        listenEvents: true,
        selfListen: false,
        logLevel: 'silent'
      });

      let botName = 'NORA AI';
      try {
        const uid = api.getCurrentUserID();
        addSession(sessionId, {
          botName,
          prefix,
          adminUID,
          uid,
          selectedCommands,
          selectedEvents
        });
        io.emit('bot-started', { sessionId, botName, prefix, adminUID, uid });
      } catch (e) {
        addSession(sessionId, { botName, prefix, adminUID, selectedCommands, selectedEvents });
        io.emit('bot-started', { sessionId, botName, prefix, adminUID });
      }

      const enabledCmds = new Map();
      if (selectedCommands && selectedCommands.length > 0) {
        for (const name of selectedCommands) {
          if (commands.has(name)) enabledCmds.set(name, commands.get(name));
        }
      } else {
        commands.forEach((v, k) => enabledCmds.set(k, v));
      }

      const enabledEvts = new Map();
      if (selectedEvents && selectedEvents.length > 0) {
        for (const name of selectedEvents) {
          if (events.has(name)) enabledEvts.set(name, events.get(name));
        }
      } else {
        events.forEach((v, k) => enabledEvts.set(k, v));
      }

      const stopListen = api.listenMqtt((err, event) => {
        if (err) {
          log('error', `Listen error [${sessionId}]: ${err.message}`);
          return;
        }

        updateSession(sessionId, { lastActivity: Date.now() });

        if (event.type === 'message' || event.type === 'message_reply') {
          const body = event.body || '';
          const isCommand = body.startsWith(prefix);

          if (isCommand) {
            const args = body.slice(prefix.length).trim().split(/\s+/);
            const cmdName = args.shift().toLowerCase();
            const cmd = enabledCmds.get(cmdName);

            if (cmd) {
              try {
                cmd.run({ api, event, args, commands: enabledCmds, prefix, adminUID, botStartTime });
                updateSession(sessionId, {
                  messageCount: (getSessions().find(s => s.id === sessionId)?.messageCount || 0) + 1
                });
                io.emit('bot-message', {
                  sessionId,
                  type: 'command',
                  command: cmdName,
                  from: event.senderID,
                  time: Date.now()
                });
              } catch (e) {
                log('error', `Command error ${cmdName}: ${e.message}`);
              }
            }
          }
        } else {
          for (const [, evt] of enabledEvts) {
            if (evt.config.eventType && evt.config.eventType.includes(event.type)) {
              try {
                evt.run({ api, event, adminUID });
              } catch (e) {
                log('error', `Event error ${evt.config.name}: ${e.message}`);
              }
            }
          }
        }

        io.emit('session-update', { sessions: getSessions() });
      });

      io.on('stop-bot', (data) => {
        if (data.sessionId === sessionId) {
          if (typeof stopListen === 'function') stopListen();
          removeSession(sessionId);
          io.emit('bot-stopped', { sessionId });
          log('info', `Bot stopped [${sessionId}]`);
        }
      });
    });
  }, 500);
});

app.post('/api/stop-bot', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });
  removeSession(sessionId);
  io.emit('bot-stopped', { sessionId });
  res.json({ success: true });
});

io.on('connection', (socket) => {
  log('info', `Dashboard connected: ${socket.id}`);
  socket.emit('session-update', { sessions: getSessions() });
  socket.on('disconnect', () => {
    log('info', `Dashboard disconnected: ${socket.id}`);
  });
});

setInterval(() => {
  io.emit('session-update', { sessions: getSessions() });
}, 5000);

server.listen(PORT, '0.0.0.0', () => {
  log('success', `NORA AI V10 Dashboard running on http://0.0.0.0:${PORT}`);
});
