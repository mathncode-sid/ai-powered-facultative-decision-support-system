"""
Synchronous version of analysis tasks for production environments without Redis/Celery
"""
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def process_reinsurance_msg_sync(msg_file_path: str) -> Dict[str, Any]:
    """
    Synchronous version of the reinsurance processing task
    """
    try:
        # Import services
        from services.msg_reader_service import MSGFileReader
        from services.cloudinary_service import CloudinaryService
        from services.document_processing_service import DocumentProcessingService
        from services.ai_analysis_service import AIAnalysisService
        
        logger.info(f"Starting sync processing of {msg_file_path}")
        
        # Step 1: Read MSG file
        msg_reader = MSGFileReader(msg_file_path)
        msg_data = msg_reader.read_msg_file()
        
        if not msg_data:
            raise Exception("Failed to read MSG file - file may be corrupted or invalid")
        
        # Step 2: Upload attachments to Cloudinary
        cloudinary_service = CloudinaryService()
        uploaded_attachments = []
        
        if msg_data.get('attachments'):
            uploaded_attachments = cloudinary_service.upload_multiple_attachments(
                msg_data['attachments']
            )
        
        # Step 3: Process documents with LlamaParse
        doc_processor = DocumentProcessingService()
        cloudinary_urls = []
        
        for attachment in uploaded_attachments:
            if attachment['status'] == 'success':
                cloudinary_urls.append(attachment['upload_result']['secure_url'])
        
        processed_docs = []
        if cloudinary_urls:
            processed_docs = doc_processor.process_documents(cloudinary_urls)
        
        # Step 4: Generate AI analysis
        ai_service = AIAnalysisService()
        analysis_result = ai_service.analyze_reinsurance_submission(
            email_data=msg_data,
            attachment_urls=cloudinary_urls
        )
        
        # Use comprehensive JSON serialization
        from utils.json_serializer import make_json_serializable
        
        # Compile final result (ensure all values are JSON serializable)
        result = {
            "email_data": {
                "subject": str(msg_data.get('subject', '')),
                "sender": str(msg_data.get('sender', '')),
                "date": str(msg_data.get('date', '')),
                "body": str(msg_data.get('body', ''))[:1000] + '...' if len(str(msg_data.get('body', ''))) > 1000 else str(msg_data.get('body', ''))
            },
            "attachments_processed": len(uploaded_attachments),
            "attachments_uploaded": len([a for a in uploaded_attachments if a['status'] == 'success']),
            "documents_analyzed": len(processed_docs),
            "reinsurance_analysis": make_json_serializable(analysis_result),
            "processing_mode": "synchronous"
        }
        
        # Ensure the entire result is JSON serializable
        result = make_json_serializable(result)
        
        logger.info(f"Sync processing completed successfully for {msg_file_path}")
        return result
        
    except Exception as e:
        logger.error(f"Sync processing failed for {msg_file_path}: {str(e)}")
        raise e
    finally:
        # Clean up temp file
        try:
            if os.path.exists(msg_file_path):
                os.unlink(msg_file_path)
        except Exception:
            pass