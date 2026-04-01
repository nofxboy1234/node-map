#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

vp run clean
vp run build:web
vp run build:api

vp run dev:api &

wait
