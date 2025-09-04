import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Upload, FileText, Download, CheckCircle, AlertCircle, Users
} from 'lucide-react';

interface CustomerImportDialogProps {
  onClose: () => void;
}

export function CustomerImportDialog({ onClose }: CustomerImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[]
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const simulateImport = () => {
    setStep('importing');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('complete');
          setImportResults({
            total: 125,
            successful: 122,
            failed: 3,
            errors: [
              'Row 5: Invalid email format',
              'Row 12: Missing required field: firstName',
              'Row 18: Duplicate email address'
            ]
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Customer Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              Upload a CSV file with customer data. Supported formats: CSV, XLSX
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium">Choose file to upload</span>
                <br />
                <span className="text-sm text-muted-foreground">
                  or drag and drop your CSV file here
                </span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download our CSV template to ensure your data is properly formatted
          </p>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={() => setStep('mapping')} 
          disabled={!file}
        >
          Next: Map Fields
        </Button>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Field Mapping</CardTitle>
          <CardDescription>
            Map your CSV columns to customer fields
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CSV Column</Label>
              <div className="space-y-2 mt-2">
                <div className="p-2 bg-muted rounded text-sm">email</div>
                <div className="p-2 bg-muted rounded text-sm">first_name</div>
                <div className="p-2 bg-muted rounded text-sm">last_name</div>
                <div className="p-2 bg-muted rounded text-sm">phone</div>
              </div>
            </div>
            <div>
              <Label>Customer Field</Label>
              <div className="space-y-2 mt-2">
                <div className="p-2 border rounded text-sm">Email Address</div>
                <div className="p-2 border rounded text-sm">First Name</div>
                <div className="p-2 border rounded text-sm">Last Name</div>
                <div className="p-2 border rounded text-sm">Phone Number</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('upload')}>
          Back
        </Button>
        <Button onClick={simulateImport}>
          Start Import
        </Button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Importing Customers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          <p className="text-sm text-muted-foreground">
            Please wait while we import your customer data...
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Import Complete</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {importResults.successful}
              </div>
              <div className="text-sm text-green-700">Successful</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {importResults.failed}
              </div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {importResults.total}
              </div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
          </div>

          {importResults.errors.length > 0 && (
            <div className="space-y-2">
              <Label>Import Errors</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {importResults.errors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>
            Import customer data from a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}