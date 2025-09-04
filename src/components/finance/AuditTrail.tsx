import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Shield,
  Eye,
  Download,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  CreditCard,
  Receipt,
  RefreshCcw,
  DollarSign,
  Lock
} from 'lucide-react';

interface AuditTrailProps {
  onBack: () => void;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  category: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'success' | 'failed' | 'pending';
  amount?: number;
  currency?: string;
  metadata?: any;
}

export function AuditTrail({ onBack }: AuditTrailProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last_7_days');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  // Mock audit events data - All amounts in CHF
  const auditEvents: AuditEvent[] = [
    {
      id: 'AUDIT-001',
      timestamp: '2025-01-01T14:30:25Z',
      eventType: 'payment_processed',
      category: 'financial',
      entityType: 'order',
      entityId: 'ORD-2025-001234',
      userId: 'system',
      userName: 'System Automated',
      userRole: 'system',
      action: 'payment_capture',
      description: 'Payment captured for order ORD-2025-001234',
      oldValues: { status: 'pending' },
      newValues: { status: 'paid', amount: 35.00, currency: 'CHF' },
      ipAddress: '192.168.1.100',
      userAgent: 'Stripe-Webhook/1.0',
      sessionId: 'webhook-stripe-001',
      riskLevel: 'low',
      status: 'success',
      amount: 35.00,
      currency: 'CHF',
      metadata: {
        paymentIntent: 'pi_1234567890',
        provider: 'stripe',
        method: 'card'
      }
    },
    {
      id: 'AUDIT-002',
      timestamp: '2025-01-01T13:45:12Z',
      eventType: 'refund_issued',
      category: 'financial',
      entityType: 'payment',
      entityId: 'PAY-2025-001123',
      userId: 'user-001',
      userName: 'Sarah Martinez',
      userRole: 'manager',
      action: 'process_refund',
      description: 'Refund processed for customer cancellation',
      oldValues: { refundedAmount: 0 },
      newValues: { refundedAmount: 25.00, reason: 'customer_cancel' },
      ipAddress: '10.0.1.25',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess-sarah-001',
      riskLevel: 'medium',
      status: 'success',
      amount: -25.00,
      currency: 'CHF',
      metadata: {
        approvalRequired: true,
        customerNotified: true
      }
    },
    {
      id: 'AUDIT-003',
      timestamp: '2025-01-01T12:15:08Z',
      eventType: 'vat_rate_updated',
      category: 'configuration',
      entityType: 'tax_settings',
      entityId: 'TAX-STANDARD',
      userId: 'user-002',
      userName: 'Marco Weber',
      userRole: 'finance_manager',
      action: 'update_tax_rate',
      description: 'Updated standard VAT rate for 2025',
      oldValues: { rate: 0.077 },
      newValues: { rate: 0.081 },
      ipAddress: '10.0.1.15',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess-marco-002',
      riskLevel: 'high',
      status: 'success',
      metadata: {
        effectiveDate: '2025-01-01',
        approvedBy: 'owner-001'
      }
    },
    {
      id: 'AUDIT-004',
      timestamp: '2025-01-01T11:30:45Z',
      eventType: 'cash_drawer_opened',
      category: 'cash_management',
      entityType: 'cash_drawer',
      entityId: 'DRAWER-001',
      userId: 'user-003',
      userName: 'Lisa Müller',
      userRole: 'front_desk',
      action: 'open_drawer',
      description: 'Cash drawer opened for shift',
      oldValues: { status: 'closed' },
      newValues: { status: 'open', openingFloat: 200.00 },
      ipAddress: '10.0.1.30',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X) AppleWebKit/605.1.15',
      sessionId: 'sess-lisa-003',
      riskLevel: 'low',
      status: 'success',
      amount: 200.00,
      currency: 'CHF',
      metadata: {
        location: 'Front Desk - Main',
        shiftStart: '08:00'
      }
    },
    {
      id: 'AUDIT-005',
      timestamp: '2025-01-01T10:45:30Z',
      eventType: 'invoice_generated',
      category: 'financial',
      entityType: 'invoice',
      entityId: 'INV-2025-YST-000124',
      userId: 'system',
      userName: 'System Automated',
      userRole: 'system',
      action: 'generate_invoice',
      description: 'Invoice generated with Swiss QR-bill',
      oldValues: null,
      newValues: { 
        invoiceNumber: 'INV-2025-YST-000124',
        amount: 120.00,
        currency: 'CHF',
        vatAmount: 9.72,
        qrBill: true
      },
      ipAddress: '192.168.1.100',
      userAgent: 'YogaSwiss-System/1.0',
      sessionId: 'system-automated',
      riskLevel: 'low',
      status: 'success',
      amount: 120.00,
      currency: 'CHF',
      metadata: {
        hasQRBill: true,
        vatMode: 'inclusive',
        dueDate: '2025-01-15'
      }
    },
    {
      id: 'AUDIT-006',
      timestamp: '2025-01-01T09:20:15Z',
      eventType: 'failed_payment_attempt',
      category: 'security',
      entityType: 'payment',
      entityId: 'PAY-FAILED-001',
      userId: 'anonymous',
      userName: 'Anonymous Customer',
      userRole: 'customer',
      action: 'payment_attempt',
      description: 'Failed payment attempt - insufficient funds',
      oldValues: null,
      newValues: { status: 'failed', errorCode: 'insufficient_funds' },
      ipAddress: '203.45.67.89',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      sessionId: 'guest-session-001',
      riskLevel: 'high',
      status: 'failed',
      amount: 85.00,
      currency: 'CHF',
      metadata: {
        provider: 'stripe',
        method: 'card',
        cardLast4: '4242',
        attempts: 3
      }
    },
    {
      id: 'AUDIT-007',
      timestamp: '2025-01-01T08:15:00Z',
      eventType: 'user_login',
      category: 'authentication',
      entityType: 'user_session',
      entityId: 'SESSION-001',
      userId: 'user-001',
      userName: 'Sarah Martinez',
      userRole: 'manager',
      action: 'login',
      description: 'User successfully logged in',
      oldValues: null,
      newValues: { sessionActive: true, loginTime: '2025-01-01T08:15:00Z' },
      ipAddress: '10.0.1.25',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess-sarah-001',
      riskLevel: 'low',
      status: 'success',
      metadata: {
        mfaUsed: true,
        deviceFingerprint: 'fp-12345'
      }
    }
  ];

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'payment_processed': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'refund_issued': return <RefreshCcw className="h-4 w-4 text-orange-600" />;
      case 'invoice_generated': return <Receipt className="h-4 w-4 text-blue-600" />;
      case 'vat_rate_updated': return <Settings className="h-4 w-4 text-purple-600" />;
      case 'cash_drawer_opened': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'failed_payment_attempt': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'user_login': return <User className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === 'all' || event.category === eventTypeFilter;
    const matchesUser = userFilter === 'all' || event.userId === userFilter;
    
    return matchesSearch && matchesEventType && matchesUser;
  });

  const eventStats = {
    total: auditEvents.length,
    today: auditEvents.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length,
    failed: auditEvents.filter(e => e.status === 'failed').length,
    highRisk: auditEvents.filter(e => e.riskLevel === 'high').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Finance
          </Button>
          <div>
            <h1>Audit Trail</h1>
            <p className="text-muted-foreground">
              Complete audit log of all financial and system activities
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Audit Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time audit events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.today}</div>
            <p className="text-xs text-muted-foreground">
              Events logged today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{eventStats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{eventStats.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              Security relevant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Event Log</CardTitle>
          <CardDescription>
            Complete chronological record of all system activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, users, or entity IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="configuration">Configuration</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="cash_management">Cash Management</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user-001">Sarah Martinez</SelectItem>
                <SelectItem value="user-002">Marco Weber</SelectItem>
                <SelectItem value="user-003">Lisa Müller</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.eventType)}
                        <div>
                          <div className="font-medium">{event.action.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {event.category.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.userName}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {event.userRole.replace('_', ' ')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">
                        {event.entityType}:{event.entityId}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.amount && (
                        <div className={`font-medium ${event.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {event.amount > 0 ? '+' : ''}{event.currency} {Math.abs(event.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getRiskBadge(event.riskLevel)}</TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
            <DialogDescription>
              Complete audit trail information for event {selectedEvent?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="changes">Changes</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getEventIcon(selectedEvent.eventType)}
                      <span className="font-medium capitalize">{selectedEvent.eventType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Timestamp</Label>
                    <p className="font-medium">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>User</Label>
                    <p className="font-medium">{selectedEvent.userName}</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedEvent.userRole.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedEvent.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Risk Level</Label>
                    <div className="mt-1">
                      {getRiskBadge(selectedEvent.riskLevel)}
                    </div>
                  </div>
                  <div>
                    <Label>Entity</Label>
                    <p className="font-mono text-sm">{selectedEvent.entityType}:{selectedEvent.entityId}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-lg">{selectedEvent.description}</p>
                </div>
                
                {selectedEvent.amount && (
                  <div>
                    <Label>Financial Impact</Label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <span className={`font-medium ${selectedEvent.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedEvent.amount > 0 ? '+' : ''}{selectedEvent.currency} {Math.abs(selectedEvent.amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="changes" className="space-y-4">
                {selectedEvent.oldValues && (
                  <div>
                    <Label>Previous Values</Label>
                    <pre className="mt-1 p-3 bg-red-50 rounded-lg text-sm border border-red-200">
                      {JSON.stringify(selectedEvent.oldValues, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedEvent.newValues && (
                  <div>
                    <Label>New Values</Label>
                    <pre className="mt-1 p-3 bg-green-50 rounded-lg text-sm border border-green-200">
                      {JSON.stringify(selectedEvent.newValues, null, 2)}
                    </pre>
                  </div>
                )}
                
                {!selectedEvent.oldValues && !selectedEvent.newValues && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data changes recorded for this event
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Session ID</Label>
                    <p className="font-mono text-sm">{selectedEvent.sessionId}</p>
                  </div>
                  <div>
                    <Label>IP Address</Label>
                    <p className="font-mono text-sm">{selectedEvent.ipAddress}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>User Agent</Label>
                    <p className="font-mono text-sm break-all">{selectedEvent.userAgent}</p>
                  </div>
                </div>
                
                {selectedEvent.metadata && (
                  <div>
                    <Label>Metadata</Label>
                    <pre className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Risk Assessment</Label>
                    <div className="mt-1">
                      {getRiskBadge(selectedEvent.riskLevel)}
                    </div>
                  </div>
                  <div>
                    <Label>Event Category</Label>
                    <p className="font-medium capitalize">{selectedEvent.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>User Role</Label>
                    <p className="font-medium capitalize">{selectedEvent.userRole.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Authentication Status</Label>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Authenticated
                    </Badge>
                  </div>
                </div>
                
                {selectedEvent.riskLevel === 'high' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium text-red-800">High Risk Event</h4>
                    </div>
                    <p className="text-sm text-red-700">
                      This event has been flagged as high risk and may require additional review or approval.
                    </p>
                  </div>
                )}
                
                {selectedEvent.status === 'failed' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium text-red-800">Failed Event</h4>
                    </div>
                    <p className="text-sm text-red-700">
                      This event failed to complete successfully and may indicate a security concern or system issue.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}