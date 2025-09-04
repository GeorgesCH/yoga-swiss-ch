import React, { useState, useEffect } from 'react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  QrCode,
  CreditCard,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Building,
  Plus,
  Download,
  ExternalLink,
  AlertTriangle,
  Shield,
  RefreshCw
} from 'lucide-react';
import { getSupabaseProjectId } from '../../utils/supabase/env';

interface SwissPaymentSettings {
  org_id: string;
  twint_enabled: boolean;
  twint_provider: 'datatrans' | 'wallee';
  twint_merchant_id?: string;
  twint_api_key?: string;
  qr_bill_enabled: boolean;
  creditor_name: string;
  creditor_address: {
    street: string;
    postal_code: string;
    city: string;
    country: string;
  };
  iban: string;
  qr_iban?: string;
  vat_number?: string;
  vat_rate: number;
  tax_inclusive: boolean;
  bank_account?: {
    name: string;
    iban: string;
    swift?: string;
  };
}

interface PaymentTransaction {
  id: string;
  order_id: string;
  amount_cents: number;
  currency: string;
  method: 'twint' | 'qr_bill' | 'stripe' | 'cash' | 'bank_transfer';
  provider: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  metadata: {
    twint_qr_code?: string;
    qr_bill_reference?: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

export function SwissPaymentIntegration() {
  const { currentOrg, hasPermission } = useMultiTenantAuth();
  const [paymentSettings, setPaymentSettings] = useState<SwissPaymentSettings | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTestPaymentDialog, setShowTestPaymentDialog] = useState(false);
  const [testPaymentData, setTestPaymentData] = useState({
    amount_chf: '25.00',
    description: 'Test payment for yoga class',
    method: 'twint' as 'twint' | 'qr_bill'
  });
  const [testPaymentResult, setTestPaymentResult] = useState<any>(null);

  // Check permissions
  if (!hasPermission('settings')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to configure payment settings.
          </p>
        </div>
      </div>
    );
  }

  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Org-ID': currentOrg?.id || '',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }
    
    return response.json();
  };

  // Format CHF currency
  const formatCHF = (amountCents: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amountCents / 100);
  };

  // Load payment settings
  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/orgs/${currentOrg?.id}/payment-settings`);
      setPaymentSettings(data.settings);
    } catch (error) {
      console.error('Error loading payment settings:', error);
      // Initialize with default settings if none exist
      setPaymentSettings({
        org_id: currentOrg?.id || '',
        twint_enabled: false,
        twint_provider: 'datatrans',
        qr_bill_enabled: false,
        creditor_name: currentOrg?.name || '',
        creditor_address: {
          street: '',
          postal_code: '',
          city: '',
          country: 'CH'
        },
        iban: '',
        vat_rate: 7.7,
        tax_inclusive: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Save payment settings
  const savePaymentSettings = async () => {
    if (!paymentSettings) return;

    try {
      setSaving(true);
      await apiCall(`/orgs/${currentOrg?.id}/payment-settings`, {
        method: 'POST',
        body: JSON.stringify(paymentSettings)
      });
    } catch (error) {
      console.error('Error saving payment settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Test payment processing
  const testPayment = async () => {
    try {
      const amountCents = parseFloat(testPaymentData.amount_chf) * 100;
      const endpoint = testPaymentData.method === 'twint' 
        ? `/orgs/${currentOrg?.id}/payments/twint`
        : `/orgs/${currentOrg?.id}/payments/qr-bill`;

      const result = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          amount_cents: amountCents,
          reference: `test_${Date.now()}`,
          order_id: `test_order_${Date.now()}`,
          description: testPaymentData.description,
          ...(testPaymentData.method === 'qr_bill' && {
            debtor_info: {
              name: 'Test Customer',
              address: 'Test Street 1',
              postal_code: '8001',
              city: 'Zürich',
              country: 'CH'
            }
          })
        })
      });

      setTestPaymentResult(result);
    } catch (error) {
      console.error('Error testing payment:', error);
      setTestPaymentResult({ error: error.message });
    }
  };

  useEffect(() => {
    if (currentOrg) {
      loadPaymentSettings();
    }
  }, [currentOrg]);

  const updateSettings = (updates: Partial<SwissPaymentSettings>) => {
    if (paymentSettings) {
      setPaymentSettings({ ...paymentSettings, ...updates });
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'refunded':
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Swiss Payment Integration</h2>
          <p className="text-muted-foreground">
            Configure TWINT and QR-Bill payments for {currentOrg?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showTestPaymentDialog} onOpenChange={setShowTestPaymentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Test Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Payment Processing</DialogTitle>
                <DialogDescription>
                  Test TWINT or QR-Bill payment processing in your current configuration.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={testPaymentData.method === 'twint' ? 'default' : 'outline'}
                      onClick={() => setTestPaymentData({ ...testPaymentData, method: 'twint' })}
                      disabled={!paymentSettings?.twint_enabled}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      TWINT
                    </Button>
                    <Button
                      size="sm"
                      variant={testPaymentData.method === 'qr_bill' ? 'default' : 'outline'}
                      onClick={() => setTestPaymentData({ ...testPaymentData, method: 'qr_bill' })}
                      disabled={!paymentSettings?.qr_bill_enabled}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      QR-Bill
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount (CHF)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={testPaymentData.amount_chf}
                    onChange={(e) => setTestPaymentData({
                      ...testPaymentData,
                      amount_chf: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={testPaymentData.description}
                    onChange={(e) => setTestPaymentData({
                      ...testPaymentData,
                      description: e.target.value
                    })}
                    placeholder="Test payment description"
                  />
                </div>

                {testPaymentResult && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Test Result:</h4>
                    {testPaymentResult.error ? (
                      <div className="text-red-600">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        Error: {testPaymentResult.error}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div>Payment ID: {testPaymentResult.payment?.id}</div>
                        <div>Status: {testPaymentResult.payment?.status}</div>
                        {testPaymentResult.qr_code && (
                          <div>
                            <span>TWINT QR Code: </span>
                            <code className="bg-background p-1 rounded text-xs">
                              {testPaymentResult.qr_code}
                            </code>
                          </div>
                        )}
                        {testPaymentResult.qr_bill && (
                          <div>QR-Bill generated successfully</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowTestPaymentDialog(false);
                  setTestPaymentResult(null);
                }}>
                  Close
                </Button>
                <Button onClick={testPayment}>
                  Run Test
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={savePaymentSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {!paymentSettings && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Payment Settings Not Configured</h3>
              <p className="text-muted-foreground">
                Configure your Swiss payment settings to start accepting TWINT and QR-Bill payments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentSettings && (
        <Tabs defaultValue="twint" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="twint" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              TWINT
            </TabsTrigger>
            <TabsTrigger value="qr-bill" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              QR-Bill
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twint" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      TWINT Integration
                    </CardTitle>
                    <CardDescription>
                      Configure TWINT mobile payments for Swiss customers
                    </CardDescription>
                  </div>
                  <Switch
                    checked={paymentSettings.twint_enabled}
                    onCheckedChange={(enabled) => updateSettings({ twint_enabled: enabled })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>TWINT Provider</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={paymentSettings.twint_provider}
                      onChange={(e) => updateSettings({ 
                        twint_provider: e.target.value as 'datatrans' | 'wallee' 
                      })}
                      disabled={!paymentSettings.twint_enabled}
                    >
                      <option value="datatrans">Datatrans</option>
                      <option value="wallee">Wallee</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Merchant ID</Label>
                    <Input
                      value={paymentSettings.twint_merchant_id || ''}
                      onChange={(e) => updateSettings({ twint_merchant_id: e.target.value })}
                      placeholder="Your TWINT merchant ID"
                      disabled={!paymentSettings.twint_enabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={paymentSettings.twint_api_key || ''}
                    onChange={(e) => updateSettings({ twint_api_key: e.target.value })}
                    placeholder="Your TWINT API key"
                    disabled={!paymentSettings.twint_enabled}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <QrCode className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">TWINT Payment Flow</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Customers scan a QR code with the TWINT app to pay instantly. 
                        Perfect for Swiss mobile users and provides immediate payment confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                {!paymentSettings.twint_enabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">TWINT Disabled</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Enable TWINT to start accepting mobile payments from Swiss customers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr-bill" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Swiss QR-Bill
                    </CardTitle>
                    <CardDescription>
                      Configure QR-Bill generation for bank transfers
                    </CardDescription>
                  </div>
                  <Switch
                    checked={paymentSettings.qr_bill_enabled}
                    onCheckedChange={(enabled) => updateSettings({ qr_bill_enabled: enabled })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Creditor Name</Label>
                  <Input
                    value={paymentSettings.creditor_name}
                    onChange={(e) => updateSettings({ creditor_name: e.target.value })}
                    placeholder="Your organization name"
                    disabled={!paymentSettings.qr_bill_enabled}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      value={paymentSettings.creditor_address.street}
                      onChange={(e) => updateSettings({ 
                        creditor_address: { 
                          ...paymentSettings.creditor_address, 
                          street: e.target.value 
                        } 
                      })}
                      placeholder="Bahnhofstrasse 1"
                      disabled={!paymentSettings.qr_bill_enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Postal Code & City</Label>
                    <div className="flex gap-2">
                      <Input
                        value={paymentSettings.creditor_address.postal_code}
                        onChange={(e) => updateSettings({ 
                          creditor_address: { 
                            ...paymentSettings.creditor_address, 
                            postal_code: e.target.value 
                          } 
                        })}
                        placeholder="8001"
                        className="w-24"
                        disabled={!paymentSettings.qr_bill_enabled}
                      />
                      <Input
                        value={paymentSettings.creditor_address.city}
                        onChange={(e) => updateSettings({ 
                          creditor_address: { 
                            ...paymentSettings.creditor_address, 
                            city: e.target.value 
                          } 
                        })}
                        placeholder="Zürich"
                        disabled={!paymentSettings.qr_bill_enabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <Input
                      value={paymentSettings.iban}
                      onChange={(e) => updateSettings({ iban: e.target.value })}
                      placeholder="CH93 0076 2011 6238 5295 7"
                      disabled={!paymentSettings.qr_bill_enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>QR-IBAN (Optional)</Label>
                    <Input
                      value={paymentSettings.qr_iban || ''}
                      onChange={(e) => updateSettings({ qr_iban: e.target.value })}
                      placeholder="Special QR-IBAN if different"
                      disabled={!paymentSettings.qr_bill_enabled}
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">QR-Bill Benefits</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Swiss QR-Bills allow customers to pay via bank transfer by scanning a QR code. 
                        All payment details are automatically filled in their banking app.
                      </p>
                    </div>
                  </div>
                </div>

                {!paymentSettings.qr_bill_enabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">QR-Bill Disabled</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Enable QR-Bill to offer bank transfer payments with automatic reconciliation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Payment Settings</CardTitle>
                <CardDescription>
                  Configure tax, currency, and business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>VAT Number (Optional)</Label>
                    <Input
                      value={paymentSettings.vat_number || ''}
                      onChange={(e) => updateSettings({ vat_number: e.target.value })}
                      placeholder="CHE-123.456.789 MWST"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>VAT Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={paymentSettings.vat_rate}
                      onChange={(e) => updateSettings({ vat_rate: parseFloat(e.target.value) })}
                      placeholder="7.7"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tax Inclusive Pricing</Label>
                    <p className="text-sm text-muted-foreground">
                      Whether displayed prices include VAT
                    </p>
                  </div>
                  <Switch
                    checked={paymentSettings.tax_inclusive}
                    onCheckedChange={(inclusive) => updateSettings({ tax_inclusive: inclusive })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Bank Account (for reconciliation)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={paymentSettings.bank_account?.name || ''}
                        onChange={(e) => updateSettings({ 
                          bank_account: { 
                            ...paymentSettings.bank_account, 
                            name: e.target.value,
                            iban: paymentSettings.bank_account?.iban || '',
                            swift: paymentSettings.bank_account?.swift || ''
                          } 
                        })}
                        placeholder="Business account name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>SWIFT Code (Optional)</Label>
                      <Input
                        value={paymentSettings.bank_account?.swift || ''}
                        onChange={(e) => updateSettings({ 
                          bank_account: { 
                            ...paymentSettings.bank_account, 
                            name: paymentSettings.bank_account?.name || '',
                            iban: paymentSettings.bank_account?.iban || '',
                            swift: e.target.value
                          } 
                        })}
                        placeholder="UBSWCHZH80A"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Track TWINT and QR-Bill payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Payment transactions will appear here once customers start making payments.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transaction.method === 'twint' ? (
                                <Smartphone className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              {transaction.method.toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell>{formatCHF(transaction.amount_cents)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {transaction.metadata.qr_bill_reference || transaction.id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
