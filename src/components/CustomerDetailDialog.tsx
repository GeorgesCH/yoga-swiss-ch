import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { PeopleService } from '../utils/supabase/people-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  User, Phone, Mail, MapPin, Calendar, CreditCard, 
  Wallet, Gift, MessageSquare, FileText, Shield,
  Edit2, Plus, Minus, Download, Send, Star,
  TrendingUp, Clock, AlertCircle, Check, X,
  Heart, Target, Award, Zap, Bell
} from 'lucide-react';

interface CustomerDetailDialogProps {
  customer: any;
  onClose: () => void;
  onUpdate?: () => void;
}

// Mock data for customer details
const mockRegistrations = [
  {
    id: '1',
    className: 'Vinyasa Flow',
    instructor: 'Sarah Chen',
    date: '2024-01-20',
    time: '09:00',
    status: 'Confirmed',
    price: 25.00,
    paymentMethod: 'Membership'
  },
  {
    id: '2', 
    className: 'Yin Yoga',
    instructor: 'Michael Brown',
    date: '2024-01-18',
    time: '19:00',
    status: 'Attended',
    price: 25.00,
    paymentMethod: 'Credits'
  }
];

const mockTransactions = [
  {
    id: '1',
    type: 'credit',
    amount: 50.00,
    description: 'Account top-up via TWINT',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'debit', 
    amount: -25.00,
    description: 'Class booking - Vinyasa Flow',
    date: '2024-01-14',
    status: 'completed'
  }
];

const mockMemberships = [
  {
    id: '1',
    name: 'Unlimited Monthly',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    autoRenew: true,
    price: 149.00,
    classesUsed: 12,
    classesTotal: 'Unlimited'
  }
];

const mockCommunications = [
  {
    id: '1',
    type: 'email',
    subject: 'Welcome to YogaSwiss!',
    status: 'delivered',
    sentAt: '2024-01-10T10:30:00',
    openedAt: '2024-01-10T11:15:00'
  },
  {
    id: '2',
    type: 'sms',
    subject: 'Class reminder for tomorrow',
    status: 'delivered',
    sentAt: '2024-01-14T18:00:00',
    openedAt: null
  }
];

const mockNotes = [
  {
    id: '1',
    author: 'Reception Team',
    content: 'Customer prefers morning classes. Very friendly and punctual.',
    createdAt: '2024-01-10T14:30:00',
    visibility: 'staff_only',
    pinned: true
  },
  {
    id: '2',
    author: 'Sarah Chen',
    content: 'Making great progress with arm balances. Recommend intermediate workshop.',
    createdAt: '2024-01-08T16:45:00',
    visibility: 'instructor_visible',
    pinned: false
  }
];

export function CustomerDetailDialog({ customer, onClose, onUpdate }: CustomerDetailDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [peopleService] = useState(() => new PeopleService());
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    language: customer?.language || 'en-CH',
    marketingConsent: customer?.marketingConsent || false
  });

  // Load detailed customer data
  useEffect(() => {
    if (customer && customer.id) {
      loadCustomerDetails();
    }
  }, [customer]);

  const loadCustomerDetails = async () => {
    if (!customer?.id) return;
    
    try {
      setLoading(true);
      const { customer: details, error } = await peopleService.getCustomer(customer.id);
      
      if (error) {
        console.error('Error loading customer details:', error);
        // Use provided customer data as fallback
        setCustomerDetails(customer);
      } else {
        setCustomerDetails(details);
        // Update edit form with latest data
        setEditForm({
          firstName: details?.firstName || customer.firstName || '',
          lastName: details?.lastName || customer.lastName || '',
          email: details?.email || customer.email || '',
          phone: details?.phone || customer.phone || '',
          language: details?.language || customer.language || 'en-CH',
          marketingConsent: details?.marketingConsent || customer.marketingConsent || false
        });
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
      setCustomerDetails(customer);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!customer?.id) return;
    
    try {
      setLoading(true);
      const { error } = await peopleService.updateCustomer(customer.id, editForm);
      
      if (error) {
        console.error('Error updating customer:', error);
        alert('Failed to update customer: ' + error);
      } else {
        setEditMode(false);
        await loadCustomerDetails(); // Reload data
        if (onUpdate) onUpdate(); // Refresh parent component
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletAdjustment = async (amount: number, reason: string) => {
    // Implementation would depend on wallet service
    console.log('Wallet adjustment:', { amount, reason });
    alert('Wallet adjustment functionality coming soon');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
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

  // Use fallback data if customer details haven't loaded yet
  const displayCustomer = customerDetails || customer;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={displayCustomer.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(displayCustomer.firstName, displayCustomer.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <DialogTitle className="text-2xl">
                  {displayCustomer.firstName} {displayCustomer.lastName}
                </DialogTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                  <span>{displayCustomer.email}</span>
                  <span>•</span>
                  <span>{displayCustomer.phone}</span>
                  <span>•</span>
                  <span>Customer since {formatDate(displayCustomer.joinedDate)}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={displayCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {displayCustomer.status}
                  </Badge>
                  {displayCustomer.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {editMode ? (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setEditMode(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-7 flex-shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="registrations">Bookings</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="memberships">Memberships</TabsTrigger>
              <TabsTrigger value="communications">Messages</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="overview" className="space-y-6 m-0">
                {/* KPI Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                          <p className="text-lg font-semibold">{formatCurrency(displayCustomer.totalSpent || 0)}</p>
                        </div>
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Visits</p>
                          <p className="text-lg font-semibold">{displayCustomer.visits || 0}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Wallet Balance</p>
                          <p className="text-lg font-semibold">{formatCurrency(displayCustomer.walletBalance || 0)}</p>
                        </div>
                        <Wallet className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Credits</p>
                          <p className="text-lg font-semibold">{displayCustomer.credits || 0}</p>
                        </div>
                        <Gift className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{displayCustomer.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{displayCustomer.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{displayCustomer.city || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Language: {(displayCustomer.language || 'en-CH').toUpperCase()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Activity</span>
                        <span className="font-medium">{formatDate(displayCustomer.lastActivity)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Risk Level</span>
                        <Badge variant={displayCustomer.riskLevel === 'Low' ? 'default' : 'destructive'}>
                          {displayCustomer.riskLevel || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">NPS Score</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{displayCustomer.npsScore || 'N/A'}</span>
                          {displayCustomer.npsScore >= 9 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Marketing Consent</span>
                        <span className="font-medium">{displayCustomer.marketingConsent ? 'Yes' : 'No'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Membership */}
                {displayCustomer.currentMembership && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Membership</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{displayCustomer.currentMembership}</h4>
                          <p className="text-sm text-muted-foreground">
                            Active membership
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="registrations" className="space-y-4 m-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Recent Bookings</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </div>

                {mockRegistrations.map(registration => (
                  <Card key={registration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium">{registration.className}</h4>
                            <p className="text-sm text-muted-foreground">
                              with {registration.instructor}
                            </p>
                          </div>
                          <Badge className={registration.status === 'Attended' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {registration.status}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{formatDate(registration.date)} {registration.time}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(registration.price)} - {registration.paymentMethod}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="wallet" className="space-y-6 m-0">
                {/* Wallet Balance */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Balance</p>
                          <p className="text-2xl font-bold">{formatCurrency(displayCustomer.walletBalance || 0)}</p>
                        </div>
                        <Wallet className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Class Credits</p>
                          <p className="text-2xl font-bold">{displayCustomer.credits || 0}</p>
                        </div>
                        <Gift className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Wallet Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Wallet Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Input
                        placeholder="Amount (CHF)"
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                        className="w-40"
                        type="number"
                        step="0.01"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const amount = parseFloat(walletAmount);
                          if (amount > 0) {
                            handleWalletAdjustment(amount, 'Manual credit addition');
                          }
                        }}
                        disabled={!walletAmount || parseFloat(walletAmount) <= 0}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Credit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const amount = parseFloat(walletAmount);
                          if (amount > 0) {
                            handleWalletAdjustment(-amount, 'Manual deduction');
                          }
                        }}
                        disabled={!walletAmount || parseFloat(walletAmount) <= 0}
                      >
                        <Minus className="w-4 h-4 mr-2" />
                        Deduct
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add or deduct funds from customer's account balance
                    </p>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTransactions.map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center space-x-3">
                            {transaction.type === 'credit' ? (
                              <Plus className="w-4 h-4 text-green-600" />
                            ) : (
                              <Minus className="w-4 h-4 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(transaction.date)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="memberships" className="space-y-4 m-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Memberships & Passes</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Grant Membership
                  </Button>
                </div>

                {mockMemberships.map(membership => (
                  <Card key={membership.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium">{membership.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(membership.startDate)} - {formatDate(membership.endDate)}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {membership.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monthly Price</p>
                          <p className="font-medium">{formatCurrency(membership.price)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Classes Used</p>
                          <p className="font-medium">{membership.classesUsed} / {membership.classesTotal}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Auto-renewal</p>
                          <p className="font-medium">{membership.autoRenew ? 'On' : 'Off'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <Button size="sm" variant="outline">Pause</Button>
                        <Button size="sm" variant="outline">Change Plan</Button>
                        <Button size="sm" variant="outline">Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="communications" className="space-y-4 m-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Communication History</h3>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>

                {mockCommunications.map(comm => (
                  <Card key={comm.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {comm.type === 'email' ? (
                            <Mail className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Phone className="w-4 h-4 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium">{comm.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              Sent {formatDateTime(comm.sentAt)}
                              {comm.openedAt && ` • Opened ${formatDateTime(comm.openedAt)}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={comm.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {comm.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add a note about this customer..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Label htmlFor="staff-only">Staff only</Label>
                        <Switch id="staff-only" />
                        <Label htmlFor="pinned">Pin note</Label>
                        <Switch id="pinned" />
                      </div>
                      <Button size="sm" disabled={!newNote.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {mockNotes.map(note => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-sm">{note.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(note.createdAt)}
                              </span>
                              {note.pinned && (
                                <Badge variant="outline" className="text-xs">Pinned</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {note.visibility === 'staff_only' ? 'Staff Only' : 'Instructor Visible'}
                              </Badge>
                            </div>
                            <p className="text-sm">{note.content}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Communications</Label>
                          <p className="text-xs text-muted-foreground">Email newsletters and promotions</p>
                        </div>
                        <Switch checked={displayCustomer.marketingConsent} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-xs text-muted-foreground">Class reminders and updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">Mobile app notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Data Management</h4>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Customer Data
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete Customer Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}