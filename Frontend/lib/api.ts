// API Service for Backend Integration
import { toast } from '@/hooks/use-toast';

// Backend API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ai-powered-facultative-reinsurancedecisionsupportsystem.replit.app';

// Types for API responses based on actual backend structure
export interface TaskStatus {
  task_id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progress?: number;
  current_status?: string;
  result?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  email_data: {
    subject: string;
    sender: string;
    date: string;
    body: string;
  };
  attachments_processed: number;
  attachments_uploaded: number;
  documents_analyzed: number;
  reinsurance_analysis: {
    working_sheet: {
      insured: string;
      cedant: string;
      broker: string;
      perils_covered: string;
      geographical_limit: string;
      situation_of_risk: string;
      occupation_of_insured: string;
      main_activities: string;
      total_sum_insured: number | null;
      tsi_breakdown: any;
      excess_deductible: number | null;
      retention_of_cedant: number | null;
      possible_maximum_loss_pml: number;
      cat_exposure: string;
      period_of_insurance: string;
      reinsurance_deductions: number;
      claims_experience_last_3_years: any;
      loss_ratio_percentage: number | null;
      share_offered: number | null;
      inward_acceptances: any;
      risk_surveyors_report: string;
      premium_rates: number;
      premium_original_currency: number | null;
      premium_kes: number | null;
      original_currency: string | null;
      climate_change_risk_factors: string;
      esg_risk_assessment: string;
      proposed_acceptance_share: number;
      liability_original_currency: number | null;
      liability_kes: number | null;
      technical_assessment: string;
      market_considerations: string;
      portfolio_impact: string;
      proposed_terms_conditions: string;
      positive_assessment: string;
      final_recommendation: string;
      recommended_share_percentage: number;
      analysis_timestamp: string;
      analysis_version: string;
    };
    risk_calculations: {
      premium_rate_percentage: number;
      premium_rate_per_mille: number;
      loss_ratio_3_year_average: number | null;
      accepted_premium: number | null;
      accepted_liability: number | null;
      pml_assessment: string;
    };
    market_analysis: {
      market_conditions: string;
      competitor_pricing: any;
      industry_trends: string;
      negotiation_factors: string[];
      market_capacity: string;
    };
    portfolio_impact: {
      concentration_risk: string;
      diversification_benefit: string;
      exposure_limits: any;
      correlation_analysis: string;
      capital_impact: number;
    };
    confidence_score: number;
    analysis_notes: string;
    recommendations: string[];
    warnings: string[];
  };
  processing_mode: string;
}

export interface ApiError {
  detail: string;
  error_code?: string;
}

// API Service Class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Submit file for analysis
  async submitAnalysis(file: File): Promise<{ task_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.makeRequest('/submit-analysis', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  }

  // Get task status
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return this.makeRequest(`/task-status/${taskId}`);
  }

  // Get task result
  async getTaskResult(taskId: string): Promise<AnalysisResult> {
    return this.makeRequest(`/task-result/${taskId}`);
  }

  // Poll task status until completion
  async pollTaskStatus(
    taskId: string,
    onStatusUpdate?: (status: TaskStatus) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<TaskStatus> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await this.getTaskStatus(taskId);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        if (status.status === 'SUCCESS' || status.status === 'FAILED') {
          return status;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
      } catch (error) {
        console.error('Error polling task status:', error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error('Task polling timeout');
        }
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Task polling timeout');
  }

  // Complete analysis workflow
  async analyzeFile(
    file: File,
    onProgress?: (progress: { status: string; progress?: number; message?: string }) => void
  ): Promise<AnalysisResult> {
    try {
      // Submit file
      onProgress?.({ status: 'Submitting file...', progress: 0 });
      const { task_id } = await this.submitAnalysis(file);
      
      // Poll for completion
      onProgress?.({ status: 'Processing...', progress: 10 });
      const finalStatus = await this.pollTaskStatus(
        task_id,
        (status) => {
          onProgress?.({
            status: status.current_status || 'Processing...',
            progress: status.progress || 10,
          });
        }
      );

      if (finalStatus.status === 'FAILED') {
        throw new Error(finalStatus.error || 'Analysis failed');
      }

      // Return the result from the status response
      if (finalStatus.result) {
        onProgress?.({ status: 'Complete!', progress: 100 });
        return finalStatus.result;
      }

      // Fallback: get result separately if not included in status
      onProgress?.({ status: 'Retrieving results...', progress: 90 });
      const result = await this.getTaskResult(task_id);
      
      onProgress?.({ status: 'Complete!', progress: 100 });
      return result;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'Kshs'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const getRiskScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-red-600 bg-red-100';
  if (score >= 0.6) return 'text-orange-600 bg-orange-100';
  if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
};

export const getRiskScoreLabel = (score: number): string => {
  if (score >= 0.8) return 'High Risk';
  if (score >= 0.6) return 'Medium-High Risk';
  if (score >= 0.4) return 'Medium Risk';
  return 'Low Risk';
};

export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-100';
  if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.8) return 'High Confidence';
  if (confidence >= 0.6) return 'Medium Confidence';
  return 'Low Confidence';
};
