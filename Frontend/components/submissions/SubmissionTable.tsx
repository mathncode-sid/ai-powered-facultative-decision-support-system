'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import { Submission } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubmissionTableProps {
  submissions: Submission[];
  selectedSubmissions: string[];
  onSelectionChange: (submissionIds: string[]) => void;
  onSubmissionClick: (submission: Submission) => void;
  onStatusChange: (submissionId: string, newStatus: string) => void;
  isLoading?: boolean;
}

const SubmissionTable: React.FC<SubmissionTableProps> = ({
  submissions,
  selectedSubmissions,
  onSelectionChange,
  onSubmissionClick,
  onStatusChange,
  isLoading = false,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(submissions.map(sub => sub.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSubmissions, submissionId]);
    } else {
      onSelectionChange(selectedSubmissions.filter(id => id !== submissionId));
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const days = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (days === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
    return { text: `${days} days left`, color: 'text-gray-600' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_review':
      case 'under_analysis':
      case 'pricing_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'awaiting_approval':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-gray-500">
          Loading submissions...
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No submissions found</p>
          <p>Try adjusting your filters or search criteria.</p>
        </div>
      </div>
    );
  }

  const allSelected = submissions.length > 0 && selectedSubmissions.length === submissions.length;
  const someSelected = selectedSubmissions.length > 0 && selectedSubmissions.length < submissions.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Insured / Cedant</TableHead>
            <TableHead>Class / Peril</TableHead>
            <TableHead>Sum Insured</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const isSelected = selectedSubmissions.includes(submission.id);
            const dueInfo = getDaysUntilDue(submission.dueDate);
            
            return (
              <TableRow
                key={submission.id}
                className={cn(
                  'cursor-pointer hover:bg-gray-50',
                  isSelected && 'bg-blue-50'
                )}
                onClick={() => onSubmissionClick(submission)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleSelectSubmission(submission.id, checked as boolean)
                    }
                    aria-label={`Select submission ${submission.reference}`}
                  />
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(submission.status)}
                    <span>{submission.reference}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{submission.insured.name}</p>
                    <p className="text-sm text-gray-500">{submission.cedant.name}</p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <p className="font-medium">{submission.riskDetails.classOfBusiness}</p>
                    <p className="text-sm text-gray-500">
                      {submission.riskDetails.peril.slice(0, 2).join(', ')}
                      {submission.riskDetails.peril.length > 2 && ` +${submission.riskDetails.peril.length - 2}`}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {formatCurrency(submission.riskDetails.sumInsured, submission.riskDetails.currency)}
                    </p>
                    <p className="text-sm text-gray-500">{submission.riskDetails.currency}</p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs', STATUS_COLORS[submission.status])}
                  >
                    {STATUS_LABELS[submission.status]}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', PRIORITY_COLORS[submission.priority])}
                  >
                    {submission.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{format(submission.dueDate, 'MMM dd')}</p>
                    <p className={cn('text-xs', dueInfo.color)}>
                      {dueInfo.text}
                    </p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {submission.assignedTo || 'Unassigned'}
                  </span>
                </TableCell>
                
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSubmissionClick(submission)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View Documents
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {submission.status === 'pending_review' && (
                        <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'under_analysis')}>
                          <Clock className="mr-2 h-4 w-4" />
                          Start Analysis
                        </DropdownMenuItem>
                      )}
                      {submission.status === 'awaiting_approval' && (
                        <>
                          <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'approved')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'declined')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Decline
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubmissionTable;