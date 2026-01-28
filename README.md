# 自动化插桩调试 (Automated Instrumented Debugging)

[![Antigravity](https://img.shields.io/badge/Agent-Antigravity-blue)](https://github.com/google-deepmind/antigravity)
[![Claude Code](https://img.shields.io/badge/Agent-Claude_Code-8555e3)](https://claude.ai/)
[![OpenCode](https://img.shields.io/badge/Agent-OpenCode-black)](https://opencode.com/)
[![Platform](https://img.shields.io/badge/Platform-Node.js-green)](https://nodejs.org/)

这是一个专为 AI Agent（如 Antigravity, Claude Code, OpenCode）设计的**自动化插桩调试系统**。它将传统的“打印日志”升级为一种**系统化的证据搜集流**。

[English Version](./README-EN.md)

## 1. 技术原理

本工具的核心理念是：**AI 负责插桩，系统负责聚合，开发者负责分析。**

### 1.1 系统架构

通过轻量级的 HTTP 协议，将受测程序的内部状态解耦并传输至中心化调试服务器。

```mermaid
graph TD
    subgraph "AIAgent"
        A1["策略制定"] --> A2["自动化插桩"]
        A3["证据检索"] --> A4["结果分析"]
    end

    subgraph "Target Environment"
        T1["Target Code"] -- "POST /log (fetch)" --> S1
    end

    subgraph "Debug Infrastructure"
        S1["Debug Server (Port: 9876)"] -- "JSON Store" --> S2[("Trace Logs")]
    end

    A2 --> T1
    S1 --> A3
```

### 1.2 核心工作流

采用 **4 阶段系统化调试法**，确保证据链的完整性：

```mermaid
graph LR
    P1["策略 & 设置"] --> P2["自动化插桩"]
    P2 --> P3["证据搜集 & 分析"]
    P3 --> P4["修复 & 清理"]
```

1.  **策略 & 设置**: AI 识别潜在故障点，启动 `debug-server`。
2.  **自动化插桩**: AI 在关键路径插入 `#region DEBUG` 包装的代码块。
3.  **证据搜集 & 分析**: 运行程序，通过 API 检索执行轨迹和变量快照。
4.  **修复 & 清理**: 确认修复后，运行 `cleanup.js` 自动回滚所有调试代码。

---

## 2. 快速开始 (AI Guide)

> [!TIP]
> 这里的步骤主要供 AI Agent 参考，人类开发者只需了解命令即可。

### 第一步：启动服务器

```bash
node .agent/skills/automated-instrumented-debugging/debug-server.js
```

### 第二步：插桩模板

AI 会在代码中插入如下结构（带有唯一 `session` ID）：

```javascript
// #region DEBUG - session_4b2a
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session: 'session_4b2a', type: 'trace', data: { varA } }),
}).catch(() => {});
// #endregion
```

### 第三步：证据检索

```bash
curl http://localhost:9876/logs/session_4b2a
```

### 第四步：一键清理

```bash
node .agent/skills/automated-instrumented-debugging/cleanup.js
```

---

## 3. 项目结构

项目遵循 **Standard Agentic Skill** 规范：

```text
.agent/
└── skills/
    └── automated-instrumented-debugging/
        ├── SKILL.md         # AI 技能指令集 (核心)
        ├── debug-server.js  # 纯 JS 日志服务器 (零依赖)
        └── cleanup.js       # 安全插桩清理工具
workflows/
└── automated-debug.md       # 标准化调试流程定义
```

## 4. 更多资源

- [详细安装指南](./INSTALL.md)
- [英文文档](./README-EN.md)

---

由 Antigravity 强力驱动。
