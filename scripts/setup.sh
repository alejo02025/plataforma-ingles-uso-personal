#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) { console.error("English OS requiere Node.js 24."); process.exit(1); }'
npm ci --no-audit
npm run db:migrate
npm run build
