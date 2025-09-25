"""
Celery application for background task processing
"""
import os
from celery import Celery

# Create Celery app
celery_app = Celery(
    "reinsurance_analysis",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=["tasks.analysis_tasks"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,  # Results expire after 1 hour
    task_time_limit=600,  # 10 minute time limit
    task_soft_time_limit=540,  # 9 minute soft limit
)

if __name__ == "__main__":
    celery_app.start()