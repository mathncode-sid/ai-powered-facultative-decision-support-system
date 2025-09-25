// Application Constants

// Brand Colors (extracted from Kenya RE logo)
export const BRAND_COLORS = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2', 
    500: '#DC2626', // Main red from logo
    600: '#B91C1C',
    900: '#7F1D1D'
  },
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#1E40AF', // Navy blue from logo
    600: '#1D4ED8',
    900: '#1E3A8A'
  },
  accent: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748B',
    600: '#475569',
    900: '#0f172a'
  }
} as const;

// User Role Definitions
export const USER_ROLES = {
  FACULTATIVE_UNDERWRITER: 'facultative_underwriter',
  PORTFOLIO_MANAGER: 'portfolio_manager', 
  SENIOR_MANAGER: 'senior_manager',
  CEDANT: 'cedant',
  BROKER: 'broker',
  REGULATOR: 'regulator',
  ADMIN: 'admin'
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.FACULTATIVE_UNDERWRITER]: 'Facultative Underwriter',
  [USER_ROLES.PORTFOLIO_MANAGER]: 'Portfolio Manager',
  [USER_ROLES.SENIOR_MANAGER]: 'Senior Manager', 
  [USER_ROLES.CEDANT]: 'Cedant',
  [USER_ROLES.BROKER]: 'Broker',
  [USER_ROLES.REGULATOR]: 'Regulator',
  [USER_ROLES.ADMIN]: 'Administrator'
} as const;

// Submission Status Flow
export const SUBMISSION_STATUS = {
  PENDING_REVIEW: 'pending_review',
  UNDER_ANALYSIS: 'under_analysis', 
  PRICING_REVIEW: 'pricing_review',
  PORTFOLIO_CHECK: 'portfolio_check',
  AWAITING_APPROVAL: 'awaiting_approval',
  APPROVED: 'approved',
  DECLINED: 'declined',
  BOUND: 'bound',
  EXPIRED: 'expired'
} as const;

export const STATUS_LABELS = {
  [SUBMISSION_STATUS.PENDING_REVIEW]: 'Pending Review',
  [SUBMISSION_STATUS.UNDER_ANALYSIS]: 'Under Analysis',
  [SUBMISSION_STATUS.PRICING_REVIEW]: 'Pricing Review', 
  [SUBMISSION_STATUS.PORTFOLIO_CHECK]: 'Portfolio Check',
  [SUBMISSION_STATUS.AWAITING_APPROVAL]: 'Awaiting Approval',
  [SUBMISSION_STATUS.APPROVED]: 'Approved',
  [SUBMISSION_STATUS.DECLINED]: 'Declined',
  [SUBMISSION_STATUS.BOUND]: 'Bound',
  [SUBMISSION_STATUS.EXPIRED]: 'Expired'
} as const;

export const STATUS_COLORS = {
  [SUBMISSION_STATUS.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-800',
  [SUBMISSION_STATUS.UNDER_ANALYSIS]: 'bg-blue-100 text-blue-800',
  [SUBMISSION_STATUS.PRICING_REVIEW]: 'bg-purple-100 text-purple-800',
  [SUBMISSION_STATUS.PORTFOLIO_CHECK]: 'bg-orange-100 text-orange-800', 
  [SUBMISSION_STATUS.AWAITING_APPROVAL]: 'bg-amber-100 text-amber-800',
  [SUBMISSION_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [SUBMISSION_STATUS.DECLINED]: 'bg-red-100 text-red-800',
  [SUBMISSION_STATUS.BOUND]: 'bg-emerald-100 text-emerald-800',
  [SUBMISSION_STATUS.EXPIRED]: 'bg-gray-100 text-gray-800'
} as const;

// Priority Levels  
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: 'bg-gray-100 text-gray-800',
  [PRIORITY_LEVELS.MEDIUM]: 'bg-blue-100 text-blue-800',
  [PRIORITY_LEVELS.HIGH]: 'bg-orange-100 text-orange-800',
  [PRIORITY_LEVELS.URGENT]: 'bg-red-100 text-red-800'
} as const;

// Classes of Business
export const CLASSES_OF_BUSINESS = [
  'Property',
  'Motor',
  'Marine Hull', 
  'Marine Cargo',
  'Aviation Hull',
  'Aviation Liability',
  'Energy',
  'Engineering',
  'Liability',
  'Credit & Political Risk',
  'Cyber',
  'Directors & Officers',
  'Professional Indemnity',
  'Workers Compensation',
  'Agriculture',
  'Terrorism'
] as const;

// Perils
export const PERILS = [
  'Fire',
  'Explosion', 
  'Earthquake',
  'Flood',
  'Windstorm',
  'Hail',
  'Lightning',
  'Theft',
  'Malicious Damage',
  'Impact by Vehicles',
  'Aircraft Impact',
  'Subsidence',
  'Landslide', 
  'Tsunami',
  'Terrorism',
  'Cyber Attack',
  'Business Interruption',
  'All Risks',
  'Named Perils'
] as const;

// Currencies
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'KES', 'ZAR', 'NGN', 'EGP', 'MAD', 'TZS', 'UGX'
] as const;

// Document Categories
export const DOCUMENT_CATEGORIES = {
  SUBMISSION_SLIP: 'submission_slip',
  RISK_REPORT: 'risk_report',
  LOSS_HISTORY: 'loss_history',
  SURVEY_REPORT: 'survey_report', 
  FINANCIAL_STATEMENTS: 'financial_statements',
  PHOTOS: 'photos',
  MAPS: 'maps',
  CORRESPONDENCE: 'correspondence',
  OTHER: 'other'
} as const;

// AI Model Configuration
export const AI_CONFIG = {
  CONFIDENCE_THRESHOLDS: {
    DATA_EXTRACTION: 0.8,
    RISK_ASSESSMENT: 0.7,
    PRICING_RECOMMENDATION: 0.75
  },
  RATE_LIMITS: {
    ANALYSIS_PER_HOUR: 100,
    BATCH_SIZE: 10
  }
} as const;

// Portfolio Limits and Thresholds
export const PORTFOLIO_LIMITS = {
  CONCENTRATION_LIMITS: {
    SINGLE_RISK: 0.1, // 10% of capacity
    SINGLE_CEDANT: 0.2, // 20% of capacity
    SINGLE_CLASS: 0.3, // 30% of capacity
    SINGLE_GEOGRAPHY: 0.4, // 40% of capacity
    SINGLE_PERIL: 0.25 // 25% of capacity
  },
  WARNING_THRESHOLDS: {
    CONCENTRATION: 0.8, // 80% of limit
    LOSS_RATIO: 0.6, // 60%
    COMBINED_RATIO: 1.0 // 100%
  }
} as const;

// Navigation Menu Items
export const NAVIGATION_ITEMS = {
  [USER_ROLES.FACULTATIVE_UNDERWRITER]: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Submissions', href: '/submissions', icon: 'FileText' },
    // { label: 'Document Viewer', href: '/documents', icon: 'FileImage' },
    // { label: 'Risk Assessment', href: '/risk-assessment', icon: 'Shield' },
    // { label: 'Pricing', href: '/pricing', icon: 'Calculator' },
    { label: 'Portfolio Impact', href: '/portfolio-impact', icon: 'TrendingUp' },
    { label: 'Market Insights', href: '/market-insights', icon: 'BarChart3' },
    { label: 'Reports', href: '/reports', icon: 'FileOutput' }
  ],
  [USER_ROLES.PORTFOLIO_MANAGER]: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Portfolio Overview', href: '/portfolio', icon: 'PieChart' },
    { label: 'Concentration Analysis', href: '/concentration', icon: 'Target' },
    { label: 'Performance Metrics', href: '/performance', icon: 'TrendingUp' },
    { label: 'Risk Monitoring', href: '/risk-monitoring', icon: 'AlertTriangle' },
    { label: 'Market Analysis', href: '/market-analysis', icon: 'LineChart' },
    { label: 'Reports', href: '/reports', icon: 'FileOutput' }
  ],
  [USER_ROLES.SENIOR_MANAGER]: [
    { label: 'Executive Dashboard', href: '/dashboard', icon: 'Crown' },
    { label: 'Strategic Overview', href: '/strategic', icon: 'Target' },
    { label: 'Performance Dashboard', href: '/performance', icon: 'BarChart3' },
    { label: 'Risk Management', href: '/risk-management', icon: 'Shield' },
    { label: 'Competitive Intelligence', href: '/competitive', icon: 'Eye' },
    { label: 'Regulatory Reports', href: '/regulatory', icon: 'FileCheck' }
  ]
} as const;

// Chart Colors for consistent styling
export const CHART_COLORS = [
  '#DC2626', // Primary red
  '#1E40AF', // Primary blue  
  '#059669', // Green
  '#D97706', // Orange
  '#7C3AED', // Purple
  '#DC2626', // Pink
  '#0891B2', // Cyan
  '#65A30D', // Lime
  '#C2410C', // Orange-red
  '#7C2D12'  // Brown
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout', 
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me'
  },
  SUBMISSIONS: {
    LIST: '/api/submissions',
    CREATE: '/api/submissions',
    GET: (id: string) => `/api/submissions/${id}`,
    UPDATE: (id: string) => `/api/submissions/${id}`,
    DELETE: (id: string) => `/api/submissions/${id}`,
    ANALYZE: (id: string) => `/api/submissions/${id}/analyze`,
    PRICING: (id: string) => `/api/submissions/${id}/pricing`,
    APPROVE: (id: string) => `/api/submissions/${id}/approve`,
    DECLINE: (id: string) => `/api/submissions/${id}/decline`
  },
  DOCUMENTS: {
    UPLOAD: '/api/documents/upload',
    GET: (id: string) => `/api/documents/${id}`,
    DELETE: (id: string) => `/api/documents/${id}`,
    EXTRACT: (id: string) => `/api/documents/${id}/extract`
  },
  PORTFOLIO: {
    OVERVIEW: '/api/portfolio/overview',
    CONCENTRATION: '/api/portfolio/concentration', 
    PERFORMANCE: '/api/portfolio/performance',
    SIMULATE: '/api/portfolio/simulate'
  },
  MARKET: {
    INSIGHTS: '/api/market/insights',
    COMPETITORS: '/api/market/competitors',
    TRENDS: '/api/market/trends'
  },
  REPORTS: {
    GENERATE: '/api/reports/generate',
    TEMPLATES: '/api/reports/templates',
    HISTORY: '/api/reports/history'
  }
} as const;

// File Upload Restrictions
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES: 20,
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png', 
    'image/tiff',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ]
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy'
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.'
} as const;