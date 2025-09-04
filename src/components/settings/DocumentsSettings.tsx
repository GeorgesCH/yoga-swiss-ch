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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  FileText, 
  Image, 
  Palette, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Plus, 
  Save,
  Mail,
  Receipt,
  FileImage,
  Printer,
  Monitor
} from 'lucide-react';

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'receipt' | 'certificate' | 'waiver' | 'contract';
  language: string;
  isActive: boolean;
  lastModified: string;
  size: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: 'transactional' | 'marketing' | 'system';
  subject: string;
  previewText: string;
  isActive: boolean;
  lastModified: string;
}

export function DocumentsSettings() {
  const [documents, setDocuments] = useState<DocumentTemplate[]>([
    {
      id: '1',
      name: 'Swiss QR-Bill Invoice',
      type: 'invoice',
      language: 'de',
      isActive: true,
      lastModified: '2024-01-15',
      size: 'A4'
    },
    {
      id: '2',
      name: 'Class Certificate',
      type: 'certificate',
      language: 'de',
      isActive: true,
      lastModified: '2024-01-14',
      size: 'A4'
    },
    {
      id: '3',
      name: 'Liability Waiver',
      type: 'waiver',
      language: 'de',
      isActive: true,
      lastModified: '2024-01-13',
      size: 'A4'
    },
    {
      id: '4',
      name: 'Membership Contract',
      type: 'contract',
      language: 'de',
      isActive: true,
      lastModified: '2024-01-12',
      size: 'A4'
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Booking Confirmation',
      type: 'transactional',
      subject: 'Your yoga class is confirmed - {{class.name}}',
      previewText: 'Thank you for booking with us. Your class details are enclosed.',
      isActive: true,
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      name: 'Class Reminder',
      type: 'transactional',
      subject: 'Class starting soon - {{class.name}} in 2 hours',
      previewText: 'Don\'t forget about your upcoming yoga class today.',
      isActive: true,
      lastModified: '2024-01-14'
    },
    {
      id: '3',
      name: 'Monthly Newsletter',
      type: 'marketing',
      subject: 'This month at {{studio.name}} - New classes & events',
      previewText: 'Discover what\'s new this month at our studio.',
      isActive: true,
      lastModified: '2024-01-13'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return Receipt;
      case 'certificate': return FileText;
      case 'waiver': return FileImage;
      case 'contract': return FileText;
      case 'receipt': return Receipt;
      default: return FileText;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Badge className="bg-blue-100 text-blue-800">Invoice</Badge>;
      case 'certificate':
        return <Badge className="bg-green-100 text-green-800">Certificate</Badge>;
      case 'waiver':
        return <Badge className="bg-yellow-100 text-yellow-800">Waiver</Badge>;
      case 'contract':
        return <Badge className="bg-purple-100 text-purple-800">Contract</Badge>;
      case 'receipt':
        return <Badge className="bg-gray-100 text-gray-800">Receipt</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getEmailTypeBadge = (type: string) => {
    switch (type) {
      case 'transactional':
        return <Badge className="bg-blue-100 text-blue-800">Transactional</Badge>;
      case 'marketing':
        return <Badge className="bg-orange-100 text-orange-800">Marketing</Badge>;
      case 'system':
        return <Badge className="bg-gray-100 text-gray-800">System</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Documents & Branding</h2>
          <p className="text-muted-foreground">
            Manage PDF templates, email design, and branding elements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">PDF Documents</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDF Document Templates</CardTitle>
              <CardDescription>Design and manage PDF templates for invoices, certificates, and contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => {
                  const Icon = getDocumentTypeIcon(doc.type);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getDocumentTypeBadge(doc.type)}
                            <Badge variant="outline">{doc.language.toUpperCase()}</Badge>
                            <Badge variant="outline">{doc.size}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className={doc.isActive ? 'text-green-600' : 'text-gray-500'}>
                            {doc.isActive ? 'Active' : 'Inactive'}
                          </p>
                          <p className="text-muted-foreground">Updated {doc.lastModified}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(doc);
                              setIsDesignerOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Switch checked={doc.isActive} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Swiss Compliance Templates</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Pre-designed templates that comply with Swiss legal requirements for invoicing and contracts.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    Install QR-Bill Template
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    Install VAT Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common document management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Receipt className="h-5 w-5" />
                  <span className="text-sm">Generate Invoice</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Create Certificate</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Printer className="h-5 w-5" />
                  <span className="text-sm">Print Queue</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Download className="h-5 w-5" />
                  <span className="text-sm">Bulk Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Design beautiful, responsive email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTemplates.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{email.name}</p>
                        <p className="text-sm text-muted-foreground mb-1">{email.subject}</p>
                        <div className="flex items-center gap-2">
                          {getEmailTypeBadge(email.type)}
                          {email.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm max-w-xs">
                        <p className="text-muted-foreground truncate">{email.previewText}</p>
                        <p className="text-muted-foreground">Updated {email.lastModified}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Switch checked={email.isActive} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Designer</CardTitle>
              <CardDescription>Create responsive email templates with drag-and-drop editor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Professional Email Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create beautiful, responsive emails with our drag-and-drop editor
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Launch Email Designer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Studio Branding</CardTitle>
              <CardDescription>Configure your studio's visual identity across all documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Logo & Images</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="logo">Primary Logo</Label>
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground">PNG/SVG, max 2MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="favicon">Favicon</Label>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded border-2 border-dashed flex items-center justify-center">
                          <Image className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Color Palette</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-blue-600 rounded border"></div>
                          <Input id="primary-color" defaultValue="#2563eb" className="font-mono text-xs" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary-color">Secondary</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gray-600 rounded border"></div>
                          <Input id="secondary-color" defaultValue="#6b7280" className="font-mono text-xs" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accent-color">Accent</Label>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-green-600 rounded border"></div>
                          <Input id="accent-color" defaultValue="#16a34a" className="font-mono text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Typography</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <Select defaultValue="inter">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="helvetica">Helvetica</SelectItem>
                          <SelectItem value="arial">Arial</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="body-font">Body Font</Label>
                      <Select defaultValue="inter">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="helvetica">Helvetica</SelectItem>
                          <SelectItem value="arial">Arial</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="studio-tagline">Studio Tagline</Label>
                      <Input id="studio-tagline" placeholder="Your place for peace and wellness" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social-links">Social Media</Label>
                      <div className="space-y-2">
                        <Input placeholder="Instagram URL" />
                        <Input placeholder="Facebook URL" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Brand Preview</h4>
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-blue-600 rounded"></div>
                    <div>
                      <p className="font-medium">Yoga Zen Zürich</p>
                      <p className="text-sm text-muted-foreground">Your place for peace and wellness</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>This is how your branding will appear on documents and emails.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Settings</CardTitle>
              <CardDescription>Configure global document generation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-generate Invoices</Label>
                    <p className="text-sm text-muted-foreground">Automatically create invoices for completed bookings</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Documents Automatically</Label>
                    <p className="text-sm text-muted-foreground">Send invoices and receipts via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include QR Codes</Label>
                    <p className="text-sm text-muted-foreground">Add QR codes for easy payment and verification</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Document Storage</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention-period">Retention Period</Label>
                    <Select defaultValue="7years">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="3years">3 years</SelectItem>
                        <SelectItem value="7years">7 years (Swiss law)</SelectItem>
                        <SelectItem value="10years">10 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Numbering Schemes</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-numbering">Invoice Numbering</Label>
                    <Input id="invoice-numbering" defaultValue="INV-{YYYY}-{MM}-{NNNN}" />
                    <p className="text-xs text-muted-foreground">
                      Use {'{YYYY}'} for year, {'{MM}'} for month, {'{NNNN}'} for sequential number
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-numbering">Receipt Numbering</Label>
                    <Input id="receipt-numbering" defaultValue="REC-{YYYY}-{NNNNNN}" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Designer Dialog */}
      <Dialog open={isDesignerOpen} onOpenChange={setIsDesignerOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Template Designer</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} - Design your PDF template
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex">
            <div className="w-1/4 border-r p-4">
              <h4 className="font-medium mb-3">Elements</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Text
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Receipt className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-8">
              <div className="bg-white h-full rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Template Designer</h3>
                  <p className="text-gray-500">Drag elements here to build your template</p>
                </div>
              </div>
            </div>
            <div className="w-1/4 border-l p-4">
              <h4 className="font-medium mb-3">Properties</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="page-size">Page Size</Label>
                  <Select defaultValue="a4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select defaultValue="portrait">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setIsDesignerOpen(false)}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}