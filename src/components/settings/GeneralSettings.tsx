import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Building2, Globe, MapPin, CreditCard, Languages, Receipt, 
  Save, AlertTriangle, CheckCircle, Info, FileText, Palette
} from 'lucide-react';
import { SettingsService } from '../../utils/supabase/settings-service';

interface GeneralSettingsProps {
  orgId: string;
}

export function GeneralSettings({ orgId }: GeneralSettingsProps) {
  const [activeTab, setActiveTab] = useState('organization');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [orgId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsData = await SettingsService.getOrgSettings(orgId);
      setSettings(settingsData || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any, dataType: string = 'string') => {
    try {
      await SettingsService.setOrgSetting(orgId, 'general', key, value, dataType as any);
      setSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      // Save all modified settings
      // This would be implemented with a batch update
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const OrganizationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Legal Information
          </CardTitle>
          <CardDescription>Company details and legal identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="Yoga Zen Zürich GmbH"
                value={settings.company_name || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, company_name: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-name">Legal Name</Label>
              <Input
                id="legal-name"
                placeholder="Yoga Zen Zürich GmbH"
                value={settings.legal_name || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, legal_name: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vat-id">VAT ID</Label>
              <Input
                id="vat-id"
                placeholder="CHE-123.456.789"
                value={settings.vat_id || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, vat_id: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-registration">Business Registration</Label>
              <Input
                id="business-registration"
                placeholder="CHE-123.456.789"
                value={settings.business_registration || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, business_registration: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address *</Label>
            <Textarea
              id="address"
              placeholder="Bahnhofstrasse 1&#10;8001 Zürich&#10;Switzerland"
              value={settings.business_address || ''}
              onChange={(e) => {
                setSettings((prev: any) => ({ ...prev, business_address: e.target.value }));
                setHasChanges(true);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="info@yogazen.ch"
                value={settings.contact_email || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, contact_email: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input
                id="contact-phone"
                placeholder="+41 44 123 45 67"
                value={settings.contact_phone || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, contact_phone: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://www.yogazen.ch"
                value={settings.website || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, website: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={settings.industry || ''}
                onValueChange={(value) => {
                  setSettings((prev: any) => ({ ...prev, industry: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wellness">Health & Wellness</SelectItem>
                  <SelectItem value="fitness">Fitness & Recreation</SelectItem>
                  <SelectItem value="education">Education & Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>Currency, timezone, and language settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={settings.currency || 'CHF'}
                onValueChange={(value) => {
                  setSettings((prev: any) => ({ ...prev, currency: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone || 'Europe/Zurich'}
                onValueChange={(value) => {
                  setSettings((prev: any) => ({ ...prev, timezone: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                  <SelectItem value="Europe/Geneva">Europe/Geneva</SelectItem>
                  <SelectItem value="Europe/Bern">Europe/Bern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary-locale">Primary Language</Label>
              <Select
                value={settings.primary_locale || 'de-CH'}
                onValueChange={(value) => {
                  setSettings((prev: any) => ({ ...prev, primary_locale: value }));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de-CH">Deutsch (Schweiz)</SelectItem>
                  <SelectItem value="fr-CH">Français (Suisse)</SelectItem>
                  <SelectItem value="it-CH">Italiano (Svizzera)</SelectItem>
                  <SelectItem value="en-CH">English (Switzerland)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Enabled Languages</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { code: 'de-CH', name: 'Deutsch (Schweiz)' },
                { code: 'fr-CH', name: 'Français (Suisse)' },
                { code: 'it-CH', name: 'Italiano (Svizzera)' },
                { code: 'en-CH', name: 'English (Switzerland)' }
              ].map(lang => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Switch
                    id={`lang-${lang.code}`}
                    checked={settings.enabled_languages?.includes(lang.code) || lang.code === 'de-CH'}
                    onCheckedChange={(checked) => {
                      const current = settings.enabled_languages || ['de-CH'];
                      const updated = checked
                        ? [...current, lang.code]
                        : current.filter((l: string) => l !== lang.code);
                      setSettings((prev: any) => ({ ...prev, enabled_languages: updated }));
                      setHasChanges(true);
                    }}
                  />
                  <Label htmlFor={`lang-${lang.code}`} className="text-sm">
                    {lang.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={settings.date_format || 'DD.MM.YYYY'}
              onValueChange={(value) => {
                setSettings((prev: any) => ({ ...prev, date_format: value }));
                setHasChanges(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (Swiss)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BrandingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Identity
          </CardTitle>
          <CardDescription>Logo, colors, and visual branding elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  placeholder="YogaZen"
                  value={settings.brand_name || ''}
                  onChange={(e) => {
                    setSettings((prev: any) => ({ ...prev, brand_name: e.target.value }));
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="Find Your Inner Peace"
                  value={settings.tagline || ''}
                  onChange={(e) => {
                    setSettings((prev: any) => ({ ...prev, tagline: e.target.value }));
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-description">Brand Description</Label>
                <Textarea
                  id="brand-description"
                  placeholder="Describe your studio's mission and values..."
                  value={settings.brand_description || ''}
                  onChange={(e) => {
                    setSettings((prev: any) => ({ ...prev, brand_description: e.target.value }));
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Colors</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={settings.primary_color || '#000000'}
                        onChange={(e) => {
                          setSettings((prev: any) => ({ ...prev, primary_color: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.primary_color || '#000000'}
                        onChange={(e) => {
                          setSettings((prev: any) => ({ ...prev, primary_color: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={settings.secondary_color || '#6b7280'}
                        onChange={(e) => {
                          setSettings((prev: any) => ({ ...prev, secondary_color: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.secondary_color || '#6b7280'}
                        onChange={(e) => {
                          setSettings((prev: any) => ({ ...prev, secondary_color: e.target.value }));
                          setHasChanges(true);
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Upload your studio logo (SVG, PNG, JPG)
                    </div>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media & Marketing</CardTitle>
          <CardDescription>Social media profiles and marketing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yogazen"
                value={settings.facebook_url || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, facebook_url: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yogazen"
                value={settings.instagram_url || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, instagram_url: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/yogazen"
                value={settings.twitter_url || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, twitter_url: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/company/yogazen"
                value={settings.linkedin_url || ''}
                onChange={(e) => {
                  setSettings((prev: any) => ({ ...prev, linkedin_url: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">General Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your studio's basic information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Alert className="p-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </Alert>
          )}
          <Button onClick={saveAllChanges} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <OrganizationTab />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <BrandingTab />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Modules</CardTitle>
              <CardDescription>Enable or disable platform features for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'online_booking', name: 'Online Booking', description: 'Allow customers to book classes online' },
                { key: 'mobile_app', name: 'Mobile App', description: 'Enable mobile app access for customers' },
                { key: 'waitlist', name: 'Waitlist Management', description: 'Automatic waitlist management for full classes' },
                { key: 'packages', name: 'Packages & Memberships', description: 'Sell class packages and memberships' },
                { key: 'workshops', name: 'Workshops & Events', description: 'Create and manage special events' },
                { key: 'retail', name: 'Retail & Products', description: 'Sell physical products and merchandise' },
                { key: 'marketing', name: 'Marketing Tools', description: 'Email campaigns and customer engagement' },
                { key: 'analytics', name: 'Advanced Analytics', description: 'Detailed reporting and insights' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                  <Switch
                    checked={settings[feature.key] || false}
                    onCheckedChange={(checked) => {
                      setSettings((prev: any) => ({ ...prev, [feature.key]: checked }));
                      setHasChanges(true);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}