const fs = require('fs');
const path = require('path');

/**
 * Cleanup script to remove #region DEBUG ... #endregion blocks from files.
 * This avoids using 'git checkout .' which might revert user's own changes.
 */

const DEBUG_REGION_START = /\/\/ #region DEBUG/g;
const DEBUG_REGION_PATTERN = /\/\/\s*#region DEBUG[\s\S]*?\/\/\s*#endregion\s*\n?/g;

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
      if (file !== 'node_modules' && file !== '.git' && file !== '.agent') {
        walkDir(fullPath);
      }
    } else {
      const ext = path.extname(fullPath);
      if (['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.java', '.c', '.cpp', '.h', '.cs'].includes(ext)) {
        cleanupFile(fullPath);
      }
    }
  }
}

const targetDir = process.cwd();
console.log(`[START] Cleaning up debug instrumentation in: ${targetDir}`);
walkDir(targetDir);
console.log(`[DONE] Cleanup complete.`);
