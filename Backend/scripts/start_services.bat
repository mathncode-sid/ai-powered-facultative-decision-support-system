@echo off
REM Windows batch script to start all services for development

echo Starting AI-Powered Facultative Reinsurance Backend Development Environment
echo ======================================================================

REM Check if Poetry is installed
poetry --version >nul 2>&1
if errorlevel 1 (
    echo Poetry is not installed. Please install Poetry first.
    echo Visit: https://python-poetry.org/docs/#installation
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies with Poetry...
poetry install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

REM Start Redis (if available)
echo Starting Redis...
start "Redis" redis-server

REM Wait a moment for Redis to start
timeout /t 3 /nobreak >nul

REM Start Celery worker
echo Starting Celery worker...
start "Celery Worker" poetry run celery -A main_celery worker --loglevel=info --concurrency=2

REM Start FastAPI server
echo Starting FastAPI server...
echo.
echo ======================================================================
echo All services are starting up!
echo FastAPI Server: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo ======================================================================
echo.

poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --reload
