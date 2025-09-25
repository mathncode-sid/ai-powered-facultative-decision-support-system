'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  DollarSign,
  MapPin,
  Calendar,
  User,
  Mail,
  Brain,
  Target,
  BarChart3,
  Lightbulb,
  Warning,
  Info
} from 'lucide-react';
import { AnalysisResult, formatCurrency, formatPercentage, getConfidenceColor, getConfidenceLabel } from '@/lib/api';

interface AnalysisResultsDisplayProps {
  result: AnalysisResult;
  onExport?: () => void;
  onSave?: () => void;
}

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
  result,
  onExport,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { email_data, reinsurance_analysis } = result;
  const { working_sheet, risk_calculations, market_analysis, portfolio_impact, confidence_score, recommendations, warnings } = reinsurance_analysis;

  const getConfidenceBadge = (score: number) => {
    const color = getConfidenceColor(score);
    const label = getConfidenceLabel(score);
    return <Badge className={color}>{label}</Badge>;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return { level: 'High', color: 'bg-red-100 text-red-800' };
    if (score >= 0.4) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const riskLevel = getRiskLevel(confidence_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <span>AI Analysis Results</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Analysis completed on {new Date(email_data.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getConfidenceBadge(confidence_score)}
              <Badge className={riskLevel.color}>{riskLevel.level} Risk</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Insured</p>
                <p className="text-xs text-gray-600">{working_sheet.insured}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Cedant</p>
                <p className="text-xs text-gray-600">{working_sheet.cedant}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Broker</p>
                <p className="text-xs text-gray-600">{working_sheet.broker}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Impact</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>Email Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Subject</p>
                  <p className="text-sm text-gray-600">{email_data.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">From</p>
                  <p className="text-sm text-gray-600">{email_data.sender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(email_data.date).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Premium Rate</span>
                  <Badge variant="outline">{formatPercentage(risk_calculations.premium_rate_percentage)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">PML</span>
                  <Badge variant="outline">{working_sheet.possible_maximum_loss_pml}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recommended Share</span>
                  <Badge variant="outline">{working_sheet.recommended_share_percentage}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confidence Score</span>
                  {getConfidenceBadge(confidence_score)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Processing Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{result.attachments_processed}</p>
                  <p className="text-sm text-gray-600">Attachments Processed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{result.attachments_uploaded}</p>
                  <p className="text-sm text-gray-600">Attachments Uploaded</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{result.documents_analyzed}</p>
                  <p className="text-sm text-gray-600">Documents Analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Risk Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Perils Covered</p>
                  <p className="text-sm text-gray-600">{working_sheet.perils_covered}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Geographical Limit</p>
                  <p className="text-sm text-gray-600">{working_sheet.geographical_limit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Occupation</p>
                  <p className="text-sm text-gray-600">{working_sheet.occupation_of_insured}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Main Activities</p>
                  <p className="text-sm text-gray-600">{working_sheet.main_activities}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">PML Assessment</p>
                  <p className="text-sm text-gray-600">{risk_calculations.pml_assessment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Catastrophe Exposure</p>
                  <p className="text-sm text-gray-600">{working_sheet.cat_exposure}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Climate Change Risk</p>
                  <Badge variant="outline">{working_sheet.climate_change_risk_factors}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">ESG Risk Assessment</p>
                  <Badge variant="outline">{working_sheet.esg_risk_assessment}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>Technical Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {working_sheet.technical_assessment}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Market Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {market_analysis.market_conditions}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Industry Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {market_analysis.industry_trends}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>Negotiation Factors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {market_analysis.negotiation_factors.map((factor, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Impact Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>Concentration Risk</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {portfolio_impact.concentration_risk}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Diversification Benefit</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {portfolio_impact.diversification_benefit}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Correlation Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {portfolio_impact.correlation_analysis}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>Final Recommendation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {working_sheet.final_recommendation}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Warning className="h-5 w-5 text-red-600" />
                  <span>Warnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Analysis completed with {formatPercentage(confidence_score)} confidence
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onExport}>
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={onSave}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResultsDisplay;
