'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  ExternalLink, 
  FileText, 
  Image, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { DocumentMetadata } from '@/lib/api';

interface DocumentViewerProps {
  document: DocumentMetadata;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  showActions?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onAnalyze,
  isAnalyzing = false,
  showActions = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);

  const getFileIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-6 w-6 text-green-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      default:
        return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (document.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const handleViewerError = () => {
    setViewerError('Failed to load document preview');
  };

  const canPreview = ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(document.format.toLowerCase());

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(document.format)}
            <div>
              <CardTitle className="text-lg">{document.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(document.status)}>
                  {getStatusIcon(document.status)}
                  <span className="ml-1">{document.status}</span>
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatFileSize(document.size)}
                </span>
                <span className="text-sm text-gray-500">
                  {document.format.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            )}
            {showActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {onAnalyze && showActions && (
              <Button
                size="sm"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewerError ? (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">{viewerError}</p>
              <Button variant="outline" onClick={handleOpenInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        ) : canPreview ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <iframe
                src={document.url}
                title={document.name}
                className="w-full h-96 border-0"
                onError={handleViewerError}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Document ID: {document.id}</span>
              <span>Uploaded: {new Date(document.upload_timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              {getFileIcon(document.format)}
              <p className="text-gray-600 mt-2 mb-4">
                Preview not available for {document.format.toUpperCase()} files
              </p>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
