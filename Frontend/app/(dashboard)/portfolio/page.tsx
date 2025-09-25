'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExposureByClassChart,
  ExposureByGeographyChart,
  PremiumTrendChart,
  LossRatioChart,
} from '@/components/charts/PortfolioChart';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  DollarSign,
  BarChart3,
  Download,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConcentrationMetric {
  dimension: string;
  category: string;
  limit: number;
  current: number;
  utilization: number;
  status: 'ok' | 'warning' | 'exceeded';
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  variance: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

const PortfolioPage: React.FC = () => {
  // Mock data - in real implementation, this would come from API
  const concentrationMetrics: ConcentrationMetric[] = [
    {
      dimension: 'Class of Business',
      category: 'Property',
      limit: 300000000,
      current: 255000000,
      utilization: 85,
      status: 'warning',
    },
    {
      dimension: 'Geography',
      category: 'Kenya',
      limit: 400000000,
      current: 320000000,
      utilization: 80,
      status: 'warning',
    },
    {
      dimension: 'Single Risk',
      category: 'Nairobi Industrial Complex',
      limit: 50000000,
      current: 35000000,
      utilization: 70,
      status: 'ok',
    },
    {
      dimension: 'Cedant',
      category: 'African Alliance Insurance',
      limit: 200000000,
      current: 125000000,
      utilization: 62.5,
      status: 'ok',
    },
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      metric: 'Gross Written Premium',
      current: 180000000,
      target: 175000000,
      variance: 2.9,
      trend: 'up',
      period: 'YTD',
    },
    {
      metric: 'Loss Ratio',
      current: 68.5,
      target: 65.0,
      variance: 5.4,
      trend: 'up',
      period: 'YTD',
    },
    {
      metric: 'Combined Ratio',
      current: 94.2,
      target: 95.0,
      variance: -0.8,
      trend: 'down',
      period: 'YTD',
    },
    {
      metric: 'Return on Capital',
      current: 12.5,
      target: 12.0,
      variance: 4.2,
      trend: 'up',
      period: 'YTD',
    },
  ];

  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: ConcentrationMetric['status']) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'exceeded':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Overview</h1>
          <p className="text-gray-600 mt-1">
            Monitor portfolio performance, concentration limits, and key metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Limits
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exposure</p>
                <p className="text-2xl font-bold text-gray-900">$2.4B</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+5.2% vs target</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12 this month</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loss Ratio</p>
                <p className="text-2xl font-bold text-gray-900">68.5%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">+2.1% vs target</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return on Capital</p>
                <p className="text-2xl font-bold text-gray-900">12.5%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+0.7% vs target</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExposureByClassChart />
        <ExposureByGeographyChart />
      </div>

      <PremiumTrendChart />

      {/* Concentration Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Concentration Limits Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {concentrationMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{metric.dimension}</span>
                    <Badge className={cn('text-xs', getStatusColor(metric.status))}>
                      {metric.utilization}% utilized
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{metric.category}</span>
                    <span>
                      {formatCurrency(metric.current)} / {formatCurrency(metric.limit)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        metric.status === 'ok' && 'bg-green-500',
                        metric.status === 'warning' && 'bg-yellow-500',
                        metric.status === 'exceeded' && 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(metric.utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{metric.metric}</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metric.trend)}
                    <span className={cn(
                      'text-sm font-medium',
                      metric.variance > 0 && 'text-green-600',
                      metric.variance < 0 && 'text-red-600',
                      metric.variance === 0 && 'text-gray-600'
                    )}>
                      {metric.variance > 0 && '+'}
                      {metric.variance.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>Current</span>
                  <span>Target</span>
                </div>
                
                <div className="flex items-center justify-between text-lg font-semibold mb-1">
                  <span className="text-gray-900">
                    {metric.metric.includes('Ratio') || metric.metric.includes('Return') 
                      ? formatPercentage(metric.current)
                      : formatCurrency(metric.current)
                    }
                  </span>
                  <span className="text-gray-500">
                    {metric.metric.includes('Ratio') || metric.metric.includes('Return')
                      ? formatPercentage(metric.target)
                      : formatCurrency(metric.target)
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{metric.period}</span>
                  <span>
                    Variance: {metric.variance > 0 && '+'}{metric.variance.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Catastrophe Exposure</span>
                <span className="text-sm text-gray-600">$450M (18.8%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Non-Cat Exposure</span>
                <span className="text-sm text-gray-600">$1.95B (81.2%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Correlated Risk</span>
                <span className="text-sm text-gray-600">15.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Diversification Benefit</span>
                <span className="text-sm text-green-600">-8.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capital Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Required Capital</span>
                <span className="text-sm text-gray-600">$280M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Capital</span>
                <span className="text-sm text-gray-600">$350M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Capital Utilization</span>
                <span className="text-sm text-gray-600">80%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Solvency Ratio</span>
                <span className="text-sm text-green-600">1.25x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioPage;