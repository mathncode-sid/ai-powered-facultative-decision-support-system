#!/usr/bin/env python3
"""
Development startup script for AI-Powered Facultative Reinsurance Backend
This script helps you start all required services for development.
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path

def check_poetry_installed():
    """Check if Poetry is installed."""
    try:
        subprocess.run(["poetry", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_dependencies():
    """Install project dependencies using Poetry."""
    print("📦 Installing dependencies with Poetry...")
    try:
        subprocess.run(["poetry", "install"], check=True)
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_redis():
    """Check if Redis is running."""
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        return True
    except:
        return False

def start_redis():
    """Start Redis server (Windows)."""
    print("🔴 Starting Redis server...")
    try:
        # Try to start Redis using Windows service or executable
        subprocess.Popen(["redis-server"], shell=True)
        time.sleep(3)
        if check_redis():
            print("✅ Redis started successfully!")
            return True
        else:
            print("⚠️  Redis might not be installed. Please install Redis manually.")
            return False
    except Exception as e:
        print(f"❌ Failed to start Redis: {e}")
        return False

def start_celery_worker():
    """Start Celery worker."""
    print("🔄 Starting Celery worker...")
    try:
        return subprocess.Popen([
            "poetry", "run", "celery", "-A", "celery_app", "worker", 
            "--loglevel=info", "--concurrency=2"
        ])
    except Exception as e:
        print(f"❌ Failed to start Celery worker: {e}")
        return None

def start_fastapi_server():
    """Start FastAPI server."""
    print("🚀 Starting FastAPI server...")
    try:
        return subprocess.Popen([
            "poetry", "run", "uvicorn", "main_celery:app", 
            "--host", "0.0.0.0", "--port", "8000", "--reload"
        ])
    except Exception as e:
        print(f"❌ Failed to start FastAPI server: {e}")
        return None

def main():
    """Main development startup function."""
    print("🚀 Starting AI-Powered Facultative Reinsurance Backend Development Environment")
    print("=" * 70)
    
    # Check Poetry installation
    if not check_poetry_installed():
        print("❌ Poetry is not installed. Please install Poetry first:")
        print("   curl -sSL https://install.python-poetry.org | python3 -")
        print("   or visit: https://python-poetry.org/docs/#installation")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Check Redis
    if not check_redis():
        print("⚠️  Redis is not running. Attempting to start...")
        if not start_redis():
            print("❌ Please install and start Redis manually:")
            print("   Windows: Download from https://github.com/microsoftarchive/redis/releases")
            print("   Or use Docker: docker run -d -p 6379:6379 redis:alpine")
            sys.exit(1)
    
    # Start services
    processes = []
    
    try:
        # Start Celery worker
        celery_process = start_celery_worker()
        if celery_process:
            processes.append(celery_process)
            print("✅ Celery worker started!")
        
        # Start FastAPI server
        fastapi_process = start_fastapi_server()
        if fastapi_process:
            processes.append(fastapi_process)
            print("✅ FastAPI server started!")
        
        print("\n🎉 All services are running!")
        print("📊 FastAPI Server: http://localhost:8000")
        print("📊 API Documentation: http://localhost:8000/docs")
        print("📊 Celery Worker: Running in background")
        print("\nPress Ctrl+C to stop all services...")
        
        # Wait for processes
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping all services...")
        for process in processes:
            if process:
                process.terminate()
        print("✅ All services stopped!")

if __name__ == "__main__":
    main()
