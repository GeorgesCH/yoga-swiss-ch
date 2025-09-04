import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Video, Repeat, Star, Camera, ArrowLeft, ArrowRight, Check, Plus, Trash2, CreditCard, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { useLanguage } from './LanguageProvider';

type ContentType = 'class' | 'workshop' | 'course' | 'private' | 'event';
type ScheduleMode = 'one-off' | 'recurring' | 'course-series' | 'workshop-event' | 'private-slots';
type PriceModel = 'free' | 'fixed' | 'sliding' | 'packages-only' | 'deposit-balance';
type DeliveryMode = 'in-person' | 'online' | 'hybrid';

interface ClassInstance {
  id?: string;
  
  // Step 1 - Basic Info
  content_type: ContentType;
  template_id?: string;
  detach_from_template: boolean;
  name: string;
  internal_label?: string;
  visibility: 'public' | 'unlisted' | 'private';
  tags: string[];
  languages: Record<string, { short_description: string; full_description: string; }>;
  theme_color?: string;
  delivery_mode: DeliveryMode;
  location_id?: string;
  room?: string;
  online_platform?: string;
  online_url?: string;
  private_location: boolean;
  primary_instructor_id: string;
  teacher_pay_rate?: number;
  teacher_pay_type: 'per_hour' | 'per_class' | 'per_attendee' | 'revenue_percent';
  enable_waitlist: boolean;
  enable_spot_selection: boolean;
  collect_phone: boolean;
  
  // Step 2 - Scheduling
  schedule_mode: ScheduleMode;
  start_date: string;
  start_time: string;
  duration_minutes: number;
  end_time: string;
  timezone: string;
  capacity?: number;
  sales_cutoff_minutes: number;
  booking_window_days: number;
  recurrence_rule?: string;
  recurrence_until?: string;
  course_sessions: Array<{ date: string; start_time: string; duration_minutes: number; }>;
  
  // Step 3 - Pricing & Access
  price_model: PriceModel;
  price_chf?: number;
  price_min_chf?: number;
  price_suggested_chf?: number;
  price_max_chf?: number;
  credits_required?: number;
  allow_book_pay_later: boolean;
  allow_discount_codes: boolean;
  eligibility_members_only: boolean;
  eligibility_min_age?: number;
  eligibility_max_age?: number;
  allow_booking_for_children: boolean;
  cancellation_cutoff_hours: number;
  late_cancel_fee_chf?: number;
  no_show_fee_chf?: number;
  waiver_required: boolean;
  welcome_message?: string;
  
  // Deposit & Payment Plan (for workshops/events)
  deposit_amount_chf?: number;
  balance_due_date?: string;
}

interface ClassInstanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (instance: ClassInstance) => void;
  instance?: ClassInstance;
  templates: Array<{ 
    id: string; 
    name: string; 
    content_type: ContentType;
    duration_min: number; 
    default_price: number; 
    max_participants: number; 
    description?: string;
  }>;
  instructors: Array<{ id: string; name: string; avatar?: string; }>;
  locations: Array<{ id: string; name: string; rooms: string[]; }>;
}

export function ClassInstanceForm({ 
  isOpen, 
  onClose, 
  onSave, 
  instance, 
  templates = [],
  instructors = [],
  locations = []
}: ClassInstanceFormProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClassInstance>(() => ({
    // Step 1 - Basic Info
    content_type: instance?.content_type || 'class',
    template_id: instance?.template_id || '',
    detach_from_template: instance?.detach_from_template || false,
    name: instance?.name || '',
    internal_label: instance?.internal_label || '',
    visibility: instance?.visibility || 'public',
    tags: instance?.tags || [],
    languages: instance?.languages || {
      en: { short_description: '', full_description: '' }
    },
    theme_color: instance?.theme_color || '#3B82F6',
    delivery_mode: instance?.delivery_mode || 'in-person',
    location_id: instance?.location_id || '',
    room: instance?.room || '',
    online_platform: instance?.online_platform || 'zoom',
    online_url: instance?.online_url || '',
    private_location: instance?.private_location || false,
    primary_instructor_id: instance?.primary_instructor_id || '',
    teacher_pay_rate: instance?.teacher_pay_rate || 25,
    teacher_pay_type: instance?.teacher_pay_type || 'per_class',
    enable_waitlist: instance?.enable_waitlist ?? true,
    enable_spot_selection: instance?.enable_spot_selection || false,
    collect_phone: instance?.collect_phone || false,
    
    // Step 2 - Scheduling
    schedule_mode: instance?.schedule_mode || 'one-off',
    start_date: instance?.start_date || new Date().toISOString().split('T')[0],
    start_time: instance?.start_time || '09:00',
    duration_minutes: instance?.duration_minutes || 60,
    end_time: instance?.end_time || '10:00',
    timezone: instance?.timezone || 'Europe/Zurich',
    capacity: instance?.capacity || 20,
    sales_cutoff_minutes: instance?.sales_cutoff_minutes || 60,
    booking_window_days: instance?.booking_window_days || 0,
    recurrence_rule: instance?.recurrence_rule || '',
    recurrence_until: instance?.recurrence_until || '',
    course_sessions: instance?.course_sessions || [],
    
    // Step 3 - Pricing & Access
    price_model: instance?.price_model || 'fixed',
    price_chf: instance?.price_chf || 25,
    price_min_chf: instance?.price_min_chf || 15,
    price_suggested_chf: instance?.price_suggested_chf || 25,
    price_max_chf: instance?.price_max_chf || 40,
    credits_required: instance?.credits_required || 1,
    allow_book_pay_later: instance?.allow_book_pay_later || false,
    allow_discount_codes: instance?.allow_discount_codes || true,
    eligibility_members_only: instance?.eligibility_members_only || false,
    eligibility_min_age: instance?.eligibility_min_age,
    eligibility_max_age: instance?.eligibility_max_age,
    allow_booking_for_children: instance?.allow_booking_for_children || false,
    cancellation_cutoff_hours: instance?.cancellation_cutoff_hours || 24,
    late_cancel_fee_chf: instance?.late_cancel_fee_chf || 10,
    no_show_fee_chf: instance?.no_show_fee_chf || 15,
    waiver_required: instance?.waiver_required || false,
    welcome_message: instance?.welcome_message || '',
    
    // Deposit & Payment Plan
    deposit_amount_chf: instance?.deposit_amount_chf,
    balance_due_date: instance?.balance_due_date,
  }));

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const contentTypes = [
    { 
      value: 'class', 
      label: 'Class (Drop-in)', 
      description: 'Single session. Easiest checkout.',
      icon: Calendar 
    },
    { 
      value: 'workshop', 
      label: 'Workshop', 
      description: 'One or few sessions, special pricing, limited seats.',
      icon: Star 
    },
    { 
      value: 'course', 
      label: 'Course / Series', 
      description: 'Recurring set (e.g., 8-week series); full-series booking.',
      icon: Repeat 
    },
    { 
      value: 'private', 
      label: 'Private Class', 
      description: '1:1 or small private; unlisted; shareable link only.',
      icon: Users 
    },
    { 
      value: 'event', 
      label: 'Event / Retreat', 
      description: 'Multi-day; deposit and payment plan support.',
      icon: MapPin 
    }
  ];

  const priceModels = [
    { 
      value: 'free', 
      label: 'Free', 
      description: 'Price CHF 0; optional donations.'
    },
    { 
      value: 'fixed', 
      label: 'Fixed Price', 
      description: 'Set price per ticket.'
    },
    { 
      value: 'sliding', 
      label: 'Sliding Scale', 
      description: 'Customers pick price within min/suggested/max.'
    },
    { 
      value: 'packages-only', 
      label: 'Packages & Subscriptions Only', 
      description: 'Requires valid pass/credits or active membership.'
    },
    { 
      value: 'deposit-balance', 
      label: 'Deposit + Balance', 
      description: 'Amount now, remainder due later; supports payment plans.'
    }
  ];

  // Mock data for demonstration
  const mockTemplates = templates.length > 0 ? templates : [
    { 
      id: '1', 
      name: 'Vinyasa Flow', 
      content_type: 'class' as ContentType, 
      duration_min: 90, 
      default_price: 25, 
      max_participants: 20,
      description: 'Dynamic Vinyasa flow for an energizing start to your day'
    },
    { 
      id: '2', 
      name: 'Hatha Yoga Workshop', 
      content_type: 'workshop' as ContentType, 
      duration_min: 120, 
      default_price: 45, 
      max_participants: 15,
      description: 'Deep dive into Hatha Yoga fundamentals'
    },
    { 
      id: '3', 
      name: 'Power Yoga Series', 
      content_type: 'course' as ContentType, 
      duration_min: 60, 
      default_price: 180, 
      max_participants: 25,
      description: '8-week Power Yoga progression course'
    }
  ];

  const mockInstructors = instructors.length > 0 ? instructors : [
    { id: '1', name: 'Sarah Miller' },
    { id: '2', name: 'Marcus Weber' },
    { id: '3', name: 'Lisa Chen' },
    { id: '4', name: 'Marie Dubois' }
  ];

  const mockLocations = locations.length > 0 ? locations : [
    { id: '1', name: 'Studio A', rooms: ['Main Room', 'Side Room'] },
    { id: '2', name: 'Studio B', rooms: ['Quiet Room', 'Movement Room'] },
    { id: '3', name: 'Online Studio', rooms: ['Zoom Room 1', 'Zoom Room 2'] }
  ];

  const selectedTemplate = mockTemplates.find(t => t.id === formData.template_id);
  const selectedLocation = mockLocations.find(l => l.id === formData.location_id);

  const calculateEndTime = (startTime: string, durationMin: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + durationMin);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === 'blank') {
      setFormData(prev => ({
        ...prev,
        template_id: '',
        detach_from_template: false
      }));
      return;
    }

    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      const endTime = calculateEndTime(formData.start_time, template.duration_min);
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        content_type: template.content_type,
        name: prev.name || template.name,
        duration_minutes: template.duration_min,
        end_time: endTime,
        capacity: prev.capacity || template.max_participants,
        price_chf: prev.price_chf || template.default_price,
        languages: prev.languages || { en: { short_description: template.description || '', full_description: '' } }
      }));
    }
  };

  const handleStartTimeChange = (startTime: string) => {
    const endTime = calculateEndTime(startTime, formData.duration_minutes);
    setFormData(prev => ({ ...prev, start_time: startTime, end_time: endTime }));
  };

  const handleDurationChange = (duration: number) => {
    const endTime = calculateEndTime(formData.start_time, duration);
    setFormData(prev => ({ ...prev, duration_minutes: duration, end_time: endTime }));
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.content_type && formData.primary_instructor_id;
      case 2:
        return formData.start_date && formData.start_time && formData.duration_minutes > 0;
      case 3:
        return true; // All fields are optional or have defaults
      default:
        return true;
    }
  };

  const getStepProgress = () => {
    let progress = 0;
    if (canProceed(1)) progress += 33;
    if (canProceed(2)) progress += 33;
    if (canProceed(3)) progress += 34;
    return progress;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSave(formData);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {instance ? 'Edit Class' : 'Create New Class'}
            <Badge variant="outline" className="ml-2">
              🇨🇭 Swiss-Ready
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {instance ? 'Update your class details using this comprehensive form.' : 'Create a new class with Swiss-specific features and multilingual support.'}
          </DialogDescription>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep ? 'bg-primary text-primary-foreground' :
                    step < currentStep ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step < currentStep ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>Step {currentStep} of 3</span>
                <span>{Math.round(getStepProgress())}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1 - Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>

                {/* Content Type & Template Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Type & Template</Label>
                    
                    {!formData.template_id && (
                      <div className="space-y-3">
                        <Label className="text-sm">Content Type *</Label>
                        <RadioGroup 
                          value={formData.content_type} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value as ContentType }))}
                          className="grid grid-cols-1 gap-3"
                        >
                          {contentTypes.map((type) => (
                            <div key={type.value} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50">
                              <RadioGroupItem value={type.value} id={type.value} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  <Label htmlFor={type.value} className="font-medium cursor-pointer">
                                    {type.label}
                                  </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label>Start from Template (optional)</Label>
                        <Select value={formData.template_id || 'blank'} onValueChange={handleTemplateChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose template or start blank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blank">Start from blank</SelectItem>
                            {mockTemplates
                              .filter(t => !formData.content_type || t.content_type === formData.content_type)
                              .map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{template.name}</span>
                                    <div className="flex gap-2 ml-2">
                                      <Badge variant="outline" className="text-xs">
                                        {template.duration_min}min
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        CHF {template.default_price}
                                      </Badge>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.template_id && (
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="detach" 
                              checked={formData.detach_from_template}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, detach_from_template: !!checked }))}
                            />
                            <Label htmlFor="detach" className="text-sm">
                              Detach from template
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>

                    {formData.template_id && selectedTemplate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm">
                          <div className="font-medium">Template: {selectedTemplate.name}</div>
                          <div className="text-muted-foreground">
                            Duration: {selectedTemplate.duration_min} min • Price: CHF {selectedTemplate.default_price} • Capacity: {selectedTemplate.max_participants}
                          </div>
                          {formData.detach_from_template && (
                            <div className="text-amber-600 text-xs mt-1">
                              ⚠️ Changes to template won't affect this class
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Identity & Visibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Class Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.slice(0, 75) }))}
                        placeholder="Enter class name..."
                        maxLength={75}
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {formData.name.length}/75 characters
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="internal_label">Internal Label (optional)</Label>
                      <Input
                        id="internal_label"
                        value={formData.internal_label}
                        onChange={(e) => setFormData(prev => ({ ...prev, internal_label: e.target.value }))}
                        placeholder="For schedule color & filtering..."
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Hidden from students, used for organization
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Visibility</Label>
                      <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div>
                              <div className="font-medium">Public</div>
                              <div className="text-sm text-muted-foreground">Listed on schedule</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="unlisted">
                            <div>
                              <div className="font-medium">Unlisted</div>
                              <div className="text-sm text-muted-foreground">Shareable link; not indexed</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div>
                              <div className="font-medium">Private</div>
                              <div className="text-sm text-muted-foreground">Only staff & link with token</div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Theme Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.theme_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={formData.theme_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, theme_color: e.target.value }))}
                          placeholder="#3B82F6"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Calendar color chip
                      </div>
                    </div>
                  </div>

                  {/* Multi-language Description */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Descriptions (Multi-language)</Label>
                    <Tabs defaultValue="en" className="w-full">
                      <TabsList>
                        {languages.map(lang => (
                          <TabsTrigger key={lang.code} value={lang.code} className="gap-2">
                            <span>{lang.flag}</span>
                            {lang.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {languages.map(lang => (
                        <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                          <div>
                            <Label>Short Description ({lang.name})</Label>
                            <Input
                              value={formData.languages[lang.code]?.short_description || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                languages: {
                                  ...prev.languages,
                                  [lang.code]: {
                                    ...prev.languages[lang.code],
                                    short_description: e.target.value
                                  }
                                }
                              }))}
                              placeholder="One-line description..."
                            />
                          </div>
                          
                          <div>
                            <Label>Full Description ({lang.name})</Label>
                            <Textarea
                              value={formData.languages[lang.code]?.full_description || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                languages: {
                                  ...prev.languages,
                                  [lang.code]: {
                                    ...prev.languages[lang.code],
                                    full_description: e.target.value
                                  }
                                }
                              }))}
                              placeholder="Rich text description with bullets, emojis OK..."
                              rows={4}
                            />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>

                  {/* Delivery & Locations */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Delivery & Location</Label>
                    
                    <div>
                      <Label>Class Location</Label>
                      <RadioGroup 
                        value={formData.delivery_mode} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_mode: value as DeliveryMode }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label htmlFor="in-person" className="cursor-pointer">In-person</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online" className="cursor-pointer">Online</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hybrid" id="hybrid" />
                          <Label htmlFor="hybrid" className="cursor-pointer">Hybrid</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {(formData.delivery_mode === 'in-person' || formData.delivery_mode === 'hybrid') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Select 
                            value={formData.location_id} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, location_id: value, room: '' }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose location" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockLocations.filter(loc => loc.name !== 'Online Studio').map(location => (
                                <SelectItem key={location.id} value={location.id}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {location.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedLocation && (
                          <div>
                            <Label htmlFor="room">Room</Label>
                            <Select 
                              value={formData.room} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose room" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedLocation.rooms.map(room => (
                                  <SelectItem key={room} value={room}>
                                    {room}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    {(formData.delivery_mode === 'online' || formData.delivery_mode === 'hybrid') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Virtual Platform</Label>
                          <Select 
                            value={formData.online_platform} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, online_platform: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="meet">Google Meet</SelectItem>
                              <SelectItem value="teams">Microsoft Teams</SelectItem>
                              <SelectItem value="custom">Custom URL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Online URL</Label>
                          <Input
                            value={formData.online_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, online_url: e.target.value }))}
                            placeholder="https://zoom.us/j/..."
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            Link hidden until booked
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.delivery_mode === 'hybrid' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm text-blue-800">
                          💡 <strong>Hybrid Mode:</strong> System creates two linked listings (in-person & online) so inventory is tracked separately.
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="private-location" 
                        checked={formData.private_location}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, private_location: !!checked }))}
                      />
                      <Label htmlFor="private-location" className="text-sm">
                        Private location (manually send location; don't reveal address)
                      </Label>
                    </div>
                  </div>

                  {/* Teachers & Staff */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Teachers & Staff</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instructor">Primary Teacher *</Label>
                        <Select 
                          value={formData.primary_instructor_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, primary_instructor_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockInstructors.map(instructor => (
                              <SelectItem key={instructor.id} value={instructor.id}>
                                {instructor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Teacher Pay Rate</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={formData.teacher_pay_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, teacher_pay_rate: parseFloat(e.target.value) || 0 }))}
                            placeholder="25"
                            min="0"
                            step="0.50"
                          />
                          <Select 
                            value={formData.teacher_pay_type} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, teacher_pay_type: value as any }))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per_class">per class</SelectItem>
                              <SelectItem value="per_hour">per hour</SelectItem>
                              <SelectItem value="per_attendee">per attendee</SelectItem>
                              <SelectItem value="revenue_percent">% revenue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Options</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="enable-waitlist" 
                            checked={formData.enable_waitlist}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_waitlist: !!checked }))}
                          />
                          <Label htmlFor="enable-waitlist" className="text-sm">
                            Enable waitlist (FIFO with auto-promote window)
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="spot-selection" 
                            checked={formData.enable_spot_selection}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_spot_selection: !!checked }))}
                          />
                          <Label htmlFor="spot-selection" className="text-sm">
                            Spot selection (customers pick seat when booking)
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="collect-phone" 
                            checked={formData.collect_phone}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, collect_phone: !!checked }))}
                          />
                          <Label htmlFor="collect-phone" className="text-sm">
                            Collect phone for SMS (consent aware)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - Scheduling */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Scheduling</h3>
                </div>

                {/* Schedule Mode */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Schedule Mode</Label>
                    <RadioGroup 
                      value={formData.schedule_mode} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, schedule_mode: value as ScheduleMode }))}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50">
                        <RadioGroupItem value="one-off" id="one-off" />
                        <div className="flex-1">
                          <Label htmlFor="one-off" className="font-medium cursor-pointer">One-off</Label>
                          <p className="text-sm text-muted-foreground">Single date/time</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50">
                        <RadioGroupItem value="recurring" id="recurring" />
                        <div className="flex-1">
                          <Label htmlFor="recurring" className="font-medium cursor-pointer">Recurring</Label>
                          <p className="text-sm text-muted-foreground">RRULE (e.g., Tue/Thu 09:00), end by date or count</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50">
                        <RadioGroupItem value="course-series" id="course-series" />
                        <div className="flex-1">
                          <Label htmlFor="course-series" className="font-medium cursor-pointer">Course/Series</Label>
                          <p className="text-sm text-muted-foreground">Specific list of session dates; enroll whole series and/or allow drop-ins</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Time & Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="start_date">Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="start_time">Start Time *</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => handleDurationChange(parseInt(e.target.value) || 60)}
                        min="10"
                        max="600"
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        End time: {formData.end_time}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || undefined }))}
                        placeholder="Leave empty for unlimited"
                        min="1"
                        max="100"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Leave empty for unlimited
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sales_cutoff">Sales Cutoff (minutes)</Label>
                      <Input
                        id="sales_cutoff"
                        type="number"
                        value={formData.sales_cutoff_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, sales_cutoff_minutes: parseInt(e.target.value) || 60 }))}
                        placeholder="60"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Set negative to allow booking after start
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="booking_window">Booking Window (days)</Label>
                      <Input
                        id="booking_window"
                        type="number"
                        value={formData.booking_window_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, booking_window_days: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Open sales X days ahead (0 = immediate)
                      </div>
                    </div>
                  </div>

                  {/* Recurring Settings */}
                  {formData.schedule_mode === 'recurring' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recurrence Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="recurrence_rule">RRULE</Label>
                            <Input
                              id="recurrence_rule"
                              value={formData.recurrence_rule}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurrence_rule: e.target.value }))}
                              placeholder="FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              Standard RRULE format
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="recurrence_until">End Date</Label>
                            <Input
                              id="recurrence_until"
                              type="date"
                              value={formData.recurrence_until}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurrence_until: e.target.value }))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Course Series Settings */}
                  {formData.schedule_mode === 'course-series' && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          Course Sessions
                          <Button size="sm" variant="outline" onClick={() => {
                            const newSession = {
                              date: formData.start_date,
                              start_time: formData.start_time,
                              duration_minutes: formData.duration_minutes
                            };
                            setFormData(prev => ({
                              ...prev,
                              course_sessions: [...prev.course_sessions, newSession]
                            }));
                          }}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Session
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {formData.course_sessions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No sessions added yet. Click "Add Session" to start building your course.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {formData.course_sessions.map((session, index) => (
                              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                  <Input
                                    type="date"
                                    value={session.date}
                                    onChange={(e) => {
                                      const updated = [...formData.course_sessions];
                                      updated[index].date = e.target.value;
                                      setFormData(prev => ({ ...prev, course_sessions: updated }));
                                    }}
                                  />
                                  <Input
                                    type="time"
                                    value={session.start_time}
                                    onChange={(e) => {
                                      const updated = [...formData.course_sessions];
                                      updated[index].start_time = e.target.value;
                                      setFormData(prev => ({ ...prev, course_sessions: updated }));
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    value={session.duration_minutes}
                                    onChange={(e) => {
                                      const updated = [...formData.course_sessions];
                                      updated[index].duration_minutes = parseInt(e.target.value) || 60;
                                      setFormData(prev => ({ ...prev, course_sessions: updated }));
                                    }}
                                    placeholder="Duration (min)"
                                    min="10"
                                    max="600"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = formData.course_sessions.filter((_, i) => i !== index);
                                    setFormData(prev => ({ ...prev, course_sessions: updated }));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 - Pricing & Access */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Pricing & Access</h3>
                </div>

                {/* Price Model */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Price Model</Label>
                    <RadioGroup 
                      value={formData.price_model} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, price_model: value as PriceModel }))}
                      className="space-y-3"
                    >
                      {priceModels.map((model) => (
                        <div key={model.value} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50">
                          <RadioGroupItem value={model.value} id={model.value} />
                          <div className="flex-1">
                            <Label htmlFor={model.value} className="font-medium cursor-pointer">
                              {model.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Price Settings based on model */}
                  {formData.price_model === 'fixed' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (CHF)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.50"
                          value={formData.price_chf || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price_chf: parseFloat(e.target.value) || undefined }))}
                          placeholder="25.00"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="credits">Credits Required</Label>
                        <Input
                          id="credits"
                          type="number"
                          step="0.5"
                          value={formData.credits_required || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, credits_required: parseFloat(e.target.value) || undefined }))}
                          placeholder="1"
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {formData.price_model === 'sliding' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price_min">Min Price (CHF)</Label>
                        <Input
                          id="price_min"
                          type="number"
                          step="0.50"
                          value={formData.price_min_chf || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price_min_chf: parseFloat(e.target.value) || undefined }))}
                          placeholder="15.00"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price_suggested">Suggested Price (CHF)</Label>
                        <Input
                          id="price_suggested"
                          type="number"
                          step="0.50"
                          value={formData.price_suggested_chf || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price_suggested_chf: parseFloat(e.target.value) || undefined }))}
                          placeholder="25.00"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price_max">Max Price (CHF)</Label>
                        <Input
                          id="price_max"
                          type="number"
                          step="0.50"
                          value={formData.price_max_chf || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, price_max_chf: parseFloat(e.target.value) || undefined }))}
                          placeholder="40.00"
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {formData.price_model === 'deposit-balance' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deposit">Deposit Amount (CHF)</Label>
                          <Input
                            id="deposit"
                            type="number"
                            step="0.50"
                            value={formData.deposit_amount_chf || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount_chf: parseFloat(e.target.value) || undefined }))}
                            placeholder="50.00"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="balance_due">Balance Due Date</Label>
                          <Input
                            id="balance_due"
                            type="date"
                            value={formData.balance_due_date || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, balance_due_date: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Swiss Payment Features */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      🇨🇭 Swiss Payment Features
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <Checkbox id="twint" defaultChecked />
                        <Label htmlFor="twint" className="text-sm">TWINT for fast mobile payments</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="qr-bill" defaultChecked />
                        <Label htmlFor="qr-bill" className="text-sm">QR-bill invoicing for corporate clients</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="mobile-pay" defaultChecked />
                        <Label htmlFor="mobile-pay" className="text-sm">Apple Pay & Google Pay</Label>
                      </div>
                      <p className="text-xs mt-2">• Automatic VAT calculation at 7.7%</p>
                    </div>
                  </div>
                </div>

                {/* Access & Eligibility */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Access & Eligibility</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="members-only" 
                          checked={formData.eligibility_members_only}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, eligibility_members_only: !!checked }))}
                        />
                        <Label htmlFor="members-only" className="text-sm">
                          Members only
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="allow-book-pay-later" 
                          checked={formData.allow_book_pay_later}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_book_pay_later: !!checked }))}
                        />
                        <Label htmlFor="allow-book-pay-later" className="text-sm">
                          Allow "Book now, pay later" (pay at studio/POS)
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="allow-discount-codes" 
                          checked={formData.allow_discount_codes}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_discount_codes: !!checked }))}
                        />
                        <Label htmlFor="allow-discount-codes" className="text-sm">
                          Allow discount codes
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Age Restrictions</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min age"
                            value={formData.eligibility_min_age || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, eligibility_min_age: parseInt(e.target.value) || undefined }))}
                            min="0"
                            max="100"
                          />
                          <Input
                            type="number"
                            placeholder="Max age"
                            value={formData.eligibility_max_age || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, eligibility_max_age: parseInt(e.target.value) || undefined }))}
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="allow-children" 
                          checked={formData.allow_booking_for_children}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_booking_for_children: !!checked }))}
                        />
                        <Label htmlFor="allow-children" className="text-sm">
                          Allow booking for children
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Cancellation Policy</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cancel-cutoff">Cutoff (hours)</Label>
                      <Input
                        id="cancel-cutoff"
                        type="number"
                        value={formData.cancellation_cutoff_hours}
                        onChange={(e) => setFormData(prev => ({ ...prev, cancellation_cutoff_hours: parseInt(e.target.value) || 24 }))}
                        min="0"
                        max="168"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="late-cancel-fee">Late Cancel Fee (CHF)</Label>
                      <Input
                        id="late-cancel-fee"
                        type="number"
                        step="0.50"
                        value={formData.late_cancel_fee_chf || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, late_cancel_fee_chf: parseFloat(e.target.value) || undefined }))}
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="no-show-fee">No-show Fee (CHF)</Label>
                      <Input
                        id="no-show-fee"
                        type="number"
                        step="0.50"
                        value={formData.no_show_fee_chf || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, no_show_fee_chf: parseFloat(e.target.value) || undefined }))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Welcome & Communication */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Welcome & Communication</Label>
                  
                  <div>
                    <Label htmlFor="welcome-message">Welcome Message</Label>
                    <Textarea
                      id="welcome-message"
                      value={formData.welcome_message || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                      placeholder="Email/SMS template sent to attendees..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="waiver-required" 
                      checked={formData.waiver_required}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, waiver_required: !!checked }))}
                    />
                    <Label htmlFor="waiver-required" className="text-sm">
                      Waiver/consent attachment required to book
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Summary Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title & Type */}
                <div>
                  <div className="font-medium">
                    {formData.name || 'Untitled Class'}
                  </div>
                  {formData.content_type && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {contentTypes.find(t => t.value === formData.content_type)?.label}
                    </Badge>
                  )}
                </div>

                {/* Date & Time */}
                {formData.start_date && formData.start_time && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(formData.start_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{formData.start_time} - {formData.end_time}</span>
                      <span className="text-xs">({formData.duration_minutes} min)</span>
                    </div>
                  </div>
                )}

                {/* Instructor */}
                {formData.primary_instructor_id && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {mockInstructors.find(i => i.id === formData.primary_instructor_id)?.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(formData.location_id || formData.delivery_mode === 'online') && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {formData.delivery_mode === 'online' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span>
                        {formData.delivery_mode === 'online' ? (
                          'Online'
                        ) : (
                          `${selectedLocation?.name}${formData.room ? ` - ${formData.room}` : ''}`
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Price */}
                {formData.price_model && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">Price:</div>
                    <div className="font-medium">
                      {formData.price_model === 'free' ? 'Free' :
                       formData.price_model === 'fixed' ? `CHF ${formData.price_chf || '25'}` :
                       formData.price_model === 'sliding' ? `CHF ${formData.price_min_chf || '15'} - ${formData.price_max_chf || '40'}` :
                       formData.price_model === 'packages-only' ? 'Packages/Memberships only' :
                       formData.price_model === 'deposit-balance' ? `CHF ${formData.deposit_amount_chf || '50'} deposit` :
                       'TBD'}
                    </div>
                    {formData.credits_required && (
                      <div className="text-xs text-muted-foreground">
                        or {formData.credits_required} credit{formData.credits_required !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* Capacity */}
                {formData.capacity && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {formData.capacity}</span>
                    </div>
                  </div>
                )}

                {/* Visibility */}
                {formData.visibility && (
                  <div className="text-sm">
                    <Badge 
                      variant={formData.visibility === 'public' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {formData.visibility === 'public' ? 'Public' : 
                       formData.visibility === 'unlisted' ? 'Unlisted' : 'Private'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={nextStep}
              disabled={!canProceed(currentStep)}
            >
              {currentStep === 3 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {instance ? 'Save Changes' : 'Create Class'}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}