import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Repeat, AlertTriangle, Info, ChevronDown, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { useLanguage } from './LanguageProvider';

interface RecurringSeriesFormData {
  name: string;
  description: string;
  instructor_id: string;
  location_id: string;
  room: string;
  category: string;
  level: string;
  language: 'de' | 'fr' | 'it' | 'en';
  capacity: number;
  price_chf: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  
  // Recurrence settings
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  weekdays: string[]; // For weekly: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
  monthly_pattern: 'day_of_month' | 'day_of_week'; // For monthly: 15th vs 3rd Tuesday
  
  // Date range
  start_date: string;
  end_type: 'date' | 'count' | 'never';
  end_date?: string;
  occurrence_count?: number;
  
  // Skip dates (holidays, breaks)
  skip_dates: string[];
  
  // Advanced options
  generate_ahead_weeks: number;
  allow_booking_ahead_weeks: number;
  auto_cancel_if_min_registrations: number;
  send_reminder_hours: number[];
}

interface RecurringClassSeriesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: RecurringSeriesFormData) => void;
  initialData?: Partial<RecurringSeriesFormData>;
  instructors: Array<{ id: string; name: string; }>;
  locations: Array<{ id: string; name: string; rooms?: string[]; }>;
}

export function RecurringClassSeriesForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  instructors,
  locations
}: RecurringClassSeriesFormProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<RecurringSeriesFormData>({
    name: '',
    description: '',
    instructor_id: '',
    location_id: '',
    room: '',
    category: '',
    level: '',
    language: 'de',
    capacity: 20,
    price_chf: 25,
    start_time: '09:00',
    end_time: '10:30',
    duration_minutes: 90,
    
    frequency: 'weekly',
    interval: 1,
    weekdays: ['MO'],
    monthly_pattern: 'day_of_month',
    
    start_date: new Date().toISOString().split('T')[0],
    end_type: 'date',
    end_date: '',
    occurrence_count: 12,
    
    skip_dates: [],
    
    generate_ahead_weeks: 12,
    allow_booking_ahead_weeks: 4,
    auto_cancel_if_min_registrations: 3,
    send_reminder_hours: [24, 2],
    
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const weekdayOptions = [
    { value: 'MO', label: 'Monday', short: 'Mo' },
    { value: 'TU', label: 'Tuesday', short: 'Tu' },
    { value: 'WE', label: 'Wednesday', short: 'We' },
    { value: 'TH', label: 'Thursday', short: 'Th' },
    { value: 'FR', label: 'Friday', short: 'Fr' },
    { value: 'SA', label: 'Saturday', short: 'Sa' },
    { value: 'SU', label: 'Sunday', short: 'Su' }
  ];

  const categoryOptions = [
    'Vinyasa', 'Hatha', 'Power Yoga', 'Yin', 'Ashtanga', 'Restorative', 
    'Hot Yoga', 'Meditation', 'Pranayama', 'Workshop'
  ];

  const levelOptions = [
    'Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Mixed Level'
  ];

  const languageOptions = [
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' }
  ];

  const updateFormData = (field: keyof RecurringSeriesFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-calculate duration when times change
    if (field === 'start_time' || field === 'end_time') {
      const startTime = field === 'start_time' ? value : formData.start_time;
      const endTime = field === 'end_time' ? value : formData.end_time;
      
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        const durationMs = end.getTime() - start.getTime();
        const durationMinutes = Math.max(0, durationMs / (1000 * 60));
        
        setFormData(prev => ({ ...prev, duration_minutes: durationMinutes }));
      }
    }
  };

  const toggleWeekday = (weekday: string) => {
    const currentWeekdays = formData.weekdays;
    if (currentWeekdays.includes(weekday)) {
      updateFormData('weekdays', currentWeekdays.filter(d => d !== weekday));
    } else {
      updateFormData('weekdays', [...currentWeekdays, weekday]);
    }
  };

  const addSkipDate = () => {
    const newDate = prompt('Enter date to skip (YYYY-MM-DD):');
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      updateFormData('skip_dates', [...formData.skip_dates, newDate]);
    }
  };

  const removeSkipDate = (dateToRemove: string) => {
    updateFormData('skip_dates', formData.skip_dates.filter(date => date !== dateToRemove));
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Class name is required';
        if (!formData.instructor_id) newErrors.instructor_id = 'Instructor is required';
        if (!formData.location_id) newErrors.location_id = 'Location is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.level) newErrors.level = 'Level is required';
        if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
        if (formData.price_chf < 0) newErrors.price_chf = 'Price cannot be negative';
        break;
        
      case 2:
        if (!formData.start_time) newErrors.start_time = 'Start time is required';
        if (!formData.end_time) newErrors.end_time = 'End time is required';
        if (formData.frequency === 'weekly' && formData.weekdays.length === 0) {
          newErrors.weekdays = 'Select at least one weekday';
        }
        if (formData.interval < 1) newErrors.interval = 'Interval must be at least 1';
        break;
        
      case 3:
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (formData.end_type === 'date' && !formData.end_date) {
          newErrors.end_date = 'End date is required';
        }
        if (formData.end_type === 'count' && (!formData.occurrence_count || formData.occurrence_count < 1)) {
          newErrors.occurrence_count = 'Occurrence count must be at least 1';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        setShowPreview(true);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    if (validateStep(4)) {
      onSave(formData);
      onClose();
    }
  };

  const generateRecurrencePreview = () => {
    const { frequency, interval, weekdays, start_date } = formData;
    let pattern = '';
    
    if (frequency === 'daily') {
      pattern = interval === 1 ? 'Daily' : `Every ${interval} days`;
    } else if (frequency === 'weekly') {
      const dayNames = weekdays.map(day => 
        weekdayOptions.find(opt => opt.value === day)?.short
      ).join(', ');
      pattern = interval === 1 
        ? `Weekly on ${dayNames}`
        : `Every ${interval} weeks on ${dayNames}`;
    } else if (frequency === 'monthly') {
      pattern = interval === 1 ? 'Monthly' : `Every ${interval} months`;
    }
    
    return pattern;
  };

  const estimateOccurrences = () => {
    if (formData.end_type === 'count') {
      return formData.occurrence_count || 0;
    } else if (formData.end_type === 'date' && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (formData.frequency === 'daily') {
        return Math.floor(diffDays / formData.interval) + 1;
      } else if (formData.frequency === 'weekly') {
        const weeks = Math.floor(diffDays / 7);
        return Math.floor(weeks / formData.interval) * formData.weekdays.length;
      } else if (formData.frequency === 'monthly') {
        const months = Math.floor(diffDays / 30);
        return Math.floor(months / formData.interval);
      }
    }
    return '∞';
  };

  const selectedLocation = locations.find(loc => loc.id === formData.location_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Recurring Series' : 'Create Recurring Series'}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4: Set up a recurring class series with automatic scheduling
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {stepNumber}
              </div>
              <div className="ml-2 text-sm">
                {stepNumber === 1 && 'Basic Info'}
                {stepNumber === 2 && 'Schedule'}
                {stepNumber === 3 && 'Duration'}
                {stepNumber === 4 && 'Advanced'}
              </div>
              {stepNumber < 4 && (
                <div className={`w-12 h-px mx-4 ${
                  step > stepNumber ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Class Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="e.g., Monday Morning Vinyasa"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Brief description of the class series..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Instructor *</Label>
                  <Select value={formData.instructor_id} onValueChange={(value) => updateFormData('instructor_id', value)}>
                    <SelectTrigger className={errors.instructor_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map(instructor => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.instructor_id && (
                    <p className="text-sm text-destructive mt-1">{errors.instructor_id}</p>
                  )}
                </div>
                
                <div>
                  <Label>Location *</Label>
                  <Select value={formData.location_id} onValueChange={(value) => updateFormData('location_id', value)}>
                    <SelectTrigger className={errors.location_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_id && (
                    <p className="text-sm text-destructive mt-1">{errors.location_id}</p>
                  )}
                </div>
              </div>

              {selectedLocation?.rooms && (
                <div>
                  <Label>Room</Label>
                  <Select value={formData.room} onValueChange={(value) => updateFormData('room', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedLocation.rooms.map(room => (
                        <SelectItem key={room} value={room}>{room}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => updateFormData('level', value)}>
                    <SelectTrigger className={errors.level ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-sm text-destructive mt-1">{errors.level}</p>
                  )}
                </div>
                
                <div>
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(value: 'de' | 'fr' | 'it' | 'en') => updateFormData('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Capacity *</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => updateFormData('capacity', parseInt(e.target.value) || 0)}
                    min="1"
                    className={errors.capacity ? 'border-destructive' : ''}
                  />
                  {errors.capacity && (
                    <p className="text-sm text-destructive mt-1">{errors.capacity}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Price (CHF) *</Label>
                <Input
                  type="number"
                  value={formData.price_chf}
                  onChange={(e) => updateFormData('price_chf', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.50"
                  className={errors.price_chf ? 'border-destructive' : ''}
                />
                {errors.price_chf && (
                  <p className="text-sm text-destructive mt-1">{errors.price_chf}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Schedule Pattern */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => updateFormData('start_time', e.target.value)}
                    className={errors.start_time ? 'border-destructive' : ''}
                  />
                  {errors.start_time && (
                    <p className="text-sm text-destructive mt-1">{errors.start_time}</p>
                  )}
                </div>
                
                <div>
                  <Label>End Time *</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => updateFormData('end_time', e.target.value)}
                    className={errors.end_time ? 'border-destructive' : ''}
                  />
                  {errors.end_time && (
                    <p className="text-sm text-destructive mt-1">{errors.end_time}</p>
                  )}
                </div>
                
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={`${formData.duration_minutes} minutes`}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Recurrence Pattern</Label>
                <RadioGroup 
                  value={formData.frequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => updateFormData('frequency', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Repeat Every</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={formData.interval}
                      onChange={(e) => updateFormData('interval', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.frequency === 'daily' && (formData.interval === 1 ? 'day' : 'days')}
                      {formData.frequency === 'weekly' && (formData.interval === 1 ? 'week' : 'weeks')}
                      {formData.frequency === 'monthly' && (formData.interval === 1 ? 'month' : 'months')}
                    </span>
                  </div>
                </div>
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <Label>Days of Week *</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {weekdayOptions.map(weekday => (
                      <Button
                        key={weekday.value}
                        type="button"
                        variant={formData.weekdays.includes(weekday.value) ? 'default' : 'outline'}
                        className="h-10"
                        onClick={() => toggleWeekday(weekday.value)}
                      >
                        {weekday.short}
                      </Button>
                    ))}
                  </div>
                  {errors.weekdays && (
                    <p className="text-sm text-destructive mt-1">{errors.weekdays}</p>
                  )}
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <Label>Monthly Pattern</Label>
                  <RadioGroup 
                    value={formData.monthly_pattern} 
                    onValueChange={(value: 'day_of_month' | 'day_of_week') => updateFormData('monthly_pattern', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day_of_month" id="day_of_month" />
                      <Label htmlFor="day_of_month">Same day of month (e.g., 15th of each month)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day_of_week" id="day_of_week" />
                      <Label htmlFor="day_of_week">Same weekday (e.g., 3rd Monday of each month)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Preview:</strong> {generateRecurrencePreview()}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 3: Duration & Dates */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData('start_date', e.target.value)}
                  className={errors.start_date ? 'border-destructive' : ''}
                />
                {errors.start_date && (
                  <p className="text-sm text-destructive mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <Label>Series Duration</Label>
                <RadioGroup 
                  value={formData.end_type} 
                  onValueChange={(value: 'date' | 'count' | 'never') => updateFormData('end_type', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="end_date" />
                    <Label htmlFor="end_date">End on specific date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="count" id="end_count" />
                    <Label htmlFor="end_count">End after number of classes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="end_never" />
                    <Label htmlFor="end_never">Continue indefinitely</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.end_type === 'date' && (
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateFormData('end_date', e.target.value)}
                    className={errors.end_date ? 'border-destructive' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-destructive mt-1">{errors.end_date}</p>
                  )}
                </div>
              )}

              {formData.end_type === 'count' && (
                <div>
                  <Label>Number of Classes *</Label>
                  <Input
                    type="number"
                    value={formData.occurrence_count}
                    onChange={(e) => updateFormData('occurrence_count', parseInt(e.target.value) || 0)}
                    min="1"
                    className={errors.occurrence_count ? 'border-destructive' : ''}
                  />
                  {errors.occurrence_count && (
                    <p className="text-sm text-destructive mt-1">{errors.occurrence_count}</p>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Skip Dates (Holidays/Breaks)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSkipDate}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Date
                  </Button>
                </div>
                
                {formData.skip_dates.length > 0 && (
                  <div className="space-y-2">
                    {formData.skip_dates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">
                          {new Date(date).toLocaleDateString()}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkipDate(date)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Estimated occurrences:</strong> {estimateOccurrences()} classes
                  {formData.skip_dates.length > 0 && ` (excluding ${formData.skip_dates.length} skip dates)`}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 4: Advanced Settings */}
          {step === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Class Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Generate classes ahead</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={formData.generate_ahead_weeks}
                        onChange={(e) => updateFormData('generate_ahead_weeks', parseInt(e.target.value) || 12)}
                        min="1"
                        max="52"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">weeks</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      How far in advance to create class instances
                    </p>
                  </div>

                  <div>
                    <Label>Allow booking ahead</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={formData.allow_booking_ahead_weeks}
                        onChange={(e) => updateFormData('allow_booking_ahead_weeks', parseInt(e.target.value) || 4)}
                        min="1"
                        max="12"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">weeks</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      How far ahead clients can book
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Auto-Cancellation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Minimum registrations</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={formData.auto_cancel_if_min_registrations}
                        onChange={(e) => updateFormData('auto_cancel_if_min_registrations', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">registrations</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-cancel class if below this number 24h before start (0 to disable)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Send reminders</Label>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={formData.send_reminder_hours.includes(24)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData('send_reminder_hours', [...formData.send_reminder_hours, 24]);
                            } else {
                              updateFormData('send_reminder_hours', formData.send_reminder_hours.filter(h => h !== 24));
                            }
                          }}
                        />
                        <Label>24 hours before</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          checked={formData.send_reminder_hours.includes(2)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData('send_reminder_hours', [...formData.send_reminder_hours, 2]);
                            } else {
                              updateFormData('send_reminder_hours', formData.send_reminder_hours.filter(h => h !== 2));
                            }
                          }}
                        />
                        <Label>2 hours before</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Preview & Create
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Series Preview</DialogTitle>
              <DialogDescription>
                Review your recurring series before creating
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {formData.name}</div>
                    <div><strong>Category:</strong> {formData.category}</div>
                    <div><strong>Level:</strong> {formData.level}</div>
                    <div><strong>Capacity:</strong> {formData.capacity} spots</div>
                    <div><strong>Price:</strong> CHF {formData.price_chf}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Schedule</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Time:</strong> {formData.start_time} - {formData.end_time}</div>
                    <div><strong>Pattern:</strong> {generateRecurrencePreview()}</div>
                    <div><strong>Start:</strong> {new Date(formData.start_date).toLocaleDateString()}</div>
                    <div><strong>Classes:</strong> {estimateOccurrences()}</div>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This will create {estimateOccurrences()} individual class instances. 
                  You can modify individual classes later or edit the entire series.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back to Edit
              </Button>
              <Button onClick={handleSave}>
                Create Series
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}