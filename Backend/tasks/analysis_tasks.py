"""
Celery tasks for reinsurance analysis
"""
import os
import tempfile
import logging
from datetime import datetime
from typing import Dict, Any

from celery import Celery

from services.cloudinary_service import CloudinaryService
from services.ai_analysis_service import AIAnalysisService
from services.msg_reader_service import MSGFileReader
from models.reinsurance_models import EmailData

logger = logging.getLogger(__name__)

# Initialize Celery app (import from main celery_app)
from celery_app import celery_app

# Initialize services
cloudinary_service = CloudinaryService()
ai_analysis_service = AIAnalysisService()

@celery_app.task(bind=True)
def process_reinsurance_msg(self, file_path: str) -> Dict[str, Any]:
    """
    Background task to process .msg file and perform AI analysis
    """
    try:
        # Update task progress
        self.update_state(state='PROGRESS', meta={'progress': 10, 'status': 'Processing MSG file'})
        
        # Extract email data using MSGFileReader
        logger.info(f"Processing MSG file: {file_path}")
        
        try:
            # Use the comprehensive MSGFileReader class
            msg_reader = MSGFileReader(file_path)
            msg_data = msg_reader.read_msg_file()
            
            if msg_data:
                email_data = EmailData(
                    sender=msg_data.get('sender', 'Unknown'),
                    subject=msg_data.get('subject', 'No Subject'),
                    body=msg_data.get('body', ''),
                    date=msg_data.get('date', datetime.utcnow()),
                    attachments=[]
                )
                
                # Process attachments using the MSGFileReader approach
                self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Processing attachments'})
                if msg_data.get('attachments'):
                    # Get attachments in format suitable for Cloudinary
                    attachment_files = msg_reader.get_attachments_for_cloudinary()
                    
                    # Create attachment metadata
                    for attachment in msg_data['attachments']:
                        attachment_data = {
                            "filename": attachment['filename'],
                            "content_type": attachment['content_type'],
                            "size": attachment['size']
                        }
                        email_data.attachments.append(attachment_data)
                    
                    # Upload attachments to Cloudinary
                    if attachment_files:
                        self.update_state(state='PROGRESS', meta={'progress': 50, 'status': 'Uploading attachments'})
                        try:
                            upload_results = cloudinary_service.upload_multiple_attachments(attachment_files)
                            
                            # Update attachment data with Cloudinary URLs
                            for i, result in enumerate(upload_results):
                                if result['status'] == 'success' and i < len(email_data.attachments):
                                    email_data.attachments[i]['cloudinary_url'] = result['upload_result']['secure_url']
                                    email_data.attachments[i]['public_id'] = result['upload_result']['public_id']
                            
                            logger.info(f"Uploaded {len(upload_results)} attachments to Cloudinary")
                        except Exception as upload_error:
                            logger.warning(f"Failed to upload some attachments: {upload_error}")
                            
                logger.info(f"Successfully processed email: {email_data.subject}")
            else:
                raise Exception("MSGFileReader returned no data")
            
        except Exception as msg_error:
            logger.warning(f"Failed to parse MSG file: {msg_error}")
            # Create fallback email data
            email_data = EmailData(
                sender="Unknown",
                subject="Failed to parse MSG file",
                body="MSG file could not be parsed",
                date=datetime.utcnow(),
                attachments=[]
            )
        
        # AI Analysis using GPT-5 with document processing
        self.update_state(state='PROGRESS', meta={'progress': 70, 'status': 'Performing AI analysis with document processing'})
        try:
            # Get attachment URLs for AI analysis
            attachment_urls = []
            for attachment in email_data.attachments:
                if attachment.get('cloudinary_url'):
                    attachment_urls.append(attachment['cloudinary_url'])
            
            # Perform comprehensive AI analysis with document processing
            ai_result = ai_analysis_service.analyze_reinsurance_submission(
                email_data.model_dump(), 
                attachment_urls if attachment_urls else None
            )
            
            logger.info("AI analysis with document processing completed successfully")
            
        except Exception as ai_error:
            logger.warning(f"AI analysis failed, using fallback: {ai_error}")
            # Create fallback analysis
            ai_result = ai_analysis_service._create_fallback_analysis(email_data.model_dump())
        
        # Complete task
        self.update_state(state='SUCCESS', meta={'progress': 100, 'status': 'Analysis completed'})
        
        result = {
            "email_data": email_data.model_dump(),
            "ai_analysis": ai_result.model_dump(),
            "processing_timestamp": datetime.utcnow().isoformat(),
            "status": "completed"
        }
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.unlink(file_path)
        
        logger.info(f"Task completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error processing task: {str(e)}")
        self.update_state(
            state='FAILURE',
            meta={
                'progress': 0,
                'status': 'failed',
                'error': str(e)
            }
        )
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.unlink(file_path)
            
        raise e