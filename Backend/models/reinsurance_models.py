"""
Pydantic models for the Facultative Reinsurance Working Sheet
Based on Appendix 1 format from Kenya Re guidelines
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class ClimateRiskLevel(str, Enum):
    MINIMAL = "Minimal"
    MODERATE = "Moderate"
    HIGH = "High"

class FacultativeReinsuranceWorkingSheet(BaseModel):
    """
    Complete Facultative Reinsurance Working Sheet model
    Based on Kenya Re guidelines and Appendix 1 format
    """
    # Basic Information
    insured: Optional[str] = Field(None, description="The original client that owns the risk")
    cedant: Optional[str] = Field(None, description="Insurance company that issued the original policy")
    broker: Optional[str] = Field(None, description="Intermediary facilitating the placement")
    
    # Risk Details
    perils_covered: Optional[str] = Field(None, description="Specific risks being insured")
    geographical_limit: Optional[str] = Field(None, description="Where insurance coverage applies")
    situation_of_risk: Optional[str] = Field(None, description="Physical location of the risk")
    occupation_of_insured: Optional[str] = Field(None, description="Business/industry of the insured")
    main_activities: Optional[str] = Field(None, description="Core operations the insured undertakes")
    
    # Financial Information
    total_sum_insured: Optional[float] = Field(None, description="Full value insured under the placement")
    tsi_breakdown: Optional[Dict[str, float]] = Field(None, description="Breakdown of TSI components")
    excess_deductible: Optional[float] = Field(None, description="Amount insured must bear before insurance responds")
    retention_of_cedant: Optional[float] = Field(None, description="Share of risk cedant keeps (percentage)")
    
    # Risk Assessment
    possible_maximum_loss_pml: Optional[float] = Field(None, description="Maximum probable loss percentage")
    cat_exposure: Optional[str] = Field(None, description="Natural catastrophe exposure assessment")
    period_of_insurance: Optional[str] = Field(None, description="Duration of coverage")
    reinsurance_deductions: Optional[float] = Field(None, description="Specific deductions under reinsurance contract")
    
    # Claims History
    claims_experience_last_3_years: Optional[List[Dict[str, Any]]] = Field(None, description="Claims record for last 3 years")
    loss_ratio_percentage: Optional[float] = Field(None, description="Calculated loss ratio for the period")
    
    # Offer Details
    share_offered: Optional[float] = Field(None, description="Portion of risk offered to this reinsurer")
    inward_acceptances: Optional[str] = Field(None, description="Risks accepted from another cedant")
    risk_surveyors_report: Optional[str] = Field(None, description="Technical inspection report")
    
    # Pricing
    premium_rates: Optional[float] = Field(None, description="Pricing rate applied to sum insured")
    premium_original_currency: Optional[float] = Field(None, description="Premium in original currency")
    premium_kes: Optional[float] = Field(None, description="Premium equivalent in KES")
    original_currency: Optional[str] = Field(None, description="Original currency of the placement")
    
    # ESG and Risk Factors
    climate_change_risk_factors: Optional[ClimateRiskLevel] = Field(None, description="Climate risk assessment")
    esg_risk_assessment: Optional[RiskLevel] = Field(None, description="Environmental, Social, Governance risk level")
    
    # Recommendations
    proposed_acceptance_share: Optional[float] = Field(None, description="Recommended share to accept")
    liability_original_currency: Optional[float] = Field(None, description="Monetary liability in original currency")
    liability_kes: Optional[float] = Field(None, description="Monetary liability in KES")
    
    # Analysis
    technical_assessment: Optional[str] = Field(None, description="Detailed risk analysis")
    market_considerations: Optional[str] = Field(None, description="Market conditions and competitor insights")
    portfolio_impact: Optional[str] = Field(None, description="Effect on reinsurer's overall book")
    proposed_terms_conditions: Optional[str] = Field(None, description="Recommended special terms or exclusions")
    positive_assessment: Optional[str] = Field(None, description="Positive factors strengthening the risk")
    
    # Decision
    final_recommendation: Optional[str] = Field(None, description="Final underwriting recommendation")
    recommended_share_percentage: Optional[float] = Field(None, description="Final recommended share percentage")
    
    # Metadata
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)
    analysis_version: str = Field(default="1.0")

class ClaimsExperience(BaseModel):
    """Model for claims experience data"""
    year: int
    paid_losses: Optional[float] = None
    outstanding_reserves: Optional[float] = None
    recoveries: Optional[float] = None
    earned_premium: Optional[float] = None
    loss_ratio: Optional[float] = None
    claim_frequency: Optional[int] = None
    claim_causes: Optional[List[str]] = None

class RiskCalculations(BaseModel):
    """Model for risk calculation results"""
    premium_rate_percentage: Optional[float] = None
    premium_rate_per_mille: Optional[float] = None
    loss_ratio_3_year_average: Optional[float] = None
    accepted_premium: Optional[float] = None
    accepted_liability: Optional[float] = None
    pml_assessment: Optional[str] = None
    
class MarketAnalysis(BaseModel):
    """Model for market analysis and competitive intelligence"""
    market_conditions: Optional[str] = None
    competitor_pricing: Optional[List[Dict[str, Any]]] = None
    industry_trends: Optional[str] = None
    negotiation_factors: Optional[List[str]] = None
    market_capacity: Optional[str] = None

class PortfolioImpact(BaseModel):
    """Model for portfolio impact assessment"""
    concentration_risk: Optional[str] = None
    diversification_benefit: Optional[str] = None
    exposure_limits: Optional[Dict[str, float]] = None
    correlation_analysis: Optional[str] = None
    capital_impact: Optional[float] = None

class EmailData(BaseModel):
    """Email data extracted from .msg file"""
    sender: str
    subject: str
    body: str
    date: datetime
    attachments: List[Dict[str, Any]]

class EmailProcessingResult(BaseModel):
    """Result of email processing with attachments"""
    email_data: Dict[str, Any]
    attachments_uploaded: List[Dict[str, Any]]
    document_analysis: Optional[List[Dict[str, Any]]] = None
    extraction_success: bool = True
    processing_errors: Optional[List[str]] = None

class AIAnalysisResult(BaseModel):
    """Complete AI analysis result"""
    working_sheet: FacultativeReinsuranceWorkingSheet
    risk_calculations: RiskCalculations
    market_analysis: MarketAnalysis
    portfolio_impact: PortfolioImpact
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    analysis_notes: Optional[str] = None
    recommendations: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)