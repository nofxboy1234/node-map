#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

vp run clean
vp run build:api
VITE_API_URL=http://localhost:3000 vp run build:web

DATABASE_URL=postgresql:///node_map vp run @node-map/api#preview &
vp run @node-map/web#preview &

wait
