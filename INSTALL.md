# Automated Instrumented Debugging - Installation Guide

GitHub: [https://github.com/MinLeeV5/automated-instrumented-debugging-skill](https://github.com/MinLeeV5/automated-instrumented-debugging-skill)

## Quick Start

### 1. Automatic Installation (Recommended)

You can use the [vercel-labs/skills](https://github.com/vercel-labs/skills) utility to install this skill globally for your preferred AI agent:

```bash
npx skills add MinLeeV5/automated-instrumented-debugging-skill
```

### 2. Manual Installation (Global)

Copy the skill contents to the specialized directory for your agent:

- **Antigravity**: `~/.gemini/antigravity/skills/`
- **Claude Code**: `~/.claude/skills/`
- **OpenCode**: `~/.config/opencode/skills/`

### 3. Project-Level Use (Native Support)

This project is already configured with a `.agent/` directory. Antigravity and compatible agents will **automatically detect** all skills and workflows when you open this workspace.

- **Skills**: `.agent/skills/automated-instrumented-debugging/`
- **Workflows**: `.agent/workflows/automated-debug.md`

## File Structure (Current Project)

The project follows the standard Agentic structure:

```text
automated-instrumented-debugging/
├── .agent/
│   ├── skills/
│   │   └── automated-instrumented-debugging/
│   │       ├── SKILL.md         # Skill definitions
│   │       └── scripts/         # Implementation logic
│   │           ├── debug-server.js
│   │           ├── bootstrap.js
│   │           └── cleanup.js
│   └── workflows/
│       └── automated-debug.md   # Step-by-step guides
├── examples/                    # Usage demonstrations
└── INSTALL.md                   # You are here
```

## Verify Installation

```bash
# Check files exist in the project
ls -R .agent

# Test the debug server
node .agent/skills/automated-instrumented-debugging/scripts/bootstrap.js
# Should show: Debug Log Server running at http://localhost:9876
```

## Usage

### Workflow Summary

1. **Start server**: `node .agent/skills/automated-instrumented-debugging/scripts/bootstrap.js`
2. **AI inserts fetch calls** with `#region DEBUG` wrappers
3. **Run code** to trigger the bug
4. **Query logs**: `curl http://localhost:9876/logs/{session}`
5. **Revert code**: `node .agent/skills/automated-instrumented-debugging/scripts/cleanup.js`
6. **Stop server**: `curl -X DELETE http://localhost:9876/shutdown`
