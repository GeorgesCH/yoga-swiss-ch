import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { PeopleService } from '../utils/supabase/people-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Upload, Download, FileSpreadsheet, AlertCircle, 
  Check, X, Users, Mail, Phone, MapPin, Tag,
  FileText, RefreshCw
} from 'lucide-react';

interface CustomerImportDialogProps {
  onClose: () => void;
  onComplete?: () => void;
}

// Mock import data
const mockImportPreview = [
  {
    row: 1,
    data: {
      firstName: 'Anna',
      lastName: 'Müller', 
      email: 'anna.mueller@email.ch',
      phone: '+41 79 123 4567',
      city: 'Zürich'
    },
    status: 'valid',
    issues: []
  },
  {
    row: 2,
    data: {
      firstName: 'Marc',
      lastName: 'Dubois',
      email: 'marc.dubois@email.ch', 
      phone: '+41 76 234',
      city: 'Genève'
    },
    status: 'warning',
    issues: ['Phone number incomplete']
  },
  {
    row: 3,
    data: {
      firstName: 'Sofia',
      lastName: 'Rossi',
      email: 'invalid-email',
      phone: '+41 78 345 6789',
      city: 'Lugano'
    },
    status: 'error',
    issues: ['Invalid email format']
  }
];

const fieldMappings = [
  { csvField: 'First Name', systemField: 'firstName', required: true },
  { csvField: 'Last Name', systemField: 'lastName', required: true },
  { csvField: 'Email', systemField: 'email', required: true },
  { csvField: 'Phone', systemField: 'phone', required: false },
  { csvField: 'City', systemField: 'city', required: false },
  { csvField: 'Date of Birth', systemField: 'birthDate', required: false },
  { csvField: 'Language', systemField: 'language', required: false }
];

export function CustomerImportDialog({ onClose, onComplete }: CustomerImportDialogProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [importProgress, setImportProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [peopleService] = useState(() => new PeopleService());
  const [importResults, setImportResults] = useState({
    total: 0,
    successful: 0,
    warnings: 0,
    errors: 0
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Parse CSV file (in a real app, you'd use a proper CSV parser like Papa Parse)
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = { _rowIndex: index + 2 }; // +2 because we start from line 2
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });
        
        setCsvHeaders(headers);
        setCsvData(data);
        
        // Auto-map common fields
        const autoMappings: Record<string, string> = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
            autoMappings['firstName'] = header;
          } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
            autoMappings['lastName'] = header;
          } else if (lowerHeader.includes('email')) {
            autoMappings['email'] = header;
          } else if (lowerHeader.includes('phone')) {
            autoMappings['phone'] = header;
          } else if (lowerHeader.includes('city')) {
            autoMappings['city'] = header;
          }
        });
        setMappings(autoMappings);
      }
      
      setStep('mapping');
    }
  };

  const handleMapping = (systemField: string, csvField: string) => {
    setMappings(prev => ({ ...prev, [systemField]: csvField }));
  };

  const validateImportData = () => {
    const preview = csvData.slice(0, 10).map(row => {
      const customerData: any = {};
      const issues: string[] = [];
      
      // Map fields according to mappings
      Object.entries(mappings).forEach(([systemField, csvField]) => {
        if (csvField && row[csvField] !== undefined) {
          customerData[systemField] = row[csvField];
        }
      });
      
      // Validate required fields
      if (!customerData.firstName || customerData.firstName.trim() === '') {
        issues.push('First name is required');
      }
      if (!customerData.lastName || customerData.lastName.trim() === '') {
        issues.push('Last name is required');  
      }
      if (!customerData.email || customerData.email.trim() === '') {
        issues.push('Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        issues.push('Invalid email format');
      }
      
      // Validate phone number format
      if (customerData.phone && !/^\+41\s?\d{2}\s?\d{3}\s?\d{4}$/.test(customerData.phone)) {
        issues.push('Phone number should be in Swiss format (+41 XX XXX XXXX)');
      }
      
      let status = 'valid';
      if (issues.length > 0) {
        status = issues.some(issue => issue.includes('required') || issue.includes('Invalid email')) ? 'error' : 'warning';
      }
      
      return {
        row: row._rowIndex,
        data: customerData,
        status,
        issues
      };
    });
    
    setPreviewData(preview);
  };

  const startImport = async () => {
    setStep('importing');
    setImportProgress(0);
    
    try {
      const results = {
        total: csvData.length,
        successful: 0,
        warnings: 0,
        errors: 0
      };
      
      // Process customers in batches
      const batchSize = 10;
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        
        for (const row of batch) {
          try {
            // Map fields according to mappings
            const customerData: any = {};
            Object.entries(mappings).forEach(([systemField, csvField]) => {
              if (csvField && row[csvField] !== undefined) {
                customerData[systemField] = row[csvField];
              }
            });
            
            // Validate required fields
            if (!customerData.firstName || !customerData.lastName || !customerData.email) {
              results.errors++;
              continue;
            }
            
            // Set defaults
            customerData.language = customerData.language || 'en-CH';
            customerData.marketingConsent = false;
            
            // Create customer
            const { error } = await peopleService.createCustomer(customerData);
            
            if (error) {
              if (error.includes('already exists') || error.includes('duplicate')) {
                results.warnings++;
              } else {
                results.errors++;
              }
            } else {
              results.successful++;
            }
            
          } catch (error) {
            console.error('Error creating customer:', error);
            results.errors++;
          }
        }
        
        // Update progress
        const progress = Math.round(((i + batch.length) / csvData.length) * 100);
        setImportProgress(progress);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportResults(results);
      setStep('complete');
      
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        total: csvData.length,
        successful: 0,
        warnings: 0,
        errors: csvData.length
      });
      setStep('complete');
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Import Customers</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['Upload', 'Mapping', 'Preview', 'Import'].map((stepName, index) => {
              const currentStepIndex = ['upload', 'mapping', 'preview', 'importing'].indexOf(step);
              const isCompleted = index < currentStepIndex || step === 'complete';
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isCurrent ? 'bg-blue-500 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium">{stepName}</span>
                  {index < 3 && <div className="w-12 h-px bg-gray-300 mx-4" />}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {step === 'upload' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Customer Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload CSV or Excel File</h3>
                      <p className="text-muted-foreground mb-4">
                        Drag and drop your file here or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span>Choose File</span>
                        </Button>
                      </label>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Supported formats: CSV, Excel (.xlsx, .xls). Maximum file size: 10MB.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Download Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use our template to ensure your data is properly formatted.
                    </p>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 'mapping' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Map Fields</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Map your CSV columns to system fields. Required fields are marked with *.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fieldMappings.map(field => (
                        <div key={field.systemField} className="flex items-center space-x-4">
                          <div className="w-40">
                            <label className="text-sm font-medium">
                              {field.csvField} {field.required && <span className="text-red-500">*</span>}
                            </label>
                          </div>
                          <Select 
                            value={mappings[field.systemField] || ''}
                            onValueChange={(value) => handleMapping(field.systemField, value)}
                          >
                            <SelectTrigger className="w-60">
                              <SelectValue placeholder="Select CSV column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">-- Skip Field --</SelectItem>
                              {csvHeaders.map(header => (
                                <SelectItem key={header} value={header}>{header}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      validateImportData();
                      setStep('preview');
                    }}
                    disabled={!mappings.firstName || !mappings.lastName || !mappings.email}
                  >
                    Preview Import
                  </Button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Import Preview</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Review your data before importing. Fix any errors or warnings.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">234</div>
                        <div className="text-muted-foreground">Valid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600">8</div>
                        <div className="text-muted-foreground">Warnings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">5</div>
                        <div className="text-muted-foreground">Errors</div>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 font-medium text-sm border-b">
                        Sample Rows (showing first 3)
                      </div>
                      {mockImportPreview.map(row => (
                        <div key={row.row} className="border-b last:border-b-0">
                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-xs text-muted-foreground">Row {row.row}</span>
                                {getStatusIcon(row.status)}
                                <span className="text-sm">
                                  {row.data.firstName} {row.data.lastName}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {row.data.email}
                                </span>
                              </div>
                            </div>
                            {row.issues.length > 0 && (
                              <div className="text-xs text-red-600">
                                Issues: {row.issues.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setStep('mapping')}>
                    Back to Mapping
                  </Button>
                  <Button onClick={startImport}>
                    Start Import
                  </Button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Importing Customers...</h3>
                      <p className="text-muted-foreground mb-6">
                        Please wait while we process your data
                      </p>
                      <Progress value={importProgress} className="w-full max-w-md mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {importProgress}% complete
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
                      <p className="text-muted-foreground mb-6">
                        Your customer data has been successfully imported
                      </p>
                      
                      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{importResults.total}</div>
                          <div className="text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{importResults.successful}</div>
                          <div className="text-muted-foreground">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-yellow-600">{importResults.warnings}</div>
                          <div className="text-muted-foreground">Warnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{importResults.errors}</div>
                          <div className="text-muted-foreground">Errors</div>
                        </div>
                      </div>

                      <div className="flex justify-center space-x-3">
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                        <Button onClick={onClose}>
                          Done
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}