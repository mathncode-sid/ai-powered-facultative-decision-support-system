'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',  
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={cn('p-2 rounded-lg border', colorClasses[color])}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className="flex items-center mt-2 space-x-1">
            {change.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
            {change.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
            <span className={cn(
              'text-sm font-medium',
              change.trend === 'up' && 'text-green-600',
              change.trend === 'down' && 'text-red-600',
              change.trend === 'neutral' && 'text-gray-600'
            )}>
              {change.value}
            </span>
            <span className="text-sm text-gray-500">{change.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  userRole: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ userRole }) => {
  // Mock data - in real implementation, this would come from API
  const getStatsForRole = (role: string) => {
    switch (role) {
      case 'facultative_underwriter':
        return [
          {
            title: 'Active Submissions',
            value: '23',
            change: { value: '+2', trend: 'up' as const, period: 'vs last week' },
            icon: <FileText className="h-4 w-4" />,
            color: 'blue' as const,
          },
          {
            title: 'Pending Review',
            value: '8',
            change: { value: '+1', trend: 'up' as const, period: 'vs yesterday' },
            icon: <Clock className="h-4 w-4" />,
            color: 'yellow' as const,
          },
          {
            title: 'Completed Today',
            value: '5',
            change: { value: '+25%', trend: 'up' as const, period: 'vs avg' },
            icon: <CheckCircle className="h-4 w-4" />,
            color: 'green' as const,
          },
          {
            title: 'Overdue Items',
            value: '2',
            change: { value: '-1', trend: 'down' as const, period: 'vs yesterday' },
            icon: <AlertTriangle className="h-4 w-4" />,
            color: 'red' as const,
          },
        ];

      case 'portfolio_manager':
        return [
          {
            title: 'Portfolio Value',
            value: '$2.4B',
            change: { value: '+5.2%', trend: 'up' as const, period: 'YTD' },
            icon: <DollarSign className="h-4 w-4" />,
            color: 'green' as const,
          },
          {
            title: 'Active Policies',
            value: '1,247',
            change: { value: '+12', trend: 'up' as const, period: 'this month' },
            icon: <Target className="h-4 w-4" />,
            color: 'blue' as const,
          },
          {
            title: 'Loss Ratio',
            value: '68.5%',
            change: { value: '+2.1%', trend: 'up' as const, period: 'vs target' },
            icon: <TrendingDown className="h-4 w-4" />,
            color: 'red' as const,
          },
          {
            title: 'Concentration Risk',
            value: 'Medium',
            change: { value: 'Stable', trend: 'neutral' as const, period: 'vs last quarter' },
            icon: <AlertTriangle className="h-4 w-4" />,
            color: 'yellow' as const,
          },
        ];

      case 'senior_manager':
        return [
          {
            title: 'Gross Written Premium',
            value: '$180M',
            change: { value: '+8.3%', trend: 'up' as const, period: 'YTD' },
            icon: <DollarSign className="h-4 w-4" />,
            color: 'green' as const,
          },
          {
            title: 'Combined Ratio',
            value: '94.2%',
            change: { value: '-1.8%', trend: 'down' as const, period: 'vs last year' },
            icon: <TrendingDown className="h-4 w-4" />,
            color: 'green' as const,
          },
          {
            title: 'Return on Capital',
            value: '12.5%',
            change: { value: '+0.7%', trend: 'up' as const, period: 'vs target' },
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'blue' as const,
          },
          {
            title: 'New Business',
            value: '$45M',
            change: { value: '+15%', trend: 'up' as const, period: 'vs plan' },
            icon: <Target className="h-4 w-4" />,
            color: 'purple' as const,
          },
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForRole(userRole);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;