# AI-Powered Facultative Reinsurance Decision Support System
# FastAPI backend with Celery integration and production fallback

import os
import tempfile
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging

from utils.redis_checker import is_redis_available, get_processing_mode

# Conditional imports for Redis/Celery
REDIS_AVAILABLE = is_redis_available()
PROCESSING_MODE = get_processing_mode()

if REDIS_AVAILABLE:
    from celery.result import AsyncResult
    from celery_app import celery_app
    # Export celery app for celery worker command
    celery = celery_app
else:
    # Create dummy celery for compatibility
    celery_app = None
    celery = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Powered Facultative Reinsurance Decision Support System",
    description=f"Backend microservice for processing reinsurance emails ({PROCESSING_MODE} mode)",
    version="1.0.0"
)

# In-memory storage for sync results (production fallback)
sync_results = {}

# Data models
class TaskSubmissionResponse(BaseModel):
    task_id: str
    message: str
    status: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str  # PENDING, PROGRESS, SUCCESS, FAILURE
    progress: Optional[float] = None
    current_status: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Sync processing functions for production fallback
async def process_sync_analysis(temp_file_path: str, filename: str) -> str:
    """
    Process analysis synchronously when Redis/Celery unavailable
    """
    task_id = str(uuid.uuid4())
    
    try:
        # Import the actual processing logic
        from tasks.analysis_tasks_sync import process_reinsurance_msg_sync
        
        # Process synchronously
        result = process_reinsurance_msg_sync(temp_file_path)
        
        # Store result in memory
        sync_results[task_id] = {
            'status': 'SUCCESS',
            'progress': 100.0,
            'current_status': 'Analysis completed',
            'result': result
        }
        
        logger.info(f"Sync processing completed for {filename}")
        
    except Exception as e:
        logger.error(f"Sync processing failed for {filename}: {str(e)}")
        sync_results[task_id] = {
            'status': 'FAILURE',
            'current_status': 'Analysis failed',
            'error': str(e)
        }
    
    # Clean up temp file
    try:
        os.unlink(temp_file_path)
    except Exception:
        pass
    
    return task_id

def get_sync_task_result(task_id: str) -> Dict[str, Any]:
    """
    Get sync task result from memory
    """
    return sync_results.get(task_id, {
        'status': 'PENDING',
        'current_status': 'Task not found',
        'progress': 0.0
    })

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI-Powered Facultative Reinsurance Decision Support System", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/submit-analysis", response_model=TaskSubmissionResponse)
async def submit_analysis(file: UploadFile = File(...)):
    """
    Submit a .msg file for facultative reinsurance analysis
    Returns task ID for polling status
    """
    try:
        # Validate file type
        if not file.filename or not file.filename.endswith('.msg'):
            raise HTTPException(status_code=400, detail="Only .msg files are supported")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.msg') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        if REDIS_AVAILABLE and celery_app:
            # Use async processing with Celery
            task = celery_app.send_task(
                'tasks.analysis_tasks.process_reinsurance_msg',
                args=[temp_file_path]
            )
            task_id = task.id
            logger.info(f"Submitted async task {task_id} for file {file.filename}")
        else:
            # Use sync processing
            task_id = await process_sync_analysis(temp_file_path, file.filename)
            logger.info(f"Processed sync task {task_id} for file {file.filename}")
        
        return TaskSubmissionResponse(
            task_id=task_id,
            message=f"Analysis started for {file.filename} ({PROCESSING_MODE} mode)",
            status="submitted"
        )
        
    except Exception as e:
        logger.error(f"Error submitting analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error submitting analysis: {str(e)}")

@app.get("/task-status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Get the status and result of an analysis task
    """
    try:
        if REDIS_AVAILABLE and celery_app:
            from celery.result import AsyncResult
            result = AsyncResult(task_id, app=celery_app)
            
            if result.state == 'PENDING':
                response = TaskStatusResponse(
                    task_id=task_id,
                    status="PENDING",
                    current_status="Task is waiting to be processed"
                )
            elif result.state == 'PROGRESS':
                response = TaskStatusResponse(
                    task_id=task_id,
                    status="PROGRESS",
                    progress=result.info.get('progress', 0),
                    current_status=result.info.get('status', 'Processing...')
                )
            elif result.state == 'SUCCESS':
                response = TaskStatusResponse(
                    task_id=task_id,
                    status="SUCCESS",
                    progress=100.0,
                    current_status="Analysis completed",
                    result=result.result
                )
            elif result.state == 'FAILURE':
                response = TaskStatusResponse(
                    task_id=task_id,
                    status="FAILURE",
                    current_status="Analysis failed",
                    error=str(result.info)
                )
            else:
                response = TaskStatusResponse(
                    task_id=task_id,
                    status=result.state,
                    current_status=f"Unknown state: {result.state}"
                )
            
            return response
        else:
            # For sync processing, check our in-memory results
            result_data = get_sync_task_result(task_id)
            
            # Set appropriate progress based on status
            if result_data['status'] == 'SUCCESS':
                progress = 100.0
            elif result_data['status'] == 'FAILURE':
                progress = 0.0
            else:
                progress = result_data.get('progress', 0.0)  # Default to 0.0 for pending tasks
            
            response = TaskStatusResponse(
                task_id=task_id,
                status=result_data['status'],
                progress=progress,
                current_status=result_data.get('current_status', 'Task not found'),
                result=result_data.get('result'),
                error=result_data.get('error')
            )
            
            # Log when task ID is not found for debugging
            if result_data['status'] == 'PENDING' and 'Task not found' in result_data.get('current_status', ''):
                logger.warning(f"Sync task {task_id} not found in memory storage")
            
            return response
        
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting task status: {str(e)}")

@app.get("/task-result/{task_id}")
async def get_task_result(task_id: str):
    """
    Get the detailed result of a completed analysis task
    """
    try:
        if REDIS_AVAILABLE and celery_app:
            from celery.result import AsyncResult
            result = AsyncResult(task_id, app=celery_app)
        
            if result.state == 'SUCCESS':
                return JSONResponse(content=result.result)
            elif result.state == 'FAILURE':
                raise HTTPException(status_code=400, detail=f"Task failed: {result.info}")
            else:
                raise HTTPException(status_code=202, detail=f"Task not completed. Status: {result.state}")
        else:
            # For sync processing, get from memory
            result_data = get_sync_task_result(task_id)
            if result_data['status'] == 'SUCCESS':
                # Ensure the result is JSON serializable
                from utils.json_serializer import make_json_serializable
                task_result = result_data.get('result', {})
                
                try:
                    # Convert to JSON serializable format
                    serializable_result = make_json_serializable(task_result)
                    return JSONResponse(content=serializable_result)
                except Exception as e:
                    logger.error(f"JSON serialization error for task {task_id}: {str(e)}")
                    logger.error(f"Result type: {type(task_result)}")
                    logger.error(f"Result keys: {list(task_result.keys()) if isinstance(task_result, dict) else 'Not a dict'}")
                    
                    # Return a more detailed error response
                    return JSONResponse(content={
                        "error": "Result contains non-serializable data",
                        "task_id": task_id,
                        "status": "completed_with_serialization_error",
                        "error_details": str(e),
                        "result_type": str(type(task_result))
                    })
            elif result_data['status'] == 'FAILURE':
                raise HTTPException(status_code=400, detail=f"Task failed: {result_data.get('error', 'Unknown error')}")
            else:
                raise HTTPException(status_code=202, detail=f"Task not completed. Status: {result_data['status']}")
            
    except HTTPException:
        # Re-raise HTTP exceptions without wrapping them
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting task result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error")

if __name__ == "__main__":
    import uvicorn
    import os
    # Use PORT environment variable for deployment compatibility
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)