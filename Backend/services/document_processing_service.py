"""
Document Processing Service using LlamaParse
Extracts structured text, tables, and images from reinsurance documents
"""
import os
import logging
import tempfile
import requests
from typing import Dict, Any, List, Optional
from llama_parse import LlamaParse

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    def __init__(self):
        """Initialize LlamaParse with API key"""
        self.api_key = os.getenv('LLAMA_CLOUD_API_KEY')
        if not self.api_key:
            logger.warning("LLAMA_CLOUD_API_KEY not found, document parsing will be limited")
            self.parser = None
        else:
            from llama_parse import ResultType
            self.parser = LlamaParse(
                api_key=self.api_key,
                result_type=ResultType.MD,  # Get structured markdown output
                language="en",
                parsing_instruction="""
                This document contains reinsurance submission information. 
                Please extract:
                1. Company and contact information
                2. Risk details (perils, locations, sums insured)
                3. Financial information (premiums, deductibles, limits)
                4. Claims history and loss experience
                5. Technical details (construction, protection systems)
                6. Any tables with numerical data
                7. Policy terms and conditions
                
                Preserve all numerical values, percentages, dates, and financial figures exactly.
                Maintain table structure where possible.
                """
            )
    
    def process_documents(self, cloudinary_urls: List[str]) -> List[Dict[str, Any]]:
        """
        Process multiple documents from Cloudinary URLs
        
        Args:
            cloudinary_urls: List of Cloudinary URLs to process
            
        Returns:
            List of processed document data
        """
        results = []
        
        for url in cloudinary_urls:
            try:
                doc_result = self.process_single_document(url)
                results.append(doc_result)
            except Exception as e:
                logger.error(f"Failed to process document {url}: {str(e)}")
                results.append({
                    "url": url,
                    "status": "failed",
                    "error": str(e),
                    "extracted_text": "",
                    "tables": [],
                    "metadata": {}
                })
        
        return results
    
    def process_single_document(self, cloudinary_url: str) -> Dict[str, Any]:
        """
        Process a single document from Cloudinary URL
        
        Args:
            cloudinary_url: Cloudinary URL of the document
            
        Returns:
            Processed document data
        """
        try:
            if not self.parser:
                return self._fallback_processing(cloudinary_url)
            
            # Download the document temporarily
            response = requests.get(cloudinary_url, timeout=30)
            
            # Handle 401 unauthorized errors specifically
            if response.status_code == 401:
                logger.error(f"Access denied to document {cloudinary_url}. File may be private.")
                return {
                    "url": cloudinary_url,
                    "status": "access_denied",
                    "error": "401 Unauthorized - File may be private or access denied",
                    "extracted_text": f"Document at {cloudinary_url} requires authentication",
                    "tables": [],
                    "metadata": {"error_type": "access_denied"}
                }
            
            response.raise_for_status()
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(response.content)
                temp_file_path = temp_file.name
            
            try:
                # Parse with LlamaParse
                documents = self.parser.load_data(temp_file_path)
                
                # Extract content
                extracted_text = ""
                tables = []
                
                for doc in documents:
                    extracted_text += doc.text + "\n\n"
                    
                    # Try to extract tables (basic implementation)
                    if hasattr(doc, 'metadata') and doc.metadata:
                        if 'tables' in doc.metadata:
                            tables.extend(doc.metadata['tables'])
                
                # Clean up
                os.unlink(temp_file_path)
                
                return {
                    "url": cloudinary_url,
                    "status": "success",
                    "extracted_text": extracted_text.strip(),
                    "tables": tables,
                    "metadata": {
                        "document_count": len(documents),
                        "total_characters": len(extracted_text),
                        "processing_method": "llamaparse"
                    }
                }
                
            except Exception as parse_error:
                # Clean up temp file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                raise parse_error
                
        except Exception as e:
            logger.error(f"Error processing document {cloudinary_url}: {str(e)}")
            return self._fallback_processing(cloudinary_url)
    
    def _fallback_processing(self, cloudinary_url: str) -> Dict[str, Any]:
        """
        Fallback processing when LlamaParse is not available
        """
        return {
            "url": cloudinary_url,
            "status": "limited",
            "extracted_text": f"Document available at: {cloudinary_url}\n[LlamaParse not available - manual review required]",
            "tables": [],
            "metadata": {
                "processing_method": "fallback",
                "note": "Limited processing - manual review recommended"
            }
        }
    
    def extract_key_information(self, processed_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract key reinsurance information from processed documents
        
        Args:
            processed_docs: List of processed document results
            
        Returns:
            Extracted key information
        """
        combined_text = ""
        all_tables = []
        
        for doc in processed_docs:
            if doc.get("status") in ["success", "limited"]:
                combined_text += doc.get("extracted_text", "") + "\n\n"
                all_tables.extend(doc.get("tables", []))
        
        # Basic information extraction (can be enhanced with NLP)
        key_info = {
            "combined_text": combined_text,
            "tables": all_tables,
            "document_count": len(processed_docs),
            "total_text_length": len(combined_text),
            "processing_summary": self._generate_processing_summary(processed_docs)
        }
        
        return key_info
    
    def _generate_processing_summary(self, processed_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of document processing results"""
        
        success_count = sum(1 for doc in processed_docs if doc.get("status") == "success")
        failed_count = sum(1 for doc in processed_docs if doc.get("status") == "failed")
        limited_count = sum(1 for doc in processed_docs if doc.get("status") == "limited")
        
        return {
            "total_documents": len(processed_docs),
            "successful_parses": success_count,
            "failed_parses": failed_count,
            "limited_parses": limited_count,
            "success_rate": success_count / len(processed_docs) if processed_docs else 0
        }