import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Users, Mail, MessageSquare, Calendar, Edit, 
  AlertCircle, Send, UserCog
} from 'lucide-react';

interface InstructorBulkActionsDialogProps {
  selectedInstructors: string[];
  onClose: () => void;
  onComplete: () => void;
}

export function InstructorBulkActionsDialog({ 
  selectedInstructors, 
  onClose, 
  onComplete 
}: InstructorBulkActionsDialogProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActions = [
    {
      id: 'send_email',
      label: 'Send Email',
      icon: Mail,
      description: 'Send an email to selected instructors'
    },
    {
      id: 'send_sms',
      label: 'Send SMS',
      icon: MessageSquare,
      description: 'Send an SMS message to selected instructors'
    },
    {
      id: 'schedule_meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      description: 'Schedule a meeting with selected instructors'
    },
    {
      id: 'change_status',
      label: 'Change Status',
      icon: Edit,
      description: 'Update the status of selected instructors'
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Users,
      description: 'Export selected instructor data to CSV'
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
                This email will be sent to {selectedInstructors.length} instructors.
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
                rows={4}
                maxLength={160}
              />
              <div className="text-sm text-muted-foreground text-right">
                0/160 characters
              </div>
            </div>
            <Alert>
              <MessageSquare className="w-4 h-4" />
              <AlertDescription>
                SMS will be sent to {selectedInstructors.length} instructors with valid phone numbers.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'schedule_meeting':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose meeting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team Meeting</SelectItem>
                  <SelectItem value="training">Training Session</SelectItem>
                  <SelectItem value="review">Performance Review</SelectItem>
                  <SelectItem value="planning">Schedule Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meeting Date & Time</Label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-input rounded-md"
              />
            </div>
            <Alert>
              <Calendar className="w-4 h-4" />
              <AlertDescription>
                Meeting invitations will be sent to {selectedInstructors.length} instructors.
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
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <Edit className="w-4 h-4" />
              <AlertDescription>
                The status will be updated for {selectedInstructors.length} instructors.
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
                Data for {selectedInstructors.length} instructors will be exported to a CSV file.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Export Fields</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Name', 'Email', 'Phone', 'Status', 'Join Date', 'Total Classes'].map((field) => (
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
            <UserCog className="w-5 h-5" />
            <span>Instructor Bulk Actions</span>
          </DialogTitle>
          <DialogDescription>
            Perform actions on {selectedInstructors.length} selected instructors
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
                <Badge variant="outline">{selectedInstructors.length} instructors selected</Badge>
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