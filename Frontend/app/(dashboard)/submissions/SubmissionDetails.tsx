'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DocumentViewer from './DocumentViewer';
import AnalysisReport from './AnalysisReport';

// Mock data - replace with actual API call
const mockSubmission = {
  id: '1',
  title: 'Commercial Property Insurance - ABC Corp',
  status: 'pending_review',
  submittedBy: 'John Smith',
  submittedDate: '2024-01-15',
  company: 'ABC Corporation',
  policyType: 'Commercial Property',
  sumInsured: 5000000,
  description: 'Comprehensive property insurance for manufacturing facility including equipment and inventory coverage.',
  documents: [
    { id: 'doc1', name: 'Policy Application.pdf', size: '2.3 MB', type: 'application/pdf', url: '/api/documents/doc1' },
    { id: 'doc2', name: 'Property Assessment.pdf', size: '1.8 MB', type: 'application/pdf', url: '/api/documents/doc2' },
    { id: 'doc3', name: 'Financial Statements.xlsx', size: '890 KB', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', url: '/api/documents/doc3' }
  ],
  analysisHistory: [
    {
      id: 'analysis1',
      date: '2024-01-16',
      analyst: 'AI System',
      status: 'completed',
      summary: 'Initial risk assessment completed with moderate risk rating',
      downloadUrl: '/api/analysis/analysis1/download'
    }
  ]
};

const SubmissionDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [submission, setSubmission] = useState(mockSubmission);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    // Load submission data based on params.id
    // This would be an actual API call
    console.log('Loading submission:', params.id);
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // API call to update status
      setSubmission(prev => ({ ...prev, status: newStatus }));
      toast({
        title: 'Status Updated',
        description: 'Submission status has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update submission status.',
        variant: 'destructive',
      });
    }
  };

  const handleDocumentView = (document) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const handleAnalyzeDocument = async (document) => {
    setIsAnalyzing(true);
    try {
      // Simulate API call for document analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis = {
        id: `analysis_${Date.now()}`,
        documentId: document.id,
        documentName: document.name,
        date: new Date().toISOString(),
        status: 'completed',
        riskRating: 'Medium',
        confidence: 0.87,
        keyFindings: [
          'Property value assessment: $4.8M - $5.2M range',
          'Located in moderate flood risk zone',
          'Fire protection systems adequate',
          'Security measures meet industry standards'
        ],
        recommendations: [
          'Consider additional flood coverage',
          'Install sprinkler system in warehouse section',
          'Regular security system maintenance required'
        ],
        summary: 'The property presents a moderate risk profile with standard commercial property exposures. The building construction and location factors support the requested coverage amount.',
        downloadUrl: `/api/analysis/${Date.now()}/download`
      };

      setAnalysisResult(mockAnalysis);
      
      // Add to analysis history
      setSubmission(prev => ({
        ...prev,
        analysisHistory: [...prev.analysisHistory, mockAnalysis]
      }));

      toast({
        title: 'Analysis Complete',
        description: 'Document has been analyzed successfully.',
      });
      
      setActiveTab('analysis');
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze the document.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadAnalysis = (analysis) => {
    // Create and download analysis report
    const reportData = {
      submissionId: submission.id,
      submissionTitle: submission.title,
      analysisDate: analysis.date,
      analyst: analysis.analyst || 'AI System',
      riskRating: analysis.riskRating,
      confidence: analysis.confidence,
      keyFindings: analysis.keyFindings,
      recommendations: analysis.recommendations,
      summary: analysis.summary
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_report_${submission.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'Analysis report is being downloaded.',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="h-4 w-4" />;
      case 'under_analysis':
        return <BarChart3 className="h-4 w-4" />;
      case 'awaiting_approval':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_analysis':
        return 'bg-blue-100 text-blue-800';
      case 'awaiting_approval':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">{submission.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={`${getStatusColor(submission.status)} flex items-center space-x-1`}>
                {getStatusIcon(submission.status)}
                <span>{submission.status.replace('_', ' ').toUpperCase()}</span>
              </Badge>
              <span className="text-gray-600 text-sm">ID: {submission.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('under_analysis')}
            disabled={submission.status === 'approved'}
          >
            Update Status
          </Button>
          <Button
            onClick={() => handleDownloadAnalysis(submission.analysisHistory[0])}
            disabled={!submission.analysisHistory.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-semibold">{submission.submittedBy}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="font-semibold">{new Date(submission.submittedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold">{submission.company}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Sum Insured</p>
                <p className="font-semibold">${submission.sumInsured.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Policy Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Policy Type:</span>
                      <span>{submission.policyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sum Insured:</span>
                      <span>${submission.sumInsured.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Submission Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents:</span>
                      <span>{submission.documents.length} files</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{submission.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documents ({submission.documents.length})</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowViewer(!showViewer)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showViewer ? 'Hide Viewer' : 'Show Viewer'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submission.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentView(doc)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAnalyzeDocument(doc)}
                        disabled={isAnalyzing}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {showViewer && selectedDocument && (
            <DocumentViewer
              document={selectedDocument}
              onAnalyze={() => handleAnalyzeDocument(selectedDocument)}
              isAnalyzing={isAnalyzing}
            />
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysisResult ? (
            <AnalysisReport
              analysis={analysisResult}
              onDownload={() => handleDownloadAnalysis(analysisResult)}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600 mb-4">
                  Select a document from the Documents tab and click "Analyze" to generate an analysis report.
                </p>
                <Button onClick={() => setActiveTab('documents')}>
                  Go to Documents
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submission.analysisHistory.map((analysis) => (
                  <div key={analysis.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{analysis.summary}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(analysis.date).toLocaleDateString()} by {analysis.analyst}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(analysis.status)}>
                          {analysis.status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadAnalysis(analysis)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmissionDetailPage;