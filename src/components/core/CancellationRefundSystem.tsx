import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, CreditCard, RefreshCw, Wallet, User, 
  Calendar, CheckCircle, X, DollarSign, ArrowRight, ArrowLeft,
  AlertCircle, Info, Zap, Receipt, Download, Send, Eye,
  Users, Building2, Smartphone, Ban, Undo, FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { supabase } from '../../utils/supabase/client';

interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  type: 'fixed_time' | 'sliding_scale' | 'no_refund' | 'full_refund';
  rules: CancellationRule[];
  applies_to: string[]; // class types, membership types, etc.
}

interface CancellationRule {
  hours_before: number;
  refund_percentage: number;
  credit_percentage: number;
  processing_fee: number;
  description: string;
}

interface CancellationRequest {
  id: string;
  type: 'customer' | 'instructor' | 'studio' | 'weather' | 'emergency';
  initiator_id: string;
  initiator_name: string;
  occurrence_id: string;
  registration_id?: string;
  reason: string;
  reason_category: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  refund_details: RefundDetails;
  notification_settings: {
    notify_customers: boolean;
    notify_instructor: boolean;
    notify_waitlist: boolean;
    custom_message?: string;
  };
  auto_process: boolean;
  processed_at?: string;
  processed_by?: string;
}

interface RefundDetails {
  original_amount: number;
  refund_amount: number;
  credit_amount: number;
  processing_fee: number;
  method: 'original_payment' | 'wallet' | 'credit' | 'manual';
  currency: string;
  transaction_ids: string[];
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  reason: string;
  reference_type: 'booking' | 'cancellation' | 'refund' | 'purchase' | 'adjustment';
  reference_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function CancellationRefundSystem() {
  const [activeTab, setActiveTab] = useState<'requests' | 'policies' | 'analytics'>('requests');
  const [cancellationRequests, setCancellationRequests] = useState<CancellationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const [processingStep, setProcessingStep] = useState<'review' | 'refund' | 'notify' | 'complete'>('review');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock cancellation policies
  const cancellationPolicies: CancellationPolicy[] = [
    {
      id: 'policy-classes',
      name: 'Standard Class Cancellation',
      description: 'Standard policy for regular yoga classes',
      type: 'sliding_scale',
      applies_to: ['class', 'workshop'],
      rules: [
        {
          hours_before: 24,
          refund_percentage: 100,
          credit_percentage: 0,
          processing_fee: 0,
          description: 'Full refund if cancelled 24+ hours before'
        },
        {
          hours_before: 12,
          refund_percentage: 50,
          credit_percentage: 50,
          processing_fee: 2.50,
          description: '50% refund + 50% credit if cancelled 12-24 hours before'
        },
        {
          hours_before: 2,
          refund_percentage: 0,
          credit_percentage: 100,
          processing_fee: 2.50,
          description: 'Full credit if cancelled 2-12 hours before'
        },
        {
          hours_before: 0,
          refund_percentage: 0,
          credit_percentage: 0,
          processing_fee: 0,
          description: 'No refund or credit for same-day cancellations'
        }
      ]
    },
    {
      id: 'policy-instructor',
      name: 'Instructor Cancellation',
      description: 'When instructor cancels a class',
      type: 'full_refund',
      applies_to: ['class', 'workshop', 'private'],
      rules: [
        {
          hours_before: 0,
          refund_percentage: 100,
          credit_percentage: 0,
          processing_fee: 0,
          description: 'Full refund when instructor cancels'
        }
      ]
    },
    {
      id: 'policy-weather',
      name: 'Weather Cancellation',
      description: 'For outdoor classes cancelled due to weather',
      type: 'full_refund',
      applies_to: ['outdoor'],
      rules: [
        {
          hours_before: 0,
          refund_percentage: 100,
          credit_percentage: 0,
          processing_fee: 0,
          description: 'Full refund for weather-related cancellations'
        }
      ]
    }
  ];

  // Mock cancellation requests
  const mockRequests: CancellationRequest[] = [
    {
      id: 'req-1',
      type: 'customer',
      initiator_id: 'customer-1',
      initiator_name: 'Emma Weber',
      occurrence_id: 'class-1',
      registration_id: 'reg-1',
      reason: 'Feeling unwell, cannot attend class',
      reason_category: 'illness',
      requested_at: '2024-01-15T14:30:00Z',
      status: 'pending',
      refund_details: {
        original_amount: 28.00,
        refund_amount: 14.00,
        credit_amount: 14.00,
        processing_fee: 2.50,
        method: 'original_payment',
        currency: 'CHF',
        transaction_ids: []
      },
      notification_settings: {
        notify_customers: true,
        notify_instructor: true,
        notify_waitlist: true
      },
      auto_process: false
    },
    {
      id: 'req-2',
      type: 'instructor',
      initiator_id: 'instructor-1',
      initiator_name: 'Sarah Chen',
      occurrence_id: 'class-2',
      reason: 'Family emergency, unable to teach',
      reason_category: 'emergency',
      requested_at: '2024-01-15T08:00:00Z',
      status: 'approved',
      refund_details: {
        original_amount: 420.00, // 15 participants × 28 CHF
        refund_amount: 420.00,
        credit_amount: 0,
        processing_fee: 0,
        method: 'original_payment',
        currency: 'CHF',
        transaction_ids: []
      },
      notification_settings: {
        notify_customers: true,
        notify_instructor: false,
        notify_waitlist: true,
        custom_message: 'Unfortunately, this class has been cancelled due to an instructor emergency. You will receive a full refund within 2-3 business days.'
      },
      auto_process: true
    },
    {
      id: 'req-3',
      type: 'weather',
      initiator_id: 'system',
      initiator_name: 'System',
      occurrence_id: 'outdoor-class-1',
      reason: 'Severe weather warning - unsafe conditions',
      reason_category: 'weather',
      requested_at: '2024-01-15T06:00:00Z',
      status: 'processed',
      refund_details: {
        original_amount: 192.00, // 6 participants × 32 CHF
        refund_amount: 192.00,
        credit_amount: 0,
        processing_fee: 0,
        method: 'original_payment',
        currency: 'CHF',
        transaction_ids: ['txn-001', 'txn-002', 'txn-003']
      },
      notification_settings: {
        notify_customers: true,
        notify_instructor: true,
        notify_waitlist: false,
        custom_message: 'Today\'s outdoor class has been cancelled due to severe weather conditions for your safety.'
      },
      auto_process: true,
      processed_at: '2024-01-15T06:15:00Z',
      processed_by: 'system'
    }
  ];

  useEffect(() => {
    setCancellationRequests(mockRequests);
  }, []);

  const calculateRefund = (
    originalAmount: number, 
    hoursBefore: number, 
    policy: CancellationPolicy,
    cancellationType: CancellationRequest['type']
  ): RefundDetails => {
    // For instructor/weather/emergency cancellations, always full refund
    if (['instructor', 'weather', 'emergency'].includes(cancellationType)) {
      return {
        original_amount: originalAmount,
        refund_amount: originalAmount,
        credit_amount: 0,
        processing_fee: 0,
        method: 'original_payment',
        currency: 'CHF',
        transaction_ids: []
      };
    }

    // Find applicable rule based on hours before
    const applicableRule = policy.rules
      .sort((a, b) => b.hours_before - a.hours_before)
      .find(rule => hoursBefore >= rule.hours_before) || policy.rules[policy.rules.length - 1];

    const refund_amount = (originalAmount * applicableRule.refund_percentage) / 100;
    const credit_amount = (originalAmount * applicableRule.credit_percentage) / 100;

    return {
      original_amount: originalAmount,
      refund_amount: refund_amount - applicableRule.processing_fee,
      credit_amount,
      processing_fee: applicableRule.processing_fee,
      method: 'original_payment',
      currency: 'CHF',
      transaction_ids: []
    };
  };

  const processRefund = async (request: CancellationRequest) => {
    setIsProcessing(true);
    setProcessingStep('refund');

    try {
      // 1. Process refund
      if (request.refund_details.refund_amount > 0) {
        await processPaymentRefund(request);
      }

      // 2. Add credits to wallet
      if (request.refund_details.credit_amount > 0) {
        await addWalletCredit(request);
      }

      // 3. Update registration status
      await updateRegistrationStatus(request);

      // 4. Update class occurrence counts
      await updateClassCounts(request);

      setProcessingStep('notify');

      // 5. Send notifications
      await sendCancellationNotifications(request);

      setProcessingStep('complete');

      // Update request status
      const updatedRequest = {
        ...request,
        status: 'processed' as const,
        processed_at: new Date().toISOString(),
        processed_by: 'current-user'
      };

      setCancellationRequests(prev => 
        prev.map(r => r.id === request.id ? updatedRequest : r)
      );

    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error processing refund. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPaymentRefund = async (request: CancellationRequest) => {
    // Simulate payment refund via Stripe/TWINT
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Processing payment refund:', {
      amount: request.refund_details.refund_amount,
      method: request.refund_details.method,
      original_amount: request.refund_details.original_amount
    });
  };

  const addWalletCredit = async (request: CancellationRequest) => {
    // Add credit to customer wallet
    const walletTransaction: WalletTransaction = {
      id: `wt-${Date.now()}`,
      wallet_id: request.initiator_id,
      type: 'credit',
      amount: request.refund_details.credit_amount,
      currency: request.refund_details.currency,
      reason: `Cancellation credit for ${request.occurrence_id}`,
      reference_type: 'cancellation',
      reference_id: request.id,
      metadata: {
        original_amount: request.refund_details.original_amount,
        occurrence_id: request.occurrence_id
      },
      created_at: new Date().toISOString()
    };

    console.log('Adding wallet credit:', walletTransaction);
  };

  const updateRegistrationStatus = async (request: CancellationRequest) => {
    if (request.registration_id) {
      // Update registration status to cancelled
      console.log('Updating registration status:', request.registration_id);
    }
  };

  const updateClassCounts = async (request: CancellationRequest) => {
    // Update class booked_count and waitlist management
    console.log('Updating class counts for:', request.occurrence_id);
  };

  const sendCancellationNotifications = async (request: CancellationRequest) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Sending notifications for cancellation:', request.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: X },
      processed: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      customer: User,
      instructor: Users,
      studio: Building2,
      weather: AlertTriangle,
      emergency: AlertCircle
    };
    return icons[type as keyof typeof icons] || AlertCircle;
  };

  const renderRequestsList = () => (
    <div className="space-y-4">
      {cancellationRequests.map((request) => {
        const TypeIcon = getTypeIcon(request.type);
        
        return (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Cancellation
                      </h3>
                      {getStatusBadge(request.status)}
                      <Badge variant="outline" className="text-xs">
                        {request.reason_category}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Initiated by:</span>
                        <p className="font-medium">{request.initiator_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested:</span>
                        <p className="font-medium">{formatDateTime(request.requested_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Original Amount:</span>
                        <p className="font-medium">{formatCurrency(request.refund_details.original_amount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Refund:</span>
                        <p className="font-medium text-green-600">
                          {formatCurrency(request.refund_details.refund_amount)}
                          {request.refund_details.credit_amount > 0 && (
                            <span className="text-blue-600 ml-1">
                              + {formatCurrency(request.refund_details.credit_amount)} credit
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    
                    {request.notification_settings.custom_message && (
                      <Alert className="mb-3">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Customer Message:</strong> {request.notification_settings.custom_message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {request.processed_at && (
                      <div className="text-xs text-green-600">
                        Processed on {formatDateTime(request.processed_at)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowProcessDialog(true);
                      }}
                    >
                      Process
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderPoliciesList = () => (
    <div className="space-y-4">
      {cancellationPolicies.map((policy) => (
        <Card key={policy.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <CardDescription>{policy.description}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{policy.type.replace('_', ' ')}</Badge>
                  <Badge variant="outline">{policy.applies_to.join(', ')}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit Policy
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-medium">Cancellation Rules</h4>
              {policy.rules.map((rule, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {rule.hours_before > 0 ? `${rule.hours_before}+ hours before` : 'Same day'}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      {rule.refund_percentage > 0 && (
                        <Badge className="bg-green-100 text-green-700">
                          {rule.refund_percentage}% refund
                        </Badge>
                      )}
                      {rule.credit_percentage > 0 && (
                        <Badge className="bg-blue-100 text-blue-700">
                          {rule.credit_percentage}% credit
                        </Badge>
                      )}
                      {rule.processing_fee > 0 && (
                        <Badge variant="outline">
                          {formatCurrency(rule.processing_fee)} fee
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Cancellations (This Month)</span>
              <span className="font-semibold">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Customer Initiated</span>
              <span className="font-semibold">15 (65%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Instructor Initiated</span>
              <span className="font-semibold">5 (22%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Weather Related</span>
              <span className="font-semibold">3 (13%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Refunds Processed</span>
              <span className="font-semibold">{formatCurrency(1247.50)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Credits Issued</span>
              <span className="font-semibold">{formatCurrency(842.00)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Fees</span>
              <span className="font-semibold">{formatCurrency(47.50)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Processing Time</span>
              <span className="font-semibold">2.3 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cancellation & Refund Management</h1>
          <p className="text-muted-foreground">
            Comprehensive system for handling cancellations, refunds, and credits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowPolicyEditor(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Manage Policies
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-semibold">
                  {cancellationRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Refunds</p>
                <p className="text-2xl font-semibold">{formatCurrency(347.50)}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Issued</p>
                <p className="text-2xl font-semibold">{formatCurrency(184.00)}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-Processed</p>
                <p className="text-2xl font-semibold">73%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="requests">Cancellation Requests</TabsTrigger>
          <TabsTrigger value="policies">Cancellation Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {renderRequestsList()}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          {renderPoliciesList()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* Process Cancellation Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Process Cancellation Request</DialogTitle>
                <DialogDescription>
                  Review and process the cancellation request from {selectedRequest.initiator_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {processingStep === 'review' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Cancellation Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium capitalize">{selectedRequest.type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reason:</span>
                          <p className="font-medium">{selectedRequest.reason_category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Original Amount:</span>
                          <p className="font-medium">{formatCurrency(selectedRequest.refund_details.original_amount)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Requested:</span>
                          <p className="font-medium">{formatDateTime(selectedRequest.requested_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Refund Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Original Payment:</span>
                          <span>{formatCurrency(selectedRequest.refund_details.original_amount)}</span>
                        </div>
                        {selectedRequest.refund_details.processing_fee > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Processing Fee:</span>
                            <span>-{formatCurrency(selectedRequest.refund_details.processing_fee)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-medium text-green-600">
                          <span>Refund Amount:</span>
                          <span>{formatCurrency(selectedRequest.refund_details.refund_amount)}</span>
                        </div>
                        {selectedRequest.refund_details.credit_amount > 0 && (
                          <div className="flex justify-between font-medium text-blue-600">
                            <span>Credit Amount:</span>
                            <span>{formatCurrency(selectedRequest.refund_details.credit_amount)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => processRefund(selectedRequest)} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Approve & Process Refund'}
                      </Button>
                    </div>
                  </div>
                )}

                {processingStep === 'refund' && (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Processing Refund</h3>
                    <p className="text-muted-foreground">
                      Processing refund of {formatCurrency(selectedRequest.refund_details.refund_amount)} 
                      to original payment method...
                    </p>
                    <Progress value={50} className="w-full" />
                  </div>
                )}

                {processingStep === 'notify' && (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Send className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Sending Notifications</h3>
                    <p className="text-muted-foreground">
                      Notifying customers and updating waitlist...
                    </p>
                    <Progress value={80} className="w-full" />
                  </div>
                )}

                {processingStep === 'complete' && (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-600">Cancellation Processed</h3>
                    <p className="text-muted-foreground">
                      The cancellation has been successfully processed. Customers have been notified and refunds are being processed.
                    </p>
                    <Button onClick={() => {
                      setShowProcessDialog(false);
                      setProcessingStep('review');
                      setSelectedRequest(null);
                    }}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}