---
description: 自动化插桩系统化调试工作流 - /automated-debug [description]
---

# Automated Systematic Debugging

$ARGUMENTS

---

## 目的

此工作流激活**自动化插桩调试模式**。它结合了“系统化调试思维”与“自动化证据搜集”工具，用于解决无法通过简单日志定位的复杂问题。

---

## 工作流程

当 `/automated-debug` 被触发时，请严格遵循以下步骤：

### 1. 准备与假设 (Strategy)

- **启动服务器**: (// turbo) `node .agent/skills/automated-instrumented-debugging/debug-server.js`
- **分析症状**: 理解用户报告的 Bug。
- **提出假设**: 列出 1-3 个最可能的根本原因。
- **制定计划**: 决定在何处插入探针 (`fetch`) 以验证假设。

### 2. 插桩执行 (Instrumentation)

- **参考技能**: 阅读 `.agent/skills/automated-instrumented-debugging/SKILL.md` 获取模板。
- **植入探针**: 在关键路径插入 `#region DEBUG` 代码块。
  - _Trace_: 追踪函数进入/退出。
  - _State_: 捕获关键变量快照。
  - _Error_: 捕获异常堆栈。

### 3. 证据搜集 (Evidence)

- **触发 Bug**: 运行能够复现问题的测试或脚本。
- **获取证据**: `curl http://localhost:9876/logs/{session}`
- **验证假设**: 对比日志数据与预期行为。

### 4. 分析与修复 (Resolution)

- **根本原因**: 基于证据确定 Root Cause。
- **实施修复**: 修改代码并验证。
- **清理环境**:
  - 移除插桩: `git checkout src/` (或手动移除 `#region DEBUG` 块)
  - 关闭服务器: `curl -X DELETE http://localhost:9876/shutdown`

---

## 输出模板

在执行过程中，请按照以下格式输出你的调试进度：

````markdown
## 🔬 Automated Debug: [Issue Summary]

### 1. Hypothesis & Plan

_推测原因_：[描述]
_插桩策略_：将在 [File:Line] 插入 [Type] 探针。

### 2. Evidence Analysis

_日志数据_：

```json
{ "type": "var", "fn": "calc", "data": { "val": NaN } }
```
````

_结论_：数据证明了 [假设] 成立/不成立。

### 3. Root Cause

🎯 **[根本原因解释]**

### 4. Fix & Cleanup

- [x] 代码已修复
- [x] 插桩代码已移除
- [x] 调试服务器已关闭

```

---

## 关键原则

- **Don't Guess, Measure**: 一切以 `debug-server` 搜集到的数据为准。
- **Clean Up**: 严禁提交调试用的 `#region DEBUG` 代码。
- **Systematic**: 不要盲目插桩，先有假设再行动。
```
