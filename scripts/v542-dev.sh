#!/usr/bin/env bash
# V54.2 — helper local : rebuild propre + (re)démarrage d'UNE instance serveur.
# Tolérant aux codes de retour (pkill/fuser renvoient 1 quand il n'y a rien à tuer).
set +e
PORT="${1:-3220}"
cd "$(dirname "$0")/.." || exit 1

pkill -9 -f 'next-server' >/dev/null 2>&1
pkill -9 -f 'next start'  >/dev/null 2>&1
sleep 1

npm run build > /tmp/v542-build.log 2>&1
BUILD=$?
if [ "$BUILD" -ne 0 ]; then
  echo "BUILD FAILED ($BUILD)"; tail -25 /tmp/v542-build.log; exit 1
fi
echo "build OK"

# progress.json remis à la baseline gelée AVANT de servir (jamais pendant les tests).
node -e 'const fs=require("fs");const en="2026-08-03T23:05:41.225Z";fs.writeFileSync("data/progress.json",JSON.stringify({schemaVersion:3,activeTrackId:"ai-engineer-foundations-v1",tracks:{"ai-engineer-foundations-v1":{version:"1",enrolledAt:en,lastOpenedAt:en,startDate:null,days:{},skills:{},weeklyReviews:{},monthlyReviews:{}}}},null,2));'

nohup npx next start -p "$PORT" > "/tmp/v542-srv-$PORT.log" 2>&1 &
for i in $(seq 1 30); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null && { echo "server READY on $PORT (${i}s)"; exit 0; }
  sleep 1
done
echo "server FAILED to start"; tail -15 "/tmp/v542-srv-$PORT.log"; exit 1
