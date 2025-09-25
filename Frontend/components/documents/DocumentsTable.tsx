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
  Download,
  Trash2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/contexts/DocumentContext';

interface DocumentTableProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
  isLoading?: boolean;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedDocuments,
  onSelectionChange,
  isLoading = false,
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(documents.map((doc) => doc.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDocuments, documentId]);
    } else {
      onSelectionChange(selectedDocuments.filter((id) => id !== documentId));
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-gray-500">
          Loading documents...
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No documents found</p>
          <p>Try adjusting your filters or upload new documents.</p>
        </div>
      </div>
    );
  }

  const allSelected =
    documents.length > 0 && selectedDocuments.length === documents.length;
  const someSelected =
    selectedDocuments.length > 0 &&
    selectedDocuments.length < documents.length;

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
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Uploaded At</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const isSelected = selectedDocuments.includes(doc.id);

            return (
              <TableRow
                key={doc.id}
                className={cn(
                  'hover:bg-gray-50',
                  isSelected && 'bg-blue-50'
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectDocument(doc.id, checked as boolean)
                    }
                    aria-label={`Select document ${doc.name}`}
                  />
                </TableCell>

                <TableCell className="font-medium">{doc.name}</TableCell>

                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {doc.type}
                  </Badge>
                </TableCell>

                <TableCell>{doc.size}</TableCell>
                <TableCell>{doc.uploadedBy}</TableCell>
                <TableCell>{doc.uploadedAt}</TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
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

export default DocumentTable;
