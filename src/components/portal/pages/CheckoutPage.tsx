import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { Checkbox } from '../../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  CreditCard, 
  Smartphone, 
  Wallet,
  Shield,
  Info,
  Gift,
  Percent,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';

export function CheckoutPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { cart, removeFromCart, clearCart, cartTotal } = usePortal();
  const [step, setStep] = useState<'cart' | 'details' | 'payment' | 'review'>('cart');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    yogaExperience: 'beginner'
  });

  const [billingDetails, setBillingDetails] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'Switzerland',
    company: '',
    vatNumber: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    twintPhone: '',
    savePaymentMethod: false
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
    cancellation: false
  });

  // Mock discount calculation
  const [discount, setDiscount] = useState(0);
  const taxRate = 0.077; // 7.7% Swiss VAT
  const subtotal = cartTotal - discount;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === 'first10') {
      setDiscount(cartTotal * 0.1);
    } else if (promoCode.toLowerCase() === 'student20') {
      setDiscount(cartTotal * 0.2);
    } else {
      setDiscount(0);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPageChange('order-success');
      clearCart();
    }, 3000);
  };

  const canProceedToDetails = cart.length > 0;
  const canProceedToPayment = customerDetails.firstName && customerDetails.lastName && customerDetails.email;
  const canProceedToReview = paymentMethod && (
    (paymentMethod === 'card' && paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvv) ||
    (paymentMethod === 'twint' && paymentDetails.twintPhone) ||
    paymentMethod === 'wallet'
  );
  const canCompleteOrder = agreements.terms && agreements.privacy && agreements.cancellation;

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground">
                Looks like you haven't added any classes yet. Explore our schedule to find your perfect practice.
              </p>
            </div>
            <Button onClick={() => onPageChange('explore')}>
              Explore Classes
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {['cart', 'details', 'payment', 'review'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === stepName 
                ? 'bg-primary text-primary-foreground' 
                : index < ['cart', 'details', 'payment', 'review'].indexOf(step)
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}>
              {index < ['cart', 'details', 'payment', 'review'].indexOf(step) ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${
                index < ['cart', 'details', 'payment', 'review'].indexOf(step)
                  ? 'bg-green-500'
                  : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {step === 'cart' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Your Cart ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.instructorName && `with ${item.instructorName}`}
                          </p>
                          {item.studioName && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.studioName}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {item.date && item.time && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="sm" disabled>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => onPageChange('explore')}>
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={() => setStep('details')}
                    disabled={!canProceedToDetails}
                  >
                    Proceed to Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'details' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerDetails.firstName}
                      onChange={(e) => setCustomerDetails({...customerDetails, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerDetails.lastName}
                      onChange={(e) => setCustomerDetails({...customerDetails, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="yogaExperience">Yoga Experience</Label>
                  <RadioGroup 
                    value={customerDetails.yogaExperience}
                    onValueChange={(value) => setCustomerDetails({...customerDetails, yogaExperience: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner (0-1 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate (1-3 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced (3+ years)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={customerDetails.emergencyContact}
                      onChange={(e) => setCustomerDetails({...customerDetails, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={customerDetails.emergencyPhone}
                      onChange={(e) => setCustomerDetails({...customerDetails, emergencyPhone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions or Injuries</Label>
                  <Input
                    id="medicalConditions"
                    placeholder="Please list any conditions your instructor should know about"
                    value={customerDetails.medicalConditions}
                    onChange={(e) => setCustomerDetails({...customerDetails, medicalConditions: e.target.value})}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your personal information is securely stored and only shared with your instructors 
                    to ensure a safe practice environment.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => setStep('cart')}>
                    Back to Cart
                  </Button>
                  <Button 
                    onClick={() => setStep('payment')}
                    disabled={!canProceedToPayment}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card
                    </TabsTrigger>
                    <TabsTrigger value="twint" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      TWINT
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="card" className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        value={paymentDetails.cardholderName}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="twint" className="space-y-4">
                    <div>
                      <Label htmlFor="twintPhone">TWINT Phone Number</Label>
                      <Input
                        id="twintPhone"
                        placeholder="+41 79 123 45 67"
                        value={paymentDetails.twintPhone}
                        onChange={(e) => setPaymentDetails({...paymentDetails, twintPhone: e.target.value})}
                      />
                    </div>
                    <Alert>
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        You'll receive a TWINT payment request on your mobile device.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="wallet" className="space-y-4">
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Use Credits</h3>
                      <p className="text-muted-foreground">
                        You have CHF 150.00 in credits available
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Remaining balance will be charged to your default payment method
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="savePayment"
                    checked={paymentDetails.savePaymentMethod}
                    onCheckedChange={(checked) => 
                      setPaymentDetails({...paymentDetails, savePaymentMethod: checked as boolean})
                    }
                  />
                  <Label htmlFor="savePayment" className="text-sm">
                    Save payment method for future purchases
                  </Label>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your payment information is encrypted and securely processed. 
                    We never store your full card details.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => setStep('details')}>
                    Back to Details
                  </Button>
                  <Button 
                    onClick={() => setStep('review')}
                    disabled={!canProceedToReview}
                  >
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Summary</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.date && formatDate(item.date)} {item.time}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.studioName}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Customer Details Summary */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Customer Details</h3>
                  <p>{customerDetails.firstName} {customerDetails.lastName}</p>
                  <p className="text-sm text-muted-foreground">{customerDetails.email}</p>
                  {customerDetails.phone && (
                    <p className="text-sm text-muted-foreground">{customerDetails.phone}</p>
                  )}
                </div>

                <Separator />

                {/* Payment Method Summary */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Method</h3>
                  <div className="flex items-center gap-2">
                    {paymentMethod === 'card' && (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Card ending in ****{paymentDetails.cardNumber.slice(-4)}</span>
                      </>
                    )}
                    {paymentMethod === 'twint' && (
                      <>
                        <Smartphone className="h-4 w-4" />
                        <span>TWINT ({paymentDetails.twintPhone})</span>
                      </>
                    )}
                    {paymentMethod === 'wallet' && (
                      <>
                        <Wallet className="h-4 w-4" />
                        <span>Wallet Credits</span>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Terms and Agreements */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Terms & Agreements</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms"
                        checked={agreements.terms}
                        onCheckedChange={(checked) => 
                          setAgreements({...agreements, terms: checked as boolean})
                        }
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the <button className="text-primary underline">Terms of Service</button> *
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="privacy"
                        checked={agreements.privacy}
                        onCheckedChange={(checked) => 
                          setAgreements({...agreements, privacy: checked as boolean})
                        }
                      />
                      <Label htmlFor="privacy" className="text-sm">
                        I agree to the <button className="text-primary underline">Privacy Policy</button> *
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="cancellation"
                        checked={agreements.cancellation}
                        onCheckedChange={(checked) => 
                          setAgreements({...agreements, cancellation: checked as boolean})
                        }
                      />
                      <Label htmlFor="cancellation" className="text-sm">
                        I understand the <button className="text-primary underline">Cancellation Policy</button> *
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="marketing"
                        checked={agreements.marketing}
                        onCheckedChange={(checked) => 
                          setAgreements({...agreements, marketing: checked as boolean})
                        }
                      />
                      <Label htmlFor="marketing" className="text-sm">
                        I would like to receive marketing communications (optional)
                      </Label>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    By completing this purchase, you agree to our terms and confirm that 
                    all information provided is accurate.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => setStep('payment')}>
                    Back to Payment
                  </Button>
                  <Button 
                    onClick={handleProcessPayment}
                    disabled={!canCompleteOrder || isProcessing}
                    className="min-w-32"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Complete Order
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>VAT (7.7%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyPromoCode}>
                    Apply
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Free cancellation 24h before class</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gift className="h-4 w-4" />
                  <span>Earn loyalty points with this purchase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}