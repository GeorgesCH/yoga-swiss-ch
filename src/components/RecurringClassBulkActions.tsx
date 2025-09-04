import { useState } from 'react';
import { Calendar, Trash2, Edit3, AlertTriangle, Info, X, Plus, ChevronDown, Download, Send, Pause, Play, CalendarX } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useLanguage } from './LanguageProvider';

interface BulkActionType {
  id: string;
  label: string;
  description: string;
  icon: any;
  destructive?: boolean;
}

interface DateRange {
  start_date: string;
  end_date: string;
  reason?: string;
}

interface RecurringClassBulkActionsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeriesIds: string[];
  selectedOccurrenceIds: string[];
  onAction: (action: string, data: any) => void;
}

export function RecurringClassBulkActions({
  isOpen,
  onClose,
  selectedSeriesIds,
  selectedOccurrenceIds,
  onAction
}: RecurringClassBulkActionsProps) {
  const { t } = useLanguage();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [step, setStep] = useState(1);

  // Bulk action types
  const bulkActions: BulkActionType[] = [
    {
      id: 'cancel_range',
      label: 'Cancel Date Range',
      description: 'Cancel all classes within a specific date range',
      icon: CalendarX,
      destructive: true
    },
    {
      id: 'change_recurrence',
      label: 'Change Recurrence Pattern',
      description: 'Modify which days classes occur (e.g., remove Tuesdays)',
      icon: Calendar
    },
    {
      id: 'bulk_edit',
      label: 'Bulk Edit Properties',
      description: 'Change instructor, location, time, or capacity for multiple classes',
      icon: Edit3
    },
    {
      id: 'add_holiday_skip',
      label: 'Add Holiday Breaks',
      description: 'Skip classes during holiday periods',
      icon: Pause
    },
    {
      id: 'export_affected',
      label: 'Export Affected Clients',
      description: 'Download CSV of all affected client bookings',
      icon: Download
    },
    {
      id: 'send_notifications',
      label: 'Send Custom Notifications',
      description: 'Send personalized messages to affected clients',
      icon: Send
    }
  ];

  const weekdayOptions = [
    { value: 'MO', label: 'Monday' },
    { value: 'TU', label: 'Tuesday' },
    { value: 'WE', label: 'Wednesday' },
    { value: 'TH', label: 'Thursday' },
    { value: 'FR', label: 'Friday' },
    { value: 'SA', label: 'Saturday' },
    { value: 'SU', label: 'Sunday' }
  ];

  const cancellationReasons = [
    'instructor_unavailable',
    'location_unavailable', 
    'holiday_break',
    'low_enrollment',
    'schedule_change',
    'maintenance',
    'other'
  ];

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      instructor_unavailable: 'Instructor Unavailable',
      location_unavailable: 'Location Unavailable',
      holiday_break: 'Holiday Break',
      low_enrollment: 'Low Enrollment',
      schedule_change: 'Schedule Change',
      maintenance: 'Maintenance',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  const updateActionData = (field: string, value: any) => {
    setActionData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setActionData({});
    setStep(2);
  };

  const handleContinue = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedAction) {
      onAction(selectedAction, actionData);
      onClose();
    }
  };

  const getEstimatedImpact = () => {
    // Mock calculations based on action type and selections
    if (selectedAction === 'cancel_range' && actionData.start_date && actionData.end_date) {
      return {
        affected_classes: 15,
        affected_clients: 180,
        revenue_at_risk: 3250,
        refunds_required: 12
      };
    } else if (selectedAction === 'change_recurrence') {
      return {
        affected_classes: 8,
        affected_clients: 95,
        revenue_at_risk: 1800,
        refunds_required: 0
      };
    } else if (selectedAction === 'bulk_edit') {
      return {
        affected_classes: selectedOccurrenceIds.length || 5,
        affected_clients: (selectedOccurrenceIds.length || 5) * 15,
        revenue_at_risk: 0,
        refunds_required: 0
      };
    }
    return null;
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'cancel_range':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={actionData.start_date || ''}
                  onChange={(e) => updateActionData('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={actionData.end_date || ''}
                  onChange={(e) => updateActionData('end_date', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label>Cancellation Reason</Label>
              <Select value={actionData.reason || ''} onValueChange={(value) => updateActionData('reason', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map(reason => (
                    <SelectItem key={reason} value={reason}>
                      {getReasonLabel(reason)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Additional Message</Label>
              <Textarea
                value={actionData.message || ''}
                onChange={(e) => updateActionData('message', e.target.value)}
                placeholder="Optional message for affected clients..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'change_recurrence':
        return (
          <div className="space-y-4">
            <div>
              <Label>Current Recurrence Pattern</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                Weekly on Mondays, Tuesdays, Thursdays
              </div>
            </div>
            
            <div>
              <Label>New Recurrence Pattern</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {weekdayOptions.map(weekday => (
                  <Button
                    key={weekday.value}
                    type="button"
                    variant={actionData.weekdays?.includes(weekday.value) ? 'default' : 'outline'}
                    className="h-10 text-xs"
                    onClick={() => {
                      const current = actionData.weekdays || ['MO', 'TU', 'TH'];
                      if (current.includes(weekday.value)) {
                        updateActionData('weekdays', current.filter((d: string) => d !== weekday.value));
                      } else {
                        updateActionData('weekdays', [...current, weekday.value]);
                      }
                    }}
                  >
                    {weekday.label.slice(0, 2)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Apply From Date</Label>
              <Input
                type="date"
                value={actionData.apply_from_date || ''}
                onChange={(e) => updateActionData('apply_from_date', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Changes will apply starting from this date
              </p>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Removed weekdays with existing registrations will be cancelled automatically.
                Clients will receive notifications and resolution options.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'bulk_edit':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={actionData.change_time || false}
                  onCheckedChange={(checked) => updateActionData('change_time', checked)}
                />
                <Label>Change Time</Label>
              </div>
              
              {actionData.change_time && (
                <div className="grid grid-cols-2 gap-3 ml-6">
                  <div>
                    <Label>New Start Time</Label>
                    <Input
                      type="time"
                      value={actionData.new_start_time || ''}
                      onChange={(e) => updateActionData('new_start_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>New End Time</Label>
                    <Input
                      type="time"
                      value={actionData.new_end_time || ''}
                      onChange={(e) => updateActionData('new_end_time', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={actionData.change_instructor || false}
                  onCheckedChange={(checked) => updateActionData('change_instructor', checked)}
                />
                <Label>Change Instructor</Label>
              </div>
              
              {actionData.change_instructor && (
                <div className="ml-6">
                  <Select value={actionData.new_instructor_id || ''} onValueChange={(value) => updateActionData('new_instructor_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new instructor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah-1">Sarah Müller</SelectItem>
                      <SelectItem value="marcus-1">Marcus Weber</SelectItem>
                      <SelectItem value="lisa-1">Lisa Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={actionData.change_capacity || false}
                  onCheckedChange={(checked) => updateActionData('change_capacity', checked)}
                />
                <Label>Change Capacity</Label>
              </div>
              
              {actionData.change_capacity && (
                <div className="ml-6">
                  <Input
                    type="number"
                    value={actionData.new_capacity || ''}
                    onChange={(e) => updateActionData('new_capacity', parseInt(e.target.value))}
                    placeholder="New capacity"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'add_holiday_skip':
        return (
          <div className="space-y-4">
            <div>
              <Label>Holiday Period</Label>
              <Select value={actionData.holiday_type || ''} onValueChange={(value) => updateActionData('holiday_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select holiday..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="christmas">Christmas Break</SelectItem>
                  <SelectItem value="new_year">New Year Break</SelectItem>
                  <SelectItem value="easter">Easter Break</SelectItem>
                  <SelectItem value="summer">Summer Break</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={actionData.holiday_start || ''}
                  onChange={(e) => updateActionData('holiday_start', e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={actionData.holiday_end || ''}
                  onChange={(e) => updateActionData('holiday_end', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label>Holiday Message</Label>
              <Textarea
                value={actionData.holiday_message || ''}
                onChange={(e) => updateActionData('holiday_message', e.target.value)}
                placeholder="Message about the holiday break..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'send_notifications':
        return (
          <div className="space-y-4">
            <div>
              <Label>Notification Type</Label>
              <Select value={actionData.notification_type || ''} onValueChange={(value) => updateActionData('notification_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Class Reminder</SelectItem>
                  <SelectItem value="update">Schedule Update</SelectItem>
                  <SelectItem value="promotion">Promotion/Offer</SelectItem>
                  <SelectItem value="announcement">General Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Subject</Label>
              <Input
                value={actionData.subject || ''}
                onChange={(e) => updateActionData('subject', e.target.value)}
                placeholder="Notification subject..."
              />
            </div>
            
            <div>
              <Label>Message</Label>
              <Textarea
                value={actionData.notification_message || ''}
                onChange={(e) => updateActionData('notification_message', e.target.value)}
                placeholder="Your message to clients..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Send Via</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={actionData.send_email || false}
                    onCheckedChange={(checked) => updateActionData('send_email', checked)}
                  />
                  <Label>Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={actionData.send_push || false}
                    onCheckedChange={(checked) => updateActionData('send_push', checked)}
                  />
                  <Label>Push Notification</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={actionData.send_sms || false}
                    onCheckedChange={(checked) => updateActionData('send_sms', checked)}
                  />
                  <Label>SMS (additional charges apply)</Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedActionDetails = bulkActions.find(action => action.id === selectedAction);
  const impact = getEstimatedImpact();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              {selectedSeriesIds.length > 0 && `${selectedSeriesIds.length} series selected`}
              {selectedOccurrenceIds.length > 0 && `${selectedOccurrenceIds.length} occurrences selected`}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Choose an action to perform:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bulkActions.map((action) => (
                    <Card
                      key={action.id}
                      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                        action.destructive ? 'border-destructive/20 hover:border-destructive/50' : ''
                      }`}
                      onClick={() => handleActionSelect(action.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            action.destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                          }`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">{action.label}</h4>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedActionDetails && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedActionDetails.destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`}>
                  <selectedActionDetails.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedActionDetails.label}</h3>
                  <p className="text-sm text-muted-foreground">{selectedActionDetails.description}</p>
                </div>
              </div>

              {renderActionForm()}

              {impact && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Estimated Impact:</strong> {impact.affected_classes} classes, {impact.affected_clients} clients
                    {impact.revenue_at_risk > 0 && `, CHF ${impact.revenue_at_risk} revenue at risk`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              
              {step === 2 && (
                <Button 
                  onClick={handleContinue}
                  className={selectedActionDetails?.destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
                >
                  Continue
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Please review the impact of this action before proceeding
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className={selectedActionDetails?.destructive ? 'border-destructive' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to <strong>{selectedActionDetails?.label.toLowerCase()}</strong>.
                This action will affect multiple classes and clients.
              </AlertDescription>
            </Alert>

            {impact && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-blue-600">{impact.affected_classes}</div>
                      <div className="text-sm text-muted-foreground">Classes Affected</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-green-600">{impact.affected_clients}</div>
                      <div className="text-sm text-muted-foreground">Clients Impacted</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedActionDetails?.destructive && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Safety Measures</h4>
                <ul className="text-sm space-y-1">
                  <li>• All affected clients will be notified automatically</li>
                  <li>• Studio-initiated change policy applies (no penalties)</li>
                  <li>• Refunds/credits will be processed automatically</li>
                  <li>• This action can be reviewed in the audit log</li>
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className={selectedActionDetails?.destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {selectedActionDetails?.destructive ? 'Confirm & Apply' : 'Apply Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}