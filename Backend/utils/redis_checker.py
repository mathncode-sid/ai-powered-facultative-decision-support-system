"""
Redis availability checker for production environments
"""
import redis
import logging
import os

logger = logging.getLogger(__name__)

def is_redis_available() -> bool:
    """
    Check if Redis is available for Celery operations
    
    Returns:
        bool: True if Redis is accessible, False otherwise
    """
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        client = redis.from_url(redis_url, socket_connect_timeout=2, socket_timeout=2)
        client.ping()
        client.close()
        return True
    except (redis.ConnectionError, redis.TimeoutError, Exception) as e:
        logger.warning(f"Redis not available: {str(e)}")
        return False

def get_processing_mode() -> str:
    """
    Determine processing mode based on Redis availability
    
    Returns:
        str: 'async' if Redis available, 'sync' if not
    """
    if is_redis_available():
        return 'async'
    else:
        return 'sync'