import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Send, Download, Trash2, MoveRight, RefreshCw,
  Users, Mail, Phone, MessageCircle, FileText,
  AlertCircle, Check, X, CreditCard, Calendar
} from 'lucide-react';

interface RegistrationBulkActionsDialogProps {
  selectedRegistrations: string[];
  onClose: () => void;
  onComplete: () => void;
}

// Mock selected registrations for preview
const mockSelectedRegistrations = [
  {
    id: '1',
    customer: { name: 'Emma Weber', email: 'emma.weber@email.ch' },
    class: 'Vinyasa Flow',
    date: '2024-01-22',
    time: '09:00',
    status: 'confirmed'
  },
  {
    id: '2',
    customer: { name: 'Marc Dubois', email: 'marc.dubois@email.ch' },
    class: 'Yin Yoga',
    date: '2024-01-22',
    time: '19:00',
    status: 'pending_payment'
  },
  {
    id: '3',
    customer: { name: 'Sofia Rossi', email: 'sofia.rossi@email.ch' },
    class: 'Vinyasa Flow',
    date: '2024-01-22',
    time: '09:00',
    status: 'waitlisted'
  }
];

// Mock available classes for moving
const mockAvailableClasses = [
  {
    id: 'c1',
    name: 'Vinyasa Flow',
    instructor: 'Sarah Chen',
    date: '2024-01-23',
    time: '09:00',
    location: 'Studio A',
    available: true
  },
  {
    id: 'c2',
    name: 'Hot Yoga',
    instructor: 'Lisa Anderson',
    date: '2024-01-23',
    time: '18:30',
    location: 'Studio C',
    available: true
  }
];

// Email templates
const emailTemplates = [
  {
    id: 'class_update',
    name: 'Class Update',
    subject: 'Important update about your class',
    body: 'Dear {firstName},\n\nWe have an important update about your upcoming class...'
  },
  {
    id: 'cancellation',
    name: 'Class Cancellation',
    subject: 'Your class has been cancelled',
    body: 'Dear {firstName},\n\nWe regret to inform you that your class "{className}" on {date} has been cancelled...'
  },
  {
    id: 'reminder',
    name: 'Class Reminder',
    subject: 'Reminder: Your class is coming up',
    body: 'Dear {firstName},\n\nThis is a friendly reminder about your upcoming class "{className}" on {date} at {time}...'
  }
];

export function RegistrationBulkActionsDialog({ 
  selectedRegistrations, 
  onClose, 
  onComplete 
}: RegistrationBulkActionsDialogProps) {
  const { t } = useLanguage();
  const [activeAction, setActiveAction] = useState<'message' | 'move' | 'cancel' | 'refund' | 'export'>('message');
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [refundToCredit, setRefundToCredit] = useState(true);
  const [waiveFees, setWaiveFees] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomSubject(template.subject);
      setCustomMessage(template.body);
    }
  };

  const executeAction = () => {
    // Here you would implement the actual bulk action
    console.log('Executing bulk action:', activeAction, {
      registrations: selectedRegistrations,
      messageType,
      customSubject,
      customMessage,
      targetClass,
      cancellationReason,
      refundToCredit,
      waiveFees
    });
    
    onComplete();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[900px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Bulk Actions ({selectedRegistrations.length} registrations)</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* Action Tabs */}
          <Tabs value={activeAction} onValueChange={(value: any) => setActiveAction(value)}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="message" className="flex items-center space-x-1 sm:space-x-2">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Message</span>
                <span className="sm:hidden">Msg</span>
              </TabsTrigger>
              <TabsTrigger value="move" className="flex items-center space-x-1 sm:space-x-2">
                <MoveRight className="w-4 h-4" />
                <span>Move</span>
              </TabsTrigger>
              <TabsTrigger value="cancel" className="flex items-center space-x-1 sm:space-x-2">
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </TabsTrigger>
              <TabsTrigger value="refund" className="flex items-center space-x-1 sm:space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refund</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center space-x-1 sm:space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto space-y-4">
            {/* Selected Registrations Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Registrations ({selectedRegistrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {mockSelectedRegistrations.slice(0, 5).map(registration => (
                    <div key={registration.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{registration.customer.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {registration.class} - {formatDate(registration.date)} {formatTime(registration.time)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {registration.status}
                      </Badge>
                    </div>
                  ))}
                  {selectedRegistrations.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center p-2">
                      +{selectedRegistrations.length - 5} more registrations
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <TabsContent value="message" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Send Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Message Type</Label>
                    <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Email</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>SMS</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {messageType === 'email' && (
                    <>
                      <div>
                        <Label>Email Template</Label>
                        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose template or write custom" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Custom Message</SelectItem>
                            {emailTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="Enter email subject..."
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Enter your message..."
                      rows={6}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {'{firstName}'}, {'{lastName}'}, {'{className}'}, {'{date}'}, {'{time}'} for personalization
                    </p>
                  </div>

                  {/* Schedule Message */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="schedule"
                      checked={scheduleMessage}
                      onCheckedChange={setScheduleMessage}
                    />
                    <Label htmlFor="schedule">Schedule for later</Label>
                  </div>

                  {scheduleMessage && (
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="move" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Move to Another Class</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Target Class</Label>
                    <Select value={targetClass} onValueChange={setTargetClass}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a class to move to" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAvailableClasses.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{cls.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(cls.date)} {formatTime(cls.time)} • {cls.location}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Customers will be automatically notified of the class change. 
                      If there are price differences, refunds or additional charges will be processed automatically.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-2">
                    <Switch id="notify-move" defaultChecked />
                    <Label htmlFor="notify-move">Send notification about class change</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cancel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cancel Registrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Cancellation Reason</Label>
                    <Select value={cancellationReason} onValueChange={setCancellationReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instructor_sick">Instructor unavailable</SelectItem>
                        <SelectItem value="facility_issue">Facility issue</SelectItem>
                        <SelectItem value="low_enrollment">Low enrollment</SelectItem>
                        <SelectItem value="weather">Weather conditions</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Add any additional information for customers..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="waive-fees" checked={waiveFees} onCheckedChange={setWaiveFees} />
                      <Label htmlFor="waive-fees">Waive cancellation fees (studio-initiated)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="auto-refund" defaultChecked />
                      <Label htmlFor="auto-refund">Automatically process refunds</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="notify-cancel" defaultChecked />
                      <Label htmlFor="notify-cancel">Send cancellation notification</Label>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Studio-initiated cancellations will automatically waive any late cancellation fees 
                      and process full refunds according to your refund policy.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="refund" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Process Refunds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Refund Method</Label>
                    <Select value={refundToCredit ? 'credit' : 'original'} onValueChange={(value) => setRefundToCredit(value === 'credit')}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Account Credit (Faster)</SelectItem>
                        <SelectItem value="original">Original Payment Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Refund Type</Label>
                    <Select defaultValue="full">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Refund</SelectItem>
                        <SelectItem value="partial">Partial Refund</SelectItem>
                        <SelectItem value="credit_only">Credits Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Reason for Refund</Label>
                    <Textarea
                      placeholder="Enter reason for refund..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Refunds to account credit are processed immediately. 
                      Refunds to original payment methods may take 3-5 business days to appear.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Registration Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Export Format</Label>
                    <Select defaultValue="csv">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV (Comma-separated)</SelectItem>
                        <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Include Fields</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {[
                        'Customer Info',
                        'Class Details', 
                        'Payment Info',
                        'Booking Source',
                        'Check-in Status',
                        'Notes',
                        'Timeline',
                        'Policies Applied'
                      ].map(field => (
                        <div key={field} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Export will include {selectedRegistrations.length} registrations. 
                      Personal data will be handled according to GDPR requirements.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            </div>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={executeAction}
              disabled={
                (activeAction === 'message' && !customMessage.trim()) ||
                (activeAction === 'move' && !targetClass) ||
                (activeAction === 'cancel' && !cancellationReason)
              }
            >
              {activeAction === 'message' && scheduleMessage ? 'Schedule Message' :
               activeAction === 'message' ? 'Send Message' :
               activeAction === 'move' ? 'Move Registrations' :
               activeAction === 'cancel' ? 'Cancel Registrations' :
               activeAction === 'refund' ? 'Process Refunds' :
               'Export Data'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}