import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Filter, Users, Plus, Edit2, Trash2, Target,
  Calendar, CreditCard, MapPin, Tag, TrendingUp,
  AlertCircle, Check
} from 'lucide-react';

interface CustomerSegmentDialogProps {
  onClose: () => void;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  customerCount: number;
  color: string;
  createdAt: string;
}

interface SegmentCriteria {
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
}

const predefinedSegments: Segment[] = [
  {
    id: '1',
    name: 'VIP Customers',
    description: 'High-value customers with total spent > CHF 1000',
    criteria: [
      { field: 'totalSpent', operator: 'greater_than', value: '1000' }
    ],
    customerCount: 47,
    color: 'bg-purple-100 text-purple-800',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'At Risk',
    description: 'Customers who haven\'t visited in 30+ days',
    criteria: [
      { field: 'lastActivity', operator: 'older_than', value: '30' }
    ],
    customerCount: 23,
    color: 'bg-red-100 text-red-800',
    createdAt: '2024-01-08'
  },
  {
    id: '3',
    name: 'New Members',
    description: 'Customers who joined in the last 7 days',
    criteria: [
      { field: 'joinedDate', operator: 'within_days', value: '7' }
    ],
    customerCount: 12,
    color: 'bg-green-100 text-green-800',
    createdAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Zurich Active',
    description: 'Active customers from Zurich area',
    criteria: [
      { field: 'city', operator: 'equals', value: 'Zürich' },
      { field: 'status', operator: 'equals', value: 'Active', logic: 'AND' }
    ],
    customerCount: 89,
    color: 'bg-blue-100 text-blue-800',
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    name: 'High Engagement',
    description: 'Customers with 20+ visits and active membership',
    criteria: [
      { field: 'visits', operator: 'greater_than', value: '20' },
      { field: 'currentMembership', operator: 'not_empty', value: '', logic: 'AND' }
    ],
    customerCount: 34,
    color: 'bg-amber-100 text-amber-800',
    createdAt: '2024-01-12'
  }
];

const segmentFields = [
  { value: 'totalSpent', label: 'Total Spent', type: 'number' },
  { value: 'visits', label: 'Visit Count', type: 'number' },
  { value: 'walletBalance', label: 'Wallet Balance', type: 'number' },
  { value: 'credits', label: 'Class Credits', type: 'number' },
  { value: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Trial', 'Suspended'] },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'language', label: 'Language', type: 'select', options: ['de', 'fr', 'it', 'en'] },
  { value: 'lastActivity', label: 'Last Activity', type: 'date' },
  { value: 'joinedDate', label: 'Joined Date', type: 'date' },
  { value: 'currentMembership', label: 'Current Membership', type: 'text' },
  { value: 'riskLevel', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High'] },
  { value: 'npsScore', label: 'NPS Score', type: 'number' },
  { value: 'marketingConsent', label: 'Marketing Consent', type: 'boolean' }
];

const operators = [
  { value: 'equals', label: 'Equals', types: ['text', 'select', 'boolean'] },
  { value: 'not_equals', label: 'Does not equal', types: ['text', 'select', 'boolean'] },
  { value: 'contains', label: 'Contains', types: ['text'] },
  { value: 'not_contains', label: 'Does not contain', types: ['text'] },
  { value: 'greater_than', label: 'Greater than', types: ['number'] },
  { value: 'less_than', label: 'Less than', types: ['number'] },
  { value: 'greater_equal', label: 'Greater than or equal', types: ['number'] },
  { value: 'less_equal', label: 'Less than or equal', types: ['number'] },
  { value: 'within_days', label: 'Within last X days', types: ['date'] },
  { value: 'older_than', label: 'Older than X days', types: ['date'] },
  { value: 'is_empty', label: 'Is empty', types: ['text'] },
  { value: 'not_empty', label: 'Is not empty', types: ['text'] },
  { value: 'is_true', label: 'Is true', types: ['boolean'] },
  { value: 'is_false', label: 'Is false', types: ['boolean'] }
];

export function CustomerSegmentDialog({ onClose }: CustomerSegmentDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('browse');
  const [segments, setSegments] = useState<Segment[]>(predefinedSegments);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteria: [{ field: '', operator: '', value: '', logic: 'AND' as 'AND' | 'OR' }]
  });

  const addCriteria = () => {
    setNewSegment(prev => ({
      ...prev,
      criteria: [...prev.criteria, { field: '', operator: '', value: '', logic: 'AND' }]
    }));
  };

  const removeCriteria = (index: number) => {
    setNewSegment(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }));
  };

  const updateCriteria = (index: number, field: keyof SegmentCriteria, value: any) => {
    setNewSegment(prev => ({
      ...prev,
      criteria: prev.criteria.map((criteria, i) => 
        i === index ? { ...criteria, [field]: value } : criteria
      )
    }));
  };

  const saveSegment = () => {
    const segment: Segment = {
      id: Date.now().toString(),
      name: newSegment.name,
      description: newSegment.description,
      criteria: newSegment.criteria.filter(c => c.field && c.operator),
      customerCount: Math.floor(Math.random() * 100), // Mock count
      color: 'bg-gray-100 text-gray-800',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setSegments(prev => [...prev, segment]);
    setNewSegment({
      name: '',
      description: '',
      criteria: [{ field: '', operator: '', value: '', logic: 'AND' }]
    });
    setActiveTab('browse');
  };

  const deleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  };

  const getAvailableOperators = (fieldType: string) => {
    return operators.filter(op => op.types.includes(fieldType));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderCriteriaBuilder = () => (
    <div className="space-y-4">
      {newSegment.criteria.map((criteria, index) => {
        const field = segmentFields.find(f => f.value === criteria.field);
        const availableOperators = field ? getAvailableOperators(field.type) : [];
        
        return (
          <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
            {index > 0 && (
              <Select
                value={criteria.logic}
                onValueChange={(value: 'AND' | 'OR') => updateCriteria(index, 'logic', value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Select
              value={criteria.field}
              onValueChange={(value) => updateCriteria(index, 'field', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {segmentFields.map(field => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={criteria.operator}
              onValueChange={(value) => updateCriteria(index, 'operator', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map(op => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {field?.type === 'select' ? (
              <Select
                value={criteria.value}
                onValueChange={(value) => updateCriteria(index, 'value', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Value" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Value"
                value={criteria.value}
                onChange={(e) => updateCriteria(index, 'value', e.target.value)}
                className="w-32"
                type={field?.type === 'number' ? 'number' : 'text'}
              />
            )}

            {newSegment.criteria.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCriteria(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      })}
      
      <Button variant="outline" onClick={addCriteria} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Criteria
      </Button>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Customer Segments</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Segments</TabsTrigger>
            <TabsTrigger value="create">Create Segment</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="browse" className="space-y-4 m-0">
              <div className="grid grid-cols-1 gap-4">
                {segments.map(segment => (
                  <Card key={segment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Target className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{segment.name}</h3>
                            <p className="text-sm text-muted-foreground">{segment.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={segment.color}>
                            <Users className="w-3 h-3 mr-1" />
                            {segment.customerCount}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSegment(segment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Criteria:</h4>
                        <div className="text-sm text-muted-foreground">
                          {segment.criteria.map((criteria, index) => {
                            const field = segmentFields.find(f => f.value === criteria.field);
                            const operator = operators.find(o => o.value === criteria.operator);
                            return (
                              <div key={index}>
                                {index > 0 && <span className="font-medium">{criteria.logic} </span>}
                                <span className="font-medium">{field?.label}</span>
                                <span> {operator?.label} </span>
                                <span className="font-medium">{criteria.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-xs text-muted-foreground">
                          Created {formatDate(segment.createdAt)}
                        </span>
                        <Button size="sm">
                          View Customers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-6 m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Segment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Segment Name</label>
                      <Input
                        placeholder="e.g., High Value Customers"
                        value={newSegment.name}
                        onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Brief description of this segment"
                        value={newSegment.description}
                        onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-4">Criteria</h4>
                    {renderCriteriaBuilder()}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setNewSegment({
                        name: '',
                        description: '',
                        criteria: [{ field: '', operator: '', value: '', logic: 'AND' }]
                      })}
                    >
                      Reset
                    </Button>
                    <Button 
                      onClick={saveSegment}
                      disabled={!newSegment.name || !newSegment.criteria.some(c => c.field && c.operator)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}