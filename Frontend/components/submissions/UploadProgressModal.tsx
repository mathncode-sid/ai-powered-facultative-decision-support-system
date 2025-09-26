'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, FileText, Upload, Search, Brain, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AnalysisWorkflowResult } from '@/lib/api';
import { apiService } from '@/lib/api';

interface UploadStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onComplete: (workflow: AnalysisWorkflowResult) => void;
  onError: (error: string) => void;
}

export function UploadProgressModal({
  isOpen,
  onClose,
  file,
  onComplete,
  onError
}: UploadProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting analysis...');
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [workflowResult, setWorkflowResult] = useState<AnalysisWorkflowResult | null>(null);
  const [steps, setSteps] = useState<UploadStep[]>([
    {
      id: 'upload',
      title: 'Uploading File',
      description: 'Securely uploading your .msg file to our servers',
      icon: Upload,
      status: 'pending'
    },
    {
      id: 'extract',
      title: 'Extracting Content',
      description: 'Reading email content and extracting attachments',
      icon: FileText,
      status: 'pending'
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Analyzing reinsurance data and risk factors',
      icon: Brain,
      status: 'pending'
    },
    {
      id: 'process',
      title: 'Processing Documents',
      description: 'Extracting data from attached documents',
      icon: Search,
      status: 'pending'
    },
    {
      id: 'complete',
      title: 'Finalizing Results',
      description: 'Preparing comprehensive analysis report',
      icon: Download,
      status: 'pending'
    }
  ]);

  // Start analysis when modal opens with a file
  useEffect(() => {
    if (isOpen && file && !isComplete && !hasError) {
      startAnalysis();
    }
  }, [isOpen, file]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setStatus('Starting analysis...');
      setIsComplete(false);
      setHasError(false);
      setErrorMessage('');
      setWorkflowResult(null);
    }
  }, [isOpen]);

  const startAnalysis = async () => {
    if (!file) {
      setHasError(true);
      setErrorMessage('No file provided for analysis.');
      setStatus('No file provided for analysis.');
      setProgress(0);
      return;
    }

    try {
      const workflow = await apiService.analyzeFile(file, (progressUpdate) => {
        setProgress(progressUpdate.progress || 0);
        setStatus(progressUpdate.status || 'Processing...');
      });

      setWorkflowResult(workflow);
      setIsComplete(true);
      setProgress(100);
      setStatus('Analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setHasError(true);
      setErrorMessage(message);
      setProgress(0);
      setStatus(message);
      onError(message);
    }
  };

  // Update step status based on progress
  useEffect(() => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      
      if (hasError) {
        return newSteps.map(step => ({
          ...step,
          status: step.status === 'processing' ? 'failed' : step.status
        }));
      }

      if (progress >= 0 && progress < 20) {
        newSteps[0].status = 'processing';
      } else if (progress >= 20 && progress < 40) {
        newSteps[0].status = 'completed';
        newSteps[1].status = 'processing';
      } else if (progress >= 40 && progress < 60) {
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'processing';
      } else if (progress >= 60 && progress < 80) {
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
        newSteps[3].status = 'processing';
      } else if (progress >= 80 && progress < 100) {
        newSteps[0].status = 'completed';
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
        newSteps[3].status = 'completed';
        newSteps[4].status = 'processing';
      } else if (progress === 100 && isComplete) {
        return newSteps.map(step => ({ ...step, status: 'completed' }));
      }

      return newSteps;
    });
  }, [progress, isComplete, hasError]);

  const getStepIcon = (step: UploadStep) => {
    const IconComponent = step.icon;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepBadge = (status: UploadStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 overflow-hidden sm:max-w-[600px]">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-left">
            <FileText className="w-5 h-5" />
            {hasError ? 'Upload Failed' : isComplete ? 'Upload Complete!' : 'Processing Upload'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">{file?.name || 'Unknown file'}</p>
                <p className="text-xs text-gray-500">MSG File • Reinsurance Submission</p>
              </div>
            </div>

            {/* Progress Bar */}
            {!hasError && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500">{status}</p>
              </div>
            )}

            {/* Error Message */}
            {hasError && errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Upload Failed</p>
                    <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Steps */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Processing Steps</h4>
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{step.title}</p>
                      {getStepBadge(step.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 bg-background">
          {hasError && (
            <Button onClick={startAnalysis} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Upload
            </Button>
          )}

          {isComplete && workflowResult && (
            <Button
              onClick={() => {
                onComplete(workflowResult);
                onClose();
              }}
              size="sm"
            >
              View Analysis Results
            </Button>
          )}

          {(hasError || isComplete) && (
            <Button onClick={() => onClose()} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}