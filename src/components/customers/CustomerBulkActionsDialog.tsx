import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Users, Mail, MessageSquare, Tag, Trash2, Edit, 
  AlertCircle, CheckCircle, Send
} from 'lucide-react';

interface CustomerBulkActionsDialogProps {
  selectedCustomers: string[];
  onClose: () => void;
  onComplete: () => void;
}

export function CustomerBulkActionsDialog({ 
  selectedCustomers, 
  onClose, 
  onComplete 
}: CustomerBulkActionsDialogProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [smsContent, setSmsContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActions = [
    {
      id: 'send_email',
      label: 'Send Email Campaign',
      icon: Mail,
      description: 'Send a marketing email to selected customers'
    },
    {
      id: 'send_sms',
      label: 'Send SMS',
      icon: MessageSquare,
      description: 'Send an SMS message to selected customers'
    },
    {
      id: 'add_tag',
      label: 'Add Tag',
      icon: Tag,
      description: 'Add a tag to selected customers'
    },
    {
      id: 'change_status',
      label: 'Change Status',
      icon: Edit,
      description: 'Update the status of selected customers'
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Users,
      description: 'Export selected customer data to CSV'
    }
  ];

  const handleExecuteAction = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onComplete();
  };

  const renderActionForm = () => {
    const action = bulkActions.find(a => a.id === selectedAction);
    if (!action) return null;

    switch (selectedAction) {
      case 'send_email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Email Subject</Label>
              <input
                id="email-subject"
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea
                id="email-content"
                placeholder="Enter email content..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={6}
              />
            </div>
            <Alert>
              <Mail className="w-4 h-4" />
              <AlertDescription>
                This email will be sent to {selectedCustomers.length} customers who have given marketing consent.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'send_sms':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sms-content">SMS Message</Label>
              <Textarea
                id="sms-content"
                placeholder="Enter SMS message..."
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                rows={4}
                maxLength={160}
              />
              <div className="text-sm text-muted-foreground text-right">
                {smsContent.length}/160 characters
              </div>
            </div>
            <Alert>
              <MessageSquare className="w-4 h-4" />
              <AlertDescription>
                SMS will be sent to {selectedCustomers.length} customers with valid phone numbers.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'add_tag':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Tag</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tag to add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP Customer</SelectItem>
                  <SelectItem value="new">New Customer</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <Tag className="w-4 h-4" />
              <AlertDescription>
                The selected tag will be added to {selectedCustomers.length} customers.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'change_status':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <Edit className="w-4 h-4" />
              <AlertDescription>
                The status will be updated for {selectedCustomers.length} customers.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription>
                Data for {selectedCustomers.length} customers will be exported to a CSV file.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Export Fields</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Name', 'Email', 'Phone', 'Status', 'Join Date', 'Wallet Balance'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">{field}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Bulk Actions</span>
          </DialogTitle>
          <DialogDescription>
            Perform actions on {selectedCustomers.length} selected customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Select Action</Label>
            <div className="grid grid-cols-1 gap-2">
              {bulkActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAction === action.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAction(action.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Form */}
          {selectedAction && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{selectedCustomers.length} customers selected</Badge>
              </div>
              {renderActionForm()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExecuteAction}
              disabled={!selectedAction || isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Action
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}