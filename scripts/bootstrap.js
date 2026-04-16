#!/usr/bin/env node
/**
 * Bootstrap script for Automated Instrumented Debugging
 * Handles environment checks and starts the debug server.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVER_PATH = path.join(__dirname, 'debug-server.js');

console.log('🚀 Initializing Automated Instrumented Debugging Environment...');

// 1. Check Node.js version
const nodeVersion = process.versions.node.split('.')[0];
if (parseInt(nodeVersion) < 14) {
  console.error('❌ Error: Node.js version 14 or higher is required.');
  process.exit(1);
}

// 2. Start Debug Server
console.log(`📡 Starting Debug Server: ${SERVER_PATH}`);

const server = spawn('node', [SERVER_PATH], {
  stdio: 'inherit',
  env: { ...process.env, DEBUG_PORT: process.env.DEBUG_PORT || '9876' }
});

server.on('error', (err) => {
  console.error('❌ Failed to start debug server:', err.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
});
