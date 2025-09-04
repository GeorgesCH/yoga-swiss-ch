import React, { useState } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { Alert, AlertDescription } from './alert';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Phone, 
  Shield, 
  Info,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

interface ConsentOption {
  id: string;
  type: 'email' | 'sms' | 'push' | 'phone' | 'whatsapp';
  title: string;
  description: string;
  required?: boolean;
  defaultValue?: boolean;
  frequency?: string;
  examples?: string[];
}

interface ConsentManagerProps {
  onConsentChange: (consents: ConsentData) => void;
  initialConsents?: ConsentData;
  showAtCheckout?: boolean;
  compactMode?: boolean;
  studioName?: string;
}

interface ConsentData {
  email_marketing?: boolean;
  email_transactional?: boolean;
  sms_marketing?: boolean;
  sms_transactional?: boolean;
  push_notifications?: boolean;
  phone_marketing?: boolean;
  whatsapp_marketing?: boolean;
  data_processing?: boolean;
  profile_sharing?: boolean;
  consentedAt: Date;
  ipAddress?: string;
  source: string;
}

export function ConsentManager({ 
  onConsentChange, 
  initialConsents,
  showAtCheckout = false,
  compactMode = false,
  studioName = "YogaSwiss"
}: ConsentManagerProps) {
  
  const [consents, setConsents] = useState<Partial<ConsentData>>({
    email_transactional: true, // Always required for booking confirmations
    data_processing: true, // Required for service
    ...initialConsents
  });

  const consentOptions: ConsentOption[] = [
    {
      id: 'email_transactional',
      type: 'email',
      title: 'Essential Emails',
      description: 'Booking confirmations, class reminders, payment receipts',
      required: true,
      defaultValue: true,
      frequency: 'As needed',
      examples: ['Booking confirmations', 'Class reminders', 'Payment receipts', 'Policy updates']
    },
    {
      id: 'email_marketing',
      type: 'email',
      title: 'Marketing Emails',
      description: 'Class schedules, special offers, studio news, and wellness tips',
      required: false,
      defaultValue: false,
      frequency: '1-2 times per week',
      examples: ['Weekly class schedules', 'Special offers', 'New instructor announcements', 'Wellness tips']
    },
    {
      id: 'sms_transactional',
      type: 'sms',
      title: 'Essential SMS',
      description: 'Urgent class changes, last-minute availability, waitlist notifications',
      required: false,
      defaultValue: true,
      frequency: 'As needed',
      examples: ['Class cancellations', 'Waitlist openings', 'Schedule changes']
    },
    {
      id: 'sms_marketing',
      type: 'sms',
      title: 'Marketing SMS',
      description: 'Flash sales, last-minute class availability, exclusive offers',
      required: false,
      defaultValue: false,
      frequency: '1-3 times per month',
      examples: ['Flash sales', 'Last-minute spots', 'Exclusive offers']
    },
    {
      id: 'push_notifications',
      type: 'push',
      title: 'Push Notifications',
      description: 'Class reminders, check-in notifications, app updates',
      required: false,
      defaultValue: true,
      frequency: 'Daily',
      examples: ['1-hour class reminders', 'Check-in notifications', 'App updates']
    },
    {
      id: 'whatsapp_marketing',
      type: 'whatsapp',
      title: 'WhatsApp Updates',
      description: 'Community updates, exclusive content, personal check-ins',
      required: false,
      defaultValue: false,
      frequency: '1-2 times per month',
      examples: ['Community updates', 'Personal wellness check-ins', 'Exclusive content']
    }
  ];

  const handleConsentChange = (optionId: string, value: boolean) => {
    const newConsents = { ...consents, [optionId]: value };
    setConsents(newConsents);
    
    const fullConsentData: ConsentData = {
      email_marketing: newConsents.email_marketing || false,
      email_transactional: newConsents.email_transactional || true,
      sms_marketing: newConsents.sms_marketing || false,
      sms_transactional: newConsents.sms_transactional || false,
      push_notifications: newConsents.push_notifications || false,
      phone_marketing: newConsents.phone_marketing || false,
      whatsapp_marketing: newConsents.whatsapp_marketing || false,
      data_processing: true, // Always required
      profile_sharing: newConsents.profile_sharing || false,
      consentedAt: new Date(),
      source: showAtCheckout ? 'checkout' : 'settings'
    };
    
    onConsentChange(fullConsentData);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (compactMode || showAtCheckout) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Essential (always required) */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="essential" 
              checked={true}
              disabled={true}
            />
            <div className="flex-1">
              <Label htmlFor="essential" className="text-sm font-medium">
                Essential Communications
                <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Booking confirmations, class reminders, and important updates
              </p>
            </div>
          </div>

          {/* Marketing opt-in */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="marketing" 
              checked={consents.email_marketing || false}
              onCheckedChange={(value) => handleConsentChange('email_marketing', !!value)}
            />
            <div className="flex-1">
              <Label htmlFor="marketing" className="text-sm font-medium">
                Marketing & Newsletter
                <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Weekly schedules, special offers, wellness tips (1-2 emails/week)
              </p>
            </div>
          </div>

          {/* SMS opt-in */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="sms" 
              checked={consents.sms_transactional || false}
              onCheckedChange={(value) => handleConsentChange('sms_transactional', !!value)}
            />
            <div className="flex-1">
              <Label htmlFor="sms" className="text-sm font-medium">
                SMS Notifications
                <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Urgent class changes and waitlist notifications
              </p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              You can change these preferences anytime in your account settings. 
              We never share your data with third parties.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Communication Preferences</h3>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Control how {studioName} communicates with you. You can update these preferences anytime.
          We respect your privacy and never share your information with third parties.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {consentOptions.map((option) => (
          <Card key={option.id} className={option.required ? "border-blue-200 bg-blue-50/50" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getChannelIcon(option.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="font-medium">{option.title}</Label>
                      {option.required ? (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {option.description}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div><strong>Frequency:</strong> {option.frequency}</div>
                      {option.examples && (
                        <div>
                          <strong>Examples:</strong> {option.examples.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Checkbox 
                  checked={consents[option.id as keyof ConsentData] as boolean || option.defaultValue || false}
                  onCheckedChange={(value) => handleConsentChange(option.id, !!value)}
                  disabled={option.required}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Data Processing Notice */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <Label className="font-medium text-green-800">Data Processing Agreement</Label>
              <p className="text-sm text-green-700 mt-1">
                By using our services, you agree to our data processing practices as outlined in our Privacy Policy. 
                This is required to provide booking and payment services.
              </p>
              <div className="flex items-center mt-2 text-xs text-green-600">
                <Clock className="h-3 w-3 mr-1" />
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GDPR Rights */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Your Rights:</strong> You can request to access, update, or delete your personal data at any time. 
          Contact us at privacy@yogaswiss.ch or use the data export feature in your account settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Convenience component for checkout flow
export function CheckoutConsentManager({ onConsentChange, studioName }: { 
  onConsentChange: (consents: ConsentData) => void;
  studioName?: string;
}) {
  return (
    <ConsentManager 
      onConsentChange={onConsentChange}
      showAtCheckout={true}
      compactMode={true}
      studioName={studioName}
    />
  );
}