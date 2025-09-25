'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  BarChart3,
  Trash2,
  Download,
  Plus,
  Search,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Risk = {
  id: string;
  name: string;
  exposure: string;
  level: 'high' | 'medium' | 'low';
  status: 'open' | 'mitigated' | 'closed';
};

const RiskAssessmentPage: React.FC = () => {
  const { user } = useAuth();

  // mock risk data
  const [risks, setRisks] = React.useState<Risk[]>([
    { id: '1', name: 'Flood Exposure', exposure: 'Kenya Region A', level: 'high', status: 'open' },
    { id: '2', name: 'Political Risk', exposure: 'Nigeria', level: 'medium', status: 'mitigated' },
    { id: '3', name: 'Earthquake Risk', exposure: 'Turkey', level: 'low', status: 'closed' },
  ]);

  const [selectedRisks, setSelectedRisks] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredRisks = risks.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.exposure.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: risks.length,
    high: risks.filter(r => r.level === 'high').length,
    medium: risks.filter(r => r.level === 'medium').length,
    low: risks.filter(r => r.level === 'low').length,
  };

  const toggleSelection = (id: string) => {
    setSelectedRisks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedRisks.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select risks first.',
        variant: 'destructive',
      });
      return;
    }
    switch (action) {
      case 'download':
        toast({
          title: 'Export Started',
          description: `Exporting ${selectedRisks.length} risk(s)...`,
        });
        break;
      case 'delete':
        setRisks(risks.filter(r => !selectedRisks.includes(r.id)));
        setSelectedRisks([]);
        toast({
          title: 'Risks Deleted',
          description: 'Selected risks have been removed.',
        });
        break;
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
          <p className="text-gray-600 mt-1">
            Evaluate and monitor risk exposures for reinsurance portfolios
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('download')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Risks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High</p>
              <p className="text-2xl font-bold text-red-600">{stats.high}</p>
            </div>
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
            </div>
            <ShieldQuestion className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low</p>
              <p className="text-2xl font-bold text-green-600">{stats.low}</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search risks..."
            className="flex-1 outline-none bg-transparent text-sm text-gray-700"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRisks.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {selectedRisks.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('download')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
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
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRisks([])}
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Risk Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Risks</span>
            <Badge variant="secondary">
              {filteredRisks.length} of {risks.length} shown
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left border-t">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedRisks.length > 0 &&
                      selectedRisks.length === filteredRisks.length
                    }
                    onChange={e =>
                      setSelectedRisks(
                        e.target.checked ? filteredRisks.map(r => r.id) : []
                      )
                    }
                  />
                </th>
                <th className="p-3">Risk Name</th>
                <th className="p-3">Exposure</th>
                <th className="p-3">Level</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map(risk => (
                <tr key={risk.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRisks.includes(risk.id)}
                      onChange={() => toggleSelection(risk.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900">{risk.name}</td>
                  <td className="p-3 text-gray-700">{risk.exposure}</td>
                  <td className="p-3">
                    <Badge
                      className={
                        risk.level === 'high'
                          ? 'bg-red-100 text-red-800'
                          : risk.level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {risk.level}
                    </Badge>
                  </td>
                  <td className="p-3 capitalize text-gray-700">{risk.status}</td>
                </tr>
              ))}
              {filteredRisks.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500 italic"
                  >
                    No risks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentPage;
