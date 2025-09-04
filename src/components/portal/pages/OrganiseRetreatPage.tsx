import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/ComprehensiveI18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { getCityHeroImage } from '../../../utils/city-hero-images';
import { 
  Mountain,
  Users,
  Calendar,
  MapPin,
  ChefHat,
  Camera,
  Shield,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  ArrowRight,
  Upload,
  FileText,
  Globe,
  MessageSquare,
  HelpCircle,
  Compass,
  Plane,
  Home,
  Utensils,
  Wifi,
  Music,
  Dumbbell,
  Award,
  Mail,
  Phone
} from 'lucide-react';

interface OrganiseRetreatPageProps {
  onPageChange: (page: string) => void;
}

interface RetreatInquiryForm {
  // Teacher and studio information
  teacherName: string;
  email: string;
  phone: string;
  brandStudio: string;
  city: string;
  language: string;
  yogaswissProfile: string;

  // Retreat details
  preferredCountry: string;
  preferredRegion: string;
  startDate: string;
  endDate: string;
  lengthNights: number;
  groupSizeMin: number;
  groupSizeMax: number;
  roomPreference: 'private' | 'shared' | 'mixed';
  yogaStyle: string;
  dailySchedule: string;
  budgetLow: number;
  budgetHigh: number;
  currency: string;

  // Required services
  services: {
    venue: boolean;
    accommodation: boolean;
    chef: boolean;
    transfers: boolean;
    activities: boolean;
    photography: boolean;
    marketing: boolean;
    bookingPage: boolean;
  };

  // Production support level
  supportLevel: 'light' | 'full';

  // Special requirements
  accessibility: string;
  familyFriendly: boolean;
  alcoholPolicy: string;
  amenities: {
    pool: boolean;
    sauna: boolean;
    spa: boolean;
    wifi: boolean;
    meals: boolean;
  };

  // Marketing preferences
  marketing: {
    listBuilding: boolean;
    paidAds: boolean;
    email: boolean;
    crossPromotion: boolean;
  };

  // Legal and compliance
  insurance: string;
  liability: string;

  // Additional information
  additionalRequirements: string;
  attachments: File[];

  // Consent
  consentContact: boolean;
  consentData: boolean;
  newsletterOptIn: boolean;
}

const initialForm: RetreatInquiryForm = {
  teacherName: '',
  email: '',
  phone: '',
  brandStudio: '',
  city: '',
  language: '',
  yogaswissProfile: '',
  preferredCountry: '',
  preferredRegion: '',
  startDate: '',
  endDate: '',
  lengthNights: 3,
  groupSizeMin: 8,
  groupSizeMax: 16,
  roomPreference: 'private',
  yogaStyle: '',
  dailySchedule: '',
  budgetLow: 1500,
  budgetHigh: 3000,
  currency: 'CHF',
  services: {
    venue: true,
    accommodation: true,
    chef: false,
    transfers: false,
    activities: false,
    photography: false,
    marketing: false,
    bookingPage: false
  },
  supportLevel: 'light',
  accessibility: '',
  familyFriendly: false,
  alcoholPolicy: '',
  amenities: {
    pool: false,
    sauna: false,
    spa: false,
    wifi: true,
    meals: true
  },
  marketing: {
    listBuilding: false,
    paidAds: false,
    email: false,
    crossPromotion: false
  },
  insurance: '',
  liability: '',
  additionalRequirements: '',
  attachments: [],
  consentContact: false,
  consentData: false,
  newsletterOptIn: false
};

export function OrganiseRetreatPage({ onPageChange }: OrganiseRetreatPageProps) {
  const { t, locale, formatCurrency } = useTranslation();
  
  const [form, setForm] = useState<RetreatInquiryForm>(initialForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const heroImage = getCityHeroImage('switzerland');

  const steps = [
    { id: 1, title: t('retreat_inquiry.steps.basics', 'Basic Information') },
    { id: 2, title: t('retreat_inquiry.steps.retreat_details', 'Retreat Details') },
    { id: 3, title: t('retreat_inquiry.steps.services', 'Services & Requirements') },
    { id: 4, title: t('retreat_inquiry.steps.review', 'Review & Submit') }
  ];

  const partners = [
    { name: 'Burgenstock Resort', type: 'venue', location: 'Switzerland' },
    { name: 'Villa Stephanie', type: 'venue', location: 'Germany' },
    { name: 'Château du Sureau', type: 'venue', location: 'France' },
    { name: 'Chef Marcus Weber', type: 'chef', location: 'Zürich' },
    { name: 'Alpine Photography', type: 'media', location: 'Swiss Alps' },
    { name: 'Wellness Transfer Services', type: 'transport', location: 'Switzerland' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      studio: 'Zen Flow Studio Zürich',
      text: 'YogaSwiss helped us organize an incredible 5-day retreat in the Swiss Alps. Their attention to detail and partner network made everything seamless.',
      rating: 5
    },
    {
      name: 'Marco Bernasconi',
      studio: 'Milano Yoga Collective',
      text: 'From venue selection to marketing support, the retreat concierge service exceeded all expectations. We\'ll definitely use them again.',
      rating: 5
    }
  ];

  const faqItems = [
    {
      question: t('retreat_inquiry.faq.timeline.question', 'How far in advance should I plan my retreat?'),
      answer: t('retreat_inquiry.faq.timeline.answer', 'We recommend planning 4-6 months in advance for domestic retreats and 6-9 months for international destinations to ensure the best venue availability and pricing.')
    },
    {
      question: t('retreat_inquiry.faq.cost.question', 'What are the costs for retreat planning services?'),
      answer: t('retreat_inquiry.faq.cost.answer', 'Our service fees vary based on the level of support needed. Light guidance starts at 5% commission, while full-service planning ranges from 10-15% depending on the retreat size and complexity.')
    },
    {
      question: t('retreat_inquiry.faq.insurance.question', 'Do I need special insurance for retreats?'),
      answer: t('retreat_inquiry.faq.insurance.answer', 'Yes, we strongly recommend retreat-specific liability and cancellation insurance. We can connect you with specialized providers and help navigate the requirements.')
    },
    {
      question: t('retreat_inquiry.faq.marketing.question', 'Can you help with marketing my retreat?'),
      answer: t('retreat_inquiry.faq.marketing.answer', 'Absolutely! Our marketing services include creating booking pages, social media campaigns, email marketing, and cross-promotion within the YogaSwiss community.')
    }
  ];

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedForm = (section: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof RetreatInquiryForm] as any,
        [field]: value
      }
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileArray]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const submitInquiry = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here would be the actual API integration:
      // const formData = new FormData();
      // Object.entries(form).forEach(([key, value]) => {
      //   if (key === 'attachments') {
      //     value.forEach((file: File) => formData.append('attachments', file));
      //   } else {
      //     formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      //   }
      // });
      
      // const response = await fetch('/api/retreat-requests', {
      //   method: 'POST',
      //   body: formData
      // });
      
      setSubmissionSuccess(true);
      
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t('retreat_inquiry.teacher_info.title', 'Teacher & Studio Information')}</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacherName">{t('retreat_inquiry.teacher_info.name', 'Your Name')}</Label>
                <Input
                  id="teacherName"
                  value={form.teacherName}
                  onChange={(e) => updateForm('teacherName', e.target.value)}
                  placeholder={t('retreat_inquiry.teacher_info.name_placeholder', 'Enter your full name')}
                />
              </div>
              
              <div>
                <Label htmlFor="email">{t('retreat_inquiry.teacher_info.email', 'Email Address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder={t('retreat_inquiry.teacher_info.email_placeholder', 'Enter your email')}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{t('retreat_inquiry.teacher_info.phone', 'Phone Number')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder={t('retreat_inquiry.teacher_info.phone_placeholder', '+41 XX XXX XX XX')}
                />
              </div>
              
              <div>
                <Label htmlFor="brandStudio">{t('retreat_inquiry.teacher_info.brand', 'Brand or Studio')}</Label>
                <Input
                  id="brandStudio"
                  value={form.brandStudio}
                  onChange={(e) => updateForm('brandStudio', e.target.value)}
                  placeholder={t('retreat_inquiry.teacher_info.brand_placeholder', 'Studio name or personal brand')}
                />
              </div>
              
              <div>
                <Label htmlFor="city">{t('retreat_inquiry.teacher_info.city', 'City')}</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  placeholder={t('retreat_inquiry.teacher_info.city_placeholder', 'Your city')}
                />
              </div>
              
              <div>
                <Label htmlFor="language">{t('retreat_inquiry.teacher_info.language', 'Preferred Language')}</Label>
                <Select value={form.language} onValueChange={(value) => updateForm('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('retreat_inquiry.teacher_info.language_placeholder', 'Select language')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="yogaswissProfile">{t('retreat_inquiry.teacher_info.profile', 'YogaSwiss Profile (Optional)')}</Label>
              <Input
                id="yogaswissProfile"
                value={form.yogaswissProfile}
                onChange={(e) => updateForm('yogaswissProfile', e.target.value)}
                placeholder={t('retreat_inquiry.teacher_info.profile_placeholder', 'Link to your YogaSwiss profile')}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t('retreat_inquiry.retreat_details.title', 'Retreat Details')}</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredCountry">{t('retreat_inquiry.retreat_details.country', 'Preferred Country')}</Label>
                <Select value={form.preferredCountry} onValueChange={(value) => updateForm('preferredCountry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('retreat_inquiry.retreat_details.country_placeholder', 'Select country')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="switzerland">Switzerland</SelectItem>
                    <SelectItem value="austria">Austria</SelectItem>
                    <SelectItem value="italy">Italy</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preferredRegion">{t('retreat_inquiry.retreat_details.region', 'Preferred Region')}</Label>
                <Input
                  id="preferredRegion"
                  value={form.preferredRegion}
                  onChange={(e) => updateForm('preferredRegion', e.target.value)}
                  placeholder={t('retreat_inquiry.retreat_details.region_placeholder', 'e.g., Swiss Alps, Tuscany')}
                />
              </div>
              
              <div>
                <Label htmlFor="startDate">{t('retreat_inquiry.retreat_details.start_date', 'Preferred Start Date')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">{t('retreat_inquiry.retreat_details.end_date', 'Preferred End Date')}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="lengthNights">{t('retreat_inquiry.retreat_details.length', 'Length (Nights)')}</Label>
                <Input
                  id="lengthNights"
                  type="number"
                  min="1"
                  max="30"
                  value={form.lengthNights}
                  onChange={(e) => updateForm('lengthNights', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="yogaStyle">{t('retreat_inquiry.retreat_details.style', 'Yoga/Wellness Style')}</Label>
                <Input
                  id="yogaStyle"
                  value={form.yogaStyle}
                  onChange={(e) => updateForm('yogaStyle', e.target.value)}
                  placeholder={t('retreat_inquiry.retreat_details.style_placeholder', 'e.g., Vinyasa, Hatha, Wellness')}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="groupSizeMin">{t('retreat_inquiry.retreat_details.group_min', 'Min Group Size')}</Label>
                <Input
                  id="groupSizeMin"
                  type="number"
                  min="1"
                  value={form.groupSizeMin}
                  onChange={(e) => updateForm('groupSizeMin', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="groupSizeMax">{t('retreat_inquiry.retreat_details.group_max', 'Max Group Size')}</Label>
                <Input
                  id="groupSizeMax"
                  type="number"
                  min="1"
                  value={form.groupSizeMax}
                  onChange={(e) => updateForm('groupSizeMax', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label>{t('retreat_inquiry.retreat_details.room_preference', 'Room Preference')}</Label>
                <RadioGroup 
                  value={form.roomPreference} 
                  onValueChange={(value) => updateForm('roomPreference', value)}
                  className="flex flex-col space-y-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">{t('retreat_inquiry.retreat_details.private_rooms', 'Private rooms')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shared" id="shared" />
                    <Label htmlFor="shared">{t('retreat_inquiry.retreat_details.shared_rooms', 'Shared rooms')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed">{t('retreat_inquiry.retreat_details.mixed_rooms', 'Mixed options')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budgetLow">{t('retreat_inquiry.retreat_details.budget_low', 'Budget Range (Low)')}</Label>
                <Input
                  id="budgetLow"
                  type="number"
                  value={form.budgetLow}
                  onChange={(e) => updateForm('budgetLow', parseInt(e.target.value))}
                  placeholder="1500"
                />
              </div>
              
              <div>
                <Label htmlFor="budgetHigh">{t('retreat_inquiry.retreat_details.budget_high', 'Budget Range (High)')}</Label>
                <Input
                  id="budgetHigh"
                  type="number"
                  value={form.budgetHigh}
                  onChange={(e) => updateForm('budgetHigh', parseInt(e.target.value))}
                  placeholder="3000"
                />
              </div>
              
              <div>
                <Label>{t('retreat_inquiry.retreat_details.currency', 'Currency')}</Label>
                <Select value={form.currency} onValueChange={(value) => updateForm('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="dailySchedule">{t('retreat_inquiry.retreat_details.schedule', 'Daily Schedule Ideas')}</Label>
              <Textarea
                id="dailySchedule"
                value={form.dailySchedule}
                onChange={(e) => updateForm('dailySchedule', e.target.value)}
                placeholder={t('retreat_inquiry.retreat_details.schedule_placeholder', 'Describe your ideal daily schedule, class types, and retreat flow...')}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t('retreat_inquiry.services.title', 'Services & Requirements')}</h3>
            
            <div>
              <h4 className="font-medium mb-3">{t('retreat_inquiry.services.required_services', 'Required Services')}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(form.services).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => updateNestedForm('services', key, !!checked)}
                    />
                    <Label htmlFor={key} className="text-sm">
                      {t(`retreat_inquiry.services.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">{t('retreat_inquiry.services.support_level', 'Production Support Level')}</h4>
              <RadioGroup 
                value={form.supportLevel} 
                onValueChange={(value) => updateForm('supportLevel', value)}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="light" id="light" className="mt-1" />
                  <div>
                    <Label htmlFor="light" className="font-medium">
                      {t('retreat_inquiry.services.light_guidance', 'Light Guidance')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('retreat_inquiry.services.light_description', 'Basic venue recommendations and partner connections')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div>
                    <Label htmlFor="full" className="font-medium">
                      {t('retreat_inquiry.services.full_service', 'Full Service')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('retreat_inquiry.services.full_description', 'Complete planning, coordination, marketing, and execution support')}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">{t('retreat_inquiry.services.amenities', 'Desired Amenities')}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(form.amenities).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateNestedForm('amenities', key, !!checked)}
                    />
                    <Label htmlFor={`amenity-${key}`} className="text-sm">
                      {t(`retreat_inquiry.amenities.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">{t('retreat_inquiry.services.marketing_preferences', 'Marketing Preferences')}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(form.marketing).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`marketing-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateNestedForm('marketing', key, !!checked)}
                    />
                    <Label htmlFor={`marketing-${key}`} className="text-sm">
                      {t(`retreat_inquiry.marketing.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="accessibility">{t('retreat_inquiry.services.accessibility', 'Accessibility Requirements')}</Label>
                <Textarea
                  id="accessibility"
                  value={form.accessibility}
                  onChange={(e) => updateForm('accessibility', e.target.value)}
                  placeholder={t('retreat_inquiry.services.accessibility_placeholder', 'Any specific accessibility needs or requirements...')}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="familyFriendly"
                  checked={form.familyFriendly}
                  onCheckedChange={(checked) => updateForm('familyFriendly', !!checked)}
                />
                <Label htmlFor="familyFriendly">{t('retreat_inquiry.services.family_friendly', 'Family-friendly retreat')}</Label>
              </div>
              
              <div>
                <Label htmlFor="alcoholPolicy">{t('retreat_inquiry.services.alcohol_policy', 'Alcohol Policy')}</Label>
                <Select value={form.alcoholPolicy} onValueChange={(value) => updateForm('alcoholPolicy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('retreat_inquiry.services.alcohol_placeholder', 'Select policy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('retreat_inquiry.services.alcohol_none', 'Alcohol-free')}</SelectItem>
                    <SelectItem value="moderate">{t('retreat_inquiry.services.alcohol_moderate', 'Moderate consumption')}</SelectItem>
                    <SelectItem value="open">{t('retreat_inquiry.services.alcohol_open', 'Open policy')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="additionalRequirements">{t('retreat_inquiry.services.additional', 'Additional Requirements')}</Label>
              <Textarea
                id="additionalRequirements"
                value={form.additionalRequirements}
                onChange={(e) => updateForm('additionalRequirements', e.target.value)}
                placeholder={t('retreat_inquiry.services.additional_placeholder', 'Any other special requirements, preferences, or details...')}
                rows={4}
              />
            </div>
            
            <div>
              <Label>{t('retreat_inquiry.services.attachments', 'Attachments (Optional)')}</Label>
              <div className="mt-2 space-y-3">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="fileUpload"
                  />
                  <Label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('retreat_inquiry.services.upload_prompt', 'Click to upload PDFs, schedules, or inspiration images')}
                    </p>
                  </Label>
                </div>
                
                {form.attachments.length > 0 && (
                  <div className="space-y-2">
                    {form.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t('retreat_inquiry.review.title', 'Review & Submit')}</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('retreat_inquiry.review.contact', 'Contact Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>{t('retreat_inquiry.teacher_info.name', 'Name')}:</strong> {form.teacherName}</p>
                  <p><strong>{t('retreat_inquiry.teacher_info.email', 'Email')}:</strong> {form.email}</p>
                  <p><strong>{t('retreat_inquiry.teacher_info.brand', 'Brand/Studio')}:</strong> {form.brandStudio}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('retreat_inquiry.review.retreat_overview', 'Retreat Overview')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>{t('retreat_inquiry.retreat_details.country', 'Country')}:</strong> {form.preferredCountry}</p>
                  <p><strong>{t('retreat_inquiry.retreat_details.dates', 'Dates')}:</strong> {form.startDate} to {form.endDate}</p>
                  <p><strong>{t('retreat_inquiry.retreat_details.group_size', 'Group Size')}:</strong> {form.groupSizeMin}-{form.groupSizeMax}</p>
                  <p><strong>{t('retreat_inquiry.retreat_details.budget', 'Budget')}:</strong> {form.budgetLow}-{form.budgetHigh} {form.currency}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium">{t('retreat_inquiry.review.consent_title', 'Consent & Privacy')}</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consentContact"
                    checked={form.consentContact}
                    onCheckedChange={(checked) => updateForm('consentContact', !!checked)}
                  />
                  <Label htmlFor="consentContact" className="text-sm leading-5">
                    {t('retreat_inquiry.review.consent_contact', 'I consent to be contacted about my retreat inquiry and understand that YogaSwiss will share my information with relevant partners to provide quotes and services.')}
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consentData"
                    checked={form.consentData}
                    onCheckedChange={(checked) => updateForm('consentData', !!checked)}
                  />
                  <Label htmlFor="consentData" className="text-sm leading-5">
                    {t('retreat_inquiry.review.consent_data', 'I agree to the storage and processing of my data as described in the privacy policy.')}
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletterOptIn"
                    checked={form.newsletterOptIn}
                    onCheckedChange={(checked) => updateForm('newsletterOptIn', !!checked)}
                  />
                  <Label htmlFor="newsletterOptIn" className="text-sm leading-5">
                    {t('retreat_inquiry.review.newsletter', 'I would like to receive updates about retreat planning tips and YogaSwiss community news (optional).')}
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{t('retreat_inquiry.review.next_steps', 'What happens next?')}</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>{t('retreat_inquiry.review.step1', 'We\'ll review your inquiry within 2 business days')}</li>
                <li>{t('retreat_inquiry.review.step2', 'A retreat specialist will contact you to discuss details')}</li>
                <li>{t('retreat_inquiry.review.step3', 'We\'ll connect you with relevant partners for quotes')}</li>
                <li>{t('retreat_inquiry.review.step4', 'You\'ll receive a comprehensive proposal with options')}</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden">
        <ImageWithFallback
          src={heroImage}
          alt={t('retreat_inquiry.hero.alt', 'Organise Your Retreat')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 max-w-3xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('retreat_inquiry.hero.title', 'Organise Your Retreat')}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {t('retreat_inquiry.hero.subtitle', 'Let our concierge team help you create unforgettable yoga retreats in Switzerland and beyond')}
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('retreat_inquiry.how_it_works.title', 'How It Works')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Compass className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('retreat_inquiry.how_it_works.step1_title', '1. Brief')}</h3>
              <p className="text-muted-foreground">
                {t('retreat_inquiry.how_it_works.step1_desc', 'Share your vision, preferences, and requirements with our detailed inquiry form.')}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('retreat_inquiry.how_it_works.step2_title', '2. Match')}</h3>
              <p className="text-muted-foreground">
                {t('retreat_inquiry.how_it_works.step2_desc', 'We connect you with our trusted network of venues, chefs, and service providers.')}
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Mountain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{t('retreat_inquiry.how_it_works.step3_title', '3. Plan')}</h3>
              <p className="text-muted-foreground">
                {t('retreat_inquiry.how_it_works.step3_desc', 'From booking to marketing, we handle the details so you can focus on teaching.')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('retreat_inquiry.services.overview_title', 'Our Services')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <Home className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">{t('retreat_inquiry.services.venues', 'Venues & Hotels')}</h4>
              <p className="text-sm text-muted-foreground">{t('retreat_inquiry.services.venues_desc', 'Curated selection of retreat-perfect locations')}</p>
            </div>
            
            <div className="text-center space-y-3">
              <ChefHat className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">{t('retreat_inquiry.services.catering', 'Chef & Catering')}</h4>
              <p className="text-sm text-muted-foreground">{t('retreat_inquiry.services.catering_desc', 'Healthy, delicious meals tailored to your retreat')}</p>
            </div>
            
            <div className="text-center space-y-3">
              <Camera className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">{t('retreat_inquiry.services.media', 'Photography & Media')}</h4>
              <p className="text-sm text-muted-foreground">{t('retreat_inquiry.services.media_desc', 'Professional content creation and marketing support')}</p>
            </div>
            
            <div className="text-center space-y-3">
              <Shield className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">{t('retreat_inquiry.services.logistics', 'Logistics & Support')}</h4>
              <p className="text-sm text-muted-foreground">{t('retreat_inquiry.services.logistics_desc', 'Transport, insurance, and full coordination')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('retreat_inquiry.partners.title', 'Our Trusted Partners')}
          </CardTitle>
          <p className="text-muted-foreground">
            {t('retreat_inquiry.partners.subtitle', 'We work with carefully selected venues, chefs, and service providers across Switzerland and Europe')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {partner.type === 'venue' && <Home className="h-5 w-5 text-primary" />}
                  {partner.type === 'chef' && <ChefHat className="h-5 w-5 text-primary" />}
                  {partner.type === 'media' && <Camera className="h-5 w-5 text-primary" />}
                  {partner.type === 'transport' && <Plane className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <div className="font-medium text-sm">{partner.name}</div>
                  <div className="text-xs text-muted-foreground">{partner.location}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Form */}
      {!submissionSuccess ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('retreat_inquiry.form.title', 'Start Your Retreat Inquiry')}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {t('retreat_inquiry.form.step', 'Step')} {currentStep} {t('retreat_inquiry.form.of', 'of')} {steps.length}
              </div>
            </div>
            
            {/* Step Progress */}
            <div className="flex space-x-2 mt-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 rounded ${
                    step.id <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={step.id === currentStep ? 'text-foreground font-medium' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStepContent()}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                {t('common.previous', 'Previous')}
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!form.teacherName || !form.email)) ||
                    (currentStep === 2 && (!form.preferredCountry || !form.startDate))
                  }
                >
                  {t('common.next', 'Next')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitInquiry}
                  disabled={!form.consentContact || !form.consentData || isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    t('retreat_inquiry.form.submitting', 'Submitting...')
                  ) : (
                    t('retreat_inquiry.form.submit', 'Submit Inquiry')
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('retreat_inquiry.success.title', 'Inquiry Submitted Successfully!')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('retreat_inquiry.success.message', 'Thank you for your retreat inquiry. Our team will review your requirements and contact you within 2 business days to discuss the next steps. You\'ll receive a confirmation email shortly.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => onPageChange('home')}>
                {t('retreat_inquiry.success.home', 'Return Home')}
              </Button>
              <Button variant="outline" onClick={() => onPageChange('retreats')}>
                {t('retreat_inquiry.success.browse', 'Browse Existing Retreats')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      {!submissionSuccess && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('retreat_inquiry.pricing.title', 'Pricing & Engagement Models')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">{t('retreat_inquiry.pricing.commission', 'Commission Model')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('retreat_inquiry.pricing.commission_desc', 'We earn a percentage of the final retreat bookings, aligning our success with yours. Rates vary from 8-15% depending on services included.')}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">{t('retreat_inquiry.pricing.consultation', 'Consultation Fees')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('retreat_inquiry.pricing.consultation_desc', 'Initial consultation and basic planning guidance available for a flat fee. Perfect for experienced teachers who need minimal support.')}
                </p>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{t('retreat_inquiry.pricing.transparency', 'Transparent Pricing')}:</strong> {t('retreat_inquiry.pricing.transparency_desc', 'All fees and commissions are clearly outlined in your proposal. No hidden costs or surprise charges.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials */}
      {!submissionSuccess && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('retreat_inquiry.testimonials.title', 'What Teachers Say')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.studio}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t('retreat_inquiry.faq.title', 'Frequently Asked Questions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <h4 className="font-semibold mb-2">{item.question}</h4>
              <p className="text-muted-foreground text-sm">{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">{t('retreat_inquiry.contact.title', 'Ready to Start Planning?')}</h3>
            <p className="text-muted-foreground">
              {t('retreat_inquiry.contact.description', 'Have questions before submitting your inquiry? Our retreat specialists are here to help.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                {t('retreat_inquiry.contact.email', 'retreats@yogaswiss.com')}
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                {t('retreat_inquiry.contact.phone', '+41 44 XXX XX XX')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}