'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

interface DocumentViewerProps {
  document: Document;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onAnalyze,
  isAnalyzing
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [viewerError, setViewerError] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setAnalysisProgress(0);
      interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setAnalysisProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    // Create a temporary link to download the document
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
    
    toast({
      title: 'Download Started',
      description: `${document.name} is being downloaded.`,
    });
  };

  const getFileTypeDisplay = (type: string) => {
    switch (type) {
      case 'application/pdf':
        return 'PDF Document';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Excel Spreadsheet';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'Word Document';
      case 'image/jpeg':
      case 'image/png':
        return 'Image';
      default:
        return 'Document';
    }
  };

  const renderDocumentPreview = () => {
    if (viewerError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <AlertCircle className="h-16 w-16 mb-4" />
          <h3 className="text-lg font-medium mb-2">Cannot Preview Document</h3>
          <p className="text-sm text-center">
            This document type cannot be previewed in the browser.
            <br />
            Please download to view the full content.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download to View
          </Button>
        </div>
      );
    }

    if (document.type === 'application/pdf') {
      return (
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <iframe
              src={`${document.url}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-none"
              title={document.name}
              onError={() => setViewerError(true)}
            />
          </div>
        </div>
      );
    }

    if (document.type.startsWith('image/')) {
      return (
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <img
              src={document.url}
              alt={document.name}
              className="max-w-full max-h-full object-contain"
              onError={() => setViewerError(true)}
            />
          </div>
        </div>
      );
    }

    // For other file types, show a generic preview
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-gray-50 rounded-lg">
        <FileText className="h-20 w-20 mb-4" />
        <h3 className="text-lg font-medium mb-2">{document.name}</h3>
        <p className="text-sm mb-4">{getFileTypeDisplay(document.type)}</p>
        <p className="text-xs text-center mb-4 max-w-md">
          Preview not available for this file type. Click analyze to process the document
          or download to view the full content.
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            size="sm"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : ''} transition-all`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <CardTitle className="text-lg">{document.name}</CardTitle>
              <div className="flex items-center space-x-3 mt-1">
                <Badge variant="secondary">
                  {getFileTypeDisplay(document.type)}
                </Badge>
                <span className="text-sm text-gray-600">{document.size}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            {(document.type === 'application/pdf' || document.type.startsWith('image/')) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600 animate-spin" />
                <span className="text-sm font-medium text-purple-700">
                  Analyzing Document...
                </span>
              </div>
              <span className="text-sm text-purple-600">
                {Math.round(analysisProgress)}%
              </span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-xs text-purple-600 mt-2">
              AI is processing the document content, extracting key information, and generating insights...
            </p>
          </div>
        )}

        {/* Document Preview */}
        {renderDocumentPreview()}

        {/* Document Info */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">File Size</p>
            <p className="font-medium">{document.size}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-medium">{getFileTypeDisplay(document.type)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Status</p>
            <Badge variant={isAnalyzing ? 'default' : 'secondary'}>
              {isAnalyzing ? 'Processing' : 'Ready'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;