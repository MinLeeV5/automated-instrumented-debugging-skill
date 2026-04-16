# Automated Instrumented Debugging - Installation Guide

GitHub: [https://github.com/MinLeeV5/automated-instrumented-debugging-skill](https://github.com/MinLeeV5/automated-instrumented-debugging-skill)

## Quick Start

### 1. Automatic Installation (Recommended)

You can use the [vercel-labs/skills](https://github.com/vercel-labs/skills) utility to install this skill globally for your preferred AI agent:

```bash
npx skills add MinLeeV5/automated-instrumented-debugging-skill
```

### 2. Manual Installation (Global)

Copy or clone the repository root into one of these destinations:

- **Claude Code**: `~/.claude/skills/automated-instrumented-debugging`
- **Codex**: `~/.codex/skills/automated-instrumented-debugging`

## File Structure (Current Project)

The project now exposes one skill only:

```text
.
├── SKILL.md
├── agents/
│   └── openai.yaml
├── scripts/
│   ├── debug-server.js
│   ├── bootstrap.js
│   └── cleanup.js
└── examples/
    └── typescript-demo/
```

## Verify Installation

```bash
# Check files exist in the project
ls -R .

# Test the debug server
node scripts/bootstrap.js
# Should show: Debug Log Server running at http://localhost:9876
```

## Usage

### Workflow Summary

1. **Start server**: `node scripts/bootstrap.js`
2. **AI inserts fetch calls** with `#region DEBUG` wrappers
3. **Run code** to trigger the bug
4. **Query logs**: `curl http://localhost:9876/logs/{session}`
5. **Revert code**: `node scripts/cleanup.js`
6. **Stop server**: `curl -X DELETE http://localhost:9876/shutdown`
