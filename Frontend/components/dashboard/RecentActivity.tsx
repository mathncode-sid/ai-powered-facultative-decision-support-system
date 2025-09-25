'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  ExternalLink
} from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import { SubmissionStatus, Priority } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'submission' | 'status_change' | 'document' | 'analysis' | 'decision';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status?: SubmissionStatus;
  priority?: Priority;
  submissionId?: string;
  metadata?: any;
}

interface RecentActivityProps {
  userRole: string;
  limit?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userRole, limit = 10 }) => {
  // Mock activity data - in real implementation, this would come from API
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'submission',
      title: 'New submission received',
      description: 'FAC-2024-001 - Nairobi Industrial Complex - Property risk from African Alliance Insurance',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      user: 'System',
      status: 'pending_review',
      priority: 'high',
      submissionId: 'FAC-2024-001',
    },
    {
      id: '2', 
      type: 'analysis',
      title: 'AI analysis completed',
      description: 'Risk assessment and pricing recommendation generated for FAC-2024-002',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      user: 'AI Engine',
      submissionId: 'FAC-2024-002',
    },
    {
      id: '3',
      type: 'status_change',
      title: 'Submission approved',
      description: 'FAC-2024-003 approved with 40% share at 1.2% rate',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: 'Sarah Wilson',
      status: 'approved',
      submissionId: 'FAC-2024-003',
    },
    {
      id: '4',
      type: 'document',
      title: 'Survey report uploaded',
      description: 'Engineering survey for Lagos Manufacturing Plant added to FAC-2024-004',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      user: 'Michael Johnson',
      submissionId: 'FAC-2024-004',
    },
    {
      id: '5',
      type: 'decision',
      title: 'Quote letter generated',
      description: 'Acceptance letter sent to broker for FAC-2024-005',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: 'James Ochieng',
      submissionId: 'FAC-2024-005',
    },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'submission':
        return <FileText className="h-4 w-4" />;
      case 'analysis':
        return <AlertTriangle className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'decision':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'submission':
        return 'text-blue-600 bg-blue-50';
      case 'analysis':
        return 'text-purple-600 bg-purple-50';
      case 'status_change':
        return 'text-green-600 bg-green-50';
      case 'document':
        return 'text-orange-600 bg-orange-50';
      case 'decision':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const activities = mockActivities.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="outline" size="sm">
          View All
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              getActivityColor(activity.type)
            )}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{activity.user}</span>
                </div>
                
                {activity.status && (
                  <Badge variant="secondary" className={cn(
                    'text-xs',
                    STATUS_COLORS[activity.status]
                  )}>
                    {STATUS_LABELS[activity.status]}
                  </Badge>
                )}
                
                {activity.priority && (
                  <Badge variant="secondary" className={cn(
                    'text-xs',
                    PRIORITY_COLORS[activity.priority]
                  )}>
                    {activity.priority.toUpperCase()}
                  </Badge>
                )}
                
                {activity.submissionId && (
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                    {activity.submissionId}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;