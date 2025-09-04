import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { PeopleService } from '../utils/supabase/people-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, Mail, Tag, Settings, AlertCircle, 
  Check, X, Send, UserMinus, UserPlus,
  CreditCard, Gift, MessageSquare, FileText
} from 'lucide-react';

interface CustomerBulkActionsDialogProps {
  selectedCustomers: string[];
  onClose: () => void;
  onComplete?: () => void;
}

const bulkActions = [
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send a custom email to selected customers',
    icon: Mail,
    category: 'communication'
  },
  {
    id: 'send_sms', 
    name: 'Send SMS',
    description: 'Send a text message to selected customers',
    icon: MessageSquare,
    category: 'communication'
  },
  {
    id: 'add_tag',
    name: 'Add Tag',
    description: 'Add a tag to selected customers',
    icon: Tag,
    category: 'organization'
  },
  {
    id: 'remove_tag',
    name: 'Remove Tag',
    description: 'Remove a tag from selected customers',
    icon: Tag,
    category: 'organization'
  },
  {
    id: 'update_status',
    name: 'Update Status',
    description: 'Change status of selected customers',
    icon: Settings,
    category: 'organization'
  },
  {
    id: 'add_credit',
    name: 'Add Wallet Credit',
    description: 'Add credit to customer wallets',
    icon: CreditCard,
    category: 'finance'
  },
  {
    id: 'grant_pass',
    name: 'Grant Class Pass',
    description: 'Grant class passes to customers',
    icon: Gift,
    category: 'finance'
  },
  {
    id: 'export_data',
    name: 'Export Data',
    description: 'Export customer data to CSV',
    icon: FileText,
    category: 'data'
  }
];

const statusOptions = [
  { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'Inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'Trial', label: 'Trial', color: 'bg-blue-100 text-blue-800' },
  { value: 'Suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
];

const tagOptions = [
  'VIP', 'Premium', 'Regular', 'Student', 'Corporate', 'New', 'At-Risk', 'Trial'
];

export function CustomerBulkActionsDialog({ selectedCustomers, onClose, onComplete }: CustomerBulkActionsDialogProps) {
  const { t } = useLanguage();
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [step, setStep] = useState<'select' | 'configure' | 'executing' | 'complete'>('select');
  const [actionConfig, setActionConfig] = useState<any>({});
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ successful: 0, failed: 0, total: 0 });
  const [peopleService] = useState(() => new PeopleService());

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setActionConfig({});
    setStep('configure');
  };

  const executeAction = async () => {
    setStep('executing');
    setProgress(0);
    
    const results = {
      successful: 0,
      failed: 0,
      total: selectedCustomers.length
    };

    try {
      // Simulate bulk action execution
      for (let i = 0; i < selectedCustomers.length; i++) {
        const customerId = selectedCustomers[i];
        
        try {
          // Execute the specific action based on selectedAction
          switch (selectedAction) {
            case 'send_email':
              // Mock email sending
              await new Promise(resolve => setTimeout(resolve, 100));
              results.successful++;
              break;
              
            case 'send_sms':
              // Mock SMS sending  
              await new Promise(resolve => setTimeout(resolve, 100));
              results.successful++;
              break;
              
            case 'add_tag':
              // Mock tag addition
              await new Promise(resolve => setTimeout(resolve, 50));
              results.successful++;
              break;
              
            case 'remove_tag':
              // Mock tag removal
              await new Promise(resolve => setTimeout(resolve, 50));
              results.successful++;
              break;
              
            case 'update_status':
              // Mock status update
              await new Promise(resolve => setTimeout(resolve, 100));
              results.successful++;
              break;
              
            case 'add_credit':
              // Mock wallet credit addition
              await new Promise(resolve => setTimeout(resolve, 100));
              results.successful++;
              break;
              
            case 'grant_pass':
              // Mock pass granting
              await new Promise(resolve => setTimeout(resolve, 100));
              results.successful++;
              break;
              
            case 'export_data':
              // Mock data export
              await new Promise(resolve => setTimeout(resolve, 50));
              results.successful++;
              break;
              
            default:
              results.failed++;
          }
        } catch (error) {
          console.error(`Error processing customer ${customerId}:`, error);
          results.failed++;
        }
        
        setProgress(Math.round(((i + 1) / selectedCustomers.length) * 100));
      }
      
      setResults(results);
      setStep('complete');
      
    } catch (error) {
      console.error('Bulk action error:', error);
      setResults({
        successful: 0,
        failed: selectedCustomers.length,
        total: selectedCustomers.length
      });
      setStep('complete');
    }
  };

  const renderActionConfig = () => {
    const action = bulkActions.find(a => a.id === selectedAction);
    if (!action) return null;

    switch (selectedAction) {
      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Email subject"
                value={actionConfig.subject || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Email content"
                rows={4}
                value={actionConfig.message || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </div>
        );
        
      case 'send_sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="SMS content (max 160 characters)"
                rows={3}
                maxLength={160}
                value={actionConfig.message || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, message: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(actionConfig.message || '').length}/160 characters
              </p>
            </div>
          </div>
        );
        
      case 'add_tag':
      case 'remove_tag':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {selectedAction === 'add_tag' ? 'Tag to Add' : 'Tag to Remove'}
              </label>
              <Select
                value={actionConfig.tag || ''}
                onValueChange={(value) => setActionConfig(prev => ({ ...prev, tag: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  {tagOptions.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'update_status':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select
                value={actionConfig.status || ''}
                onValueChange={(value) => setActionConfig(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center space-x-2">
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'add_credit':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Credit Amount (CHF)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={actionConfig.amount || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Input
                placeholder="Reason for credit addition"
                value={actionConfig.reason || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
        );
        
      case 'grant_pass':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pass Type</label>
              <Select
                value={actionConfig.passType || ''}
                onValueChange={(value) => setActionConfig(prev => ({ ...prev, passType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pass type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Class</SelectItem>
                  <SelectItem value="5-pack">5 Class Pack</SelectItem>
                  <SelectItem value="10-pack">10 Class Pack</SelectItem>
                  <SelectItem value="monthly">Monthly Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Expiry Days</label>
              <Input
                type="number"
                min="1"
                placeholder="30"
                value={actionConfig.expiryDays || ''}
                onChange={(e) => setActionConfig(prev => ({ ...prev, expiryDays: e.target.value }))}
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="py-4 text-center text-muted-foreground">
            No configuration needed for this action.
          </div>
        );
    }
  };

  const isConfigValid = () => {
    switch (selectedAction) {
      case 'send_email':
        return actionConfig.subject && actionConfig.message;
      case 'send_sms':
        return actionConfig.message && actionConfig.message.length <= 160;
      case 'add_tag':
      case 'remove_tag':
        return actionConfig.tag;
      case 'update_status':
        return actionConfig.status;
      case 'add_credit':
        return actionConfig.amount && parseFloat(actionConfig.amount) > 0;
      case 'grant_pass':
        return actionConfig.passType;
      default:
        return true;
    }
  };

  const action = bulkActions.find(a => a.id === selectedAction);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Bulk Actions ({selectedCustomers.length} customers)</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Choose Action</h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(
                    bulkActions.reduce((acc, action) => {
                      if (!acc[action.category]) acc[action.category] = [];
                      acc[action.category].push(action);
                      return acc;
                    }, {} as Record<string, typeof bulkActions>)
                  ).map(([category, actions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground capitalize">{category}</h4>
                      {actions.map(action => {
                        const Icon = action.icon;
                        return (
                          <Card
                            key={action.id}
                            className="cursor-pointer transition-colors hover:bg-accent"
                            onClick={() => handleActionSelect(action.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <Icon className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{action.name}</div>
                                  <div className="text-sm text-muted-foreground">{action.description}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'configure' && action && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <action.icon className="w-5 h-5" />
                <div>
                  <h3 className="text-lg font-medium">{action.name}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will be applied to {selectedCustomers.length} selected customers.
                </AlertDescription>
              </Alert>

              {renderActionConfig()}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setStep('select')}>
                  Back
                </Button>
                <Button 
                  onClick={executeAction}
                  disabled={!isConfigValid()}
                >
                  Execute Action
                </Button>
              </div>
            </div>
          )}

          {step === 'executing' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Executing Action...</h3>
                    <p className="text-muted-foreground mb-6">
                      Processing {selectedCustomers.length} customers
                    </p>
                    <Progress value={progress} className="w-full max-w-md mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {progress}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Action Complete!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your bulk action has been processed
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{results.total}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{results.successful}</div>
                        <div className="text-muted-foreground">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">{results.failed}</div>
                        <div className="text-muted-foreground">Failed</div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        if (onComplete) onComplete();
                        onClose();
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}