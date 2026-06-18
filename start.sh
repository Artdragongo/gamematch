#!/bin/bash
echo ""
echo "🎮 Starting GameMatch..."
echo ""

# Start backend
cd "$(dirname "$0")/server"
node index.js &
SERVER_PID=$!
echo "✅ Backend running (PID $SERVER_PID)"

# Start frontend
cd "$(dirname "$0")/client"
echo "✅ Starting frontend..."
npm start &
CLIENT_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
