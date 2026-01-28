const fs = require('fs');
const path = require('path');
const http = require('http');

/**
 * Cleanup script to remove #region DEBUG ... #endregion blocks from files.
 * This avoids using 'git checkout .' which might revert user's own changes.
 */

const DEBUG_REGION_START = /\/\/ #region DEBUG/i;
const DEBUG_REGION_PATTERN = /\/\/\s*#region\s+DEBUG[\s\S]*?\/\/\s*#endregion[\s\r\n]*/gi;

// Configurable exclusion list
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.agent', 'dist', 'build', '.next', 'out']);
const SUPPORTED_EXTS = new Set(['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.java', '.c', '.cpp', '.h', '.cs', '.mjs', '.cjs']);

function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (DEBUG_REGION_START.test(content)) {
      const newContent = content.replace(DEBUG_REGION_PATTERN, '');
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`[CLEANUP] Removed debug blocks from: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`[ERROR] Failed to process ${filePath}: ${err.message}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.has(file)) {
        walkDir(fullPath);
      }
    } else {
      const ext = path.extname(fullPath);
      if (SUPPORTED_EXTS.has(ext)) {
        cleanupFile(fullPath);
      }
    }
  }
}

function shutdownServer() {
  const PORT = process.env.DEBUG_PORT || 9876;
  console.log(`[SHUTDOWN] Attempting to stop debug server on port ${PORT}...`);

  const req = http.request({
    hostname: 'localhost',
    port: PORT,
    path: '/shutdown',
    method: 'DELETE'
  }, (res) => {
    console.log(`[SHUTDOWN] Server responded with status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.log(`[SHUTDOWN] Server not reachable or already stopped: ${err.message}`);
  });

  req.end();
}

const targetDir = process.cwd();
console.log(`[START] Cleaning up debug instrumentation in: ${targetDir}`);
walkDir(targetDir);
console.log(`[DONE] File cleanup complete.`);

// Automatically try to shutdown the server
shutdownServer();
