#!/usr/bin/env bash
set -e
echo "[post-merge] Installing dependencies..."
pnpm install --frozen-lockfile
echo "[post-merge] Done."
