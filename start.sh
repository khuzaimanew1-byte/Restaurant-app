#!/bin/bash
set -e

# Start API server on port 8080 in background
PORT=8080 node --enable-source-maps ./artifacts/api-server/dist/main.mjs &
API_PID=$!

# Start frontend on port 5000
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/onboarding run dev

# If frontend exits, kill the API
kill $API_PID 2>/dev/null || true
