#!/bin/bash

# Start the backend server
echo "Starting backend server..."
node server/index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start the frontend
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "✅ Backend server running on port 5001"
echo "✅ Frontend running (check terminal output)"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
