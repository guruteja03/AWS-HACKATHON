@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist backend\node_modules call npm --prefix backend install
if not exist frontend\node_modules call npm --prefix frontend install
start "" http://localhost:5173
npm run dev
