#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

DATABASE_URL=postgresql:///node_map vp run dev:api &
VITE_API_URL=http://localhost:3000 vp run dev:web &

wait
