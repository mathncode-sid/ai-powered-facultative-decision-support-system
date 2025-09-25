# Complete Installation Guide for AI-Powered Facultative Reinsurance Backend

## Prerequisites Installation

### 1. Install Python 3.11+
**Windows:**
1. Download Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify installation: `python --version`

**Alternative - Install via Microsoft Store:**
1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Install the official Python package

### 2. Install Poetry
**Method 1 - Official Installer (Recommended):**
```powershell
# Windows PowerShell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

**Method 2 - Using pip:**
```bash
pip install poetry
```

**Method 3 - Manual Installation:**
```bash
# Download and run the installer
curl -sSL https://install.python-poetry.org | python3 -
```

**Add Poetry to PATH:**
1. Add `%USERPROFILE%\.local\bin` to your Windows PATH
2. Or run: `poetry config --list` to see configuration

### 3. Install Redis
**Option A - Using Docker (Easiest):**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop/
# Then run:
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option B - Windows Binary:**
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

**Option C - Using Chocolatey:**
```powershell
# Install Chocolatey first: https://chocolatey.org/install
choco install redis-64
```

**Option D - Using WSL (Windows Subsystem for Linux):**
```bash
# In WSL terminal
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

## Project Setup

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
# Copy the example file
copy env.example .env

# Edit .env file with your actual API keys
notepad .env
```

**Required Environment Variables:**
```env
OPENAI_API_KEY=your_openai_api_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
```

### 4. Start Services

**Option A - Using Python Script (Recommended):**
```bash
python start_dev.py
```

**Option B - Using Batch Script:**
```cmd
scripts\start_services.bat
```

**Option C - Manual Start (3 terminals):**

**Terminal 1 - Redis:**
```bash
redis-server
```

**Terminal 2 - Celery Worker:**
```bash
poetry run celery -A main_celery worker --loglevel=info --concurrency=2
```

**Terminal 3 - FastAPI Server:**
```bash
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --reload
```

## Verification

### 1. Check Services
- **FastAPI Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 2. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test with a .msg file
curl -X POST "http://localhost:8000/submit-analysis" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_file.msg"
```

## Troubleshooting

### Common Issues and Solutions

**1. Poetry not found:**
```bash
# Add Poetry to PATH
export PATH="$HOME/.local/bin:$PATH"

# Or reinstall Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

**2. Python not found:**
- Ensure Python is installed and in PATH
- Try using `python3` instead of `python`
- On Windows, try `py` command

**3. Redis connection failed:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis manually
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

**4. Port already in use:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <process_id> /F

# Or use different port
poetry run uvicorn main_celery:app --port 8001 --reload
```

**5. Import errors:**
```bash
# Ensure you're in Poetry environment
poetry shell

# Reinstall dependencies
poetry install --sync

# Check Python path
poetry run python -c "import sys; print(sys.path)"
```

**6. Celery worker issues:**
```bash
# Check Redis connection
poetry run python -c "import redis; r=redis.Redis(); print(r.ping())"

# Start Celery with debug
poetry run celery -A main_celery worker --loglevel=debug

# Check Celery configuration
poetry run python -c "from main_celery import celery_app; print(celery_app.conf)"
```

## Development Workflow

### Daily Development
```bash
# 1. Start all services
python start_dev.py

# 2. Make changes to code
# 3. Services auto-reload (FastAPI with --reload)
# 4. Test endpoints at http://localhost:8000/docs
```

### Adding New Dependencies
```bash
# Add runtime dependency
poetry add package_name

# Add development dependency
poetry add --group dev package_name

# Update dependencies
poetry update
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

## Production Deployment

### Using Docker
```bash
# Build image
docker build -t reinsurance-backend .

# Run with environment
docker run -d -p 8000:8000 --env-file .env reinsurance-backend
```

### Using Poetry
```bash
# Install production dependencies only
poetry install --only=main

# Run production server
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Keys Setup

### 1. OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env` file: `OPENAI_API_KEY=your_key_here`

### 2. Cloudinary Setup
1. Go to https://cloudinary.com/
2. Sign up for free account
3. Get credentials from dashboard
4. Add to `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 3. LlamaParse Setup
1. Go to https://cloud.llamaindex.ai/
2. Sign up and get API key
3. Add to `.env` file: `LLAMA_CLOUD_API_KEY=your_key_here`

## Support

If you encounter issues:
1. Check this installation guide
2. Review the SETUP.md file
3. Check service logs for error messages
4. Verify all environment variables are set correctly
5. Ensure all services (Redis, Celery, FastAPI) are running
