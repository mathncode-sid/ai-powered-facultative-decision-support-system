# AI-Powered Facultative Reinsurance Decision Support System

## Overview
A comprehensive FastAPI backend microservice that processes Outlook .msg files to extract reinsurance submission data and generate AI-powered underwriting recommendations using GPT-5, LlamaParse document processing, and Cloudinary file storage.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Redis server
- API keys (OpenAI, Cloudinary, LlamaParse)

### Installation Options

#### Option 1: Using Poetry (Recommended)
```bash
# Install Poetry (if not installed)
curl -sSL https://install.python-poetry.org | python3 -

# Navigate to Backend directory
cd Backend

# Install dependencies
poetry install

# Set up environment variables
cp env.example .env
# Edit .env with your API keys

# Start all services
poetry run python start_dev.py
```

#### Option 2: Using Simple Setup (No Poetry)
```bash
cd Backend

# Run simple setup script
python setup_simple.py

# Start all services
python start_dev.py
```

#### Option 3: Using pip
```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your API keys

# Start all services
python start_dev.py
```

#### Option 4: Using Platform Scripts
```bash
# Windows
cd Backend
scripts\start_services.bat

# Linux/macOS
cd Backend
./scripts/start_services.sh
```

### Manual Start (3 terminals)
```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Celery Worker
poetry run celery -A main_celery worker --loglevel=info --concurrency=2

# Terminal 3: Start FastAPI Server
poetry run uvicorn main_celery:app --host 0.0.0.0 --port 8000 --reload
```

## 📋 Prerequisites Installation

### 1. Install Python 3.11+
- **Windows**: Download from https://www.python.org/downloads/
- **Linux/macOS**: `sudo apt install python3.11` or `brew install python@3.11`

### 2. Install Redis
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **Docker**: `docker run -d -p 6379:6379 redis:alpine`
- **Linux**: `sudo apt install redis-server`
- **macOS**: `brew install redis`

### 3. Install Poetry (Optional)
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

## 🔧 Environment Setup

### Required API Keys
Create a `.env` file in the Backend directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# LlamaParse Configuration
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
```

### API Keys Setup
1. **OpenAI**: Get API key from https://platform.openai.com/api-keys
2. **Cloudinary**: Sign up at https://cloudinary.com/ and get credentials
3. **LlamaParse**: Get API key from https://cloud.llamaindex.ai/

## 🏗️ Architecture
- **FastAPI Server**: Main API endpoints with Celery integration (`main_celery.py`)
- **Celery Worker**: Background task processing for long-running AI analysis
- **Redis**: Message broker and result backend for Celery
- **Document Processing**: LlamaParse for extracting text, tables, and images from attachments
- **AI Analysis**: GPT-5 with LangChain and Pydantic output parsing
- **File Storage**: Cloudinary for secure attachment storage

## ✨ Key Features
1. **Email Processing**: Extracts data from .msg files using extract-msg library
2. **Attachment Handling**: Uploads attachments to Cloudinary for secure storage
3. **Document Analysis**: Uses LlamaParse to extract structured content from documents
4. **AI-Powered Analysis**: GPT-5 generates comprehensive reinsurance working sheets
5. **Background Processing**: Celery handles long-running tasks asynchronously
6. **Structured Output**: Pydantic models ensure consistent data format following Appendix 1

## 🌐 API Endpoints
- `POST /submit-analysis`: Submit .msg file for analysis (returns task ID)
- `GET /task-status/{task_id}`: Check analysis progress and status
- `GET /task-result/{task_id}`: Retrieve completed analysis results
- `GET /health`: Health check endpoint
- `GET /docs`: Interactive API documentation

## 📊 Access Points
Once running, access the application at:
- **FastAPI Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📋 Working Sheet Format
The system generates comprehensive facultative reinsurance working sheets following Kenya Re guidelines with:
- Risk assessment (PML, ESG factors, climate risks)
- Financial analysis (premiums, deductibles, shares)
- Market considerations and portfolio impact
- Technical assessment and recommendations
- Claims experience evaluation

## 🛠️ Development Commands

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
```

### Celery Commands
```bash
# Start worker
poetry run celery -A main_celery worker --loglevel=info

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
```

## 🧪 Testing

### Run Tests
```bash
# Using Poetry
poetry run pytest

# Using pip
pytest

# Run with coverage
poetry run pytest --cov=.
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

## 🐛 Troubleshooting

### Common Issues

1. **Poetry not found**
   - Install Poetry: `curl -sSL https://install.python-poetry.org | python3 -`
   - Add to PATH: `export PATH="$HOME/.local/bin:$PATH"`

2. **Redis connection failed**
   - Check if Redis is running: `redis-cli ping`
   - Start Redis: `redis-server` or `docker run -d -p 6379:6379 redis:alpine`

3. **Port already in use**
   - Kill process: `lsof -ti:8000 | xargs kill`
   - Use different port: `--port 8001`

4. **Import errors**
   - Ensure you're in Poetry environment: `poetry shell`
   - Reinstall dependencies: `poetry install --sync`

## 📚 Documentation

- **Setup Guide**: [SETUP.md](SETUP.md) - Detailed setup instructions
- **Installation Guide**: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - Complete installation guide
- **API Documentation**: http://localhost:8000/docs (when running)

## 🔄 Recent Changes
- **2025-09-25**: Added Poetry configuration and multiple installation options
- **2025-09-25**: Created comprehensive setup scripts and documentation
- **2025-09-25**: Added development startup scripts for all platforms
- **2025-09-25**: Implemented complete system with Celery background processing
- **2025-09-25**: Added LlamaParse integration for document processing
- **2025-09-25**: Created comprehensive Pydantic models for Appendix 1 format
- **2025-09-25**: Integrated Cloudinary for secure attachment storage
- **2025-09-25**: Built AI analysis engine with GPT-5 and structured output parsing

## 🏛️ Architecture Decisions
- Used Celery for background processing to handle large document analysis tasks
- Implemented LlamaParse for specialized document parsing capabilities
- Chose Cloudinary for reliable file storage and management
- Created comprehensive Pydantic models to ensure data consistency
- Used GPT-5 with structured prompts for accurate reinsurance analysis
- Added Poetry for modern Python dependency management
- Created multiple installation options for different user preferences

## ✅ Current State
System is fully operational with all components running:
- FastAPI server accepting .msg file uploads
- Celery workers processing analysis tasks
- Redis managing task queues and results
- Document processing with LlamaParse integration
- AI analysis generating structured reinsurance recommendations
- Multiple installation and startup options available
- Comprehensive documentation and setup guides