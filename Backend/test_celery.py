#!/usr/bin/env python3
"""
Test script to verify Celery configuration
"""

def test_celery_import():
    """Test if Celery app can be imported correctly."""
    try:
        from celery_app import celery_app
        print("✅ Celery app imported successfully")
        print(f"   App name: {celery_app.main}")
        print(f"   App type: {type(celery_app)}")
        return True
    except Exception as e:
        print(f"❌ Failed to import Celery app: {e}")
        return False

def test_redis_connection():
    """Test Redis connection."""
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis connection successful")
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def test_tasks_import():
    """Test if tasks can be imported."""
    try:
        from tasks.analysis_tasks import process_reinsurance_msg
        print("✅ Tasks imported successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to import tasks: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Celery Configuration")
    print("=" * 40)
    
    # Test Redis
    test_redis_connection()
    
    # Test Celery app
    test_celery_import()
    
    # Test tasks
    test_tasks_import()
    
    print("\n" + "=" * 40)
    print("📋 Correct Commands:")
    print("✅ poetry run celery -A celery_app worker --loglevel=info --concurrency=2")
    print("❌ poetry run celery -A main_celery worker --loglevel=info --concurrency=2")
    print("\n💡 The key difference is 'celery_app' vs 'main_celery'")
