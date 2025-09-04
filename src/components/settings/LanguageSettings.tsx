import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Globe, 
  Info,
  Settings
} from 'lucide-react';

export function LanguageSettings() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Regional & Format Settings</h2>
          <p className="text-muted-foreground">
            Configure Swiss formatting and regional preferences (English-only)
          </p>
        </div>
      </div>

      {/* Language Status Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Language Support Removed:</strong> YogaSwiss now operates in English-only mode. Multi-language support has been simplified to focus on core functionality with Swiss regional formatting.
        </AlertDescription>
      </Alert>

      {/* Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Current Configuration
          </CardTitle>
          <CardDescription>Application language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">Application interface</p>
                </div>
                <Badge className="bg-green-100 text-green-800">English</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium">Region</p>
                  <p className="text-sm text-muted-foreground">Business location</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Switzerland</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <p className="font-medium">Currency</p>
                  <p className="text-sm text-muted-foreground">Default currency</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">CHF</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div>
                  <p className="font-medium">Timezone</p>
                  <p className="text-sm text-muted-foreground">Local timezone</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Europe/Zurich</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swiss Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Swiss Format Settings</CardTitle>
          <CardDescription>Configure Swiss-specific formatting preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Date & Time Formats</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dd.mm.yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd.mm.yyyy">DD.MM.YYYY (Swiss Standard)</SelectItem>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24-hour (14:30) - Swiss Standard</SelectItem>
                      <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Number & Currency</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="decimal-separator">Decimal Separator</Label>
                  <Select defaultValue="period">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="period">Period (123.45) - Swiss Standard</SelectItem>
                      <SelectItem value="comma">Comma (123,45)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thousand-separator">Thousand Separator</Label>
                  <Select defaultValue="apostrophe">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apostrophe">Apostrophe (1'234) - Swiss Standard</SelectItem>
                      <SelectItem value="space">Space (1 234)</SelectItem>
                      <SelectItem value="comma">Comma (1,234)</SelectItem>
                      <SelectItem value="none">None (1234)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency-position">Currency Position</Label>
                  <Select defaultValue="before">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before (CHF 25.00) - Swiss Standard</SelectItem>
                      <SelectItem value="after">After (25.00 CHF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Format Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Date:</strong> 15.01.2024</p>
                <p><strong>Time:</strong> 14:30</p>
                <p><strong>DateTime:</strong> 15.01.2024 14:30</p>
              </div>
              <div>
                <p><strong>Currency:</strong> CHF 1'234.50</p>
                <p><strong>Number:</strong> 1'234.56</p>
                <p><strong>VAT Rate:</strong> 7.7%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Format */}
      <Card>
        <CardHeader>
          <CardTitle>Address Format</CardTitle>
          <CardDescription>Swiss address display format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="swiss-address">Swiss Address Format</Label>
            <Textarea 
              id="swiss-address"
              defaultValue="{street} {number}&#10;{postal_code} {city}&#10;Switzerland"
              rows={3}
              readOnly
              className="bg-muted/50"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Standard Swiss address format with postal code before city name.
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Example Address</h5>
            <div className="text-sm text-blue-700">
              <p>Bahnhofstrasse 123</p>
              <p>8001 Zürich</p>
              <p>Switzerland</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}