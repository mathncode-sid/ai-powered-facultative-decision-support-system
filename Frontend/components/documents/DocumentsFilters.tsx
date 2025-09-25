'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, SlidersHorizontal, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DocumentFiltersProps {
  filters: {
    type?: string[];
    uploadedBy?: string[];
    dateRange?: { from?: Date; to?: Date };
  };
  onFiltersChange: (filters: DocumentFiltersProps['filters']) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const activeFiltersCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0;
    }
    return value !== undefined && value !== '';
  }).length;

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    const current = filters.type || [];
    let newTypes;
    if (checked) {
      newTypes = [...current, type];
    } else {
      newTypes = current.filter((t) => t !== type);
    }
    onFiltersChange({ ...filters, type: newTypes });
  };

  const handleUploaderFilterChange = (uploader: string, checked: boolean) => {
    const current = filters.uploadedBy || [];
    let newUploaders;
    if (checked) {
      newUploaders = [...current, uploader];
    } else {
      newUploaders = current.filter((u) => u !== uploader);
    }
    onFiltersChange({ ...filters, uploadedBy: newUploaders });
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    const currentRange = filters.dateRange || {};
    const newRange = { ...currentRange, [field]: date };

    if (!newRange.from && !newRange.to) {
      const { dateRange, ...otherFilters } = filters;
      onFiltersChange(otherFilters);
    } else {
      onFiltersChange({ ...filters, dateRange: newRange });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toggle */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            'relative',
            activeFiltersCount > 0 && 'border-blue-500 bg-blue-50'
          )}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 bg-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Document Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              {['pdf', 'docx', 'xlsx', 'image'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`type-${type}`}
                    checked={filters.type?.includes(type) || false}
                    onChange={(e) => handleTypeFilterChange(type, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>

            {/* Uploaded By Filter */}
            <div className="space-y-2">
              <Label>Uploaded By</Label>
              {['Alice', 'Bob', 'Charlie'].map((uploader) => (
                <div key={uploader} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`uploader-${uploader}`}
                    checked={filters.uploadedBy?.includes(uploader) || false}
                    onChange={(e) => handleUploaderFilterChange(uploader, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`uploader-${uploader}`} className="text-sm font-normal">
                    {uploader}
                  </Label>
                </div>
              ))}
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Uploaded</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from
                      ? format(filters.dateRange.from, 'MMM dd, yyyy')
                      : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.from}
                    onSelect={(date) => handleDateRangeChange('from', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.to
                      ? format(filters.dateRange.to, 'MMM dd, yyyy')
                      : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.to}
                    onSelect={(date) => handleDateRangeChange('to', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {filters.type?.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    Type: {t}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleTypeFilterChange(t, false)}
                    />
                  </Badge>
                ))}
                {filters.uploadedBy?.map((u) => (
                  <Badge key={u} variant="secondary" className="text-xs">
                    Uploader: {u}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleUploaderFilterChange(u, false)}
                    />
                  </Badge>
                ))}
                {filters.dateRange && (
                  <Badge variant="secondary" className="text-xs">
                    Date: {filters.dateRange.from && format(filters.dateRange.from, 'MMM dd')} -{' '}
                    {filters.dateRange.to && format(filters.dateRange.to, 'MMM dd')}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => {
                        const { dateRange, ...other } = filters;
                        onFiltersChange(other);
                      }}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentFilters;
