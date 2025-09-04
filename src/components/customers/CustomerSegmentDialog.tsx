import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, Filter, Plus, X, Settings, Target
} from 'lucide-react';

interface CustomerSegmentDialogProps {
  onClose: () => void;
}

export function CustomerSegmentDialog({ onClose }: CustomerSegmentDialogProps) {
  const [segmentName, setSegmentName] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  const segmentCriteria = [
    { id: 'status_active', label: 'Active customers', category: 'Status' },
    { id: 'status_trial', label: 'Trial members', category: 'Status' },
    { id: 'high_value', label: 'High-value customers (>200 CHF)', category: 'Value' },
    { id: 'new_customers', label: 'New customers (last 30 days)', category: 'Recency' },
    { id: 'frequent_visitors', label: 'Frequent visitors (5+ classes/month)', category: 'Behavior' },
    { id: 'marketing_consent', label: 'Marketing consent given', category: 'Preferences' },
    { id: 'language_de', label: 'German speakers', category: 'Language' },
    { id: 'language_fr', label: 'French speakers', category: 'Language' },
    { id: 'language_it', label: 'Italian speakers', category: 'Language' },
  ];

  const predefinedSegments = [
    {
      name: 'VIP Customers',
      description: 'High-value active customers',
      criteria: ['status_active', 'high_value'],
      count: 45
    },
    {
      name: 'New Members',
      description: 'Recently joined customers',
      criteria: ['new_customers', 'status_active'],
      count: 23
    },
    {
      name: 'At-Risk Customers',
      description: 'Inactive customers who might churn',
      criteria: ['status_inactive', 'low_activity'],
      count: 18
    }
  ];

  const toggleCriteria = (criteriaId: string) => {
    setSelectedCriteria(prev => 
      prev.includes(criteriaId) 
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Customer Segments</span>
          </DialogTitle>
          <DialogDescription>
            Create and manage customer segments for targeted marketing and analytics
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Create New Segment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create New Segment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment-name">Segment Name</Label>
                <Input
                  id="segment-name"
                  placeholder="e.g., Premium Members"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Criteria</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {segmentCriteria.map((criteria) => (
                    <div key={criteria.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={criteria.id}
                        checked={selectedCriteria.includes(criteria.id)}
                        onCheckedChange={() => toggleCriteria(criteria.id)}
                      />
                      <Label htmlFor={criteria.id} className="text-sm">
                        {criteria.label}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {criteria.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full" 
                  disabled={!segmentName || selectedCriteria.length === 0}
                >
                  Create Segment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Existing Segments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predefinedSegments.map((segment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{segment.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{segment.count} customers</Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {segment.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {segment.criteria.map((criteria) => {
                      const criteriaInfo = segmentCriteria.find(c => c.id === criteria);
                      return criteriaInfo ? (
                        <Badge key={criteria} variant="outline" className="text-xs">
                          {criteriaInfo.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}

              {predefinedSegments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No segments created yet</p>
                  <p className="text-sm">Create your first segment to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}