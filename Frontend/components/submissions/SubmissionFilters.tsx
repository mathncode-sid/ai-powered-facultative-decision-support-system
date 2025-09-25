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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  Search,
  CalendarIcon,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { STATUS_LABELS, CLASSES_OF_BUSINESS } from '@/lib/constants';
import { FilterOptions, SortOption } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubmissionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const sortOptions: SortOption[] = [
    { field: 'submissionDate', direction: 'desc', label: 'Newest First' },
    { field: 'submissionDate', direction: 'asc', label: 'Oldest First' },
    { field: 'dueDate', direction: 'asc', label: 'Due Date (Earliest)' },
    { field: 'dueDate', direction: 'desc', label: 'Due Date (Latest)' },
    { field: 'sumInsured', direction: 'desc', label: 'Sum Insured (Highest)' },
    { field: 'sumInsured', direction: 'asc', label: 'Sum Insured (Lowest)' },
    { field: 'priority', direction: 'desc', label: 'Priority (Highest)' },
    { field: 'reference', direction: 'asc', label: 'Reference (A-Z)' },
  ];

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  }).length;

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.status || [];
    let newStatuses;
    
    if (checked) {
      newStatuses = [...currentStatuses, status as any];
    } else {
      newStatuses = currentStatuses.filter(s => s !== status);
    }
    
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handlePriorityFilterChange = (priority: string, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    let newPriorities;
    
    if (checked) {
      newPriorities = [...currentPriorities, priority as any];
    } else {
      newPriorities = currentPriorities.filter(p => p !== priority);
    }
    
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const handleClassFilterChange = (classOfBusiness: string, checked: boolean) => {
    const currentClasses = filters.classOfBusiness || [];
    let newClasses;
    
    if (checked) {
      newClasses = [...currentClasses, classOfBusiness];
    } else {
      newClasses = currentClasses.filter(c => c !== classOfBusiness);
    }
    
    onFiltersChange({ ...filters, classOfBusiness: newClasses });
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
      {/* Search and Sort Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search submissions, insured names, or cedants..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={`${sortOption.field}-${sortOption.direction}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('-');
            const option = sortOptions.find(opt => 
              opt.field === field && opt.direction === direction
            );
            if (option) onSortChange(option);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem
                key={`${option.field}-${option.direction}`}
                value={`${option.field}-${option.direction}`}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      checked={filters.status?.includes(status as any) || false}
                      onChange={(e) => handleStatusFilterChange(status, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="space-y-2">
                {['urgent', 'high', 'medium', 'low'].map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`priority-${priority}`}
                      checked={filters.priority?.includes(priority as any) || false}
                      onChange={(e) => handlePriorityFilterChange(priority, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`priority-${priority}`} className="text-sm font-normal capitalize">
                      {priority}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Class of Business Filter */}
            <div className="space-y-2">
              <Label>Class of Business</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {CLASSES_OF_BUSINESS.map((classOfBusiness) => (
                  <div key={classOfBusiness} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`class-${classOfBusiness}`}
                      checked={filters.classOfBusiness?.includes(classOfBusiness) || false}
                      onChange={(e) => handleClassFilterChange(classOfBusiness, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`class-${classOfBusiness}`} className="text-sm font-normal">
                      {classOfBusiness}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Submission Date Range</Label>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? format(filters.dateRange.from, 'MMM dd, yyyy') : 'From date'}
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
                      {filters.dateRange?.to ? format(filters.dateRange.to, 'MMM dd, yyyy') : 'To date'}
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
          </div>

          {/* Amount Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sum Insured Range</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Minimum"
                  value={filters.amountRange?.min || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    const currentRange = filters.amountRange || {};
                    if (value === undefined && !currentRange.max) {
                      const { amountRange, ...otherFilters } = filters;
                      onFiltersChange(otherFilters);
                    } else {
                      onFiltersChange({
                        ...filters,
                        amountRange: { ...currentRange, min: value }
                      });
                    }
                  }}
                />
                <span>to</span>
                <Input
                  type="number"
                  placeholder="Maximum"
                  value={filters.amountRange?.max || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    const currentRange = filters.amountRange || {};
                    if (value === undefined && !currentRange.min) {
                      const { amountRange, ...otherFilters } = filters;
                      onFiltersChange(otherFilters);
                    } else {
                      onFiltersChange({
                        ...filters,
                        amountRange: { ...currentRange, max: value }
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Active Filters</Label>
                <Button variant="link" onClick={onClearFilters} className="text-sm">
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.status?.map((status) => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    Status: {STATUS_LABELS[status]}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleStatusFilterChange(status, false)}
                    />
                  </Badge>
                ))}
                {filters.priority?.map((priority) => (
                  <Badge key={priority} variant="secondary" className="text-xs">
                    Priority: {priority}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handlePriorityFilterChange(priority, false)}
                    />
                  </Badge>
                ))}
                {filters.classOfBusiness?.map((cls) => (
                  <Badge key={cls} variant="secondary" className="text-xs">
                    Class: {cls}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleClassFilterChange(cls, false)}
                    />
                  </Badge>
                ))}
                {filters.dateRange && (
                  <Badge variant="secondary" className="text-xs">
                    Date: {filters.dateRange.from && format(filters.dateRange.from, 'MMM dd')} - {filters.dateRange.to && format(filters.dateRange.to, 'MMM dd')}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => {
                        const { dateRange, ...otherFilters } = filters;
                        onFiltersChange(otherFilters);
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

export default SubmissionFilters;