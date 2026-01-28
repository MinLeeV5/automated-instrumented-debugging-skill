# TypeScript 调试示例

本目录提供了一个简单的购物车结算系统的调试示例。

## 场景描述

`buggy-code.ts` 模拟了一个处理订单的系统。当以 `guest` 用户身份运行时，系统会因获取不到购物车项目而受到影响。我们将通过自动化插桩来追踪这一过程。

## 核心流程

### 1. 启动服务器

自动化插桩系统依赖一个本地日志服务器来聚合数据。

```bash
node ../../.agent/skills/automated-instrumented-debugging/scripts/debug-server.js
```

### 2. 插桩演示

`instrumented-code.ts` 展示了如何使用 `#region DEBUG` 包装器注入探针：

- **Trace**: 记录函数进入。
- **Variable**: 记录关键变量状态。
- **Error**: 捕获潜在异常。

### 3. 查看证据

运行代码后，可以通过 REST API 获取证据链：

```bash
curl http://localhost:9876/logs/bug-guest-order
```

## 运行 Demo

我们提供了一个脚本来自动化上述过程：

```bash
chmod +x run-demo.sh
./run-demo.sh
```

## 清理

调试完成后，可以使用以下命令移除所有调试代码：

```bash
node ../../.agent/skills/automated-instrumented-debugging/scripts/cleanup.js
```
