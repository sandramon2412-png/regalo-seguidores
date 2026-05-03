#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies
npm install

# Build the frontend
npm run build

# Start the Express server (serves both API and built frontend)
PORT=3000 nohup npx tsx server.ts > /tmp/app-server.log 2>&1 &
echo "Server started on port 3000 (PID: $!)"
