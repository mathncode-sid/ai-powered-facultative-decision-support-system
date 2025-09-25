# AI-Powered Facultative Reinsurance Decision Support System

## 🎯 Project Overview

This comprehensive system provides AI-powered decision support for facultative reinsurance underwriting by processing Outlook .msg files and generating intelligent recommendations using advanced AI technologies including GPT-5, LlamaParse document processing, and Cloudinary file storage.

## 🏗️ System Architecture

The project consists of two main components:

### 1. 📊 Jupyter Notebook Analysis
- **File**: `AI-Powered_Facultative_Reinsurance_Decision_Support_System.ipynb`
- **Purpose**: Interactive analysis and development of MSG file processing
- **Features**: 
  - MSG file reading and extraction
  - Email content and attachment processing
  - Data analysis and visualization
  - Prototype development and testing

### 2. 🚀 Backend API System
- **Directory**: `Backend/`
- **Purpose**: Production-ready FastAPI microservice
- **Features**:
  - RESTful API endpoints
  - Background task processing with Celery
  - AI-powered analysis with GPT-5
  - Document processing with LlamaParse
  - Secure file storage with Cloudinary

## 📁 Project Structure

```
AI-Powered_Facultative_Decision_Support_System/
├── 📊 AI-Powered_Facultative_Reinsurance_Decision_Support_System.ipynb
├── 📁 Backend/                          # FastAPI Backend System
│   ├── 🚀 main_celery.py               # Main FastAPI application
│   ├── 🔄 celery_app.py                # Celery configuration
│   ├── 📁 services/                     # Business logic services
│   │   ├── msg_reader_service.py       # MSG file processing
│   │   ├── ai_analysis_service.py      # AI analysis engine
│   │   ├── document_processing_service.py # Document parsing
│   │   └── cloudinary_service.py       # File storage
│   ├── 📁 tasks/                        # Celery background tasks
│   │   └── analysis_tasks.py           # Analysis task definitions
│   ├── 📁 models/                       # Pydantic data models
│   │   └── reinsurance_models.py       # Reinsurance data structures
│   ├── 📁 scripts/                      # Startup scripts
│   │   ├── start_services.bat          # Windows startup
│   │   └── start_services.sh           # Linux/macOS startup
│   ├── 📄 pyproject.toml                # Poetry configuration
│   ├── 📄 requirements.txt              # pip dependencies
│   ├── 📄 start_dev.py                  # Development startup
│   ├── 📄 setup_simple.py               # Simple setup script
│   └── 📚 README.md                     # Backend documentation
├── 📁 Data/                            # Sample MSG files
│   ├── 📧 Fac Support - Patel Engineering Teesta Project V- Package 6 - CAR.msg
│   ├── 📧 FAC. Offer - GLACIER REFRIGERATION SERVICES CORPORATION OR GLACIER MEGAFRIDGE (FIRE FACULTATIVE OFFER).msg
│   └── 📧 Facultative Agriculture Risk Placement  Cairo 3A (Egypt)  Request for Line Support.msg
└── 📄 README.md                         # This file
```

## 🚀 Quick Start Guide

### Option 1: Jupyter Notebook Analysis
```bash
# Install Jupyter and dependencies
pip install jupyter extract-msg

# Start Jupyter Notebook
jupyter notebook

# Open: AI-Powered_Facultative_Reinsurance_Decision_Support_System.ipynb
```

### Option 2: Backend API System
```bash
# Navigate to Backend directory
cd Backend

# Quick setup (no Poetry required)
python setup_simple.py

# Start all services
python start_dev.py
```

### Option 3: Using Poetry (Recommended)
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Navigate to Backend
cd Backend

# Install dependencies
poetry install

# Set up environment
cp env.example .env
# Edit .env with your API keys

# Start services
poetry run python start_dev.py
```

## 🔧 Prerequisites

### Required Software
- **Python 3.11+**
- **Redis Server** (for Backend)
- **API Keys** (OpenAI, Cloudinary, LlamaParse)

### Installation Commands

#### Python
```bash
# Windows: Download from https://www.python.org/downloads/
# Linux: sudo apt install python3.11
# macOS: brew install python@3.11
```

#### Redis
```bash
# Windows: Download from GitHub releases
# Docker: docker run -d -p 6379:6379 redis:alpine
# Linux: sudo apt install redis-server
# macOS: brew install redis
```

#### Poetry (Optional)
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

## 🔑 Environment Setup

### Required API Keys
Create a `.env` file in the `Backend/` directory:

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

## 📊 Jupyter Notebook Features

### MSG File Processing
- **Email Extraction**: Reads Outlook .msg files and extracts all content
- **Attachment Handling**: Processes and saves all email attachments
- **Data Analysis**: Analyzes email content and metadata
- **Visualization**: Creates charts and reports from extracted data

### Key Capabilities
- ✅ Read .msg files with full email content
- ✅ Extract and save attachments
- ✅ Parse email metadata (sender, recipient, date, subject)
- ✅ Generate JSON exports of email data
- ✅ Batch processing of multiple .msg files
- ✅ Error handling and logging

### Usage Example
```python
# Process all .msg files in Data directory
results = process_all_msg_files("Data")

# Get email body from specific file
body_text = get_email_body_text("path/to/file.msg")

# Get attachment information
attachments = get_attachments_info("path/to/file.msg")
```

## 🚀 Backend API Features

### RESTful API Endpoints
- `POST /submit-analysis`: Submit .msg file for AI analysis
- `GET /task-status/{task_id}`: Check analysis progress
- `GET /task-result/{task_id}`: Retrieve analysis results
- `GET /health`: Health check endpoint
- `GET /docs`: Interactive API documentation

### AI-Powered Analysis
- **GPT-5 Integration**: Advanced AI analysis of reinsurance submissions
- **Document Processing**: LlamaParse extracts structured content from attachments
- **Risk Assessment**: Comprehensive evaluation of PML, ESG factors, climate risks
- **Financial Analysis**: Premium calculations, deductible recommendations
- **Working Sheets**: Generates structured reinsurance working sheets

### Background Processing
- **Celery Workers**: Handle long-running AI analysis tasks
- **Redis Queue**: Manages task queues and results
- **Async Processing**: Non-blocking API responses
- **Progress Tracking**: Real-time task status updates

## 🌐 Access Points

### Jupyter Notebook
- **Local Access**: http://localhost:8888 (when running)
- **File**: `AI-Powered_Facultative_Reinsurance_Decision_Support_System.ipynb`

### Backend API
- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠️ Development Workflow

### For Data Analysis
1. **Open Jupyter Notebook**: `jupyter notebook`
2. **Run Analysis Cells**: Execute notebook cells for MSG processing
3. **View Results**: Check extracted data and attachments
4. **Export Data**: Generate JSON files for further analysis

### For Backend Development
1. **Start Services**: `python start_dev.py` or `poetry run python start_dev.py`
2. **Test API**: Use http://localhost:8000/docs for interactive testing
3. **Submit Files**: Upload .msg files via API endpoints
4. **Monitor Tasks**: Check Celery worker logs for processing status

## 📋 Sample Data

The `Data/` directory contains sample .msg files for testing:
- **Patel Engineering**: Construction project reinsurance submission
- **Glacier Refrigeration**: Fire insurance facultative offer
- **Cairo Agriculture**: Agriculture risk placement request

## 🧪 Testing

### Jupyter Notebook Testing
```bash
# Run all notebook cells
# Check extracted attachments in extracted_attachments/
# Verify JSON exports in project root
```

### Backend API Testing
```bash
# Health check
curl http://localhost:8000/health

# Submit analysis
curl -X POST "http://localhost:8000/submit-analysis" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@Data/sample.msg"
```

## 🐛 Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python 3.11+ is installed and in PATH
   - Try using `python3` instead of `python`

2. **Redis connection failed**
   - Check if Redis is running: `redis-cli ping`
   - Start Redis: `redis-server` or `docker run -d -p 6379:6379 redis:alpine`

3. **Import errors in notebook**
   - Install required packages: `pip install extract-msg`
   - Restart Jupyter kernel

4. **Backend API not starting**
   - Check environment variables in `.env` file
   - Ensure Redis is running
   - Verify all dependencies are installed

5. **Port conflicts**
   - Change ports in startup commands
   - Kill existing processes: `lsof -ti:8000 | xargs kill`

## 📚 Documentation

- **Backend Setup**: [Backend/README.md](Backend/README.md)
- **Installation Guide**: [Backend/INSTALLATION_GUIDE.md](Backend/INSTALLATION_GUIDE.md)
- **Setup Instructions**: [Backend/SETUP.md](Backend/SETUP.md)
- **API Documentation**: http://localhost:8000/docs (when running)

## 🔄 Recent Updates

- **2025-09-25**: Complete system implementation with Poetry configuration
- **2025-09-25**: Added comprehensive MSG file processing capabilities
- **2025-09-25**: Implemented AI-powered analysis with GPT-5 and LlamaParse
- **2025-09-25**: Created multiple installation and startup options
- **2025-09-25**: Added comprehensive documentation and setup guides
- **2025-09-25**: Implemented secure file handling and .gitignore configuration

## 🏛️ Architecture Decisions

- **Jupyter Notebook**: Interactive development and data analysis
- **FastAPI Backend**: Production-ready API with async processing
- **Celery**: Background task processing for AI analysis
- **Redis**: Message broker and result backend
- **Poetry**: Modern Python dependency management
- **Cloudinary**: Secure cloud file storage
- **LlamaParse**: Specialized document processing
- **GPT-5**: Advanced AI analysis capabilities

## ✅ Current Status

The system is fully operational with:
- ✅ Jupyter notebook for interactive MSG file analysis
- ✅ FastAPI backend with comprehensive API endpoints
- ✅ AI-powered analysis with GPT-5 and LlamaParse
- ✅ Background processing with Celery and Redis
- ✅ Secure file storage with Cloudinary
- ✅ Multiple installation and startup options
- ✅ Comprehensive documentation and setup guides
- ✅ Sample data and testing capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Backend documentation
3. Check the API documentation at `/docs`
4. Review logs for error messages
5. Ensure all prerequisites are installed correctly
