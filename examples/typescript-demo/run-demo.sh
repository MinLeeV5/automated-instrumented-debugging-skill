#!/bin/bash

echo "=== Automated Instrumented Debugging Demo ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_SCRIPT="$SCRIPT_DIR/../../.agent/skills/automated-instrumented-debugging/scripts/debug-server.js"

echo "Step 1: Starting debug server..."
node "$SERVER_SCRIPT" &
SERVER_PID=$!
sleep 1

echo ""
echo "Step 2: Running instrumented code..."
echo ""
npx tsx "$SCRIPT_DIR/instrumented-code.ts"

echo ""
echo "Step 3: Querying collected logs..."
echo ""
curl -s http://localhost:9876/logs/bug-guest-order | npx -y json

echo ""
echo "Step 4: Stopping server..."
kill $SERVER_PID 2>/dev/null

echo ""
echo "=== Demo Complete ==="
