#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

vp run clean
vp run build:web

vp run @node-map/db#migrate

vp run dev:api &
vp run dev:web &

wait
