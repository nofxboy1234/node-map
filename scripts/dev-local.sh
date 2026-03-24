#!/usr/bin/env bash

set -euo pipefail

trap 'kill 0' EXIT

vp run dev:api &
vp run dev:web &

wait
