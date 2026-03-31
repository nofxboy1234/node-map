#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

vp run clean
vp run build:api
vp run build:web

vp run dev:api &
vp run @node-map/web#preview &

wait
