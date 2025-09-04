import React, { useState, useEffect } from 'react';
import { usePortal } from './PortalProvider';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { WaiverModal } from '../ui/waiver-modal';
import { CheckoutConsentManager } from '../ui/consent-manager';
import { SwissPaymentHub } from '../finance/SwissPaymentHub';
import { PolicyBadge, CancellationPolicyBadge } from '../ui/policy-badge';
import { useBrandTheme, useBrandStyles, useBrandAnalytics } from '../brands/BrandThemeProvider';
import { BrandService } from '../../utils/supabase/brands-service';
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
  Lock,
  Zap,
  Tag,
  X,
  FileText,
  Receipt,
  Building
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';

interface WalletCredits {
  totalCredits: number;
  availableCredits: number;
  expiringCredits: { amount: number; expiryDate: Date }[];
  value: number;
}

interface CouponCode {
  code: string;
  type: 'percentage' | 'fixed' | 'credits';
  value: number;
  description: string;
  minimumAmount?: number;
  maxDiscount?: number;
  validUntil?: Date;
  applicableItems?: string[];
  restrictions?: string[];
}

export function EnhancedCheckoutFlow({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { cart, removeFromCart, clearCart, cartTotal, customerProfile } = usePortal();
  const { currentBrand, setBrandByEntity } = useBrandTheme();
  const { getBrandStyle, getBrandClassName } = useBrandStyles();
  const { track } = useBrandAnalytics();
  
  const [step, setStep] = useState<'cart' | 'details' | 'waiver' | 'payment' | 'review' | 'confirmation'>('cart');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoApplyCredits, setAutoApplyCredits] = useState(true);
  const [useWalletCredits, setUseWalletCredits] = useState(true);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [waiverData, setWaiverData] = useState<any>(null);
  const [consentData, setConsentData] = useState<any>(null);
  const [hostBrand, setHostBrand] = useState<any>(null);

  // Mock wallet credits data
  const walletCredits: WalletCredits = {
    totalCredits: 150,
    availableCredits: 120, // Some might be reserved
    expiringCredits: [
      { amount: 30, expiryDate: new Date(2025, 0, 15) },
      { amount: 25, expiryDate: new Date(2025, 1, 28) }
    ],
    value: 144 // 120 * 1.2 CHF per credit
  };

  useEffect(() => {
    loadHostBrand();
  }, [cart]);

  const loadHostBrand = async () => {
    if (cart.length === 0) return;
    
    // Get brand from the first item's studio (host brand takes precedence)
    const firstItem = cart[0];
    if (firstItem.studioId) {
      try {
        await setBrandByEntity('studio', firstItem.studioId);
        const brand = await BrandService.resolveEntityBrand('studio', firstItem.studioId);
        setHostBrand(brand);
        
        // Track checkout start (don't await to avoid blocking)
        if (brand) {
          track('booking_start', {
            entityType: 'studio',
            entityId: firstItem.studioId,
            value: total
          }).catch(err => console.warn('Failed to track checkout start:', err));
        }
      } catch (error) {
        console.warn('Failed to load host brand:', error);
      }
    }
  };

  // Available coupons database
  const availableCoupons: CouponCode[] = [
    {
      code: 'FIRST10',
      type: 'percentage',
      value: 10,
      description: '10% off your first purchase',
      minimumAmount: 20,
      maxDiscount: 50,
      validUntil: new Date(2025, 2, 31),
      restrictions: ['Valid for first-time customers only']
    },
    {
      code: 'STUDENT20',
      type: 'percentage',
      value: 20,
      description: '20% student discount',
      minimumAmount: 30,
      maxDiscount: 100,
      restrictions: ['Valid student ID required', 'Cannot combine with other offers']
    },
    {
      code: 'WINTER25',
      type: 'fixed',
      value: 25,
      description: 'CHF 25 off winter classes',
      minimumAmount: 75,
      applicableItems: ['winter-classes'],
      validUntil: new Date(2025, 1, 28)
    },
    {
      code: 'CREDITS50',
      type: 'credits',
      value: 50,
      description: '50 bonus credits',
      minimumAmount: 100,
      restrictions: ['Credits expire in 6 months']
    }
  ];

  // Form states
  const [customerDetails, setCustomerDetails] = useState({
    firstName: customerProfile?.firstName || '',
    lastName: customerProfile?.lastName || '',
    email: customerProfile?.email || '',
    phone: customerProfile?.phone || '',
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
    cancellation: false,
    waiver: false
  });

  // Calculate pricing
  const subtotal = cartTotal;
  const creditAmountToUse = useWalletCredits && autoApplyCredits 
    ? Math.min(walletCredits.availableCredits * 1.2, subtotal)
    : 0;
  
  const discountAmount = appliedCoupon ? calculateCouponDiscount(appliedCoupon, subtotal) : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const afterCredits = Math.max(0, afterDiscount - creditAmountToUse);
  const taxRate = 0.077; // 7.7% Swiss VAT
  const tax = afterCredits * taxRate;
  const total = afterCredits + tax;

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

  function calculateCouponDiscount(coupon: CouponCode, amount: number): number {
    if (coupon.minimumAmount && amount < coupon.minimumAmount) return 0;
    
    switch (coupon.type) {
      case 'percentage':
        const percentDiscount = amount * (coupon.value / 100);
        return coupon.maxDiscount ? Math.min(percentDiscount, coupon.maxDiscount) : percentDiscount;
      case 'fixed':
        return Math.min(coupon.value, amount);
      case 'credits':
        return 0; // Credits are handled separately
      default:
        return 0;
    }
  }

  const applyCouponCode = () => {
    if (!couponCode.trim()) return;
    
    const foundCoupon = availableCoupons.find(
      c => c.code.toLowerCase() === couponCode.toLowerCase().trim()
    );
    
    if (!foundCoupon) {
      toast.error('Invalid coupon code');
      return;
    }
    
    if (foundCoupon.validUntil && new Date() > foundCoupon.validUntil) {
      toast.error('This coupon has expired');
      return;
    }
    
    if (foundCoupon.minimumAmount && subtotal < foundCoupon.minimumAmount) {
      toast.error(`Minimum order amount is ${formatPrice(foundCoupon.minimumAmount)}`);
      return;
    }
    
    setAppliedCoupon(foundCoupon);
    setCouponCode('');
    toast.success(`Coupon "${foundCoupon.code}" applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 75) return '1h 15min';
    if (minutes === 90) return '1h 30min';
    if (minutes < 60) return `${minutes}min`;
    return `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}min` : ''}`;
  };

  const requiresWaiver = cart.some(item => item.type === 'class'); // All classes require waiver

  const handleProcessPayment = async (paymentData?: any) => {
    setIsProcessing(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const bookingData = {
        items: cart,
        payment: paymentData || { method: paymentMethod, amount: total },
        waiver: waiverData,
        consent: consentData,
        pricing: { subtotal, discount: discountAmount, walletCredit: creditAmountToUse, total },
        confirmation: {
          number: `YS-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      };

      setStep('confirmation');
      sendConfirmationEmail(bookingData);
      
      setTimeout(() => {
        toast.success('Payment successful! Booking confirmed.');
        clearCart();
        onPageChange('account-dashboard');
      }, 2000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendConfirmationEmail = (bookingData: any) => {
    // Comprehensive confirmation email content as per Victoria's requirements
    const emailData = {
      to: customerDetails.email,
      subject: `Booking Confirmation - ${bookingData.confirmation.number}`,
      template: 'booking_confirmation',
      brand: hostBrand,
      content: {
        bookingDetails: bookingData.items,
        brandLogo: hostBrand ? `/api/brand-assets/logo_primary?brand=${hostBrand.id}&v=${hostBrand.version}` : null,
        brandColors: hostBrand?.theme.color,
        policies: '24h free cancellation policy',
        arrivalInstructions: 'Please arrive 5 minutes early',
        entryInstructions: 'Enter via main hotel lobby',
        paymentStatus: bookingData.payment.method === 'payatStudio' ? 'Payment required at studio' : 'Payment confirmed',
        instructorContact: '+41 XX XXX XX XX',
        calendarAttachment: true,
        cancellationLinks: true,
        brandFooter: hostBrand ? {
          name: hostBrand.name,
          website: hostBrand.content?.contact_info?.website,
          social: hostBrand.content?.social_links
        } : null
      }
    };
    
    console.log('Sending branded confirmation email:', emailData);
  };

  const handleWaiverAccept = (data: any) => {
    setWaiverData(data);
    setWaiverAccepted(true);
    setShowWaiverModal(false);
    setStep('payment');
    toast.success('Waiver accepted. Proceeding to payment...');
  };

  const handleConsentChange = (data: any) => {
    setConsentData(data);
  };

  const proceedToNextStep = () => {
    switch (step) {
      case 'cart':
        setStep('details');
        break;
      case 'details':
        if (requiresWaiver && !waiverAccepted) {
          setShowWaiverModal(true);
        } else {
          setStep('payment');
        }
        break;
      case 'payment':
        setStep('review');
        break;
      case 'review':
        handleProcessPayment();
        break;
    }
  };

  const canProceedToDetails = cart.length > 0;
  const canProceedToPayment = customerDetails.firstName && customerDetails.lastName && customerDetails.email;
  const canProceedToReview = paymentMethod && (
    (paymentMethod === 'card' && paymentDetails.cardNumber && paymentDetails.expiryDate && paymentDetails.cvv) ||
    (paymentMethod === 'twint' && paymentDetails.twintPhone) ||
    paymentMethod === 'wallet'
  );
  const canCompleteOrder = agreements.terms && agreements.privacy && agreements.cancellation && 
    (!requiresWaiver || waiverAccepted);

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

  // Brand-aware styling
  const brandStyles = {
    '--checkout-primary': getBrandStyle('primaryColor'),
    '--checkout-secondary': getBrandStyle('secondaryColor'),
    '--checkout-accent': getBrandStyle('accentColor'),
    '--checkout-radius': getBrandStyle('borderRadius'),
  } as React.CSSProperties;

  const brandClassName = getBrandClassName('brand-checkout-flow');

  return (
    <div 
      className={`max-w-6xl mx-auto space-y-6 ${brandClassName}`}
      style={brandStyles}
    >
      {/* Brand Header */}
      {hostBrand && step !== 'confirmation' && (
        <div className="text-center py-4 border-b">
          <div className="flex items-center justify-center gap-3">
            {hostBrand.assets?.logo_primary && (
              <img 
                src={`/api/brand-assets/logo_primary?brand=${hostBrand.id}&v=${hostBrand.version}`}
                alt={hostBrand.name}
                className="h-8"
              />
            )}
            <div>
              <h2 className="font-semibold" style={{ color: getBrandStyle('primaryColor') }}>
                {hostBrand.name}
              </h2>
              {hostBrand.tagline && (
                <p className="text-sm text-muted-foreground">{hostBrand.tagline}</p>
              )}
            </div>
          </div>
        </div>
      )}
      {step !== 'confirmation' && (
        <>
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {['cart', 'details', requiresWaiver ? 'waiver' : null, 'payment', 'review'].filter(Boolean).map((stepName, index, array) => (
              <div key={stepName} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-primary text-primary-foreground' 
                    : array.indexOf(step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {array.indexOf(step) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : stepName === 'waiver' ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < array.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    array.indexOf(step) > index
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'confirmation' && (
        <div className="max-w-md mx-auto py-12 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Booking Confirmed! 🎉</h2>
            <p className="text-muted-foreground">
              Your booking has been confirmed and you'll receive a detailed confirmation email shortly.
            </p>
          </div>

          <Card className="text-left">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium">What's next:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Confirmation email with all details</li>
                <li>✓ Calendar invitation (.ics file)</li>
                <li>✓ 24h cancellation policy applies</li>
                <li>✓ Arrive 5 minutes early to class</li>
                <li>✓ Enter via main hotel lobby</li>
                {paymentMethod === 'payatStudio' && (
                  <li className="text-orange-600">⚠ Remember to bring payment to studio</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={() => onPageChange('account-dashboard')} className="w-full">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => onPageChange('explore')} className="w-full">
              Continue Browsing
            </Button>
          </div>
        </div>
      )}

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
                            <span>{item.time} ({formatDuration(item.duration || 60)})</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Policies and Requirements */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <CancellationPolicyBadge timeLimit="24h" className="text-xs" />
                        {item.type === 'class' && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Waiver Required
                          </Badge>
                        )}
                        {item.duration === 75 && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            75 min class
                          </Badge>
                        )}
                      </div>
                      
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
                    onClick={proceedToNextStep}
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
                  Your Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerDetails.firstName}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerDetails.lastName}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+41 XX XXX XX XX"
                    />
                  </div>
                </div>

                {/* Communication Preferences */}
                <CheckoutConsentManager onConsentChange={handleConsentChange} />

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => setStep('cart')}>
                    Back to Cart
                  </Button>
                  <Button 
                    onClick={proceedToNextStep}
                    disabled={!canProceedToPayment}
                  >
                    {requiresWaiver ? 'Review Waiver' : 'Proceed to Payment'}
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
              <CardContent>
                <SwissPaymentHub
                  amount={total}
                  walletBalance={creditAmountToUse}
                  allowPayAtStudio={cart.every(item => item.type === 'class')}
                  onPaymentComplete={handleProcessPayment}
                  onPaymentMethod={setPaymentMethod}
                />
                
                <div className="flex justify-between items-center pt-6">
                  <Button variant="outline" onClick={() => setStep('details')}>
                    Back to Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Final Review */}
                <div className="space-y-4">
                  <h3 className="font-medium">Order Review</h3>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.date && formatDate(item.date)} at {item.time}
                        </div>
                      </div>
                      <div className="font-medium">{formatPrice(item.price)}</div>
                    </div>
                  ))}
                </div>

                {/* Final Agreements */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreements.terms}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, terms: !!checked }))}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="cancellation" 
                      checked={agreements.cancellation}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, cancellation: !!checked }))}
                    />
                    <Label htmlFor="cancellation" className="text-sm">
                      I understand the 24h cancellation policy
                    </Label>
                  </div>
                  
                  {requiresWaiver && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Waiver completed</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowWaiverModal(true)}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" onClick={() => setStep('payment')}>
                    Back to Payment
                  </Button>
                  <Button 
                    onClick={proceedToNextStep}
                    disabled={!canCompleteOrder || isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Complete Order - ${formatPrice(total)}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Order Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Summary */}
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{item.name}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Coupon Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Promo Code</span>
                </div>
                
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applyCouponCode()}
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyCouponCode}
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700">{appliedCoupon.code}</Badge>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm text-green-700 mt-1">{appliedCoupon.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeCoupon}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Wallet Credits Section */}
              {walletCredits.availableCredits > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium">Wallet Credits</span>
                    </div>
                    <Switch
                      checked={useWalletCredits}
                      onCheckedChange={setUseWalletCredits}
                    />
                  </div>
                  
                  {useWalletCredits && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Available credits:</span>
                          <span className="font-medium">{walletCredits.availableCredits} credits</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Credit value:</span>
                          <span className="font-medium">{formatPrice(walletCredits.value)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="auto-apply-credits"
                            checked={autoApplyCredits}
                            onCheckedChange={setAutoApplyCredits}
                          />
                          <Label htmlFor="auto-apply-credits" className="text-xs">
                            Auto-apply credits to reduce total
                          </Label>
                        </div>
                        
                        {walletCredits.expiringCredits.length > 0 && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {walletCredits.expiringCredits[0].amount} credits expire on{' '}
                              {formatDate(walletCredits.expiringCredits[0].expiryDate)}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Separator />
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                {useWalletCredits && creditAmountToUse > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Wallet Credits:</span>
                    <span>-{formatPrice(creditAmountToUse)}</span>
                  </div>
                )}
                
                {afterCredits > 0 && (
                  <div className="flex justify-between">
                    <span>Tax (7.7%):</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatPrice(Math.max(0, total))}</span>
              </div>
              
              {total === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    Your order is fully covered by credits and discounts!
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Savings Summary */}
              {(discountAmount > 0 || creditAmountToUse > 0) && (
                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">You're saving</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatPrice(discountAmount + creditAmountToUse)}
                  </div>
                  {discountAmount > 0 && creditAmountToUse > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      {formatPrice(discountAmount)} coupon + {formatPrice(creditAmountToUse)} credits
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Security Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-center">
                <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Secure Checkout</p>
                  <p className="text-muted-foreground">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Waiver Modal */}
      <WaiverModal
        isOpen={showWaiverModal}
        onClose={() => setShowWaiverModal(false)}
        onAccept={handleWaiverAccept}
        classTitle={cart.map(item => item.name).join(', ')}
        studioName={cart[0]?.studioName || 'YogaSwiss'}
        waiverType="yoga"
        requiresSignature={true}
        requiresEmergencyContact={true}
      />
    </div>
  );
}