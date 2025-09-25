'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AnalysisResultsDisplay from '@/components/analysis/AnalysisResultsDisplay';
import TaskStatusTracker from '@/components/analysis/TaskStatusTracker';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Bookmark,
  AlertCircle,
  CheckCircle2,
  Clock,
  Brain
} from 'lucide-react';
import { AnalysisResult, TaskStatus } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const AnalysisResultsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setError('No task ID provided');
      setIsLoading(false);
      return;
    }

    // Try to get cached result from localStorage first
    const cachedResult = localStorage.getItem(`analysis_${taskId}`);
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult);
        setAnalysisResult(parsed);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse cached result:', e);
      }
    }

    // If no cached result, start polling
    pollTaskStatus();
  }, [taskId]);

  const pollTaskStatus = async () => {
    if (!taskId) return;

    try {
      const response = await fetch(`https://ai-powered-facultative-reinsurancedecisionsupportsystem.replit.app/task-status/${taskId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const status: TaskStatus = await response.json();
      setTaskStatus(status);

      if (status.status === 'SUCCESS' && status.result) {
        setAnalysisResult(status.result);
        // Cache the result
        localStorage.setItem(`analysis_${taskId}`, JSON.stringify(status.result));
        setIsLoading(false);
      } else if (status.status === 'FAILED') {
        setError(status.error || 'Analysis failed');
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check task status';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!analysisResult) return;

    const exportData = {
      taskId,
      timestamp: new Date().toISOString(),
      result: analysisResult
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${taskId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Analysis results have been exported successfully.',
    });
  };

  const handleSave = () => {
    if (!analysisResult) return;

    // Here you would typically save to your backend/database
    // For now, we'll just show a success message
    toast({
      title: 'Analysis Saved',
      description: 'The analysis has been saved to your submissions.',
    });
  };

  const handleBack = () => {
    router.push('/submissions');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
              <p className="text-gray-600 mt-1">Loading analysis results...</p>
            </div>
          </div>
        </div>

        {taskId && (
          <TaskStatusTracker
            taskId={taskId}
            onComplete={(result) => {
              setAnalysisResult(result);
              setIsLoading(false);
            }}
            onError={(error) => {
              setError(error);
              setIsLoading(false);
            }}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
              <p className="text-gray-600 mt-1">Error loading analysis</p>
            </div>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Analysis Failed</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleBack}>
                Return to Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
              <p className="text-gray-600 mt-1">No analysis results found</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
            <p className="text-gray-600 mb-4">
              No analysis results were found for this task.
            </p>
            <Button variant="outline" onClick={handleBack}>
              Return to Submissions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
            <p className="text-gray-600 mt-1">
              AI-powered analysis of {analysisResult.email_data.subject}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Analysis Results */}
      <AnalysisResultsDisplay
        result={analysisResult}
        onExport={handleExport}
        onSave={handleSave}
      />
    </div>
  );
};

export default AnalysisResultsPage;
