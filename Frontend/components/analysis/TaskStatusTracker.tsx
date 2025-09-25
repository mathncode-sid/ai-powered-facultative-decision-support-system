'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  Brain,
  TrendingUp
} from 'lucide-react';
import { TaskStatus, AnalysisResult } from '@/lib/api';

interface TaskStatusTrackerProps {
  taskId: string;
  onComplete?: (result: AnalysisResult) => void;
  onError?: (error: string) => void;
  autoPoll?: boolean;
  pollInterval?: number;
}

const TaskStatusTracker: React.FC<TaskStatusTrackerProps> = ({
  taskId,
  onComplete,
  onError,
  autoPoll = true,
  pollInterval = 2000
}) => {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'PROCESSING':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Completed';
      case 'PROCESSING':
        return 'Processing';
      case 'PENDING':
        return 'Pending';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const pollStatus = async () => {
    if (isPolling) return;
    
    setIsPolling(true);
    setError(null);

    try {
      const response = await fetch(`/api/task-status/${taskId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: TaskStatus = await response.json();
      setStatus(data);

      if (data.status === 'SUCCESS' && data.result && onComplete) {
        onComplete(data.result);
      } else if (data.status === 'FAILED' && onError) {
        onError(data.error || 'Analysis failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check status';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    if (autoPoll && taskId) {
      pollStatus();
      
      const interval = setInterval(() => {
        if (status?.status === 'SUCCESS' || status?.status === 'FAILED') {
          clearInterval(interval);
          return;
        }
        pollStatus();
      }, pollInterval);

      return () => clearInterval(interval);
    }
  }, [taskId, autoPoll, pollInterval, status?.status]);

  const handleManualRefresh = () => {
    pollStatus();
  };

  if (!status && !error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Initializing analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status?.status || 'PENDING')}
            <span>Analysis Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(status?.status || 'PENDING')}>
              {getStatusLabel(status?.status || 'PENDING')}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isPolling}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isPolling ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {status && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {status.current_status || 'Processing...'}
                </span>
                <span className="text-gray-600">
                  {status.progress || 0}%
                </span>
              </div>
              <Progress 
                value={status.progress || 0} 
                className="h-2"
              />
            </div>

            {/* Status Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Task ID</p>
                  <p className="text-xs text-gray-600 font-mono">{taskId}</p>
                </div>
              </div>

              {status.progress && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-xs text-gray-600">{status.progress}% Complete</p>
                  </div>
                </div>
              )}

              {status.status === 'SUCCESS' && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
                  <Brain className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Analysis Complete</p>
                    <p className="text-xs text-gray-600">Results ready for review</p>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Steps */}
            {status.status === 'PROCESSING' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Processing Steps</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>File uploaded and validated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (status.progress || 0) > 20 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>Extracting email data and attachments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (status.progress || 0) > 50 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>Analyzing risk factors and market conditions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (status.progress || 0) > 80 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>Generating recommendations and finalizing report</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskStatusTracker;
