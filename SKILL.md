---
name: automated-instrumented-debugging
description: 当 Claude Code 或 Codex 需要基于证据定位复杂 Bug 时使用：临时插入轻量级 HTTP 探针，收集跨函数、跨异步链或受限环境中的执行轨迹，在本地零依赖调试服务器里分析日志，并在修复后清理所有 `#region DEBUG` 插桩。
---

# 自动化插桩调试

遵循这个原则：先假设，后插桩；先看证据，再改代码。

## 快速开始

先解析技能目录，再运行脚本。优先使用第一个存在的路径：

```bash
SKILL_DIR="${CODEX_HOME:-$HOME/.codex}/skills/automated-instrumented-debugging"
[ -d "$SKILL_DIR" ] || SKILL_DIR="$HOME/.claude/skills/automated-instrumented-debugging"
[ -f "$SKILL_DIR/SKILL.md" ] || SKILL_DIR="."
```

启动服务器：

```bash
node "$SKILL_DIR/scripts/bootstrap.js"
```

查看会话和证据：

```bash
curl http://localhost:9876/sessions
curl http://localhost:9876/logs/{session}
```

清理插桩并关闭服务：

```bash
node "$SKILL_DIR/scripts/cleanup.js"
```

## 工作方式

1. 先用 1-3 个可验证的假设缩小范围，不要一上来大面积加日志。
2. 只在最有信息增益的位置插桩：函数入口、关键分支、异常路径、返回点、异步边界。
3. 所有调试代码都包在 `// #region DEBUG ... // #endregion` 中，保证可批量清理。
4. 重现问题后立即读取日志，按时间线比对假设。
5. 修复后先验证，再运行清理脚本，避免把探针留在仓库里。

## 插桩模板

优先复用这个最小模板，并把 `session` 设计成一次调试唯一值。

### 1. 入口探针

```typescript
// #region DEBUG - {SESSION}
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: '{SESSION}',
    type: 'enter',
    fn: '{FUNC}',
    file: '{FILE_PATH}',
    data: { arg1, arg2 },
  }),
}).catch(() => {});
// #endregion
```

### 2. 状态快照

```typescript
// #region DEBUG - {SESSION}
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: '{SESSION}',
    type: 'var',
    fn: '{FUNC}',
    file: '{FILE_PATH}',
    data: { varName: value },
  }),
}).catch(() => {});
// #endregion
```

### 3. 退出探针

```typescript
// #region DEBUG - {SESSION}
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: '{SESSION}',
    type: 'exit',
    fn: '{FUNC}',
    data: { result },
  }),
}).catch(() => {});
// #endregion
```

### 4. 错误探针

```typescript
// #region DEBUG - {SESSION}
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: '{SESSION}',
    type: 'error',
    fn: '{FUNC}',
    data: { error: err.message, stack: err.stack },
  }),
}).catch(() => {});
// #endregion
```

## 分析规则

- 先确认关键函数是否真的执行，再看变量是否偏离预期。
- 优先找第一条异常日志之前的最后一条正常日志。
- 对异步链问题，使用同一个 `session` 串起入口、回调、错误分支。
- 如果需要多轮插桩，每轮换一个新 `session`，避免混淆旧证据。

## 避免这些问题

- 不要在未定义变量之前插桩。
- 不要把 `fetch` 写成会阻断业务逻辑的同步依赖；始终保留 `.catch(() => {})`。
- 不要在无假设的情况下满仓插桩。
- 不要提交残留的 `#region DEBUG` 代码块。
