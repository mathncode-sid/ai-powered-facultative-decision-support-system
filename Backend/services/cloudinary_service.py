"""
Cloudinary service for uploading reinsurance document attachments
"""
import os
import logging
from typing import Dict, Any, Optional
import cloudinary
import cloudinary.uploader
from io import BytesIO

logger = logging.getLogger(__name__)

class CloudinaryService:
    def __init__(self):
        """Initialize Cloudinary with environment variables"""
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET')
        )
        
    def upload_attachment(self, file_data: bytes, filename: str, folder: str = "reinsurance_docs") -> Dict[str, Any]:
        """
        Upload attachment file to Cloudinary
        
        Args:
            file_data: Binary file data
            filename: Original filename
            folder: Cloudinary folder to upload to
            
        Returns:
            Dictionary with upload result including public_id and secure_url
        """
        try:
            # Create a file-like object from bytes
            file_stream = BytesIO(file_data)
            
            # Upload to Cloudinary with public access
            result = cloudinary.uploader.upload(
                file_stream,
                folder=folder,
                public_id=f"{filename}_{hash(file_data)}",
                resource_type="auto",  # Auto-detect file type
                overwrite=True,
                use_filename=True,
                unique_filename=True,
                access_mode="public"  # Ensure public access for document processing
            )
            
            logger.info(f"Successfully uploaded {filename} to Cloudinary")
            
            return {
                "public_id": result.get("public_id"),
                "secure_url": result.get("secure_url"),
                "format": result.get("format"),
                "resource_type": result.get("resource_type"),
                "bytes": result.get("bytes"),
                "width": result.get("width"),
                "height": result.get("height")
            }
            
        except Exception as e:
            logger.error(f"Failed to upload {filename} to Cloudinary: {str(e)}")
            raise Exception(f"Cloudinary upload failed: {str(e)}")
    
    def upload_multiple_attachments(self, attachments: list) -> list:
        """
        Upload multiple attachments to Cloudinary
        
        Args:
            attachments: List of attachment dictionaries with 'data' and 'filename'
            
        Returns:
            List of upload results
        """
        results = []
        
        for attachment in attachments:
            try:
                result = self.upload_attachment(
                    file_data=attachment['data'],
                    filename=attachment['filename']
                )
                results.append({
                    "original_filename": attachment['filename'],
                    "upload_result": result,
                    "status": "success"
                })
            except Exception as e:
                logger.error(f"Failed to upload {attachment['filename']}: {str(e)}")
                results.append({
                    "original_filename": attachment['filename'],
                    "error": str(e),
                    "status": "failed"
                })
                
        return results