import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Search, User, Calendar, MapPin, Clock, 
  CreditCard, Wallet, Gift, AlertCircle,
  CheckCircle, Users, Timer, Phone, Mail,
  Plus, Minus, Info
} from 'lucide-react';

interface RegistrationBookingDialogProps {
  onClose: () => void;
}

// Mock data for available classes
const mockAvailableClasses = [
  {
    id: 'o1',
    className: 'Vinyasa Flow',
    instructor: 'Sarah Chen',
    date: '2024-01-23',
    time: '09:00',
    duration: 75,
    location: 'Studio A',
    capacity: 20,
    registered: 15,
    waitlist: 2,
    price: 28.00,
    dropInAllowed: true,
    membershipAccess: ['unlimited_monthly', 'premium_annual'],
    creditsRequired: 1,
    tags: ['beginner_friendly', 'morning']
  },
  {
    id: 'o2',
    className: 'Hot Yoga',
    instructor: 'Lisa Anderson',
    date: '2024-01-23',
    time: '18:30',
    duration: 60,
    location: 'Studio C',
    capacity: 25,
    registered: 24,
    waitlist: 0,
    price: 32.00,
    dropInAllowed: true,
    membershipAccess: ['unlimited_monthly', 'premium_annual', 'hot_yoga_pass'],
    creditsRequired: 1,
    tags: ['advanced', 'evening']
  },
  {
    id: 'o3',
    className: 'Beginner Hatha',
    instructor: 'Tom Wilson',
    date: '2024-01-23',
    time: '19:30',
    duration: 60,
    location: 'Studio B',
    capacity: 15,
    registered: 8,
    waitlist: 0,
    price: 25.00,
    dropInAllowed: true,
    membershipAccess: ['unlimited_monthly', 'beginner_package'],
    creditsRequired: 1,
    tags: ['beginner', 'gentle']
  }
];

// Mock customer data
const mockCustomers = [
  {
    id: 'c1',
    firstName: 'Emma',
    lastName: 'Weber',
    email: 'emma.weber@email.ch',
    phone: '+41 79 123 4567',
    walletBalance: 45.50,
    credits: 3,
    memberships: [
      {
        id: 'm1',
        type: 'unlimited_monthly',
        name: 'Unlimited Monthly',
        status: 'active',
        classesRemaining: 'unlimited'
      }
    ]
  },
  {
    id: 'c2',
    firstName: 'Marc',
    lastName: 'Dubois',
    email: 'marc.dubois@email.ch',
    phone: '+41 76 234 5678',
    walletBalance: 12.00,
    credits: 0,
    memberships: []
  }
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'twint', name: 'TWINT', icon: Phone },
  { id: 'account_credit', name: 'Account Credit', icon: Wallet },
  { id: 'cash', name: 'Cash (POS)', icon: Wallet }
];

export function RegistrationBookingDialog({ onClose }: RegistrationBookingDialogProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'select_class' | 'select_customer' | 'select_ticket' | 'payment' | 'confirm'>('select_class');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [ticketType, setTicketType] = useState<'drop_in' | 'membership' | 'credits' | 'comp'>('drop_in');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [useAccountCredit, setUseAccountCredit] = useState(false);
  const [accountCreditAmount, setAccountCreditAmount] = useState(0);
  const [addToWaitlist, setAddToWaitlist] = useState(false);
  const [createNewCustomer, setCreateNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Filter customers based on search
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.firstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getAvailableTicketTypes = (cls: any, customer: any) => {
    const types = [];
    
    // Drop-in option
    if (cls.dropInAllowed) {
      types.push({
        id: 'drop_in',
        name: 'Drop-in',
        description: `Single class - ${formatCurrency(cls.price)}`,
        price: cls.price,
        available: true
      });
    }

    // Membership options
    if (customer?.memberships) {
      customer.memberships.forEach(membership => {
        if (membership.status === 'active' && cls.membershipAccess.includes(membership.type)) {
          types.push({
            id: 'membership',
            name: membership.name,
            description: 'Included in membership',
            price: 0,
            available: true,
            membershipId: membership.id
          });
        }
      });
    }

    // Credits option
    if (customer?.credits >= cls.creditsRequired) {
      types.push({
        id: 'credits',
        name: 'Class Credits',
        description: `${cls.creditsRequired} credit${cls.creditsRequired > 1 ? 's' : ''}`,
        price: 0,
        available: true
      });
    }

    // Comp option (staff only)
    types.push({
      id: 'comp',
      name: 'Complimentary',
      description: 'Free - Staff use only',
      price: 0,
      available: true
    });

    return types;
  };

  const getTotalPrice = () => {
    if (!selectedClass || !selectedCustomer) return 0;
    
    const ticketTypes = getAvailableTicketTypes(selectedClass, selectedCustomer);
    const selectedTicketType = ticketTypes.find(t => t.id === ticketType);
    
    if (!selectedTicketType) return 0;
    
    let total = selectedTicketType.price;
    
    if (useAccountCredit && selectedCustomer.walletBalance > 0) {
      const creditToUse = Math.min(accountCreditAmount || selectedCustomer.walletBalance, total);
      total -= creditToUse;
    }
    
    return Math.max(0, total);
  };

  const canProceedToPayment = () => {
    if (!selectedClass || !selectedCustomer) return false;
    
    const isClassFull = selectedClass.registered >= selectedClass.capacity;
    
    if (isClassFull && !addToWaitlist) return false;
    
    return true;
  };

  const handleBooking = () => {
    // Here you would implement the actual booking logic
    console.log('Processing booking:', {
      class: selectedClass,
      customer: selectedCustomer,
      ticketType,
      paymentMethod,
      totalPrice: getTotalPrice(),
      addToWaitlist
    });
    
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[90vh] max-h-[900px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Registration</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* Progress Steps */}
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {['Class', 'Customer', 'Ticket', 'Payment', 'Confirm'].map((stepName, index) => {
              const stepKeys = ['select_class', 'select_customer', 'select_ticket', 'payment', 'confirm'];
              const currentStepIndex = stepKeys.indexOf(step);
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={stepName} className="flex items-center min-w-0 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium whitespace-nowrap">{stepName}</span>
                  {index < 4 && <div className="w-12 h-px bg-gray-300 mx-4 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-auto">
            {step === 'select_class' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select a Class</h3>
                
                <div className="space-y-3">
                  {mockAvailableClasses.map(cls => {
                    const isFullyBooked = cls.registered >= cls.capacity;
                    const hasWaitlist = cls.waitlist > 0;
                    
                    return (
                      <Card 
                        key={cls.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedClass?.id === cls.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div>
                                <h4 className="font-medium">{cls.className}</h4>
                                <p className="text-sm text-muted-foreground">
                                  with {cls.instructor}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(cls.date)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(cls.time)} ({cls.duration}min)</span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{cls.location}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(cls.price)}</div>
                                <div className="text-xs text-muted-foreground">Drop-in</div>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-sm font-medium ${
                                  isFullyBooked ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {cls.registered}/{cls.capacity}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {isFullyBooked ? 'Full' : 'Available'}
                                </div>
                                {hasWaitlist && (
                                  <div className="text-xs text-blue-600">
                                    {cls.waitlist} waitlisted
                                  </div>
                                )}
                              </div>

                              {isFullyBooked && (
                                <Badge variant="destructive">Full</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'select_customer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Select Customer</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreateNewCustomer(!createNewCustomer)}
                  >
                    {createNewCustomer ? 'Select Existing' : 'Create New Customer'}
                  </Button>
                </div>

                {createNewCustomer ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={newCustomerData.firstName}
                            onChange={(e) => setNewCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={newCustomerData.lastName}
                            onChange={(e) => setNewCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newCustomerData.email}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={newCustomerData.phone}
                          onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+41 79 123 4567"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search customers by name, email, or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-auto">
                      {filteredCustomers.map(customer => (
                        <Card 
                          key={customer.id}
                          className={`cursor-pointer transition-colors ${
                            selectedCustomer?.id === customer.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <CardContent className="p-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <div>
                                <h4 className="font-medium">
                                  {customer.firstName} {customer.lastName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {customer.email} • {customer.phone}
                                </p>
                              </div>
                              
                              <div className="text-left sm:text-right text-sm">
                                <div className="flex items-center space-x-3 justify-start sm:justify-end">
                                  <div>
                                    <div className="font-medium">{formatCurrency(customer.walletBalance)}</div>
                                    <div className="text-muted-foreground">Balance</div>
                                  </div>
                                  <div>
                                    <div className="font-medium">{customer.credits}</div>
                                    <div className="text-muted-foreground">Credits</div>
                                  </div>
                                  {customer.memberships.length > 0 && (
                                    <Badge className="bg-green-100 text-green-800">
                                      Member
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'select_ticket' && selectedClass && selectedCustomer && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Ticket Type</h3>
                
                {selectedClass.registered >= selectedClass.capacity && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This class is fully booked. You can add the customer to the waitlist.
                      <div className="mt-2">
                        <Label className="flex items-center space-x-2">
                          <Checkbox 
                            checked={addToWaitlist}
                            onCheckedChange={setAddToWaitlist}
                          />
                          <span>Add to waitlist</span>
                        </Label>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <RadioGroup value={ticketType} onValueChange={setTicketType}>
                  {getAvailableTicketTypes(selectedClass, selectedCustomer).map(ticket => (
                    <div key={ticket.id} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={ticket.id} 
                        id={ticket.id}
                        disabled={!ticket.available}
                      />
                      <Label htmlFor={ticket.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{ticket.name}</div>
                            <div className="text-sm text-muted-foreground">{ticket.description}</div>
                          </div>
                          <div className="font-medium">
                            {ticket.price > 0 ? formatCurrency(ticket.price) : 'Free'}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Details</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>{selectedClass?.className}</span>
                      <span>{formatCurrency(selectedClass?.price || 0)}</span>
                    </div>
                    
                    {useAccountCredit && selectedCustomer?.walletBalance > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Account Credit Applied</span>
                        <span>-{formatCurrency(Math.min(accountCreditAmount || selectedCustomer.walletBalance, selectedClass?.price || 0))}</span>
                      </div>
                    )}
                    
                    <hr />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(getTotalPrice())}</span>
                    </div>
                  </CardContent>
                </Card>

                {selectedCustomer?.walletBalance > 0 && getTotalPrice() > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <Label className="flex items-center space-x-2">
                        <Checkbox 
                          checked={useAccountCredit}
                          onCheckedChange={setUseAccountCredit}
                        />
                        <span>Use account credit ({formatCurrency(selectedCustomer.walletBalance)} available)</span>
                      </Label>
                      
                      {useAccountCredit && (
                        <div className="mt-3">
                          <Label>Amount to use</Label>
                          <Input
                            type="number"
                            max={selectedCustomer.walletBalance}
                            value={accountCreditAmount}
                            onChange={(e) => setAccountCreditAmount(parseFloat(e.target.value) || 0)}
                            placeholder={`Max: ${formatCurrency(selectedCustomer.walletBalance)}`}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {getTotalPrice() > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        {paymentMethods.map(method => {
                          const Icon = method.icon;
                          return (
                            <div key={method.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Label htmlFor={method.id} className="flex items-center space-x-2 cursor-pointer">
                                <Icon className="w-4 h-4" />
                                <span>{method.name}</span>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Confirm Registration</h3>
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Customer</h4>
                        <p>{selectedCustomer?.firstName} {selectedCustomer?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer?.email}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Class</h4>
                        <p>{selectedClass?.className}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(selectedClass?.date || '')} at {formatTime(selectedClass?.time || '')}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedClass?.location}</p>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-lg font-bold">{formatCurrency(getTotalPrice())}</span>
                    </div>

                    {addToWaitlist && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Customer will be added to the waitlist and automatically promoted when a spot becomes available.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                const steps = ['select_class', 'select_customer', 'select_ticket', 'payment', 'confirm'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1] as any);
                } else {
                  onClose();
                }
              }}
            >
              {step === 'select_class' ? 'Cancel' : 'Back'}
            </Button>
            
            <Button 
              onClick={() => {
                const steps = ['select_class', 'select_customer', 'select_ticket', 'payment', 'confirm'];
                const currentIndex = steps.indexOf(step);
                
                if (step === 'confirm') {
                  handleBooking();
                } else if (currentIndex < steps.length - 1) {
                  setStep(steps[currentIndex + 1] as any);
                }
              }}
              disabled={
                (step === 'select_class' && !selectedClass) ||
                (step === 'select_customer' && !selectedCustomer && !createNewCustomer) ||
                (step === 'select_customer' && createNewCustomer && (!newCustomerData.firstName || !newCustomerData.lastName || !newCustomerData.email)) ||
                (step === 'select_ticket' && !canProceedToPayment())
              }
            >
              {step === 'confirm' ? 'Complete Booking' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}