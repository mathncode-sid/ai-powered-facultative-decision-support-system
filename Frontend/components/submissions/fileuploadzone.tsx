'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Mail,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

interface FileUploadZoneProps {
  onFilesUploaded?: (files: FileList) => void;
  onAnalysisComplete?: (result: any) => void;
  onAnalysisError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  enableAnalysis?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  onAnalysisComplete,
  onAnalysisError,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.ms-outlook', // MSG files
    'application/octet-stream' // Fallback for MSG files that might not have proper MIME type
  ],
  enableAnalysis = true
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ status: string; progress?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string, fileName?: string) => {
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (type.includes('image')) return <Image className="h-6 w-6 text-green-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
    if (type.includes('document') || type.includes('word')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (type.includes('outlook') || fileName?.endsWith('.msg')) return <Mail className="h-6 w-6 text-orange-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const getFileTypeLabel = (type: string, fileName?: string) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'Image';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'Excel';
    if (type.includes('document') || type.includes('word')) return 'Word';
    if (type.includes('text')) return 'Text';
    if (type.includes('outlook') || fileName?.endsWith('.msg')) return 'MSG';
    return 'Document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFiles = (files: FileList): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file, index) => {
      // Special handling for MSG files (they might have generic MIME type)
      const isMsgFile = file.name.toLowerCase().endsWith('.msg');
      const isAcceptedType = acceptedTypes.includes(file.type) || isMsgFile;

      // Check file type
      if (!isAcceptedType) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds ${maxFileSize}MB limit`);
        return;
      }

      // Check max files
      if (validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    handleFileSelection(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelection(files);
    }
    // Reset input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeFile = async (file: File) => {
    if (!enableAnalysis || !onAnalysisComplete) return;

    setIsAnalyzing(true);
    setAnalysisProgress({ status: 'Starting analysis...', progress: 0 });

    try {
      const result = await apiService.analyzeFile(file, (progress) => {
        setAnalysisProgress(progress);
      });

      setAnalysisProgress({ status: 'Analysis complete!', progress: 100 });
      onAnalysisComplete(result);
      
      toast({
        title: 'Analysis Complete',
        description: 'Your file has been successfully analyzed.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisProgress(null);
      onAnalysisError?.(errorMessage);
      
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelection = (files: FileList) => {
    const { validFiles, errors } = validateFiles(files);
    
    setUploadErrors(errors);

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      onFilesUploaded?.(fileList.files);

      // If analysis is enabled and we have a single .msg file, start analysis
      if (enableAnalysis && validFiles.length === 1 && validFiles[0].name.toLowerCase().endsWith('.msg')) {
        analyzeFile(validFiles[0]);
      }
    }

    if (errors.length > 0) {
      toast({
        title: 'Upload Issues',
        description: `${errors.length} file(s) could not be uploaded. Check details below.`,
        variant: 'destructive',
      });
    } else if (validFiles.length > 0) {
      toast({
        title: 'Files Ready',
        description: `${validFiles.length} file(s) added successfully.`,
      });
    }
  };

  const clearErrors = () => {
    setUploadErrors([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className={`p-4 rounded-full mb-4 ${
            isDragActive ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Upload className={`h-8 w-8 ${
              isDragActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Documents'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to select files
          </p>

          <div className="flex items-center space-x-2 mb-4">
            <Button variant="outline" size="sm" type="button">
              <Plus className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Maximum {maxFiles} files, up to {maxFileSize}MB each</p>
            <p>Supported: PDF, Word, Excel, Images, Text files, MSG emails</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',') + ',.msg'}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Supported File Types */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Supported File Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-red-500" />
              <span className="text-xs">PDF Documents</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-xs">Word Documents</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-xs">Excel Files</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <Image className="h-4 w-4 text-green-500" />
              <span className="text-xs">Images</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <Mail className="h-4 w-4 text-orange-500" />
              <span className="text-xs">MSG Emails</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="text-sm font-medium text-red-800">Upload Issues</h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearErrors}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {uploadErrors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">
                  • {error}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && analysisProgress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <h4 className="text-sm font-medium text-blue-800">AI Analysis in Progress</h4>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {analysisProgress.progress || 0}%
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-blue-700">{analysisProgress.status}</p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Upload Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Include policy application forms</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Property assessment reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Financial statements</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Email correspondence (MSG)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Risk assessment documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Supporting photographs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Previous policy documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Client communication files</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadZone;