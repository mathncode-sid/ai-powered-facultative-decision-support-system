# AI-Powered Facultative Reinsurance Backend Setup Guide

## Prerequisites

### 1. Install Poetry
Poetry is a dependency management and packaging tool for Python.

**Windows:**
```powershell
# Using PowerShell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

**Linux/macOS:**
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

**Alternative (all platforms):**
```bash
pip install poetry
```

### 2. Install Redis
Redis is required for Celery message broker.

**Windows:**
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use Docker: `docker run -d -p 6379:6379 redis:alpine`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Docker (all platforms):**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

## Quick Start

### 1. Navigate to Backend Directory
```bash
cd Backend
```

### 2. Install Dependencies
```bash
poetry install
```

### 3. Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit .env file with your actual API keys
# Required: OPENAI_API_KEY, CLOUDINARY_*, LLAMA_CLOUD_API_KEY
```

### 4. Start All Services

**Option A: Using Python Script (Recommended)**
```bash
python start_dev.py
```

**Option B: Using Platform-Specific Scripts**

**Windows:**
```cmd
scripts\start_services.bat
```

**Linux/macOS:**
```bash
./scripts/start_services.sh
```

**Option C: Manual Start**
```bash
# Terminal 1: Start Redis (if not running)
redis-server

# Terminal 2: Start Celery Worker
poetry run celery -A main_celery worker --loglevel=info --concurrency=2

# Terminal 3: Start FastAPI Server
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --reload
```

## Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key

# Optional Configuration
REDIS_URL=redis://localhost:6379/0
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

## API Endpoints

Once running, the following endpoints are available:

- **Health Check**: `GET http://localhost:8000/health`
- **API Documentation**: `GET http://localhost:8000/docs`
- **Submit Analysis**: `POST http://localhost:8000/submit-analysis`
- **Task Status**: `GET http://localhost:8000/task-status/{task_id}`
- **Task Result**: `GET http://localhost:8000/task-result/{task_id}`

## Development Commands

### Poetry Commands
```bash
# Install dependencies
poetry install

# Add new dependency
poetry add package_name

# Add development dependency
poetry add --group dev package_name

# Run commands in Poetry environment
poetry run python script.py
poetry run uvicorn main_celery:app --reload
poetry run celery -A main_celery worker --loglevel=info

# Update dependencies
poetry update

# Show dependency tree
poetry show --tree
```

### Celery Commands
```bash
# Start worker
poetry run celery -A main_celery worker --loglevel=info

# Start worker with specific concurrency
poetry run celery -A main_celery worker --loglevel=info --concurrency=4

# Monitor tasks
poetry run celery -A main_celery flower

# Purge all tasks
poetry run celery -A main_celery purge
```

### FastAPI Commands
```bash
# Start development server
poetry run uvicorn main_celery:app --reload

# Start production server
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --workers 4

# Start with specific host/port
poetry run uvicorn main_celery:app --host 127.0.0.1 --port 8080 --reload
```

## Testing

### Run Tests
```bash
poetry run pytest

# Run with coverage
poetry run pytest --cov=.

# Run specific test file
poetry run pytest tests/test_analysis.py
```

### Code Quality
```bash
# Format code
poetry run black .

# Sort imports
poetry run isort .

# Lint code
poetry run flake8 .

# Type checking
poetry run mypy .
```

## Troubleshooting

### Common Issues

1. **Poetry not found**
   - Ensure Poetry is installed and in PATH
   - Try: `poetry --version`

2. **Redis connection failed**
   - Check if Redis is running: `redis-cli ping`
   - Verify Redis URL in environment variables

3. **Import errors**
   - Ensure you're in the Poetry environment: `poetry shell`
   - Reinstall dependencies: `poetry install`

4. **Port already in use**
   - Change port in startup command: `--port 8001`
   - Kill existing process: `lsof -ti:8000 | xargs kill`

5. **Celery worker not starting**
   - Check Redis connection
   - Verify Celery configuration in `main_celery.py`

### Logs and Debugging

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# View Celery logs
poetry run celery -A main_celery worker --loglevel=debug

# View Redis logs
redis-cli monitor
```

## Production Deployment

### Using Docker
```bash
# Build image
docker build -t reinsurance-backend .

# Run with environment variables
docker run -d -p 8000:8000 --env-file .env reinsurance-backend
```

### Using Poetry in Production
```bash
# Install production dependencies only
poetry install --only=main

# Run with production settings
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --workers 4
```

## Support

For issues and questions:
1. Check this setup guide
2. Review the README.md
3. Check the API documentation at `/docs`
4. Review logs for error messages
