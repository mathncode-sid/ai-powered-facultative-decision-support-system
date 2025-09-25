#!/bin/bash
# Linux/macOS script to start all services for development

echo "🚀 Starting AI-Powered Facultative Reinsurance Backend Development Environment"
echo "=============================================================================="

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry is not installed. Please install Poetry first:"
    echo "   curl -sSL https://install.python-poetry.org | python3 -"
    echo "   or visit: https://python-poetry.org/docs/#installation"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies with Poetry..."
poetry install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Start Redis (if available)
echo "🔴 Starting Redis..."
if command -v redis-server &> /dev/null; then
    redis-server --daemonize yes
    sleep 2
    echo "✅ Redis started"
else
    echo "⚠️  Redis not found. Please install Redis or use Docker:"
    echo "   docker run -d -p 6379:6379 redis:alpine"
fi

# Start Celery worker in background
echo "🔄 Starting Celery worker..."
poetry run celery -A main_celery worker --loglevel=info --concurrency=2 &
CELERY_PID=$!

# Start FastAPI server
echo "🚀 Starting FastAPI server..."
echo ""
echo "=============================================================================="
echo "All services are starting up!"
echo "FastAPI Server: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "=============================================================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $CELERY_PID 2>/dev/null
    if command -v redis-server &> /dev/null; then
        redis-cli shutdown 2>/dev/null
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start FastAPI server (this will block)
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --reload
