'use client';

import React from 'react';
import { useDocuments, DocumentProvider } from '@/contexts/DocumentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import DocumentTable from '@/components/documents/DocumentsTable';
import DocumentFilters from '@/components/documents/DocumentsFilters';
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Plus,
} from 'lucide-react';

/* ---------- Inner Page (uses context) ---------- */
const DocumentsContent: React.FC = () => {
  const { user } = useAuth();
  const {
    documents,
    filteredDocuments,
    selectedDocuments,
    isLoading,
    filters,
    searchQuery,
    loadDocuments,
    setFilters,
    setSearch,
    setSelectedDocuments,
    clearFilters,
    deleteDocument,
    downloadDocument,
  } = useDocuments();

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const handleBulkAction = (action: string) => {
    if (selectedDocuments.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select documents first.',
        variant: 'destructive',
      });
      return;
    }

    switch (action) {
      case 'download':
        toast({
          title: 'Download Started',
          description: `Downloading ${selectedDocuments.length} document(s)...`,
        });
        selectedDocuments.forEach((id) => downloadDocument(id));
        break;
      case 'delete':
        toast({
          title: 'Delete Confirmation',
          description: `Are you sure you want to delete ${selectedDocuments.length} document(s)?`,
        });
        selectedDocuments.forEach((id) => deleteDocument(id));
        setSelectedDocuments([]);
        break;
    }
  };

  const stats = {
    total: documents.length,
    pdfs: documents.filter((d) => d.type === 'pdf').length,
    excel: documents.filter((d) => d.type === 'excel').length,
    word: documents.filter((d) => d.type === 'word').length,
  };

  return (
    <div className="space-y-8 w-full mr-[900px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage and view uploaded reinsurance documents
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PDF</p>
              <p className="text-2xl font-bold text-red-600">{stats.pdfs}</p>
            </div>
            <Badge className="bg-red-100 text-red-800">PDF</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Excel</p>
              <p className="text-2xl font-bold text-green-600">{stats.excel}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">XLS</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Word</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.word}</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800">DOC</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <DocumentFilters
            filters={filters}
            onFiltersChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearch}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {selectedDocuments.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('download')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDocuments([])}
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Document Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Documents</span>
            <Badge variant="secondary">
              {filteredDocuments.length} of {documents.length} shown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DocumentTable
            documents={filteredDocuments}
            selectedDocuments={selectedDocuments}
            onSelectionChange={setSelectedDocuments}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

/* ---------- Wrapper Page (provides context only here) ---------- */
const DocumentsPage: React.FC = () => {
  return (
    <DocumentProvider>
      <DocumentsContent />
    </DocumentProvider>
  );
};

export default DocumentsPage;
