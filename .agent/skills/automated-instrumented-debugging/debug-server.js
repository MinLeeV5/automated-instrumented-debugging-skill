#!/usr/bin/env node
/**
 * Debug Log Server - Zero-dependency log collection service
 * 
 * Usage: node debug-server.js
 * Port:  DEBUG_PORT=9876 (default)
 * 
 * API:
 *   POST /log              - Send log entry
 *   GET  /sessions         - List all sessions  
 *   GET  /logs/:session    - Query logs (?fn=&type=&limit=)
 *   DELETE /logs/:session  - Clear session logs
 *   GET  /                 - Server status
 */

const http = require('http');
const os = require('os');
const { randomBytes } = require('crypto');

const PORT = parseInt(process.env.DEBUG_PORT || '9876');
const IDLE_TIMEOUT = parseInt(process.env.DEBUG_IDLE_TIMEOUT || (10 * 60 * 1000).toString()); // Default 10 mins
const logs = new Map();
const startTime = Date.now();
let lastRequestTime = Date.now();

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
}

function generateId() {
  return `log_${Date.now()}_${randomBytes(3).toString('hex')}`;
}

function resetIdleTimer() {
  lastRequestTime = Date.now();
}

const idleChecker = setInterval(() => {
  const idleTime = Date.now() - lastRequestTime;
  if (idleTime > IDLE_TIMEOUT) {
    console.log(`[${new Date().toISOString()}] Server idle for ${Math.round(idleTime / 1000)}s. Shutting down automatically...`);
    clearInterval(idleChecker);
    process.emit('SIGINT');
  }
}, 30000); // Check every 30s

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data, null, 2));
}

function formatTime(ts) {
  return new Date(ts).toISOString().replace('T', ' ').substring(0, 19);
}

async function handleRequest(req, res) {
  resetIdleTimer();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    if (method === 'POST' && path === '/log') {
      const body = await parseBody(req);
      const session = body.session || 'default';
      const entry = {
        id: generateId(),
        ts: Date.now(),
        type: body.type || 'log',
        fn: body.fn || body.function,
        file: body.file,
        line: body.line,
        data: body.data,
        msg: body.msg || body.message
      };

      Object.keys(entry).forEach(k => entry[k] === undefined && delete entry[k]);

      if (!logs.has(session)) logs.set(session, []);
      logs.get(session).push(entry);

      const fnInfo = entry.fn ? ` ${entry.fn}` : '';
      const msgInfo = entry.msg ? ` - ${entry.msg}` : '';
      console.log(`[${formatTime(entry.ts)}] [${session}] ${entry.type}${fnInfo}${msgInfo}`);

      return json(res, { id: entry.id });
    }

    if (method === 'GET' && path === '/sessions') {
      const sessions = [];
      for (const [id, entries] of logs) {
        sessions.push({
          id,
          count: entries.length,
          firstAt: entries[0]?.ts,
          lastAt: entries[entries.length - 1]?.ts
        });
      }
      return json(res, { sessions });
    }

    const logsMatch = path.match(/^\/logs\/([^/]+)$/);
    if (method === 'GET' && logsMatch) {
      const session = decodeURIComponent(logsMatch[1]);
      let entries = logs.get(session) || [];

      const fn = url.searchParams.get('fn');
      const type = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '0');

      if (fn) entries = entries.filter(e => e.fn === fn);
      if (type) entries = entries.filter(e => e.type === type);
      if (limit > 0) entries = entries.slice(-limit);

      return json(res, { session, count: entries.length, logs: entries });
    }

    const deleteMatch = path.match(/^\/logs\/([^/]+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const session = decodeURIComponent(deleteMatch[1]);
      const count = logs.get(session)?.length || 0;
      logs.delete(session);
      console.log(`[${formatTime(Date.now())}] Deleted session: ${session} (${count} logs)`);
      return json(res, { deleted: count });
    }

    if (method === 'DELETE' && path === '/shutdown') {
      console.log(`[${formatTime(Date.now())}] Explicit shutdown requested.`);
      json(res, { message: 'Shutting down...' });
      setTimeout(() => process.emit('SIGINT'), 100);
      return;
    }

    if (method === 'GET' && path === '/') {
      let totalLogs = 0;
      for (const entries of logs.values()) totalLogs += entries.length;

      return json(res, {
        name: 'Debug Log Server',
        version: '1.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        totalLogs,
        sessions: logs.size,
        api: {
          'POST /log': 'Send log: {session?, type?, fn?, file?, line?, data?, msg?}',
          'GET /sessions': 'List all sessions',
          'GET /logs/:session': 'Get logs (query: ?fn=&type=&limit=)',
          'DELETE /logs/:session': 'Clear session logs'
        }
      });
    }

    json(res, { error: 'Not Found', path }, 404);

  } catch (err) {
    console.error('Error:', err.message);
    json(res, { error: err.message }, 400);
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, '0.0.0.0', () => {
  const networkIP = getNetworkAddress();
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                      Debug Log Server v1.0.0                      ║
╠═══════════════════════════════════════════════════════════════════╣
║  Local:    http://localhost:${PORT}                                 ║
║  Network:  http://${networkIP}:${PORT}                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  API:                                                             ║
║    POST /log              Send log entry                          ║
║    GET  /sessions         List all sessions                       ║
║    GET  /logs/:session    Query logs (?fn=&type=&limit=)          ║
║    DELETE /logs/:session  Clear session logs                      ║
╠═══════════════════════════════════════════════════════════════════╣
║  Press Ctrl+C to stop                                             ║
╚═══════════════════════════════════════════════════════════════════╝
`);
});

process.on('SIGINT', () => {
  console.log('\n\nShutting down Debug Log Server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
