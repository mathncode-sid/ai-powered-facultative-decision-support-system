'use client';

import React, { createContext, useContext, useState } from 'react';

type DocumentType = 'pdf' | 'excel' | 'word' | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  uploadedAt: string;
  uploadedBy: string;
  size: string;
}

interface DocumentContextType {
  documents: Document[];
  filteredDocuments: Document[];
  selectedDocuments: string[];
  isLoading: boolean;
  filters: Record<string, any>;
  searchQuery: string;

  loadDocuments: () => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearch: (query: string) => void;
  setSelectedDocuments: (ids: string[]) => void;
  toggleDocumentSelection: (id: string) => void;
  clearFilters: () => void;
  deleteDocument: (id: string) => void;
  downloadDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearch] = useState('');

  const loadDocuments = () => {
    setIsLoading(true);

    setTimeout(() => {
      const mockDocs: Document[] = [
        {
          id: '1',
          name: 'Claims_Report.pdf',
          type: 'pdf',
          uploadedAt: '2025-09-20',
          uploadedBy: 'Joseph',
          size: '1.2 MB',
        },
        {
          id: '2',
          name: 'Underwriting_Data.xlsx',
          type: 'excel',
          uploadedAt: '2025-09-18',
          uploadedBy: 'Admin',
          size: '890 KB',
        },
        {
          id: '3',
          name: 'Policy_Wording.docx',
          type: 'word',
          uploadedAt: '2025-09-17',
          uploadedBy: 'Analyst',
          size: '450 KB',
        },
      ];

      setDocuments(mockDocs);
      setFilteredDocuments(mockDocs);
      setIsLoading(false);
    }, 800);
  };

  const applyFilters = (docs: Document[], query: string, filters: any) => {
    let result = [...docs];
    if (query) {
      result = result.filter((doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (filters.type) {
      result = result.filter((doc) => doc.type === filters.type);
    }
    return result;
  };

  const updateFiltered = (query: string, newFilters: any) => {
    const updated = applyFilters(documents, query, newFilters);
    setFilteredDocuments(updated);
  };

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setFilteredDocuments(documents);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setFilteredDocuments((prev) => prev.filter((doc) => doc.id !== id));
    setSelectedDocuments((prev) => prev.filter((docId) => docId !== id));
  };

  const downloadDocument = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      console.log(`Downloading document: ${doc.name}`);
    }
  };

  React.useEffect(() => {
    updateFiltered(searchQuery, filters);
  }, [documents, filters, searchQuery]);

  return (
    <DocumentContext.Provider
      value={{
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
        toggleDocumentSelection,
        clearFilters,
        deleteDocument,
        downloadDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
