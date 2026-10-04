#!/bin/sh
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
[ -d backend/node_modules ] || npm --prefix backend install
[ -d frontend/node_modules ] || npm --prefix frontend install
npm run dev
