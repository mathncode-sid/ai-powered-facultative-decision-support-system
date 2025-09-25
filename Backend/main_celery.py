# AI-Powered Facultative Reinsurance Decision Support System
# FastAPI backend with Celery integration

import os
import tempfile
from typing import Optional, Dict, Any
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging

from celery.result import AsyncResult
from celery_app import celery_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Powered Facultative Reinsurance Decision Support System",
    description="Backend microservice for processing reinsurance emails with Celery background jobs",
    version="1.0.0"
)

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
        
        # Submit to Celery
        task = celery_app.send_task(
            'tasks.analysis_tasks.process_reinsurance_msg',
            args=[temp_file_path]
        )
        
        logger.info(f"Submitted task {task.id} for file {file.filename}")
        
        return TaskSubmissionResponse(
            task_id=task.id,
            message=f"Analysis started for {file.filename}",
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
        
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting task status: {str(e)}")

@app.get("/task-result/{task_id}")
async def get_task_result(task_id: str):
    """
    Get the detailed result of a completed analysis task
    """
    try:
        result = AsyncResult(task_id, app=celery_app)
        
        if result.state == 'SUCCESS':
            return JSONResponse(content=result.result)
        elif result.state == 'FAILURE':
            raise HTTPException(status_code=400, detail=f"Task failed: {result.info}")
        else:
            raise HTTPException(status_code=202, detail=f"Task not completed. Status: {result.state}")
            
    except Exception as e:
        logger.error(f"Error getting task result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting task result: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)