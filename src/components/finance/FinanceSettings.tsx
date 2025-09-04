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
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft, 
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Calculator,
  Building,
  FileText,
  Shield,
  Globe,
  Banknote,
  QrCode,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface FinanceSettingsProps {
  onBack: () => void;
}

export function FinanceSettings({ onBack }: FinanceSettingsProps) {
  const [activeTab, setActiveTab] = useState('tax');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Mock VAT rates configuration
  const vatRates = [
    {
      id: 'vat-standard',
      name: 'Standard Rate',
      rate: 8.1,
      category: 'standard',
      description: 'Standard VAT rate for services and classes',
      isDefault: true,
      applicableProducts: ['classes', 'workshops', 'memberships']
    },
    {
      id: 'vat-reduced',
      name: 'Reduced Rate',
      rate: 2.5,
      category: 'reduced',
      description: 'Reduced VAT rate for certain products',
      isDefault: false,
      applicableProducts: ['retail', 'books']
    },
    {
      id: 'vat-exempt',
      name: 'Exempt',
      rate: 0.0,
      category: 'exempt',
      description: 'VAT exempt for healthcare services',
      isDefault: false,
      applicableProducts: ['therapy', 'healthcare']
    }
  ];

  // Mock payment providers configuration
  const paymentProviders = [
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'active',
      methods: ['card', 'apple_pay', 'google_pay'],
      fees: { card: 1.45, apple_pay: 1.45, google_pay: 1.45 },
      currency: 'CHF',
      testMode: false,
      webhookUrl: 'https://api.yogaswiss.ch/webhooks/stripe'
    },
    {
      id: 'datatrans',
      name: 'Datatrans',
      status: 'active',
      methods: ['twint', 'postfinance'],
      fees: { twint: 0.95, postfinance: 1.20 },
      currency: 'CHF',
      testMode: false,
      webhookUrl: 'https://api.yogaswiss.ch/webhooks/datatrans'
    },
    {
      id: 'wallee',
      name: 'Wallee',
      status: 'inactive',
      methods: ['paypal', 'klarna'],
      fees: { paypal: 2.35, klarna: 1.85 },
      currency: 'CHF',
      testMode: true,
      webhookUrl: 'https://api.yogaswiss.ch/webhooks/wallee'
    }
  ];

  // Mock organization legal info
  const organizationInfo = {
    legalName: 'YogaSwiss Studio GmbH',
    address: {
      street: 'Bahnhofstrasse 123',
      city: 'Zürich',
      postalCode: '8001',
      country: 'Switzerland'
    },
    vatNumber: 'CHE-123.456.789 MWST',
    bankAccount: {
      iban: 'CH93 0076 2011 6238 5295 7',
      bank: 'UBS Switzerland AG',
      swift: 'UBSWCHZH80A'
    },
    contactInfo: {
      email: 'finance@yogaswiss.ch',
      phone: '+41 44 123 45 67',
      website: 'https://yogaswiss.ch'
    }
  };

  // Mock accounting integration settings
  const accountingIntegrations = [
    {
      id: 'datev',
      name: 'DATEV',
      status: 'configured',
      description: 'German accounting software integration',
      lastSync: '2025-01-01T12:00:00Z',
      chartOfAccounts: 'Standard DATEV SKR03'
    },
    {
      id: 'sage',
      name: 'SAGE',
      status: 'available',
      description: 'SAGE accounting software integration',
      lastSync: null,
      chartOfAccounts: null
    },
    {
      id: 'abacus',
      name: 'Abacus',
      status: 'available',
      description: 'Swiss Abacus accounting integration',
      lastSync: null,
      chartOfAccounts: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'configured':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Configured</Badge>;
      case 'available':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Available</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      card: { label: 'Card', icon: CreditCard },
      apple_pay: { label: 'Apple Pay', icon: Smartphone },
      google_pay: { label: 'Google Pay', icon: Smartphone },
      twint: { label: 'TWINT', icon: QrCode },
      postfinance: { label: 'PostFinance', icon: Banknote },
      paypal: { label: 'PayPal', icon: Globe },
      klarna: { label: 'Klarna', icon: CreditCard }
    };

    const config = methodConfig[method as keyof typeof methodConfig];
    if (!config) return <Badge variant="secondary">{method}</Badge>;

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
            <h1>Finance Settings</h1>
            <p className="text-muted-foreground">
              Configure tax rates, payment methods and financial integrations
            </p>
          </div>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Configuration</CardTitle>
          <CardDescription>
            Manage all aspects of your financial system setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="tax">Tax & VAT</TabsTrigger>
              <TabsTrigger value="payments">Payment Methods</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tax" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">VAT Rate Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure Swiss VAT rates for different product categories
                  </p>
                </div>
                <Button onClick={() => setShowEditDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add VAT Rate
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rate Name</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Applicable Products</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rate.name}</div>
                            <div className="text-sm text-muted-foreground">{rate.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{rate.rate}%</TableCell>
                        <TableCell>
                          <Badge 
                            variant={rate.category === 'standard' ? 'default' : 'secondary'}
                          >
                            {rate.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {rate.applicableProducts.map((product) => (
                              <Badge key={product} variant="outline" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rate.isDefault && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingItem(rate);
                                setShowEditDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Rate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Rate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">VAT Filing Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>VAT Number</Label>
                      <Input value="CHE-123.456.789 MWST" />
                    </div>
                    <div>
                      <Label>Filing Period</Label>
                      <Select defaultValue="quarterly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tax Year</Label>
                      <Select defaultValue="calendar">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar Year</SelectItem>
                          <SelectItem value="fiscal">Fiscal Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tax Mode</Label>
                      <Select defaultValue="inclusive">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">Inclusive Pricing</SelectItem>
                          <SelectItem value="exclusive">Exclusive Pricing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Payment Provider Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage payment providers and their supported methods
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </div>

              <div className="space-y-4">
                {paymentProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg">{provider.name}</CardTitle>
                            <CardDescription>
                              {provider.methods.length} payment methods • {provider.currency} currency
                            </CardDescription>
                          </div>
                          {getStatusBadge(provider.status)}
                          {provider.testMode && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Test Mode
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Switch checked={provider.status === 'active'} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Payment Methods</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {provider.methods.map((method) => (
                              <div key={method} className="flex items-center gap-2">
                                {getMethodBadge(method)}
                                <span className="text-sm text-muted-foreground">
                                  {provider.fees[method as keyof typeof provider.fees]}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Webhook URL:</span>
                            <p className="font-mono text-xs break-all">{provider.webhookUrl}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Currency:</span>
                            <p className="font-medium">{provider.currency}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cash Payment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Cash Payments</Label>
                      <p className="text-sm text-muted-foreground">Allow front desk to accept cash payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cash Rounding (CHF)</Label>
                      <p className="text-sm text-muted-foreground">Round cash payments to nearest 0.05 CHF</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Cash Drawer Float</Label>
                      <Input type="number" placeholder="200.00" />
                    </div>
                    <div>
                      <Label>Maximum Cash Transaction</Label>
                      <Input type="number" placeholder="500.00" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Legal Entity Information</CardTitle>
                  <CardDescription>
                    Organization details used for invoices and legal documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Legal Name</Label>
                      <Input value={organizationInfo.legalName} />
                    </div>
                    <div>
                      <Label>VAT Number</Label>
                      <Input value={organizationInfo.vatNumber} />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Business Address</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input placeholder="Street Address" value={organizationInfo.address.street} />
                      <Input placeholder="City" value={organizationInfo.address.city} />
                      <Input placeholder="Postal Code" value={organizationInfo.address.postalCode} />
                      <Input placeholder="Country" value={organizationInfo.address.country} />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Contact Information</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input placeholder="Email" value={organizationInfo.contactInfo.email} />
                      <Input placeholder="Phone" value={organizationInfo.contactInfo.phone} />
                      <Input placeholder="Website" value={organizationInfo.contactInfo.website} className="col-span-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bank Account Information</CardTitle>
                  <CardDescription>
                    Primary bank account for QR-bill generation and reconciliation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>IBAN</Label>
                      <Input value={organizationInfo.bankAccount.iban} />
                    </div>
                    <div>
                      <Label>Bank Name</Label>
                      <Input value={organizationInfo.bankAccount.bank} />
                    </div>
                    <div>
                      <Label>SWIFT/BIC</Label>
                      <Input value={organizationInfo.bankAccount.swift} />
                    </div>
                    <div>
                      <Label>Account Type</Label>
                      <Select defaultValue="business">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business Account</SelectItem>
                          <SelectItem value="qr">QR-IBAN Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="accounting" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Accounting Software Integrations</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with popular accounting software for automated data export
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {accountingIntegrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(integration.status)}
                          {integration.status === 'configured' ? (
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          ) : (
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Setup
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {integration.status === 'configured' && (
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Last Sync:</span>
                            <p className="font-medium">
                              {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chart of Accounts:</span>
                            <p className="font-medium">{integration.chartOfAccounts || 'Not configured'}</p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Export Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Export Format</Label>
                      <Select defaultValue="csv">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date Format</Label>
                      <Select defaultValue="dd.mm.yyyy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-export to accounting software</Label>
                      <p className="text-sm text-muted-foreground">Automatically export data daily</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security & Compliance Settings</CardTitle>
                  <CardDescription>
                    Configure data protection and audit settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all financial operations for compliance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Approval for Refunds</Label>
                      <p className="text-sm text-muted-foreground">Manager approval required for refunds over threshold</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Refund Approval Threshold (CHF)</Label>
                      <Input type="number" placeholder="100.00" />
                    </div>
                    <div>
                      <Label>Data Retention Period (months)</Label>
                      <Input type="number" placeholder="84" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data Protection (GDPR/nLPD)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anonymize Customer Data</Label>
                      <p className="text-sm text-muted-foreground">Anonymize customer data after retention period</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Data Export for Customers</Label>
                      <p className="text-sm text-muted-foreground">Allow customers to export their financial data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div>
                    <Label>Privacy Notice Text</Label>
                    <Textarea 
                      placeholder="Enter privacy notice text for financial data collection..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Webhook Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Verify Webhook Signatures</Label>
                      <p className="text-sm text-muted-foreground">Verify incoming webhook signatures for security</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Webhook Timeout (seconds)</Label>
                      <Input type="number" placeholder="30" />
                    </div>
                    <div>
                      <Label>Max Retry Attempts</Label>
                      <Input type="number" placeholder="3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit VAT Rate' : 'Add New VAT Rate'}
            </DialogTitle>
            <DialogDescription>
              Configure VAT rate settings for product categories
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rate Name</Label>
                <Input placeholder="e.g., Standard Rate" />
              </div>
              <div>
                <Label>VAT Rate (%)</Label>
                <Input type="number" step="0.1" placeholder="8.1" />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Input placeholder="Description of when this rate applies" />
            </div>
            
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="reduced">Reduced</SelectItem>
                  <SelectItem value="exempt">Exempt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Set as Default Rate</Label>
              <Switch />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowEditDialog(false);
                setEditingItem(null);
              }}>
                {editingItem ? 'Update Rate' : 'Create Rate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}