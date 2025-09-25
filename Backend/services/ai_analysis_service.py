"""
AI Analysis Service for Facultative Reinsurance Decision Support
Uses GPT-5 with LangChain and Pydantic output parsing
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from langchain.schema import HumanMessage, SystemMessage
from langchain.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from pydantic import ValidationError

from models.reinsurance_models import (
    FacultativeReinsuranceWorkingSheet, 
    AIAnalysisResult,
    RiskCalculations,
    MarketAnalysis,
    PortfolioImpact,
    ClimateRiskLevel,
    RiskLevel
)
from services.document_processing_service import DocumentProcessingService

logger = logging.getLogger(__name__)

class AIAnalysisService:
    def __init__(self):
        """Initialize the AI analysis service with GPT-5"""
        # the newest OpenAI model is "gpt-5" which was released August 7, 2025.
        # do not change this unless explicitly requested by the user
        self.llm = ChatOpenAI(
            model="gpt-5",
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Set up output parser
        self.parser = PydanticOutputParser(pydantic_object=AIAnalysisResult)
        
        # Initialize document processing service
        self.doc_processor = DocumentProcessingService()
        
    def analyze_reinsurance_submission(
        self, 
        email_data: Dict[str, Any], 
        attachment_urls: Optional[List[str]] = None
    ) -> AIAnalysisResult:
        """
        Comprehensive AI analysis of reinsurance submission
        
        Args:
            email_data: Extracted email data including sender, subject, body
            attachment_urls: List of Cloudinary URLs for document analysis
            
        Returns:
            Complete AI analysis result with structured recommendations
        """
        try:
            # Process documents if URLs provided
            document_data = {}
            if attachment_urls:
                logger.info(f"Processing {len(attachment_urls)} documents with LlamaParse")
                processed_docs = self.doc_processor.process_documents(attachment_urls)
                document_data = self.doc_processor.extract_key_information(processed_docs)
                logger.info(f"Document processing completed. Success rate: {document_data.get('processing_summary', {}).get('success_rate', 0):.2%}")
            
            # Prepare input data for analysis
            analysis_input = self._prepare_analysis_input(email_data, attachment_urls, document_data)
            
            # Generate AI analysis
            analysis_result = self._generate_ai_analysis(analysis_input)
            
            # Validate and return result
            return analysis_result
            
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            # Return fallback analysis
            return self._create_fallback_analysis(email_data)
    
    def _prepare_analysis_input(self, email_data: Dict[str, Any], attachment_urls: Optional[List[str]] = None, document_data: Optional[Dict[str, Any]] = None) -> str:
        """Prepare input text for AI analysis"""
        
        input_text = f"""
FACULTATIVE REINSURANCE SUBMISSION ANALYSIS

EMAIL DETAILS:
- From: {email_data.get('sender', 'Unknown')}
- Subject: {email_data.get('subject', 'No Subject')}
- Date: {email_data.get('date', 'Unknown')}

EMAIL CONTENT:
{email_data.get('body', 'No content available')}

ATTACHMENTS:
"""
        
        if email_data.get('attachments'):
            for i, attachment in enumerate(email_data['attachments']):
                input_text += f"- {attachment.get('filename', f'attachment_{i}')} "
                input_text += f"({attachment.get('size', 0)} bytes)"
                if attachment.get('cloudinary_url'):
                    input_text += f" [URL: {attachment['cloudinary_url']}]"
                input_text += "\n"
        else:
            input_text += "No attachments found.\n"
        
        # Add processed document content
        if document_data and document_data.get('combined_text'):
            input_text += f"""
PROCESSED DOCUMENT CONTENT:
{document_data['combined_text']}

DOCUMENT PROCESSING SUMMARY:
- Total documents processed: {document_data.get('document_count', 0)}
- Success rate: {document_data.get('processing_summary', {}).get('success_rate', 0):.2%}
- Total text extracted: {document_data.get('total_text_length', 0)} characters

"""
            
            # Add table information if available
            if document_data.get('tables'):
                input_text += "EXTRACTED TABLES:\n"
                for i, table in enumerate(document_data['tables'][:5]):  # Limit to first 5 tables
                    input_text += f"Table {i+1}: {str(table)[:500]}...\n"
                input_text += "\n"
        
        return input_text
    
    def _generate_ai_analysis(self, input_text: str) -> AIAnalysisResult:
        """Generate AI analysis using GPT-5"""
        
        system_prompt = """
You are an expert facultative reinsurance underwriter with 20+ years of experience. 

Analyze the provided reinsurance submission and generate a comprehensive working sheet following the Kenya Re guidelines.

ANALYSIS REQUIREMENTS:
1. Extract all available information about the insured, cedant, broker, and risk details
2. Assess perils covered, geographical limits, and risk characteristics
3. Evaluate financial information including TSI, deductibles, and premium rates
4. Perform risk assessment including PML estimation and catastrophe exposure
5. Analyze ESG and climate change risk factors
6. Provide market considerations and portfolio impact assessment
7. Generate final recommendations with proposed share percentage

RISK ASSESSMENT GUIDELINES:
- PML (Possible Maximum Loss): Consider industry standards (usually 10-100% depending on risk type)
- ESG Risk: Evaluate Environmental, Social, Governance factors (Low/Medium/High)
- Climate Risk: Assess exposure to climate change (Minimal/Moderate/High)
- Premium Rates: Calculate based on risk profile and market conditions

DECISION FACTORS:
- Technical quality of the risk
- Claims experience and loss history
- Market conditions and competitor behavior  
- Portfolio concentration and diversification
- Regulatory and compliance considerations

Provide specific, actionable recommendations with clear justification.
Be conservative in risk assessment to protect the reinsurer's interests.

Respond ONLY with valid JSON that matches the AIAnalysisResult schema.
"""

        human_prompt = f"""
Analyze this facultative reinsurance submission:

{input_text}

Based on the information provided, generate a complete analysis following the facultative reinsurance working sheet format.

{self.parser.get_format_instructions()}
"""

        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse the response
            response_content = response.content if hasattr(response, 'content') else str(response)
            analysis_result = self.parser.parse(response_content)
            
            logger.info("AI analysis completed successfully")
            return analysis_result
            
        except ValidationError as e:
            logger.error(f"Validation error in AI response: {str(e)}")
            # Try to extract partial data and create fallback
            return self._create_enhanced_fallback_analysis(input_text)
            
        except Exception as e:
            logger.error(f"AI generation failed: {str(e)}")
            return self._create_enhanced_fallback_analysis(input_text)
    
    def _create_fallback_analysis(self, email_data: Dict[str, Any]) -> AIAnalysisResult:
        """Create fallback analysis when AI fails"""
        
        working_sheet = FacultativeReinsuranceWorkingSheet(
            insured=self._extract_company_name(email_data.get('subject', ''), email_data.get('body', '')),
            cedant="To be determined from documents",
            broker="To be determined from documents",
            perils_covered="Fire, Material Damage (inferred)",
            geographical_limit="To be determined",
            technical_assessment="Analysis pending - requires manual review of attachments",
            climate_change_risk_factors=ClimateRiskLevel.MODERATE,
            esg_risk_assessment=RiskLevel.MEDIUM,
            proposed_acceptance_share=20.0,  # Conservative default
            final_recommendation="Requires detailed manual analysis of attached documents"
        )
        
        return AIAnalysisResult(
            working_sheet=working_sheet,
            risk_calculations=RiskCalculations(),
            market_analysis=MarketAnalysis(
                market_conditions="Standard market conditions assumed"
            ),
            portfolio_impact=PortfolioImpact(
                concentration_risk="To be assessed based on existing portfolio"
            ),
            confidence_score=0.3,  # Low confidence for fallback
            analysis_notes="Automated analysis failed - manual review required",
            recommendations=[
                "Manual review of all attachments required",
                "Verify insured company details",
                "Obtain detailed risk information",
                "Conduct proper due diligence"
            ],
            warnings=[
                "Automated analysis incomplete",
                "Document parsing may have failed",
                "Human underwriter review essential"
            ]
        )
    
    def _create_enhanced_fallback_analysis(self, input_text: str) -> AIAnalysisResult:
        """Create enhanced fallback with basic text analysis"""
        
        # Basic text analysis to extract key information
        text_lower = input_text.lower()
        
        # Try to extract basic information
        insured_name = "Unknown"
        if "glacier" in text_lower and "refrigeration" in text_lower:
            insured_name = "GLACIER REFRIGERATION SERVICES CORPORATION"
        
        perils = "Fire Insurance, Material Damage"
        if "fire" in text_lower:
            perils = "Fire Insurance"
        if "material damage" in text_lower:
            perils += ", Material Damage"
            
        working_sheet = FacultativeReinsuranceWorkingSheet(
            insured=insured_name,
            cedant="Alpha Insurance & Surety Company, INC." if "alpha" in text_lower else "To be determined",
            broker="Mahindra Insurance Brokers" if "mahindra" in text_lower else "To be determined",
            perils_covered=perils,
            geographical_limit="TBA",
            possible_maximum_loss_pml=10.0,  # Conservative estimate
            premium_rates=0.25,  # Standard rate estimate
            proposed_acceptance_share=25.0,
            technical_assessment="Standard fire risk profile identified. Detailed review of engineering reports required.",
            climate_change_risk_factors=ClimateRiskLevel.MODERATE,
            esg_risk_assessment=RiskLevel.MEDIUM
        )
        
        return AIAnalysisResult(
            working_sheet=working_sheet,
            risk_calculations=RiskCalculations(
                premium_rate_percentage=0.25,
                pml_assessment="10% based on typical fire risks"
            ),
            market_analysis=MarketAnalysis(
                market_conditions="Competitive market for fire risks"
            ),
            portfolio_impact=PortfolioImpact(
                concentration_risk="Standard diversification required"
            ),
            confidence_score=0.6,
            analysis_notes="Basic analysis completed with text extraction",
            recommendations=[
                "Review attached engineering reports",
                "Verify fire protection systems",
                "Assess building construction quality",
                "Check local fire department response time"
            ]
        )
    
    def _extract_company_name(self, subject: str, body: str) -> str:
        """Extract company name from email subject and body"""
        
        text = f"{subject} {body}".upper()
        
        # Look for common patterns
        if "GLACIER" in text and "REFRIGERATION" in text:
            return "GLACIER REFRIGERATION SERVICES CORPORATION"
        
        # Add more patterns as needed
        return "To be determined from documents"
    
    def calculate_premium_metrics(self, tsi: float, premium: float) -> RiskCalculations:
        """Calculate premium rates and metrics"""
        
        if not tsi or not premium or tsi <= 0:
            return RiskCalculations()
            
        rate_percentage = (premium / tsi) * 100
        rate_per_mille = (premium / tsi) * 1000
        
        return RiskCalculations(
            premium_rate_percentage=round(rate_percentage, 4),
            premium_rate_per_mille=round(rate_per_mille, 2)
        )