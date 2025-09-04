import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  CreditCard,
  Wallet,
  RefreshCw,
  Info,
  XCircle,
  DollarSign,
  Timer,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';

interface Booking {
  id: string;
  className: string;
  instructor: string;
  studio: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'waitlist';
  paymentMethod: 'card' | 'credits' | 'membership' | 'package';
  paymentDetails: {
    creditsUsed?: number;
    cardLast4?: string;
    packageName?: string;
    membershipType?: string;
  };
  cancellationPolicy: {
    freeUntil: Date;
    creditRefundUntil: Date;
    noRefundAfter: Date;
    lateFeePenalty: number;
  };
}

interface RefundOption {
  type: 'full-refund' | 'credit-refund' | 'partial-refund' | 'no-refund';
  label: string;
  description: string;
  amount: number;
  processingTime: string;
  available: boolean;
  recommended?: boolean;
}

interface CancellationReason {
  id: string;
  label: string;
  requiresNote: boolean;
  mayQualifyForException: boolean;
}

interface EnhancedCancellationManagerProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancellationComplete: (refundType: string, amount: number) => void;
}

export function EnhancedCancellationManager({ 
  booking, 
  isOpen, 
  onClose, 
  onCancellationComplete 
}: EnhancedCancellationManagerProps) {
  const [currentStep, setCurrentStep] = useState<'policy' | 'reason' | 'refund' | 'confirm'>('policy');
  const [selectedRefundOption, setSelectedRefundOption] = useState<RefundOption | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [reasonNote, setReasonNote] = useState<string>('');
  const [agreeToPenalty, setAgreeToPenalty] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    total: number;
    hours: number;
    minutes: number;
    expired: boolean;
  }>({ total: 0, hours: 0, minutes: 0, expired: false });

  // Cancellation reasons
  const cancellationReasons: CancellationReason[] = [
    { id: 'schedule', label: 'Schedule conflict', requiresNote: false, mayQualifyForException: false },
    { id: 'illness', label: 'Illness/injury', requiresNote: true, mayQualifyForException: true },
    { id: 'emergency', label: 'Family/personal emergency', requiresNote: true, mayQualifyForException: true },
    { id: 'weather', label: 'Weather conditions', requiresNote: false, mayQualifyForException: true },
    { id: 'transport', label: 'Transportation issues', requiresNote: true, mayQualifyForException: false },
    { id: 'other', label: 'Other reason', requiresNote: true, mayQualifyForException: false }
  ];

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = booking.cancellationPolicy.freeUntil.getTime();
      const difference = deadline - now;
      
      if (difference <= 0) {
        setTimeRemaining({ total: 0, hours: 0, minutes: 0, expired: true });
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining({ total: difference, hours, minutes, expired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [booking.cancellationPolicy.freeUntil]);

  // Calculate refund options based on timing and policy
  const getRefundOptions = (): RefundOption[] => {
    const now = new Date();
    const { freeUntil, creditRefundUntil, noRefundAfter, lateFeePenalty } = booking.cancellationPolicy;
    
    const options: RefundOption[] = [];
    
    if (now < freeUntil) {
      // Free cancellation period
      if (booking.paymentMethod === 'credits') {
        options.push({
          type: 'credit-refund',
          label: 'Full Credit Refund',
          description: 'Credits will be returned to your wallet immediately',
          amount: booking.paymentDetails.creditsUsed || booking.price,
          processingTime: 'Immediate',
          available: true,
          recommended: true
        });
      } else if (booking.paymentMethod === 'card') {
        options.push({
          type: 'full-refund',
          label: 'Full Card Refund',
          description: 'Full refund to your original payment method',
          amount: booking.price,
          processingTime: '3-5 business days',
          available: true,
          recommended: true
        });
        options.push({
          type: 'credit-refund',
          label: 'Wallet Credits',
          description: 'Get credits in your wallet for faster future bookings',
          amount: booking.price,
          processingTime: 'Immediate',
          available: true
        });
      } else {
        options.push({
          type: 'credit-refund',
          label: 'Wallet Credits',
          description: 'Credits will be added to your wallet',
          amount: booking.price,
          processingTime: 'Immediate',
          available: true,
          recommended: true
        });
      }
    } else if (now < creditRefundUntil) {
      // Credit-only refund period
      options.push({
        type: 'credit-refund',
        label: 'Credit Refund',
        description: 'Receive credits in your wallet (no cash refund available)',
        amount: booking.price,
        processingTime: 'Immediate',
        available: true,
        recommended: true
      });
    } else if (now < noRefundAfter) {
      // Late cancellation with penalty
      const penaltyAmount = booking.price * (lateFeePenalty / 100);
      const refundAmount = booking.price - penaltyAmount;
      
      if (refundAmount > 0) {
        options.push({
          type: 'partial-refund',
          label: `Partial Credit Refund (${lateFeePenalty}% penalty)`,
          description: `${lateFeePenalty}% late cancellation fee applies`,
          amount: refundAmount,
          processingTime: 'Immediate',
          available: true,
          recommended: true
        });
      }
    }
    
    // Always show no-refund option for transparency
    options.push({
      type: 'no-refund',
      label: 'Cancel without refund',
      description: 'Free up your spot for other students',
      amount: 0,
      processingTime: 'N/A',
      available: true
    });
    
    return options;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCancelBooking = async () => {
    if (!selectedRefundOption) return;
    
    setIsCancelling(true);
    try {
      // Mock cancellation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Booking cancelled successfully');
      onCancellationComplete(selectedRefundOption.type, selectedRefundOption.amount);
      onClose();
    } catch (error) {
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'policy': return 'Cancellation Policy';
      case 'reason': return 'Cancellation Reason';
      case 'refund': return 'Refund Options';
      case 'confirm': return 'Confirm Cancellation';
      default: return 'Cancel Booking';
    }
  };

  const canProceedFromPolicy = true;
  const canProceedFromReason = selectedReason && (!cancellationReasons.find(r => r.id === selectedReason)?.requiresNote || reasonNote.trim());
  const canProceedFromRefund = selectedRefundOption;
  const canConfirm = selectedRefundOption && (selectedRefundOption.type !== 'partial-refund' || agreeToPenalty);

  const refundOptions = getRefundOptions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card className="border-red-200">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-red-900">{booking.className}</h3>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>with {booking.instructor}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{booking.studio}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-red-100 text-red-700 mb-2">{booking.status}</Badge>
                  <div className="font-semibold text-red-900">{formatPrice(booking.price)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countdown Timer */}
          {!timeRemaining.expired && (
            <Alert className="border-orange-200 bg-orange-50">
              <Timer className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <span>Free cancellation ends in:</span>
                  <span className="font-mono font-semibold">
                    {timeRemaining.hours}h {timeRemaining.minutes}m
                  </span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (timeRemaining.total / (24 * 60 * 60 * 1000)) * 100)} 
                  className="mt-2 h-2"
                />
              </AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          {currentStep === 'policy' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                      <div className="text-sm font-medium text-green-800">Free Cancellation</div>
                      <div className="text-xs text-green-600 mt-1">
                        Until {formatTime(booking.cancellationPolicy.freeUntil)}
                        <br />
                        {formatDate(booking.cancellationPolicy.freeUntil)}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertCircle className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
                      <div className="text-sm font-medium text-yellow-800">Credit Only</div>
                      <div className="text-xs text-yellow-600 mt-1">
                        Until {formatTime(booking.cancellationPolicy.creditRefundUntil)}
                        <br />
                        {formatDate(booking.cancellationPolicy.creditRefundUntil)}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <XCircle className="h-6 w-6 mx-auto text-red-600 mb-2" />
                      <div className="text-sm font-medium text-red-800">
                        {booking.cancellationPolicy.lateFeePenalty}% Penalty
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Until {formatTime(booking.cancellationPolicy.noRefundAfter)}
                        <br />
                        {formatDate(booking.cancellationPolicy.noRefundAfter)}
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Cancellations help us manage class capacity and waitlists. 
                      Early cancellation allows other students to join and helps instructors plan accordingly.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep('reason')}
                  disabled={!canProceedFromPolicy}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'reason' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Why are you cancelling?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                    {cancellationReasons.map((reason) => (
                      <div key={reason.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={reason.id} id={reason.id} />
                          <Label htmlFor={reason.id} className="flex-1">
                            {reason.label}
                            {reason.mayQualifyForException && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                May qualify for exception
                              </Badge>
                            )}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {selectedReason && cancellationReasons.find(r => r.id === selectedReason)?.requiresNote && (
                    <div className="mt-4">
                      <Label htmlFor="reason-note">Additional details (required)</Label>
                      <Textarea
                        id="reason-note"
                        placeholder="Please provide more details about your situation..."
                        value={reasonNote}
                        onChange={(e) => setReasonNote(e.target.value)}
                        className="mt-1"
                      />
                      {cancellationReasons.find(r => r.id === selectedReason)?.mayQualifyForException && (
                        <p className="text-xs text-blue-600 mt-1">
                          Detailed information may help us process an exception to the standard policy.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('policy')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep('refund')}
                  disabled={!canProceedFromReason}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'refund' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Choose your refund option</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={selectedRefundOption?.type} 
                    onValueChange={(value) => {
                      const option = refundOptions.find(o => o.type === value);
                      setSelectedRefundOption(option || null);
                    }}
                  >
                    {refundOptions.filter(option => option.available).map((option) => (
                      <div key={option.type} className="space-y-2">
                        <div className={`p-4 rounded-lg border-2 transition-all ${
                          selectedRefundOption?.type === option.type 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        } ${option.recommended ? 'border-green-200 bg-green-50' : ''}`}>
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value={option.type} id={option.type} className="mt-0.5" />
                            <div className="flex-1">
                              <Label htmlFor={option.type} className="flex items-center gap-2">
                                {option.type === 'full-refund' && <CreditCard className="h-4 w-4" />}
                                {option.type === 'credit-refund' && <Wallet className="h-4 w-4" />}
                                {option.type === 'partial-refund' && <DollarSign className="h-4 w-4" />}
                                {option.type === 'no-refund' && <XCircle className="h-4 w-4" />}
                                <span className="font-medium">{option.label}</span>
                                {option.recommended && (
                                  <Badge className="bg-green-100 text-green-700">Recommended</Badge>
                                )}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-semibold">
                                  {option.amount > 0 ? formatPrice(option.amount) : 'No refund'}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {option.processingTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {selectedRefundOption?.type === 'partial-refund' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="agree-penalty"
                          checked={agreeToPenalty}
                          onCheckedChange={setAgreeToPenalty}
                        />
                        <Label htmlFor="agree-penalty" className="text-sm">
                          I understand and accept the {booking.cancellationPolicy.lateFeePenalty}% 
                          late cancellation penalty of {formatPrice(booking.price * (booking.cancellationPolicy.lateFeePenalty / 100))}.
                        </Label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('reason')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep('confirm')}
                  disabled={!canProceedFromRefund}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'confirm' && selectedRefundOption && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-red-600">Confirm Cancellation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      <strong>This action cannot be undone.</strong> Your booking will be cancelled immediately.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Cancellation reason:</span>
                      <span>{cancellationReasons.find(r => r.id === selectedReason)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refund method:</span>
                      <span>{selectedRefundOption.label}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Refund amount:</span>
                      <span className={selectedRefundOption.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {selectedRefundOption.amount > 0 ? formatPrice(selectedRefundOption.amount) : 'No refund'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Processing time:</span>
                      <span>{selectedRefundOption.processingTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('refund')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleCancelBooking}
                  disabled={!canConfirm || isCancelling}
                  className="min-w-32"
                >
                  {isCancelling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}