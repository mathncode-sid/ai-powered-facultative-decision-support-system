'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmissions } from '@/contexts/SubmissionContext';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { 
  ExposureByClassChart, 
  ExposureByGeographyChart, 
  PremiumTrendChart, 
  LossRatioChart 
} from '@/components/charts/PortfolioChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Plus, 
  ChevronRight,
  Target,
  Shield,
  DollarSign
} from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { submissions, loadSubmissions } = useSubmissions();

  React.useEffect(() => {
    loadSubmissions();
  }, []);

  if (!user) return null;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeGreeting}, ${user.name.split(' ')[0]}`;
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'facultative_underwriter':
        return [
          { label: 'New Submission', href: '/submissions/new', icon: <Plus className="h-4 w-4" /> },
          { label: 'Pending Review', href: '/submissions?status=pending_review', icon: <Clock className="h-4 w-4" /> },
          { label: 'Generate Report', href: '/reports/generate', icon: <FileText className="h-4 w-4" /> },
        ];
      case 'portfolio_manager':
        return [
          { label: 'Portfolio Analysis', href: '/portfolio', icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'Concentration Report', href: '/concentration', icon: <Target className="h-4 w-4" /> },
          { label: 'Risk Monitoring', href: '/risk-monitoring', icon: <Shield className="h-4 w-4" /> },
        ];
      case 'senior_manager':
        return [
          { label: 'Executive Report', href: '/reports/executive', icon: <FileText className="h-4 w-4" /> },
          { label: 'Performance Dashboard', href: '/performance', icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'Strategic Overview', href: '/strategic', icon: <Target className="h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your {user.role.replace('_', ' ').toLowerCase()} portfolio today.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {quickActions.slice(0, 2).map((action) => (
            <Button key={action.href} variant="outline" className="flex items-center space-x-2">
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Key Statistics */}
      <DashboardStats userRole={user.role} />

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role-specific main content */}
          {user.role === 'facultative_underwriter' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExposureByClassChart />
                <ExposureByGeographyChart />
              </div>
              
              {/* Priority Submissions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Priority Submissions</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">{submission.reference}</p>
                            <p className="text-xs text-gray-500">{submission.insured.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={STATUS_COLORS[submission.status]}>
                            {submission.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ${(submission.riskDetails.sumInsured / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'portfolio_manager' && (
            <>
              <PremiumTrendChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExposureByClassChart />
                <LossRatioChart />
              </div>
            </>
          )}

          {user.role === 'senior_manager' && (
            <>
              <PremiumTrendChart />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExposureByGeographyChart />
                <LossRatioChart />
              </div>
            </>
          )}
        </div>

        {/* Right Column - Activity and Quick Info */}
        <div className="space-y-6">
          <RecentActivity userRole={user.role} limit={8} />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={action.href} className="flex items-center space-x-2">
                    {action.icon}
                    <span>{action.label}</span>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Alerts and Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm text-yellow-800">Concentration Warning</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Property class approaching 85% of concentration limit
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-sm text-red-800">Overdue Items</span>
                </div>
                <p className="text-xs text-red-700">
                  2 submissions past due date requiring immediate attention
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-800">Market Update</span>
                </div>
                <p className="text-xs text-blue-700">
                  New catastrophe model update available for review
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Analysis Engine</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Ingestion</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Document Processing</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Queue: 3
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Portfolio Updates</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Real-time
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;