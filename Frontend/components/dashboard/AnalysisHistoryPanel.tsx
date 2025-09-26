'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ClipboardList, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import type { AnalysisHistoryRecord, HistoryStatus } from '@/lib/analysis-history-types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AnalysisHistoryPanelProps {
  limit?: number;
}

const statusStyles: Record<HistoryStatus, string> = {
  SUCCESS: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<HistoryStatus, React.ReactNode> = {
  SUCCESS: <CheckCircle2 className="h-4 w-4" />,
  FAILED: <AlertTriangle className="h-4 w-4" />,
};

const AnalysisHistoryPanel: React.FC<AnalysisHistoryPanelProps> = ({ limit = 20 }) => {
  const [history, setHistory] = useState<AnalysisHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/analysis-history');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to load analysis history');
        }

        if (mounted) {
          setHistory(data.history.slice(0, limit));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load history';
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [limit]);

  const downloadRecord = (record: AnalysisHistoryRecord) => {
    const exportData = {
      taskId: record.taskId,
      completedAt: record.completedAt,
      status: record.status,
      metadata: record.metadata,
      result: record.result,
      progressHistory: record.progressHistory,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedFileName = record.fileName?.replace(/[^a-z0-9-_\.]/gi, '_') || record.taskId;
    link.download = `${sanitizedFileName}_${record.taskId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download started',
      description: `Analysis record for ${record.fileName || record.taskId} is downloading.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <ClipboardList className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg font-semibold">Recent AI Analyses</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {history.length} runs
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading history...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            No previous analyses stored yet.
          </div>
        ) : (
          <ScrollArea className="h-[360px] pr-2">
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.taskId}
                  className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.fileName || 'Unknown file'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Task ID: <span className="font-mono">{record.taskId}</span>
                      </p>
                    </div>
                    <Badge className={cn('flex items-center space-x-1 border', statusStyles[record.status])}>
                      {statusIcons[record.status]}
                      <span>{record.status}</span>
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div>
                      <p className="font-medium text-gray-700">Started</p>
                      <p>{new Date(record.startedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Completed</p>
                      <p>{new Date(record.completedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Persisted By</p>
                      <p>{record.persistedBy || 'unknown'}</p>
                    </div>
                  </div>

                  {record.metadata?.subject && (
                    <p className="mt-2 text-xs text-gray-500">
                      Subject: <span className="font-medium">{record.metadata.subject as string}</span>
                    </p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadRecord(record)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download JSON
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisHistoryPanel;

