import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Shield, 
  Clock, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Wallet,
  QrCode,
  Building,
  Euro,
  Info
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner@2.0.3';

interface PaymentMethod {
  id: string;
  type: 'twint' | 'card' | 'payatStudio' | 'wallet' | 'qrbill' | 'installments';
  name: string;
  description: string;
  icon: React.ReactNode;
  fees?: number;
  processingTime?: string;
  requirements?: string[];
  available: boolean;
  recommended?: boolean;
}

interface PaymentHubProps {
  amount: number;
  currency?: string;
  walletBalance?: number;
  allowPayAtStudio?: boolean;
  allowInstallments?: boolean;
  onPaymentComplete: (paymentData: PaymentResult) => void;
  onPaymentMethod: (method: string) => void;
  className?: string;
}

interface PaymentResult {
  method: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  walletUsed?: number;
  remainingBalance?: number;
}

export function SwissPaymentHub({
  amount,
  currency = 'CHF',
  walletBalance = 0,
  allowPayAtStudio = true,
  allowInstallments = false,
  onPaymentComplete,
  onPaymentMethod,
  className = ""
}: PaymentHubProps) {
  
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [installmentPlan, setInstallmentPlan] = useState('');

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const remainingAmount = useWallet ? Math.max(0, amount - walletAmount) : amount;
  const canUseWallet = walletBalance > 0;
  const maxWalletUsage = Math.min(walletBalance, amount);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'twint',
      type: 'twint',
      name: 'TWINT',
      description: 'Pay instantly with your Swiss mobile payment app',
      icon: <Smartphone className="h-5 w-5 text-red-600" />,
      processingTime: 'Instant',
      available: true,
      recommended: true
    },
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express accepted',
      icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      fees: amount * 0.029, // 2.9% processing fee
      processingTime: 'Instant',
      available: true
    },
    {
      id: 'payatStudio',
      type: 'payatStudio',
      name: 'Pay at Studio',
      description: 'Reserve now, pay cash/card when you arrive',
      icon: <Building className="h-5 w-5 text-purple-600" />,
      processingTime: 'Reserve spot',
      requirements: ['Arrive 15 minutes early', 'Bring payment method'],
      available: allowPayAtStudio
    },
    {
      id: 'qrbill',
      type: 'qrbill',
      name: 'Swiss QR-Bill',
      description: 'Bank transfer with QR code (1-2 business days)',
      icon: <QrCode className="h-5 w-5 text-green-600" />,
      processingTime: '1-2 days',
      available: amount >= 10 // Minimum for QR-Bill
    },
    ...(allowInstallments && amount >= 100 ? [{
      id: 'installments',
      type: 'installments' as const,
      name: 'Pay in Installments',
      description: 'Split payment over 2-6 months',
      icon: <Euro className="h-5 w-5 text-orange-600" />,
      fees: amount * 0.05, // 5% installment fee
      processingTime: 'Instant approval',
      available: amount >= 100
    }] : [])
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentResult: PaymentResult = {
        method: selectedMethod,
        amount: remainingAmount,
        currency,
        reference: `YS-${Date.now()}`,
        status: 'completed',
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
        walletUsed: useWallet ? walletAmount : 0,
        remainingBalance: useWallet ? walletBalance - walletAmount : walletBalance
      };

      onPaymentComplete(paymentResult);
      toast.success(`Payment successful via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`);
      
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onPaymentMethod(methodId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatPrice(amount)}</span>
          </div>
          
          {useWallet && walletAmount > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Wallet Credit:</span>
                <span>-{formatPrice(walletAmount)}</span>
              </div>
              <Separator />
            </>
          )}
          
          {selectedMethod === 'card' && paymentMethods.find(m => m.id === 'card')?.fees && (
            <div className="flex justify-between text-orange-600">
              <span>Processing Fee (2.9%):</span>
              <span>+{formatPrice(paymentMethods.find(m => m.id === 'card')!.fees!)}</span>
            </div>
          )}
          
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total to Pay:</span>
            <span>{formatPrice(remainingAmount + (selectedMethod === 'card' ? paymentMethods.find(m => m.id === 'card')?.fees || 0 : 0))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Section */}
      {canUseWallet && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Wallet className="h-5 w-5" />
              Use Wallet Credit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Available Balance:</span>
              <span className="font-semibold text-green-600">{formatPrice(walletBalance)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useWallet"
                checked={useWallet}
                onCheckedChange={(checked) => {
                  setUseWallet(!!checked);
                  if (checked) {
                    setWalletAmount(maxWalletUsage);
                  } else {
                    setWalletAmount(0);
                  }
                }}
              />
              <Label htmlFor="useWallet" className="text-sm">
                Apply wallet credit to this order
              </Label>
            </div>
            
            {useWallet && (
              <div className="space-y-2">
                <Label htmlFor="walletAmount" className="text-sm">
                  Amount to use (max {formatPrice(maxWalletUsage)}):
                </Label>
                <Input
                  id="walletAmount"
                  type="number"
                  min="0"
                  max={maxWalletUsage}
                  step="0.50"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Math.min(parseFloat(e.target.value) || 0, maxWalletUsage))}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
            <div className="space-y-3">
              {paymentMethods.filter(method => method.available).map((method) => (
                <div key={method.id} className="space-y-3">
                  <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-muted">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex items-center gap-3 flex-1">
                      {method.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.recommended && <Badge className="text-xs">Recommended</Badge>}
                          {method.fees && (
                            <Badge variant="outline" className="text-xs">
                              +{formatPrice(method.fees)} fee
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {method.processingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Label>

                  {/* Method-specific forms */}
                  {selectedMethod === method.id && (
                    <div className="ml-8 space-y-3">
                      {method.type === 'card' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardExpiry">Expiry</Label>
                            <Input
                              id="cardExpiry"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardCvc">CVC</Label>
                            <Input
                              id="cardCvc"
                              placeholder="123"
                              value={cardDetails.cvc}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                      {method.type === 'twint' && (
                        <Alert>
                          <Smartphone className="h-4 w-4" />
                          <AlertDescription>
                            You'll be redirected to the TWINT app to complete your payment securely.
                          </AlertDescription>
                        </Alert>
                      )}

                      {method.type === 'payatStudio' && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p><strong>Important:</strong> Your spot will be reserved for 15 minutes after class start time.</p>
                              <ul className="text-sm space-y-1">
                                <li>• Arrive at least 15 minutes before class</li>
                                <li>• Bring cash or card for payment</li>
                                <li>• Late arrivals may forfeit their spot</li>
                              </ul>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      {method.type === 'installments' && allowInstallments && (
                        <div className="space-y-3">
                          <Label>Choose installment plan:</Label>
                          <Select value={installmentPlan} onValueChange={setInstallmentPlan}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2months">2 months - {formatPrice(amount / 2)} per month</SelectItem>
                              <SelectItem value="3months">3 months - {formatPrice(amount / 3)} per month</SelectItem>
                              <SelectItem value="6months">6 months - {formatPrice(amount / 6)} per month</SelectItem>
                            </SelectContent>
                          </Select>
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              A 5% processing fee applies to installment payments.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}

                      {method.type === 'qrbill' && (
                        <Alert>
                          <QrCode className="h-4 w-4" />
                          <AlertDescription>
                            A QR-Bill will be generated and sent to your email. 
                            Your booking will be confirmed once payment is received (1-2 business days).
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All payments are processed securely. We never store your payment information. 
          This transaction is protected by 256-bit SSL encryption.
        </AlertDescription>
      </Alert>

      {/* Process Payment Button */}
      <Button 
        onClick={handlePayment}
        disabled={!selectedMethod || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            {selectedMethod === 'payatStudio' ? 'Reserve Spot' : `Pay ${formatPrice(remainingAmount)}`}
          </>
        )}
      </Button>
    </div>
  );
}