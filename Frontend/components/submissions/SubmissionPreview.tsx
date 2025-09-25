'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Image,
  FileSpreadsheet,
  File,
  Clock
} from 'lucide-react';

interface SubmissionFormData {
  title: string;
  company: string;
  submittedBy: string;
  policyType: string;
  sumInsured: string;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  brokerContact: string;
  underwriter: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  preview?: string;
}

interface SubmissionPreviewProps {
  formData: SubmissionFormData;
  uploadedFiles: UploadedFile[];
}

const SubmissionPreview: React.FC<SubmissionPreviewProps> = ({
  formData,
  uploadedFiles
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('image')) return <Image className="h-5 w-5 text-green-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (type.includes('document') || type.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateTotalSize = () => {
    return uploadedFiles.reduce((total, file) => total + file.size, 0);
  };

  const getCompletedFiles = () => {
    return uploadedFiles.filter(file => file.status === 'completed').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <CheckCircle className="h-6 w-6" />
            <span>Submission Review</span>
          </CardTitle>
          <p className="text-blue-700">
            Please review all information before submitting. You can edit any section by going back to the previous steps.
          </p>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold text-sm">{formData.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Sum Insured</p>
                <p className="font-semibold text-sm">${parseInt(formData.sumInsured).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="font-semibold text-sm">{getCompletedFiles()} files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getPriorityColor(formData.priority)}`}>
                {getPriorityIcon(formData.priority)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-semibold text-sm capitalize">{formData.priority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Submission Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium text-right max-w-xs">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{formData.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted By:</span>
                  <span className="font-medium">{formData.submittedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Broker Contact:</span>
                  <span className="font-medium">{formData.brokerContact || 'Not provided'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Policy Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Policy Type:</span>
                  <span className="font-medium">{formData.policyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sum Insured:</span>
                  <span className="font-medium">${parseInt(formData.sumInsured).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Effective Date:</span>
                  <span className="font-medium">{new Date(formData.effectiveDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-medium">{new Date(formData.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment & Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Assignment & Priority</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Priority Level:</span>
                <Badge className={`${getPriorityColor(formData.priority)} flex items-center space-x-1`}>
                  {getPriorityIcon(formData.priority)}
                  <span className="capitalize">{formData.priority}</span>
                </Badge>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Assigned Underwriter:</span>
                <span className="font-medium">{formData.underwriter || 'Not assigned'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {formData.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Uploaded Documents</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{getCompletedFiles()} of {uploadedFiles.length} files</span>
              <span>{formatFileSize(calculateTotalSize())} total</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <div className="grid gap-3">
              {uploadedFiles.map((file, index) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file.type)
                      )}
                      {file.status === 'completed' && (
                        <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{file.name}</h4>
                      <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={file.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      file.status === 'completed' ? 'bg-green-100 text-green-800' :
                      file.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No documents uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Ready to Submit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-green-900 mb-2">What happens next?</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Submission will be assigned ID</li>
                <li>• Documents will be processed</li>
                <li>• Underwriter will be notified</li>
                <li>• Initial review will begin</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Timeline</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Initial review: 1-2 business days</li>
                <li>• Document analysis: 2-3 business days</li>
                <li>• Underwriting decision: 5-7 business days</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Important:</strong> Once submitted, you&apos;ll receive a confirmation email with your submission ID. 
              You can track the progress in the submissions dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionPreview;