import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Shield, 
  Database, 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  FileText, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Users,
  Globe,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface DataRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  type: 'export' | 'deletion' | 'correction' | 'portability';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  description: string;
}

interface ConsentRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  consentType: 'marketing' | 'analytics' | 'necessary' | 'functional';
  status: 'granted' | 'withdrawn' | 'expired';
  grantedDate: string;
  withdrawnDate?: string;
  policyVersion: string;
}

export function PrivacySettings() {
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([
    {
      id: '1',
      customerName: 'Maria Müller',
      customerEmail: 'maria@example.ch',
      type: 'export',
      status: 'completed',
      requestDate: '2024-01-10',
      completionDate: '2024-01-12',
      description: 'Customer requested all personal data for review'
    },
    {
      id: '2',
      customerName: 'Jean Dubois',
      customerEmail: 'jean@example.fr',
      type: 'deletion',
      status: 'in_progress',
      requestDate: '2024-01-14',
      description: 'Request to delete all personal information'
    },
    {
      id: '3',
      customerName: 'Marco Rossi',
      customerEmail: 'marco@example.it',
      type: 'correction',
      status: 'pending',
      requestDate: '2024-01-15',
      description: 'Request to correct address information'
    }
  ]);

  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([
    {
      id: '1',
      customerName: 'Anna Weber',
      customerEmail: 'anna@example.ch',
      consentType: 'marketing',
      status: 'granted',
      grantedDate: '2024-01-01',
      policyVersion: 'v2.1'
    },
    {
      id: '2',
      customerName: 'Thomas Fischer',
      customerEmail: 'thomas@example.ch',
      consentType: 'analytics',
      status: 'withdrawn',
      grantedDate: '2023-12-15',
      withdrawnDate: '2024-01-10',
      policyVersion: 'v2.0'
    }
  ]);

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'export': return Download;
      case 'deletion': return Trash2;
      case 'correction': return FileText;
      case 'portability': return Database;
      default: return FileText;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'export':
        return <Badge className="bg-blue-100 text-blue-800">Data Export</Badge>;
      case 'deletion':
        return <Badge className="bg-red-100 text-red-800">Data Deletion</Badge>;
      case 'correction':
        return <Badge className="bg-yellow-100 text-yellow-800">Data Correction</Badge>;
      case 'portability':
        return <Badge className="bg-green-100 text-green-800">Data Portability</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConsentStatusBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Granted</Badge>;
      case 'withdrawn':
        return <Badge className="bg-red-100 text-red-800">Withdrawn</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConsentTypeIcon = (type: string) => {
    switch (type) {
      case 'marketing': return Users;
      case 'analytics': return Search;
      case 'necessary': return Shield;
      case 'functional': return Database;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Data & Privacy</h2>
          <p className="text-muted-foreground">
            GDPR compliance, data handling, and customer privacy management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Privacy Report
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
          </Button>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>Handle GDPR data requests from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRequests.map((request) => {
                    const Icon = getRequestTypeIcon(request.type);
                    const dueDate = new Date(request.requestDate);
                    dueDate.setDate(dueDate.getDate() + 30); // GDPR 30-day limit
                    
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.customerName}</p>
                            <p className="text-sm text-muted-foreground">{request.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {getRequestTypeBadge(request.type)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-sm">{request.requestDate}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dueDate.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' && (
                              <Button size="sm">Process</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Processing Automation</CardTitle>
              <CardDescription>Configure automatic handling of common data requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Data Export Requests</Label>
                  <p className="text-sm text-muted-foreground">Automatically process and fulfill data export requests</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Manager Approval for Deletions</Label>
                  <p className="text-sm text-muted-foreground">Manager approval required for all deletion requests</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Send Confirmation Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify customers when requests are completed</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-template">Auto-response Template</Label>
                <Textarea 
                  id="response-template"
                  placeholder="Template for automated responses to data requests..."
                  rows={3}
                  defaultValue="Thank you for your data request. We have received it and will process it within 30 days as required by GDPR."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Records</CardTitle>
              <CardDescription>Track and manage customer consent preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Input placeholder="Search by name or email..." className="max-w-xs" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="necessary">Necessary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Consent Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Granted Date</TableHead>
                    <TableHead>Policy Version</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentRecords.map((consent) => {
                    const Icon = getConsentTypeIcon(consent.consentType);
                    return (
                      <TableRow key={consent.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{consent.customerName}</p>
                            <p className="text-sm text-muted-foreground">{consent.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{consent.consentType}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getConsentStatusBadge(consent.status)}</TableCell>
                        <TableCell className="text-sm">{consent.grantedDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {consent.policyVersion}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent Banner Settings</CardTitle>
              <CardDescription>Configure cookie and consent banners for your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Cookie Consent Banner</Label>
                    <p className="text-sm text-muted-foreground">Display cookie consent banner for website visitors</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Granular Cookie Controls</Label>
                    <p className="text-sm text-muted-foreground">Allow users to select specific cookie categories</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Consent Refresh</Label>
                    <p className="text-sm text-muted-foreground">Re-prompt for consent when privacy policy changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Banner Customization</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="banner-text">Banner Text</Label>
                    <Textarea 
                      id="banner-text"
                      defaultValue="We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accept-button">Accept Button Text</Label>
                      <Input id="accept-button" defaultValue="Accept All" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-button">Settings Button Text</Label>
                      <Input id="settings-button" defaultValue="Cookie Settings" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="bg-white p-4 rounded border shadow-sm">
                  <p className="text-sm mb-3">
                    We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">Accept All</Button>
                    <Button variant="outline" size="sm">Cookie Settings</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policies</CardTitle>
              <CardDescription>Configure how long different types of data are stored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Customer Data</h4>
                <div className="space-y-3">
                  {[
                    { type: 'Active Customer Data', description: 'Data for customers with recent activity', period: 'indefinite' },
                    { type: 'Inactive Customer Data', description: 'Data for customers with no activity', period: '3years' },
                    { type: 'Marketing Preferences', description: 'Email and marketing consent data', period: '2years' },
                    { type: 'Payment Information', description: 'Credit card and payment details', period: '7years' }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Select defaultValue={item.period}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="2years">2 years</SelectItem>
                          <SelectItem value="3years">3 years</SelectItem>
                          <SelectItem value="7years">7 years</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Transaction Data</h4>
                <div className="space-y-3">
                  {[
                    { type: 'Booking Records', description: 'Class bookings and attendance', period: '7years' },
                    { type: 'Payment Records', description: 'Payment transactions and receipts', period: '10years' },
                    { type: 'Invoice Data', description: 'Invoices and billing information', period: '10years' },
                    { type: 'Refund Records', description: 'Refund transactions and reasons', period: '7years' }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Select defaultValue={item.period}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3years">3 years</SelectItem>
                          <SelectItem value="7years">7 years (Swiss law)</SelectItem>
                          <SelectItem value="10years">10 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Swiss Legal Requirements</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Swiss law requires businesses to retain certain financial records for 10 years. 
                      Ensure your retention policies comply with local regulations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automated Data Cleanup</CardTitle>
              <CardDescription>Configure automatic data deletion based on retention policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Automatic Cleanup</Label>
                  <p className="text-sm text-muted-foreground">Automatically delete data based on retention policies</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify Before Deletion</Label>
                  <p className="text-sm text-muted-foreground">Send notifications before deleting customer data</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cleanup-schedule">Cleanup Schedule</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-period">Notification Period</Label>
                  <Select defaultValue="30days">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 days before</SelectItem>
                      <SelectItem value="30days">30 days before</SelectItem>
                      <SelectItem value="90days">90 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Monitor your GDPR and Swiss data protection compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-muted-foreground">GDPR Compliance</div>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">Data Encrypted</div>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">2.1</div>
                  <div className="text-sm text-muted-foreground">Avg Response Days</div>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm text-muted-foreground">Active Consents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy Management</CardTitle>
              <CardDescription>Manage privacy policy versions and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Privacy Policy v2.1</p>
                  <p className="text-sm text-muted-foreground">Current version - Updated January 15, 2024</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Privacy Policy v2.0</p>
                  <p className="text-sm text-muted-foreground">Previous version - Updated December 1, 2023</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">Archived</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Policy Update Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notify Customers of Policy Changes</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications when privacy policy is updated</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Re-consent for Major Changes</Label>
                      <p className="text-sm text-muted-foreground">Require customers to re-accept consent for significant changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection Officer</CardTitle>
              <CardDescription>Configure DPO information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dpo-name">DPO Name</Label>
                  <Input id="dpo-name" placeholder="Data Protection Officer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpo-email">DPO Email</Label>
                  <Input id="dpo-email" type="email" placeholder="dpo@yogazen.ch" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dpo-address">DPO Address</Label>
                <Textarea 
                  id="dpo-address"
                  placeholder="Complete address of the Data Protection Officer"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Display DPO Contact on Website</Label>
                  <p className="text-sm text-muted-foreground">Show DPO contact information in privacy policy</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}