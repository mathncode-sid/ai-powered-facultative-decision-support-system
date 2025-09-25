'use client';

import React from 'react';
import { useSubmissions } from '@/contexts/SubmissionContext';
import { useAuth } from '@/contexts/AuthContext';
import SubmissionTable from '@/components/submissions/SubmissionTable';
import SubmissionFilters from '@/components/submissions/SubmissionFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FileUploadZone from '@/components/submissions/fileuploadzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Mail,
  BarChart3,
  FileText,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SubmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const {
    filteredAndSortedSubmissions,
    selectedSubmissions,
    isLoading,
    filters,
    sortOption,
    searchQuery,
    loadSubmissions,
    setFilters,
    setSort,
    setSearch,
    setSelectedSubmissions,
    toggleSubmissionSelection,
    updateSubmissionStatus,
    clearFilters,
  } = useSubmissions();

  React.useEffect(() => {
    loadSubmissions();
  }, []);

  const [openUpload, setOpenUpload] = React.useState(false);

  const handleAnalysisComplete = (result: any) => {
    // Navigate to analysis results page
    const taskId = result.task_id || 'unknown';
    router.push(`/analysis-results?taskId=${taskId}`);
  };

  const handleAnalysisError = (error: string) => {
    toast({
      title: 'Analysis Failed',
      description: error,
      variant: 'destructive',
    });
  };

  const handleSubmissionClick = (submission: any) => {
    // Navigate to submission detail page
    window.location.href = `/submissions/${submission.id}`;
  };
  const handleNewSubmission = () => {
  window.location.href = `/submissions/addsubmission`;
};

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      await updateSubmissionStatus(submissionId, newStatus as any);
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

  const handleBulkAction = (action: string) => {
    if (selectedSubmissions.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select submissions to perform bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    // Implement bulk actions
    switch (action) {
      case 'export':
        toast({
          title: 'Export Started',
          description: `Exporting ${selectedSubmissions.length} submissions...`,
        });
        break;
      case 'delete':
        toast({
          title: 'Delete Confirmation',
          description: `Are you sure you want to delete ${selectedSubmissions.length} submissions?`,
        });
        break;
      case 'assign':
        toast({
          title: 'Assignment',
          description: 'Assignment dialog would open here.',
        });
        break;
    }
  };

  const getSubmissionStats = () => {
    const total = filteredAndSortedSubmissions.length;
    const pending = filteredAndSortedSubmissions.filter(s => s.status === 'pending_review').length;
    const inProgress = filteredAndSortedSubmissions.filter(s => 
      ['under_analysis', 'pricing_review', 'portfolio_check'].includes(s.status)
    ).length;
    const awaitingApproval = filteredAndSortedSubmissions.filter(s => s.status === 'awaiting_approval').length;
    
    return { total, pending, inProgress, awaitingApproval };
  };

  const stats = getSubmissionStats();

  return (
    <div className="space-y-8 w-full mr-[360px]">
      <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600 mt-1">
            Manage and process facultative reinsurance submissions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email Ingestion
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenUpload(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
          <Dialog open={openUpload} onOpenChange={setOpenUpload}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
              </DialogHeader>
              <FileUploadZone
                onFilesUploaded={(files) => {
                  console.log("Uploaded files:", files);
                  setOpenUpload(false); // ✅ auto-close after upload (optional)
                }}
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisError={handleAnalysisError}
                enableAnalysis={true}
              />
            </DialogContent>
          </Dialog>
           <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleNewSubmission}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 h-8 w-8 p-0 flex items-center justify-center">
                !
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Awaiting Approval</p>
                <p className="text-2xl font-bold text-orange-600">{stats.awaitingApproval}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 h-8 w-8 p-0 flex items-center justify-center">
                ⏳
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <SubmissionFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortOption={sortOption}
            onSortChange={setSort}
            searchQuery={searchQuery}
            onSearchChange={setSearch}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedSubmissions.length} submission{selectedSubmissions.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('assign')}
                  >
                    Bulk Assign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmissions([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Submissions</span>
            <Badge variant="secondary">
              {filteredAndSortedSubmissions.length} of {filteredAndSortedSubmissions.length} shown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SubmissionTable
            submissions={filteredAndSortedSubmissions}
            selectedSubmissions={selectedSubmissions}
            onSelectionChange={setSelectedSubmissions}
            onSubmissionClick={handleSubmissionClick}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination would go here */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedSubmissions.length} submissions
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;