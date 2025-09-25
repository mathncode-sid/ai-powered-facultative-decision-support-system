'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Submission, SubmissionStatus, FilterOptions, SortOption } from '@/types';

interface SubmissionState {
  submissions: Submission[];
  currentSubmission: Submission | null;
  isLoading: boolean;
  error: string | null;
  filters: FilterOptions;
  sortOption: SortOption;
  searchQuery: string;
  selectedSubmissions: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SubmissionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUBMISSIONS'; payload: Submission[] }
  | { type: 'SET_CURRENT_SUBMISSION'; payload: Submission | null }
  | { type: 'UPDATE_SUBMISSION'; payload: Submission }
  | { type: 'ADD_SUBMISSION'; payload: Submission }
  | { type: 'REMOVE_SUBMISSION'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SELECTED'; payload: string[] }
  | { type: 'TOGGLE_SELECTED'; payload: string }
  | { type: 'SET_PAGINATION'; payload: Partial<SubmissionState['pagination']> }
  | { type: 'CLEAR_FILTERS' };

interface SubmissionContextType extends SubmissionState {
  loadSubmissions: (filters?: FilterOptions) => Promise<void>;
  loadSubmission: (id: string) => Promise<void>;
  createSubmission: (data: Partial<Submission>) => Promise<void>;
  updateSubmission: (id: string, data: Partial<Submission>) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  updateSubmissionStatus: (id: string, status: SubmissionStatus, comment?: string) => Promise<void>;
  analyzeSubmission: (id: string) => Promise<void>;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOption) => void;
  setSearch: (query: string) => void;
  setSelectedSubmissions: (ids: string[]) => void;
  toggleSubmissionSelection: (id: string) => void;
  clearFilters: () => void;
  filteredAndSortedSubmissions: Submission[];
}

const initialState: SubmissionState = {
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  error: null,
  filters: {},
  sortOption: { field: 'submissionDate', direction: 'desc', label: 'Newest First' },
  searchQuery: '',
  selectedSubmissions: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },
};

const submissionReducer = (state: SubmissionState, action: SubmissionAction): SubmissionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.payload, isLoading: false };
    case 'SET_CURRENT_SUBMISSION':
      return { ...state, currentSubmission: action.payload };
    case 'UPDATE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map(sub =>
          sub.id === action.payload.id ? action.payload : sub
        ),
        currentSubmission: state.currentSubmission?.id === action.payload.id 
          ? action.payload 
          : state.currentSubmission,
      };
    case 'ADD_SUBMISSION':
      return { ...state, submissions: [action.payload, ...state.submissions] };
    case 'REMOVE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.filter(sub => sub.id !== action.payload),
        currentSubmission: state.currentSubmission?.id === action.payload 
          ? null 
          : state.currentSubmission,
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SORT':
      return { ...state, sortOption: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED':
      return { ...state, selectedSubmissions: action.payload };
    case 'TOGGLE_SELECTED':
      return {
        ...state,
        selectedSubmissions: state.selectedSubmissions.includes(action.payload)
          ? state.selectedSubmissions.filter(id => id !== action.payload)
          : [...state.selectedSubmissions, action.payload],
      };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: {}, searchQuery: '' };
    default:
      return state;
  }
};

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(submissionReducer, initialState);

  const loadSubmissions = async (filters?: FilterOptions): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockSubmissions: Submission[] = [
        {
          id: '1',
          reference: 'FAC-2024-001',
          cedant: {
            id: '1',
            name: 'African Alliance Insurance',
            country: 'Kenya',
            relationship: 'treaty_partner',
            contactPerson: 'John Kamau',
            email: 'j.kamau@africanalliance.co.ke',
          },
          insured: {
            name: 'Nairobi Industrial Complex',
            business: 'Manufacturing',
            country: 'Kenya',
            industry: 'Textile Manufacturing',
          },
          riskDetails: {
            classOfBusiness: 'Property',
            peril: ['Fire', 'Explosion', 'Earthquake'],
            geography: 'Nairobi, Kenya',
            sumInsured: 50000000,
            currency: 'USD',
            policyPeriod: {
              from: new Date('2024-01-01'),
              to: new Date('2024-12-31'),
            },
          },
          financialDetails: {
            grossPremium: 500000,
            commission: 0.15,
            brokerage: 0.05,
            requestedShare: 0.5,
            currency: 'USD',
          },
          status: 'under_analysis',
          priority: 'high',
          submissionDate: new Date('2024-01-15'),
          dueDate: new Date('2024-01-22'),
          assignedTo: 'underwriter1',
          documents: [],
          workingSheet: {
            id: 'ws1',
            submissionId: '1',
            version: 1,
            lastModified: new Date(),
            modifiedBy: 'underwriter1',
            basicInfo: {
              insuredName: 'Nairobi Industrial Complex',
              cedantName: 'African Alliance Insurance',
              classOfBusiness: 'Property',
              country: 'Kenya',
              currency: 'USD',
            },
            riskInfo: {
              peril: ['Fire', 'Explosion', 'Earthquake'],
              sumInsured: 50000000,
              policyPeriod: '01/01/2024 - 31/12/2024',
              deductible: 100000,
              occupancy: 'Textile Manufacturing',
              construction: 'Steel frame with concrete floors',
              numberOfLocations: 1,
            },
            lossHistory: [],
            exposureAnalysis: {
              pml: 25000000,
              aal: 150000,
              returnPeriods: [],
              catastropheExposure: [],
              concentration: {
                byGeography: {},
                byClass: {},
                byCedant: {},
              },
            },
            pricing: {
              technicalRate: 0.008,
              loadings: [],
              finalRate: 0.01,
              grossPremium: 500000,
              commission: 75000,
              netPremium: 425000,
            },
            recommendations: {
              recommendedShare: 0.4,
              rationale: 'Good risk with adequate protection measures',
              conditions: [],
              exclusions: [],
              riskFactors: [],
            },
          },
          decisionHistory: [],
          tags: ['high-value', 'property'],
          version: 1,
        },
      ];

      dispatch({ type: 'SET_SUBMISSIONS', payload: mockSubmissions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load submissions' });
    }
  };

  const loadSubmission = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const submission = state.submissions.find(sub => sub.id === id);
      dispatch({ type: 'SET_CURRENT_SUBMISSION', payload: submission || null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load submission' });
    }
  };

  const createSubmission = async (data: Partial<Submission>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mock creation logic
      const newSubmission: Submission = {
        id: Date.now().toString(),
        reference: `FAC-2024-${String(Date.now()).slice(-3)}`,
        ...data,
      } as Submission;
      
      dispatch({ type: 'ADD_SUBMISSION', payload: newSubmission });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create submission' });
    }
  };

  const updateSubmission = async (id: string, data: Partial<Submission>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const existing = state.submissions.find(sub => sub.id === id);
      if (existing) {
        const updated = { ...existing, ...data };
        dispatch({ type: 'UPDATE_SUBMISSION', payload: updated });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update submission' });
    }
  };

  const deleteSubmission = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'REMOVE_SUBMISSION', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete submission' });
    }
  };

  const updateSubmissionStatus = async (id: string, status: SubmissionStatus, comment?: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const existing = state.submissions.find(sub => sub.id === id);
      if (existing) {
        const updated = { ...existing, status };
        dispatch({ type: 'UPDATE_SUBMISSION', payload: updated });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update status' });
    }
  };

  const analyzeSubmission = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock AI analysis
      const existing = state.submissions.find(sub => sub.id === id);
      if (existing) {
        const updated = { 
          ...existing, 
          status: 'pricing_review' as SubmissionStatus,
          aiAnalysis: {
            id: 'ai1',
            submissionId: id,
            timestamp: new Date(),
            version: '1.0',
            dataExtraction: {
              confidence: 0.95,
              extractedFields: [],
              missingFields: [],
              warnings: [],
            },
            riskAssessment: {
              riskScore: 0.75,
              riskFactors: [],
              pmlEstimate: 25000000,
              confidenceInterval: [20000000, 30000000],
              methodology: 'Monte Carlo simulation',
            },
            pricingRecommendation: {
              recommendedRate: 0.01,
              rateRange: [0.008, 0.012],
              rationale: 'Based on similar risks and loss history',
              keyFactors: ['Construction type', 'Protection measures', 'Location'],
              benchmarkComparison: [],
            },
            portfolioImpact: {
              concentrationIncrease: 0.02,
              diversificationBenefit: 0.01,
              correlationRisk: 0.15,
              capitalRequirement: 5000000,
              rocImpact: 0.001,
            },
            explainability: {
              featureImportance: [],
              decisionPath: [],
              similarCases: [],
              modelConfidence: 0.87,
            },
          },
        };
        dispatch({ type: 'UPDATE_SUBMISSION', payload: updated });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to analyze submission' });
    }
  };

  const setFilters = (filters: FilterOptions): void => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSort = (sort: SortOption): void => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const setSearch = (query: string): void => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const setSelectedSubmissions = (ids: string[]): void => {
    dispatch({ type: 'SET_SELECTED', payload: ids });
  };

  const toggleSubmissionSelection = (id: string): void => {
    dispatch({ type: 'TOGGLE_SELECTED', payload: id });
  };

  const clearFilters = (): void => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Computed filtered and sorted submissions
  const filteredAndSortedSubmissions = React.useMemo(() => {
    let filtered = [...state.submissions];

    // Apply search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.reference.toLowerCase().includes(query) ||
        sub.insured.name.toLowerCase().includes(query) ||
        sub.cedant.name.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (state.filters.status?.length) {
      filtered = filtered.filter(sub => state.filters.status?.includes(sub.status));
    }
    
    if (state.filters.priority?.length) {
      filtered = filtered.filter(sub => state.filters.priority?.includes(sub.priority));
    }

    if (state.filters.classOfBusiness?.length) {
      filtered = filtered.filter(sub => 
        state.filters.classOfBusiness?.includes(sub.riskDetails.classOfBusiness)
      );
    }

    if (state.filters.dateRange) {
      const { from, to } = state.filters.dateRange;
      filtered = filtered.filter(sub => 
        sub.submissionDate >= from && sub.submissionDate <= to
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = state.sortOption;
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'submissionDate':
          aValue = a.submissionDate.getTime();
          bValue = b.submissionDate.getTime();
          break;
        case 'dueDate':
          aValue = a.dueDate.getTime();
          bValue = b.dueDate.getTime();
          break;
        case 'sumInsured':
          aValue = a.riskDetails.sumInsured;
          bValue = b.riskDetails.sumInsured;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          aValue = a.reference;
          bValue = b.reference;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [state.submissions, state.filters, state.sortOption, state.searchQuery]);

  const value: SubmissionContextType = {
    ...state,
    loadSubmissions,
    loadSubmission,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    updateSubmissionStatus,
    analyzeSubmission,
    setFilters,
    setSort,
    setSearch,
    setSelectedSubmissions,
    toggleSubmissionSelection,
    clearFilters,
    filteredAndSortedSubmissions,
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
};

export const useSubmissions = (): SubmissionContextType => {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmissions must be used within a SubmissionProvider');
  }
  return context;
};