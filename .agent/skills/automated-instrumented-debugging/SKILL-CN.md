---
name: automated-instrumented-debugging
description: 一种系统化的调试能力，通过动态插桩自动化搜集证据。适用于手动追踪繁琐或环境受限的场景。
allowed-tools: replace_file_content, run_command, read_url_content
---

# 自动化插桩调试 (Automated Instrumented Debugging)

> **核心哲学**：不要猜测。插桩、测量，让数据揭示根本原因。

## 概述

本技能通过在代码中系统地注入轻量级探针（`fetch` 调用），赋予你调试复杂问题的能力。这些探针将实时执行数据（函数进入、变量状态、错误）流式传输到本地调试服务器，从而让你能够重构确切的执行流，而无需依赖分散的控制台日志或交互式调试器。

## 何时使用

- **复杂性**：Bug 涉及跨越 3 个以上函数或异步链的数据流。
- **不可见性**：代码运行在盲环境（Docker、CI、远程服务器）中。
- **持久性**：你需要在执行后分析事件的时间轴。
- **系统化分析**：你需要确凿的证据来证明假设。

## 系统化调试流程

遵循以下 4 阶段循环，高效解决问题。

### 阶段 1：策略与设置

不要急于编码。首先，定义你需要捕捉的内容。

1. **启动服务器**：确保 `debug-server.js` 正在运行（`node .agent/skills/automated-instrumented-debugging/debug-server.js`）。
2. **提出假设**：哪个变量或流程可能出了问题？
3. **规划探针**：决定在何处放置 `#region DEBUG` 块（进入、退出、错误、状态）。

### 阶段 2：插桩（探针）

使用标准模板注入探针。**务必**使用 `#region DEBUG` 包装器，以便于清理。

- **追踪流**：记录函数进入/退出来查看执行路径。
- **快照状态**：记录局部变量和参数。
- **捕获错误**：在关键路径记录 `try-catch` 块。

_（参见下文的“插桩模板”以获取代码模式）_

### 阶段 3：证据搜集与分析

运行复现案例，让数据说话。

1. **触发**：运行测试/脚本以复现 Bug。
2. **查询**：通过 `curl http://localhost:9876/logs/{session}` 获取日志。
3. **分析**：
   - _函数被调用了吗？_（查看 Entry 日志）
   - _数据正确吗？_（查看 Variable 日志）
   - _在哪里崩溃的？_（查看 Error 日志/最后一条成功的日志）

### 阶段 4：解决与清理

修复根本原因并恢复代码库。

1. **修复**：根据证据实施修复。
2. **验证**：运行测试以确认修复方案。
3. **清理**：**至关重要！** 使用清理脚本移除所有 `#region DEBUG` 块：
   ```bash
   node .agent/skills/automated-instrumented-debugging/cleanup.js
   ```
4. **关闭**：如果不再需要，停止调试服务器。

## 插桩模板

### 1. 函数进入（追踪路径）

```typescript
// #region DEBUG - {SESSION}
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: '{SESSION}',
    type: 'enter',
    fn: '{FUNC}',
    file: '{FILE}',
    data: { arg1, arg2 }, // 快照参数
  }),
}).catch(() => {});
// #endregion
```

### 2. 变量快照（检查状态）

```typescript
// #region DEBUG - {SESSION}
fetch('http://localhost:9876/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session: '{SESSION}',
    type: 'var',
    fn: '{FUNC}',
    data: { varName, computedValue },
  }),
}).catch(() => {});
// #endregion
```

### 3. 函数退出（结果与消耗时间）

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

### 4. 错误捕获（捕获并报告）

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

## 反模式

❌ **盲目插桩**：在没有计划的情况下，到处撒 `console.log` 或探针。
-> _修正_：先规划具体问题（“X 是否等于 Y？”）。

❌ **忽略上下文**：只记录“发生了错误”，而不记录变量 `id` 或 `state`。
-> _修正_：务必在 JSON 正文中包含相关的 `data`。

❌ **残留代码**：提交包含 `#region DEBUG` 的代码。
-> _修正_：在最终提交前务必验证清理结果。

❌ **遗留服务器**：在没有目标的情况下，让调试服务器无限期运行。
-> _修正_：完成后使用显式关闭 API。
