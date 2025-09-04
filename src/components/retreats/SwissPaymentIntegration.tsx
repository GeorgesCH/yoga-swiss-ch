import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import {
  Smartphone,
  CreditCard,
  Building2,
  QrCode,
  Shield,
  Check,
  AlertCircle,
  Download,
  Mail,
  Clock,
  Info
} from 'lucide-react';

interface SwissPaymentIntegrationProps {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  paymentMethod: 'twint' | 'card' | 'qr-bill';
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export function SwissPaymentIntegration({
  amount,
  currency,
  orderId,
  customerEmail,
  paymentMethod,
  onPaymentSuccess,
  onPaymentError
}: SwissPaymentIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [twintQrCode, setTwintQrCode] = useState<string | null>(null);
  const [qrBillData, setQrBillData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  const handleTwintPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Simulate TWINT QR code generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock QR code for demo
      const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TWINT-${orderId}-${amount}`;
      setTwintQrCode(mockQrCode);
      
      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Simulate random success/failure for demo
          const success = Math.random() > 0.2; // 80% success rate
          
          if (success) {
            setPaymentStatus('success');
            const transactionId = `twint_${Date.now()}`;
            toast.success('TWINT payment successful!');
            onPaymentSuccess(transactionId);
          } else {
            throw new Error('Payment was cancelled or failed');
          }
        } catch (error) {
          setPaymentStatus('failed');
          toast.error('TWINT payment failed');
          onPaymentError('Payment was cancelled or failed');
        }
      }, 10000); // 10 seconds for demo
      
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Failed to initiate TWINT payment');
      onPaymentError('Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Simulate Stripe/PostFinance card processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        setPaymentStatus('success');
        const transactionId = `card_${Date.now()}`;
        toast.success('Card payment successful!');
        onPaymentSuccess(transactionId);
      } else {
        throw new Error('Card payment was declined');
      }
      
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Card payment failed');
      onPaymentError('Card payment was declined');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQrBillGeneration = async () => {
    setIsProcessing(true);
    
    try {
      // Generate Swiss QR-bill data
      const qrBillData = {
        creditorName: 'YogaSwiss AG',
        creditorAddress: 'Musterstrasse 123',
        creditorPostcode: '8000',
        creditorCity: 'Zürich',
        creditorCountry: 'CH',
        iban: 'CH93 0076 2011 6238 5295 7',
        amount: amount,
        currency: currency,
        debtorName: customerEmail.split('@')[0], // Simple extraction
        reference: orderId,
        additionalInfo: `Yoga Retreat Booking - Order #${orderId}`,
        qrCodeData: `SPC\n0200\n1\n${amount}\n${currency}\nCH9300762011623852957\nS\nYogaSwiss AG\nMusterstrasse 123\n8000\nZürich\nCH\n\n\n\n\n\n\n\n${orderId}\nYoga Retreat Booking`
      };
      
      setQrBillData(qrBillData);
      toast.success('QR-bill generated! Check your email for the invoice.');
      
      // Simulate email sending
      setTimeout(() => {
        toast.info('QR-bill invoice sent to your email address');
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to generate QR-bill');
      onPaymentError('Failed to generate QR-bill');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQrBill = () => {
    // In a real implementation, this would generate and download a PDF
    toast.info('QR-bill PDF would be downloaded in a real implementation');
  };

  const renderTwintPayment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          TWINT Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!twintQrCode ? (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Pay with TWINT</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Quick and secure payment with your TWINT app
              </p>
              <div className="text-2xl font-semibold">
                {currency} {amount.toLocaleString()}
              </div>
            </div>
            
            <Button 
              onClick={handleTwintPayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating QR Code...
                </div>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate TWINT QR Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4">Scan with TWINT App</h3>
              <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                <img 
                  src={twintQrCode} 
                  alt="TWINT QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>1. Open your TWINT app</p>
                <p>2. Scan this QR code</p>
                <p>3. Confirm the payment</p>
              </div>
            </div>
            
            {paymentStatus === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Waiting for payment confirmation...</span>
              </div>
            )}
            
            {paymentStatus === 'success' && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm">Payment successful!</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCardPayment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Credit/Debit Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              disabled={isProcessing}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                disabled={isProcessing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="Name on card"
              disabled={isProcessing}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">
              Secured by 3D Secure and SSL encryption
            </span>
          </div>
        </div>
        
        <Button 
          onClick={handleCardPayment}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Pay {currency} {amount.toLocaleString()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderQrBillPayment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Swiss QR-Bill
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrBillData ? (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Swiss QR-Bill Invoice</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We'll generate a Swiss QR-bill that you can pay through your bank
              </p>
              <div className="text-2xl font-semibold">
                {currency} {amount.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-start gap-2 text-orange-700">
                <Info className="h-4 w-4 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Payment Terms</p>
                  <p>Payment due within 14 days of invoice date</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleQrBillGeneration}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating Invoice...
                </div>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR-Bill Invoice
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Check className="h-4 w-4" />
                <span className="font-medium">QR-Bill Generated</span>
              </div>
              <p className="text-sm text-green-600">
                Your invoice has been generated and sent to {customerEmail}
              </p>
            </div>
            
            <Card className="border border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Number:</span>
                    <span className="font-medium">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{currency} {amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono text-xs">{qrBillData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBAN:</span>
                    <span className="font-mono text-xs">{qrBillData.iban}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-CH')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={downloadQrBill}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Resend Email
              </Button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2 text-blue-700">
                <Info className="h-4 w-4 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">How to Pay</p>
                  <p>Use your banking app to scan the QR code on the invoice, or make a manual transfer using the provided details.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  switch (paymentMethod) {
    case 'twint':
      return renderTwintPayment();
    case 'card':
      return renderCardPayment();
    case 'qr-bill':
      return renderQrBillPayment();
    default:
      return null;
  }
}