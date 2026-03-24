#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

vp run clean
vp run build:api
vp run build:web

vp run @node-map/api#preview &
vp run @node-map/web#preview &

wait
