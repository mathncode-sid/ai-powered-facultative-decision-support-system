#!/usr/bin/env python3
"""
Simple setup script for AI-Powered Facultative Reinsurance Backend
This script works without Poetry and uses pip directly.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.11+."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print(f"❌ Python 3.11+ required. Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_requirements():
    """Install requirements using pip."""
    print("📦 Installing dependencies...")
    
    try:
        # Install production dependencies
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Production dependencies installed!")
        
        # Ask if user wants dev dependencies
        response = input("Install development dependencies? (y/N): ").lower().strip()
        if response in ['y', 'yes']:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements-dev.txt"], check=True)
            print("✅ Development dependencies installed!")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_redis():
    """Check if Redis is available."""
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis is running and accessible")
        return True
    except ImportError:
        print("⚠️  Redis Python client not installed (will be installed with requirements)")
        return False
    except Exception:
        print("⚠️  Redis is not running. Please start Redis manually:")
        print("   Windows: Download from https://github.com/microsoftarchive/redis/releases")
        print("   Docker: docker run -d -p 6379:6379 redis:alpine")
        return False

def create_env_file():
    """Create .env file from template if it doesn't exist."""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from template...")
        with open(env_example, 'r') as f:
            content = f.read()
        with open(env_file, 'w') as f:
            f.write(content)
        print("✅ .env file created! Please edit it with your API keys.")
        return True
    elif env_file.exists():
        print("✅ .env file already exists")
        return True
    else:
        print("⚠️  No env.example file found")
        return False

def show_next_steps():
    """Show next steps to the user."""
    print("\n" + "="*60)
    print("🎉 Setup Complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Edit .env file with your API keys:")
    print("   - OPENAI_API_KEY")
    print("   - CLOUDINARY_* credentials")
    print("   - LLAMA_CLOUD_API_KEY")
    print("\n2. Start Redis (if not running):")
    print("   Windows: redis-server.exe")
    print("   Docker: docker run -d -p 6379:6379 redis:alpine")
    print("\n3. Start the application:")
    print("   python start_dev.py")
    print("\n4. Access the API:")
    print("   - Server: http://localhost:8000")
    print("   - Documentation: http://localhost:8000/docs")
    print("   - Health Check: http://localhost:8000/health")

def main():
    """Main setup function."""
    print("🚀 AI-Powered Facultative Reinsurance Backend Setup")
    print("="*60)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_requirements():
        sys.exit(1)
    
    # Check Redis
    check_redis()
    
    # Create .env file
    create_env_file()
    
    # Show next steps
    show_next_steps()

if __name__ == "__main__":
    main()
