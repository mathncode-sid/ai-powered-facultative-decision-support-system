export type HistoryStatus = 'SUCCESS' | 'FAILED';

export interface ProgressSnapshot {
  timestamp: string;
  status: HistoryStatus | 'PENDING' | 'PROCESSING';
  current_status?: string | null;
  progress?: number | null;
}

export interface AnalysisHistoryRecord {
  taskId: string;
  fileName: string;
  status: HistoryStatus;
  startedAt: string;
  completedAt: string;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
  progressHistory?: ProgressSnapshot[];
  persistedBy?: 'server' | 'client';
}

export interface PersistHistoryResponse {
  success: boolean;
  message?: string;
  record?: AnalysisHistoryRecord;
}

