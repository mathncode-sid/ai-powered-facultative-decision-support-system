'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Star,
  Target,
  FileDown,
  Mail,
  Printer
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Analysis {
  id: string;
  documentId: string;
  documentName: string;
  date: string;
  status: string;
  riskRating: string;
  confidence: number;
  keyFindings: string[];
  recommendations: string[];
  summary: string;
  downloadUrl: string;
}

interface AnalysisReportProps {
  analysis: Analysis;
  onDownload: () => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({
  analysis,
  onDownload
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'pdf' | 'excel'>('json');
  const [isDownloading, setIsDownloading] = useState(false);

  const getRiskColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const handleDownload = async (format: 'json' | 'pdf' | 'excel') => {
    setIsDownloading(true);
    try {
      let content: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(analysis, null, 2);
          mimeType = 'application/json';
          filename = `analysis_${analysis.id}.json`;
          break;
        
        case 'pdf':
          // Simulate PDF generation
          const pdfContent = generatePDFContent(analysis);
          content = pdfContent;
          mimeType = 'application/pdf';
          filename = `analysis_report_${analysis.id}.pdf`;
          break;
        
        case 'excel':
          // Simulate Excel generation
          const excelContent = generateExcelContent(analysis);
          content = excelContent;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = `analysis_data_${analysis.id}.xlsx`;
          break;
        
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Complete',
        description: `Analysis report downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download analysis report.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFContent = (analysis: Analysis) => {
    // In a real app, you'd use a PDF library like jsPDF or PDFKit
    return `
      ANALYSIS REPORT
      ===============
      
      Document: ${analysis.documentName}
      Analysis Date: ${new Date(analysis.date).toLocaleDateString()}
      Risk Rating: ${analysis.riskRating}
      Confidence: ${(analysis.confidence * 100).toFixed(1)}%
      
      SUMMARY
      -------
      ${analysis.summary}
      
      KEY FINDINGS
      ------------
      ${analysis.keyFindings.map((finding, index) => `${index + 1}. ${finding}`).join('\n')}
      
      RECOMMENDATIONS
      ---------------
      ${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
    `;
  };

  const generateExcelContent = (analysis: Analysis) => {
    // In a real app, you'd use a library like SheetJS
    const csvContent = [
      ['Analysis Report'],
      ['Document', analysis.documentName],
      ['Date', new Date(analysis.date).toLocaleDateString()],
      ['Risk Rating', analysis.riskRating],
      ['Confidence', `${(analysis.confidence * 100).toFixed(1)}%`],
      [''],
      ['Key Findings'],
      ...analysis.keyFindings.map((finding, index) => [`${index + 1}`, finding]),
      [''],
      ['Recommendations'],
      ...analysis.recommendations.map((rec, index) => [`${index + 1}`, rec]),
    ].map(row => row.join(','));
    
    return csvContent.join('\n');
  };

  const handleEmailReport = () => {
    const subject = `Analysis Report - ${analysis.documentName}`;
    const body = `Please find the analysis report for ${analysis.documentName}.\n\nRisk Rating: ${analysis.riskRating}\nConfidence: ${(analysis.confidence * 100).toFixed(1)}%\n\n${analysis.summary}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Analysis Report</CardTitle>
                <p className="text-gray-600 mt-1">
                  Generated on {new Date(analysis.date).toLocaleDateString()} at{' '}
                  {new Date(analysis.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailReport}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <div className="flex items-center space-x-1">
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as any)}
                  className="px-3 py-2 text-sm border rounded-md"
                >
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
                <Button
                  onClick={() => handleDownload(downloadFormat)}
                  disabled={isDownloading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Document</p>
                <p className="font-semibold text-sm truncate max-w-[150px]" title={analysis.documentName}>
                  {analysis.documentName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getRiskColor(analysis.riskRating)}`}>
                {getRiskIcon(analysis.riskRating)}
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Rating</p>
                <p className="font-semibold">{analysis.riskRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-semibold">{(analysis.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-800">
                  {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Analysis Confidence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Confidence Score</span>
              <span className="text-sm font-bold">{(analysis.confidence * 100).toFixed(1)}%</span>
            </div>
            <Progress value={analysis.confidence * 100} className="h-3" />
            <p className="text-sm text-gray-600">
              This score indicates the AI's confidence in the analysis results based on document quality,
              data completeness, and pattern recognition accuracy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Key Findings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.keyFindings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1">{finding}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Document Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Name:</span>
                  <span className="font-medium">{analysis.documentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document ID:</span>
                  <span className="font-mono text-xs">{analysis.documentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis ID:</span>
                  <span className="font-mono text-xs">{analysis.id}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Processing Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis Date:</span>
                  <span className="font-medium">{new Date(analysis.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">~3.2 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Model:</span>
                  <span className="font-medium">DocAnalyzer v2.1</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisReport;