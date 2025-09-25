"""
MSGFileReader service for reading Outlook .msg files
Based on the provided comprehensive MSGFileReader class
"""
import os
import sys
import extract_msg
from pathlib import Path
import json
from datetime import datetime
import base64
import logging

logger = logging.getLogger(__name__)

class MSGFileReader:
    """
    A comprehensive class to read Outlook .msg files and extract email content and attachments.
    """
    
    def __init__(self, msg_file_path):
        """
        Initialize the MSGFileReader with a .msg file path.
        
        Args:
            msg_file_path (str): Path to the .msg file
        """
        self.msg_file_path = Path(msg_file_path)
        self.msg = None
        self.email_data = {}
        
    def read_msg_file(self):
        """
        Read the .msg file and extract all email data.
        
        Returns:
            dict: Dictionary containing all email information
        """
        try:
            # Open the .msg file
            self.msg = extract_msg.Message(self.msg_file_path)
            
            # Extract basic email information
            self.email_data = {
                'file_path': str(self.msg_file_path),
                'subject': self.msg.subject or '',
                'sender': self.msg.sender or '',
                'to': self.msg.to or '',
                'cc': self.msg.cc or '',
                'bcc': self.msg.bcc or '',
                'date': self.msg.date or '',
                'body': self.msg.body or '',
                'html_body': self.msg.htmlBody or '',
                'attachments': [],
                'headers': dict(self.msg.header) if hasattr(self.msg, 'header') else {}
            }
            
            # Extract attachments
            self._extract_attachments()
            
            return self.email_data
            
        except Exception as e:
            logger.error(f"Error reading .msg file: {e}")
            return None
    
    def _extract_attachments(self):
        """
        Extract all attachments from the email.
        """
        try:
            if self.msg and hasattr(self.msg, 'attachments') and self.msg.attachments:
                for attachment in self.msg.attachments:
                    # Get attachment data safely
                    attachment_data_raw = getattr(attachment, 'data', None)
                    data_size = 0
                    encoded_data = None
                    
                    if attachment_data_raw is not None:
                        try:
                            # Ensure we have bytes for size calculation and encoding
                            if isinstance(attachment_data_raw, bytes):
                                data_size = len(attachment_data_raw)
                                encoded_data = base64.b64encode(attachment_data_raw).decode('utf-8')
                            else:
                                # Try to convert to bytes if it's not already
                                data_bytes = bytes(attachment_data_raw)
                                data_size = len(data_bytes)
                                encoded_data = base64.b64encode(data_bytes).decode('utf-8')
                        except (TypeError, AttributeError):
                            # If conversion fails, skip this attachment data
                            data_size = 0
                            encoded_data = None
                    
                    attachment_data = {
                        'filename': getattr(attachment, 'longFilename', None) or getattr(attachment, 'shortFilename', None) or 'unknown',
                        'size': data_size,
                        'content_type': getattr(attachment, 'mimetype', None) or 'application/octet-stream',
                        'data': encoded_data
                    }
                    self.email_data['attachments'].append(attachment_data)
        except Exception as e:
            logger.error(f"Error extracting attachments: {e}")
    
    def save_attachments(self, output_dir=None):
        """
        Save all attachments to a specified directory.
        
        Args:
            output_dir (str): Directory to save attachments. If None, saves to current directory.
            
        Returns:
            list: List of saved file paths
        """
        if not self.email_data or not self.email_data['attachments']:
            logger.info("No attachments found or email not read yet.")
            return []
        
        if output_dir is None:
            output_dir = Path.cwd() / "extracted_attachments"
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(exist_ok=True)
        saved_files = []
        
        try:
            for i, attachment in enumerate(self.email_data['attachments']):
                if attachment['data']:
                    # Decode the base64 data
                    file_data = base64.b64decode(attachment['data'])
                    
                    # Create safe filename
                    safe_filename = self._sanitize_filename(attachment['filename'])
                    if not safe_filename:
                        safe_filename = f"attachment_{i+1}"
                    
                    file_path = output_dir / safe_filename
                    
                    # Write the file
                    with open(file_path, 'wb') as f:
                        f.write(file_data)
                    
                    saved_files.append(str(file_path))
                    logger.info(f"Saved attachment: {file_path}")
            
            return saved_files
            
        except Exception as e:
            logger.error(f"Error saving attachments: {e}")
            return []
    
    def _sanitize_filename(self, filename):
        """
        Sanitize filename to remove invalid characters.
        
        Args:
            filename (str): Original filename
            
        Returns:
            str: Sanitized filename
        """
        if not filename:
            return None
        
        # Remove or replace invalid characters for both files and directories
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        # Additional Windows-specific invalid characters
        invalid_chars_windows = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
        for char in invalid_chars_windows:
            filename = filename.replace(char, '_')
        
        # Remove leading/trailing dots and spaces
        filename = filename.strip('. ')
        
        # Limit length to avoid Windows path length issues
        if len(filename) > 100:
            filename = filename[:100]
        
        return filename.strip()
    
    def get_email_summary(self):
        """
        Get a summary of the email content.
        
        Returns:
            dict: Email summary
        """
        if not self.email_data:
            return None
        
        return {
            'subject': self.email_data['subject'],
            'sender': self.email_data['sender'],
            'date': self.email_data['date'],
            'body_preview': self.email_data['body'][:200] + '...' if len(self.email_data['body']) > 200 else self.email_data['body'],
            'attachment_count': len(self.email_data['attachments']),
            'attachment_names': [att['filename'] for att in self.email_data['attachments']]
        }
    
    def get_attachments_for_cloudinary(self):
        """
        Get attachments in format suitable for Cloudinary upload.
        
        Returns:
            list: List of attachment data with binary content
        """
        attachments = []
        
        if not self.email_data or not self.email_data['attachments']:
            return attachments
        
        for attachment in self.email_data['attachments']:
            if attachment['data']:
                # Decode base64 data for Cloudinary upload
                file_data = base64.b64decode(attachment['data'])
                
                attachments.append({
                    'filename': attachment['filename'],
                    'data': file_data,
                    'content_type': attachment['content_type'],
                    'size': attachment['size']
                })
        
        return attachments

# Utility functions for batch processing
def sanitize_directory_name(name):
    """
    Sanitize a name to be safe for use as a directory name on Windows.
    
    Args:
        name (str): Original name
        
    Returns:
        str: Sanitized directory name
    """
    if not name:
        return "unnamed"
    
    # Replace invalid characters for Windows directory names
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        name = name.replace(char, '_')
    
    # Remove leading/trailing dots and spaces
    name = name.strip('. ')
    
    # Limit length
    if len(name) > 100:
        name = name[:100]
    
    # Ensure it's not empty
    if not name:
        name = "unnamed"
    
    return name

def get_email_body_text(msg_file_path):
    """
    Simple function to get just the email body text from a .msg file.
    
    Args:
        msg_file_path (str): Path to the .msg file
        
    Returns:
        str: Email body text
    """
    try:
        reader = MSGFileReader(msg_file_path)
        email_data = reader.read_msg_file()
        
        if email_data:
            return email_data['body']
        else:
            return None
    except Exception as e:
        logger.error(f"Error reading email body: {e}")
        return None

def get_attachments_info(msg_file_path):
    """
    Get information about attachments in a .msg file.
    
    Args:
        msg_file_path (str): Path to the .msg file
        
    Returns:
        list: List of attachment information dictionaries
    """
    try:
        reader = MSGFileReader(msg_file_path)
        email_data = reader.read_msg_file()
        
        if email_data and email_data['attachments']:
            return email_data['attachments']
        else:
            return []
    except Exception as e:
        logger.error(f"Error reading attachments: {e}")
        return []