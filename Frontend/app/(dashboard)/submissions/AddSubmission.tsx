'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Upload,
  FileText,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Building,
  User,
  DollarSign,
  Calendar,
  FileCheck,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import FileUploadZone from '@/components/submissions/fileuploadzone';
import SubmissionPreview from '@/components/submissions/SubmissionPreview';

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

const AddSubmissionPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const [formData, setFormData] = useState<SubmissionFormData>({
    title: '',
    company: '',
    submittedBy: '',
    policyType: '',
    sumInsured: '',
    effectiveDate: '',
    expiryDate: '',
    description: '',
    priority: 'medium',
    brokerContact: '',
    underwriter: ''
  });

  const [errors, setErrors] = useState<Partial<SubmissionFormData>>({});

  const policyTypes = [
    'Commercial Property',
    'Commercial Auto',
    'General Liability',
    'Professional Liability',
    'Workers Compensation',
    'Cyber Liability',
    'Marine Insurance',
    'Aviation Insurance'
  ];

  const underwriters = [
    'John Smith',
    'Sarah Johnson',
    'Michael Brown',
    'Emily Davis',
    'David Wilson'
  ];

  const handleInputChange = (field: keyof SubmissionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SubmissionFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.submittedBy.trim()) newErrors.submittedBy = 'Submitted by is required';
    if (!formData.policyType) newErrors.policyType = 'Policy type is required';
    if (!formData.sumInsured || isNaN(Number(formData.sumInsured))) {
      newErrors.sumInsured = 'Valid sum insured is required';
    }
    if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Date validation
    if (formData.effectiveDate && formData.expiryDate) {
      const effective = new Date(formData.effectiveDate);
      const expiry = new Date(formData.expiryDate);
      if (expiry <= effective) {
        newErrors.expiryDate = 'Expiry date must be after effective date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}_${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload progress
    newFiles.forEach(uploadFile => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id) {
            const newProgress = Math.min(f.progress + Math.random() * 30, 100);
            const isComplete = newProgress >= 100;
            
            return {
              ...f,
              progress: newProgress,
              status: isComplete ? 'completed' : 'uploading'
            };
          }
          return f;
        }));

        if (uploadFile.progress >= 100) {
          clearInterval(interval);
        }
      }, 300);

      // Generate preview for images
      if (uploadFile.file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(uploadFile.file);
      }
    });

    toast({
      title: 'Files Added',
      description: `${files.length} file(s) added for upload.`,
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: 'File Removed',
      description: 'File has been removed from the upload queue.',
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && validateForm()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (uploadedFiles.length === 0) {
        toast({
          title: 'No Files',
          description: 'Please upload at least one document.',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      const submissionData = {
        ...formData,
        files: uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })),
        submittedDate: new Date().toISOString(),
        status: 'pending_review',
        id: `SUB_${Date.now()}`
      };

      console.log('Submission data:', submissionData);

      toast({
        title: 'Submission Created',
        description: 'Your submission has been created successfully.',
      });

      // Redirect to submissions list or detail page
      router.push('/submissions');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to create submission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (step: number, currentStep: number) => {
    if (step < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step === currentStep) {
      return <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{step}</div>;
    } else {
      return <div className="h-5 w-5 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">{step}</div>;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 w-full mr-[360px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Submission</h1>
            <p className="text-gray-600 mt-1">Create a new facultative reinsurance submission</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStepIcon(1, currentStep)}
              <span className={`font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                Submission Details
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-4">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: currentStep >= 2 ? '100%' : '0%' }}
              />
            </div>
            <div className="flex items-center space-x-4">
              {getStepIcon(2, currentStep)}
              <span className={`font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                Upload Documents
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-4">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: currentStep >= 3 ? '100%' : '0%' }}
              />
            </div>
            <div className="flex items-center space-x-4">
              {getStepIcon(3, currentStep)}
              <span className={`font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                Review & Submit
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Submission Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Submission Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Commercial Property Insurance - ABC Corp"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g., ABC Corporation"
                    className={errors.company ? 'border-red-500' : ''}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submittedBy">Submitted By *</Label>
                  <Input
                    id="submittedBy"
                    value={formData.submittedBy}
                    onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                    placeholder="e.g., John Smith"
                    className={errors.submittedBy ? 'border-red-500' : ''}
                  />
                  {errors.submittedBy && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.submittedBy}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="brokerContact">Broker Contact</Label>
                  <Input
                    id="brokerContact"
                    value={formData.brokerContact}
                    onChange={(e) => handleInputChange('brokerContact', e.target.value)}
                    placeholder="e.g., jane.doe@broker.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Policy Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policyType">Policy Type *</Label>
                  <Select 
                    value={formData.policyType} 
                    onValueChange={(value) => handleInputChange('policyType', value)}
                  >
                    <SelectTrigger className={errors.policyType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select policy type" />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.policyType && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.policyType}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sumInsured">Sum Insured ($) *</Label>
                  <Input
                    id="sumInsured"
                    type="number"
                    value={formData.sumInsured}
                    onChange={(e) => handleInputChange('sumInsured', e.target.value)}
                    placeholder="e.g., 5000000"
                    className={errors.sumInsured ? 'border-red-500' : ''}
                  />
                  {errors.sumInsured && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.sumInsured}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effectiveDate">Effective Date *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                    className={errors.effectiveDate ? 'border-red-500' : ''}
                  />
                  {errors.effectiveDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.effectiveDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className={errors.expiryDate ? 'border-red-500' : ''}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="underwriter">Assign Underwriter</Label>
                  <Select 
                    value={formData.underwriter} 
                    onValueChange={(value) => handleInputChange('underwriter', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select underwriter (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {underwriters.map(underwriter => (
                        <SelectItem key={underwriter} value={underwriter}>{underwriter}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide detailed description of the insurance requirements, coverage needed, and any special considerations..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
              Next: Upload Documents
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Documents */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone onFilesUploaded={handleFileUpload} />
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {file.preview ? (
                            <img 
                              src={file.preview} 
                              alt={file.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <FileText className="h-10 w-10 text-blue-500" />
                          )}
                          {file.status === 'completed' && (
                            <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{file.name}</h4>
                          <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                          {file.status === 'uploading' && (
                            <div className="mt-1">
                              <Progress value={file.progress} className="h-1 w-32" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={file.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            file.status === 'completed' ? 'bg-green-100 text-green-800' :
                            file.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {file.status === 'uploading' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={handleNext} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={uploadedFiles.length === 0}
            >
              Next: Review & Submit
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <SubmissionPreview 
            formData={formData}
            uploadedFiles={uploadedFiles}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Submit Submission
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubmissionPage;