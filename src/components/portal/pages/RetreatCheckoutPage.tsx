import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { Separator } from '../../ui/separator';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { toast } from 'sonner@2.0.3';
import {
  ChevronLeft,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Check,
  Smartphone,
  Building2,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface RetreatCheckoutPageProps {
  onPageChange: (page: string) => void;
  bookingData?: any;
}

// Mock booking data
const mockBookingData = {
  retreat: {
    id: 'alpine-serenity-2024',
    title: 'Alpine Serenity Yoga Retreat',
    subtitle: 'Discover inner peace surrounded by the Swiss Alps',
    location: 'Interlaken, Switzerland',
    startDate: '2024-07-15',
    endDate: '2024-07-21',
    duration: '7 days, 6 nights',
    heroImage: 'https://images.unsplash.com/photo-1679161551610-67dd4756f8db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcmV0cmVhdCUyMG1vdW50YWlucyUyMGJlYXV0aWZ1bCUyMG5hdHVyZXxlbnwxfHx8fDE3NTY3NzEyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  selection: {
    roomType: {
      id: 'private-double',
      name: 'Private Double Room',
      description: 'Luxurious private room with king bed and mountain balcony',
      price: 2850,
      singleSupplement: 450
    },
    occupancy: 1,
    addOns: [
      { id: 'spa-package', name: 'Spa Package', price: 290 },
      { id: 'airport-transfer', name: 'Airport Transfer', price: 120 }
    ]
  },
  pricing: {
    roomRate: 2850,
    singleSupplement: 450,
    addOns: 410,
    subtotal: 3710,
    taxes: 290,
    total: 4000
  }
};

export function RetreatCheckoutPage({ onPageChange, bookingData = mockBookingData }: RetreatCheckoutPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: 'CH',
    address: '',
    city: '',
    postalCode: '',
    country: 'Switzerland'
  });
  
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: ''
  });

  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('twint');
  const [paymentPlan, setPaymentPlan] = useState('full');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedWaiver, setAcceptedWaiver] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, title: 'Guest Information', description: 'Your contact details' },
    { id: 2, title: 'Health & Dietary', description: 'Requirements and conditions' },
    { id: 3, title: 'Payment', description: 'Choose payment method' },
    { id: 4, title: 'Confirmation', description: 'Review and complete' }
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
          toast.error('Please fill in all required guest information');
          return false;
        }
        break;
      case 2:
        if (!emergencyContact.name || !emergencyContact.phone) {
          toast.error('Please provide emergency contact information');
          return false;
        }
        break;
      case 3:
        if (!paymentMethod) {
          toast.error('Please select a payment method');
          return false;
        }
        break;
      case 4:
        if (!acceptedTerms || !acceptedWaiver) {
          toast.error('Please accept the terms and waiver to complete booking');
          return false;
        }
        break;
    }
    return true;
  };

  const handleCompleteBooking = async () => {
    if (!acceptedTerms || !acceptedWaiver) {
      toast.error('Please accept all terms and conditions');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate booking processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Booking confirmed! Check your email for details.');
      onPageChange('account-dashboard');
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Guest Information</h3>
              <p className="text-sm text-muted-foreground">
                Please provide your contact details for the booking
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={guestInfo.firstName}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={guestInfo.lastName}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+41 79 123 45 67"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={guestInfo.dateOfBirth}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Select
                  value={guestInfo.nationality}
                  onValueChange={(value) => setGuestInfo(prev => ({ ...prev, nationality: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CH">Switzerland</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="AT">Austria</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Address Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={guestInfo.address}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street name and number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={guestInfo.city}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={guestInfo.postalCode}
                      onChange={(e) => setGuestInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="Postal code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={guestInfo.country}
                      onValueChange={(value) => setGuestInfo(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Switzerland">Switzerland</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Austria">Austria</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Italy">Italy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Health & Dietary Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Help us prepare for your stay by sharing any dietary or health requirements
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Requirements</Label>
                <Textarea
                  id="dietary"
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  placeholder="Please describe any dietary restrictions, allergies, or preferences (vegetarian, vegan, gluten-free, etc.)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical">Medical Conditions & Injuries</Label>
                <Textarea
                  id="medical"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="Please list any medical conditions, injuries, or physical limitations we should be aware of"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This information is kept confidential and helps our instructors provide appropriate modifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special">Special Requests</Label>
                <Textarea
                  id="special"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any other special requests or requirements for your stay"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Emergency Contact *</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Full Name *</Label>
                    <Input
                      id="emergencyName"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Input
                      id="relationship"
                      value={emergencyContact.relationship}
                      onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone Number *</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+41 79 123 45 67"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Payment Method</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred payment method and plan
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Payment Plan</Label>
                <RadioGroup value={paymentPlan} onValueChange={setPaymentPlan}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Full Payment</p>
                            <p className="text-sm text-muted-foreground">Pay the complete amount now</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">CHF {bookingData.pricing.total.toLocaleString()}</p>
                            <p className="text-sm text-green-600">Best value</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="deposit" id="deposit" />
                      <Label htmlFor="deposit" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Deposit + Balance</p>
                            <p className="text-sm text-muted-foreground">Pay 30% now, 70% 30 days before retreat</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">CHF {Math.round(bookingData.pricing.total * 0.3).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Due now</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="twint" id="twint" />
                      <Label htmlFor="twint" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">TWINT</p>
                            <p className="text-sm text-muted-foreground">Quick and secure Swiss mobile payment</p>
                          </div>
                          <Badge className="ml-auto bg-green-100 text-green-700">Recommended</Badge>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">QR invoice will be sent to your email</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Secure Payment</p>
                  <p className="text-blue-700">
                    All payments are processed securely. Your payment information is encrypted and never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Booking Summary</h3>
              <p className="text-sm text-muted-foreground">
                Please review your booking details before confirming
              </p>
            </div>

            {/* Booking Review */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="aspect-[16/10] w-24 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={bookingData.retreat.heroImage}
                        alt={bookingData.retreat.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{bookingData.retreat.title}</h4>
                      <p className="text-sm text-muted-foreground">{bookingData.retreat.subtitle}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {bookingData.retreat.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {bookingData.retreat.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Room: {bookingData.selection.roomType.name}</span>
                      <span>CHF {bookingData.pricing.roomRate.toLocaleString()}</span>
                    </div>
                    {bookingData.pricing.singleSupplement > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Single supplement</span>
                        <span>CHF {bookingData.pricing.singleSupplement.toLocaleString()}</span>
                      </div>
                    )}
                    {bookingData.selection.addOns.map((addOn: any) => (
                      <div key={addOn.id} className="flex justify-between text-sm">
                        <span>{addOn.name}</span>
                        <span>CHF {addOn.price.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm">
                      <span>Taxes & fees</span>
                      <span>CHF {bookingData.pricing.taxes.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>CHF {bookingData.pricing.total.toLocaleString()}</span>
                    </div>
                    {paymentPlan === 'deposit' && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Due now (30%)</span>
                        <span>CHF {Math.round(bookingData.pricing.total * 0.3).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guest Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">{guestInfo.firstName} {guestInfo.lastName}</p>
                    <p className="text-muted-foreground">{guestInfo.email}</p>
                    <p className="text-muted-foreground">{guestInfo.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium">Emergency Contact</p>
                    <p className="text-muted-foreground">{emergencyContact.name}</p>
                    <p className="text-muted-foreground">{emergencyContact.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I accept the{' '}
                  <button className="text-primary underline hover:no-underline">
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button className="text-primary underline hover:no-underline">
                    Cancellation Policy
                  </button>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="waiver"
                  checked={acceptedWaiver}
                  onCheckedChange={setAcceptedWaiver}
                />
                <Label htmlFor="waiver" className="text-sm cursor-pointer">
                  I have read and agree to the{' '}
                  <button className="text-primary underline hover:no-underline">
                    Liability Waiver
                  </button>{' '}
                  and understand the physical nature of yoga practice
                </Label>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">Cancellation Policy</p>
                  <p className="text-orange-700">
                    Free cancellation until 30 days before the retreat. 50% refund between 30-14 days, 
                    25% refund between 14-7 days. No refund within 7 days unless medical emergency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => onPageChange('retreat-detail')}
                className="p-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Complete Your Booking</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep > step.id 
                      ? 'bg-green-600 text-white' 
                      : currentStep === step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mx-2
                      ${currentStep > step.id ? 'bg-green-600' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <Card>
              <CardContent className="pt-6">
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteBooking}
                  disabled={isProcessing || !acceptedTerms || !acceptedWaiver}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Booking
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="aspect-[16/10] w-16 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={bookingData.retreat.heroImage}
                        alt={bookingData.retreat.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{bookingData.retreat.title}</h4>
                      <p className="text-xs text-muted-foreground">{bookingData.retreat.location}</p>
                      <p className="text-xs text-muted-foreground">{bookingData.retreat.duration}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{bookingData.selection.roomType.name}</span>
                      <span>CHF {bookingData.pricing.roomRate.toLocaleString()}</span>
                    </div>
                    {bookingData.pricing.singleSupplement > 0 && (
                      <div className="flex justify-between">
                        <span>Single supplement</span>
                        <span>CHF {bookingData.pricing.singleSupplement.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span>CHF {bookingData.pricing.addOns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & fees</span>
                      <span>CHF {bookingData.pricing.taxes.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>CHF {bookingData.pricing.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Free cancellation until 30 days before</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}