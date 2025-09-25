// Core Business Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  lastLogin?: Date;
  permissions: Permission[];
}

export type UserRole = 
  | 'facultative_underwriter'
  | 'portfolio_manager'
  | 'senior_manager'
  | 'cedant'
  | 'broker'
  | 'regulator'
  | 'admin';

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'approve' | 'admin')[];
}

// Submission Types
export interface Submission {
  id: string;
  reference: string;
  cedant: Cedant;
  broker?: Broker;
  insured: Insured;
  riskDetails: RiskDetails;
  financialDetails: FinancialDetails;
  status: SubmissionStatus;
  priority: Priority;
  submissionDate: Date;
  dueDate: Date;
  assignedTo?: string;
  documents: Document[];
  workingSheet: WorkingSheet;
  aiAnalysis?: AIAnalysis;
  decisionHistory: DecisionEvent[];
  tags: string[];
  version: number;
}

export type SubmissionStatus = 
  | 'pending_review'
  | 'under_analysis'
  | 'pricing_review'
  | 'portfolio_check'
  | 'awaiting_approval'
  | 'approved'
  | 'declined'
  | 'bound'
  | 'expired';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Cedant {
  id: string;
  name: string;
  country: string;
  rating?: string;
  relationship: 'treaty_partner' | 'facultative_only' | 'new_client';
  contactPerson: string;
  email: string;
}

export interface Broker {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  market: string;
}

export interface Insured {
  name: string;
  business: string;
  country: string;
  industry: string;
  yearEstablished?: number;
  rating?: string;
}

export interface RiskDetails {
  classOfBusiness: string;
  peril: string[];
  geography: string;
  sumInsured: number;
  currency: string;
  policyPeriod: {
    from: Date;
    to: Date;
  };
  deductible?: number;
  attachmentPoint?: number;
  limit?: number;
  occupancy?: string;
  construction?: string;
  protection?: string;
  exposure?: string;
}

export interface FinancialDetails {
  grossPremium: number;
  commission: number;
  brokerage: number;
  requestedShare: number; // percentage
  minimumShare?: number;
  maximumShare?: number;
  currency: string;
  exchangeRate?: number;
}

// Working Sheet (Appendix 1)
export interface WorkingSheet {
  id: string;
  submissionId: string;
  version: number;
  lastModified: Date;
  modifiedBy: string;
  
  // Basic Information
  basicInfo: {
    insuredName: string;
    cedantName: string;
    brokerName?: string;
    classOfBusiness: string;
    country: string;
    currency: string;
  };
  
  // Risk Information
  riskInfo: {
    peril: string[];
    sumInsured: number;
    policyPeriod: string;
    deductible: number;
    occupancy: string;
    construction: string;
    yearBuilt?: number;
    numberOfLocations: number;
  };
  
  // Loss History
  lossHistory: LossRecord[];
  
  // Exposure Analysis
  exposureAnalysis: {
    pml: number;
    aal: number; // Average Annual Loss
    returnPeriods: ReturnPeriod[];
    catastropheExposure: CatExposure[];
    concentration: ConcentrationMetrics;
  };
  
  // Pricing
  pricing: {
    technicalRate: number;
    loadings: PricingLoading[];
    finalRate: number;
    grossPremium: number;
    commission: number;
    netPremium: number;
    competitorRates?: CompetitorRate[];
  };
  
  // Recommendations
  recommendations: {
    recommendedShare: number;
    rationale: string;
    conditions: string[];
    exclusions: string[];
    riskFactors: RiskFactor[];
  };
}

export interface LossRecord {
  year: number;
  event: string;
  lossAmount: number;
  currency: string;
  description?: string;
}

export interface ReturnPeriod {
  years: number;
  loss: number;
}

export interface CatExposure {
  peril: string;
  pml: number;
  returnPeriod: number;
  zone?: string;
}

export interface ConcentrationMetrics {
  byGeography: { [key: string]: number };
  byClass: { [key: string]: number };
  byCedant: { [key: string]: number };
}

export interface PricingLoading {
  type: string;
  factor: number;
  description: string;
}

export interface CompetitorRate {
  competitor: string;
  rate: number;
  share: number;
  source: string;
  date: Date;
}

export interface RiskFactor {
  category: string;
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  submissionId: string;
  timestamp: Date;
  version: string;
  
  dataExtraction: {
    confidence: number;
    extractedFields: ExtractedField[];
    missingFields: string[];
    warnings: string[];
  };
  
  riskAssessment: {
    riskScore: number;
    riskFactors: AIRiskFactor[];
    pmlEstimate: number;
    confidenceInterval: [number, number];
    methodology: string;
  };
  
  pricingRecommendation: {
    recommendedRate: number;
    rateRange: [number, number];
    rationale: string;
    keyFactors: string[];
    benchmarkComparison: BenchmarkComparison[];
  };
  
  portfolioImpact: {
    concentrationIncrease: number;
    diversificationBenefit: number;
    correlationRisk: number;
    capitalRequirement: number;
    rocImpact: number;
  };
  
  explainability: {
    featureImportance: FeatureImportance[];
    decisionPath: DecisionNode[];
    similarCases: SimilarCase[];
    modelConfidence: number;
  };
}

export interface ExtractedField {
  field: string;
  value: any;
  confidence: number;
  source: string; // which document/page
}

export interface AIRiskFactor {
  factor: string;
  impact: number; // -1 to 1
  confidence: number;
  explanation: string;
}

export interface BenchmarkComparison {
  benchmark: string;
  ourRate: number;
  marketRate: number;
  deviation: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'increases' | 'decreases';
  explanation: string;
}

export interface DecisionNode {
  condition: string;
  outcome: string;
  probability: number;
  path: string[];
}

export interface SimilarCase {
  submissionId: string;
  similarity: number;
  keyMatches: string[];
  outcome: string;
  date: Date;
}

// Portfolio Types
export interface Portfolio {
  totalExposure: number;
  currency: string;
  activePolicies: number;
  grossPremium: number;
  netPremium: number;
  lossRatio: number;
  roc: number; // Return on Capital
  
  exposureByClass: { [key: string]: number };
  exposureByGeography: { [key: string]: number };
  exposureByCedant: { [key: string]: number };
  
  concentrationLimits: ConcentrationLimit[];
  utilizationMetrics: UtilizationMetric[];
  
  performanceMetrics: PerformanceMetric[];
  trendsAnalysis: TrendAnalysis[];
}

export interface ConcentrationLimit {
  dimension: string; // 'class', 'geography', 'cedant', etc.
  category: string;
  limit: number;
  current: number;
  utilization: number; // percentage
  status: 'ok' | 'warning' | 'exceeded';
}

export interface UtilizationMetric {
  metric: string;
  capacity: number;
  utilized: number;
  available: number;
  utilizationRate: number;
}

export interface PerformanceMetric {
  period: string;
  grossPremium: number;
  netPremium: number;
  claims: number;
  lossRatio: number;
  expenseRatio: number;
  combinedRatio: number;
  roc: number;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  period: string;
  forecast?: number;
}

// Document Types
export interface Document {
  id: string;
  submissionId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  uploadedBy: string;
  category: DocumentCategory;
  status: DocumentStatus;
  extractedData?: any;
  annotations: Annotation[];
  version: number;
  checksum: string;
}

export type DocumentCategory = 
  | 'submission_slip'
  | 'risk_report'
  | 'loss_history'
  | 'survey_report'
  | 'financial_statements'
  | 'photos'
  | 'maps'
  | 'correspondence'
  | 'other';

export type DocumentStatus = 
  | 'uploading'
  | 'processing'
  | 'processed'
  | 'failed'
  | 'archived';

export interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  type: 'highlight' | 'comment' | 'flag';
  content: string;
  position: {
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  timestamp: Date;
  resolved?: boolean;
}

// Decision & Workflow Types
export interface DecisionEvent {
  id: string;
  submissionId: string;
  timestamp: Date;
  userId: string;
  action: DecisionAction;
  fromStatus: SubmissionStatus;
  toStatus: SubmissionStatus;
  decision?: Decision;
  comments?: string;
  attachments?: string[];
}

export type DecisionAction = 
  | 'submit'
  | 'assign'
  | 'analyze'
  | 'price'
  | 'review'
  | 'approve'
  | 'decline'
  | 'request_info'
  | 'bind'
  | 'archive';

export interface Decision {
  outcome: 'accept' | 'decline' | 'quote' | 'refer';
  shareOffered?: number;
  premium?: number;
  conditions?: string[];
  exclusions?: string[];
  validUntil?: Date;
  referralReason?: string;
}

// Market Intelligence Types
export interface MarketInsight {
  id: string;
  type: 'competitor_activity' | 'market_trend' | 'regulatory_change' | 'loss_event';
  title: string;
  content: string;
  source: string;
  date: Date;
  relevanceScore: number;
  tags: string[];
  impactAssessment?: string;
  relatedSubmissions?: string[];
}

// Reports and Templates
export interface ReportTemplate {
  id: string;
  name: string;
  type: 'acceptance_letter' | 'decline_letter' | 'quote_slip' | 'portfolio_report';
  template: string; // HTML template with variables
  variables: TemplateVariable[];
  createdBy: string;
  createdDate: Date;
  version: number;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  description: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Form and UI Types
export interface FilterOptions {
  status?: SubmissionStatus[];
  priority?: Priority[];
  classOfBusiness?: string[];
  cedant?: string[];
  assignedTo?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: any;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

// System Configuration
export interface SystemConfig {
  features: {
    emailIngestion: boolean;
    aiAnalysis: boolean;
    autoApproval: boolean;
    marketInsights: boolean;
  };
  limits: {
    maxFileSize: number;
    maxFilesPerSubmission: number;
    sessionTimeout: number;
  };
  workflows: WorkflowConfig[];
  notifications: NotificationConfig[];
}

export interface WorkflowConfig {
  role: UserRole;
  transitions: {
    from: SubmissionStatus;
    to: SubmissionStatus[];
    requiresApproval?: boolean;
    autoTriggers?: string[];
  }[];
}

export interface NotificationConfig {
  event: string;
  roles: UserRole[];
  channels: ('email' | 'inapp' | 'sms')[];
  template: string;
}