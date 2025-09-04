import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Calendar, Clock, Users, MapPin, 
  DollarSign, Settings, Eye, EyeOff, Globe, Image, Tag,
  AlertCircle, CheckCircle, Wand2, Plus, X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { classesService } from '../../utils/supabase/classes-service';
import { classesServiceFallback, CreateClassWizardData } from '../../utils/supabase/classes-service-fallback';
import { toast } from 'sonner@2.0.3';

interface ClassCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (classData: any) => void;
  editingTemplate?: any;
}

export function ClassCreationWizard({ 
  isOpen, 
  onClose, 
  onComplete, 
  editingTemplate 
}: ClassCreationWizardProps) {
  const { currentOrg, user } = useMultiTenantAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateClassWizardData>({
    // Step 1: Basics
    name: '',
    type: 'class',
    visibility: 'public',
    description: { 'de-CH': '', 'fr-CH': '', 'it-CH': '', 'en-CH': '' },
    category: '',
    level: 'all_levels',
    duration_minutes: 60,
    image_url: '',
    color: '#3B82F6',
    tags: [],
    
    // Step 2: Scheduling
    start_date: new Date().toISOString().split('T')[0],
    time_window_start: '09:00',
    time_window_end: '10:30',
    recurrence_pattern: undefined,
    instructor_ids: [],
    location_ids: [],
    
    // Step 3: Pricing
    default_price: 25.00,
    pricing_tiers: [],
    
    // Step 4: Policies
    cancellation_hours: 24,
    late_cancel_fee: 0,
    no_show_fee: 0,
    sales_open_hours: 168, // 1 week
    sales_close_hours: 2,
    
    // Step 5: Publication
    publish_now: false
  });

  const [tagInput, setTagInput] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'de-CH' | 'fr-CH' | 'it-CH' | 'en-CH'>('en-CH');

  const steps = [
    { id: 1, name: 'Basics', icon: Settings },
    { id: 2, name: 'Scheduling', icon: Calendar },
    { id: 3, name: 'Pricing', icon: DollarSign },
    { id: 4, name: 'Policies', icon: AlertCircle },
    { id: 5, name: 'Publication', icon: Globe }
  ];

  const classTypes = [
    { value: 'class', label: 'Drop-in Class', description: 'Regular recurring class' },
    { value: 'workshop', label: 'Workshop/Event', description: 'Special one-time event' },
    { value: 'course', label: 'Course/Series', description: 'Multi-week program' },
    { value: 'private', label: 'Private Class', description: 'One-on-one instruction' },
    { value: 'hybrid', label: 'Hybrid Class', description: 'In-person + online' }
  ];

  const categories = [
    'Vinyasa', 'Hatha', 'Ashtanga', 'Bikram', 'Hot Yoga', 'Yin', 'Restorative',
    'Power Yoga', 'Kundalini', 'Meditation', 'Pranayama', 'Workshop', 'Teacher Training'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all_levels', label: 'All Levels' }
  ];

  const languages = [
    { code: 'de-CH', label: '🇩🇪 Deutsch', flag: '🇩🇪' },
    { code: 'fr-CH', label: '🇫🇷 Français', flag: '🇫🇷' },
    { code: 'it-CH', label: '🇮🇹 Italiano', flag: '🇮🇹' },
    { code: 'en-CH', label: '🇬🇧 English', flag: '🇬🇧' }
  ];

  const recurrencePatterns = [
    { value: 'none', label: 'One-time class' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly (same day)' },
    { value: 'custom', label: 'Custom pattern' }
  ];

  // Handle form updates
  const updateFormData = (updates: Partial<CreateClassWizardData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData({
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    updateFormData({
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  // Handle step navigation
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!currentOrg) return;

    setIsSubmitting(true);
    try {
      let result;
      try {
        // Try the main service first
        result = await classesService.createClassWithWizard(currentOrg.id, formData);
      } catch (mainError) {
        console.log('Main service not available, using fallback service');
        // Use fallback service
        result = await classesServiceFallback.createClassWithWizard(currentOrg.id, formData);
      }
      
      toast.success('Class created successfully!');
      onComplete(result);
      onClose();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const progress = (currentStep / steps.length) * 100;

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="e.g., Morning Vinyasa Flow"
                required
              />
            </div>

            <div>
              <Label>Class Type *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {classTypes.map((type) => (
                  <Card 
                    key={type.value} 
                    className={`cursor-pointer transition-colors ${
                      formData.type === type.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => updateFormData({ type: type.value as any })}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => updateFormData({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level *</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => updateFormData({ level: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Select 
                value={formData.duration_minutes.toString()} 
                onValueChange={(value) => updateFormData({ duration_minutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="75">75 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Description</Label>
                <div className="flex items-center gap-2">
                  {languages.map(lang => (
                    <Button
                      key={lang.code}
                      variant={currentLanguage === lang.code ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentLanguage(lang.code as any)}
                    >
                      {lang.flag}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                value={formData.description[currentLanguage] || ''}
                onChange={(e) => updateFormData({
                  description: {
                    ...formData.description,
                    [currentLanguage]: e.target.value
                  }
                })}
                placeholder={`Description in ${languages.find(l => l.code === currentLanguage)?.label}`}
                rows={4}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Theme Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => updateFormData({ color: e.target.value })}
                />
              </div>

              <div>
                <Label>Visibility</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value) => updateFormData({ visibility: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Public (Listed)
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Unlisted (Direct link)
                      </div>
                    </SelectItem>
                    <SelectItem value="private">Private (Invitation only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData({ start_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.time_window_start}
                  onChange={(e) => updateFormData({ time_window_start: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.time_window_end}
                  onChange={(e) => updateFormData({ time_window_end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Recurrence Pattern</Label>
              <Select 
                value={formData.recurrence_pattern ? 'weekly' : 'none'} 
                onValueChange={(value) => updateFormData({ 
                  recurrence_pattern: value === 'none' ? undefined : { type: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recurrencePatterns.map(pattern => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.recurrence_pattern && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.recurrence_end_date || ''}
                    onChange={(e) => updateFormData({ recurrence_end_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Or Number of Classes</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.recurrence_end_count || ''}
                    onChange={(e) => updateFormData({ 
                      recurrence_end_count: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Instructors *</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Select at least one instructor for this class
              </div>
              {/* Instructor selection would be implemented here */}
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Instructor selection coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label>Locations *</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Select available locations for this class
              </div>
              {/* Location selection would be implemented here */}
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Location selection coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="price">Base Price (CHF) *</Label>
              <Input
                id="price"
                type="number"
                step="0.50"
                value={formData.default_price}
                onChange={(e) => updateFormData({ default_price: parseFloat(e.target.value) })}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Price includes Swiss VAT (7.7%)
              </div>
            </div>

            <div>
              <Label>Pricing Tiers (Optional)</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Create different pricing tiers (early bird, student, member discounts)
              </div>
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Pricing tiers coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label htmlFor="capacity">Capacity Override (Optional)</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Leave empty to use location default"
                value={formData.capacity_override || ''}
                onChange={(e) => updateFormData({ 
                  capacity_override: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="cancel-hours">Cancellation Window (hours)</Label>
              <Input
                id="cancel-hours"
                type="number"
                value={formData.cancellation_hours}
                onChange={(e) => updateFormData({ cancellation_hours: parseInt(e.target.value) })}
              />
              <div className="text-xs text-muted-foreground mt-1">
                How many hours before class can customers cancel for full refund
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="late-fee">Late Cancellation Fee (CHF)</Label>
                <Input
                  id="late-fee"
                  type="number"
                  step="0.50"
                  value={formData.late_cancel_fee}
                  onChange={(e) => updateFormData({ late_cancel_fee: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="no-show-fee">No-Show Fee (CHF)</Label>
                <Input
                  id="no-show-fee"
                  type="number"
                  step="0.50"
                  value={formData.no_show_fee}
                  onChange={(e) => updateFormData({ no_show_fee: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sales-open">Sales Open (hours before)</Label>
                <Input
                  id="sales-open"
                  type="number"
                  value={formData.sales_open_hours}
                  onChange={(e) => updateFormData({ sales_open_hours: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="sales-close">Sales Close (hours before)</Label>
                <Input
                  id="sales-close"
                  type="number"
                  value={formData.sales_close_hours}
                  onChange={(e) => updateFormData({ sales_close_hours: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="publish-now"
                checked={formData.publish_now}
                onCheckedChange={(checked) => updateFormData({ publish_now: checked })}
              />
              <Label htmlFor="publish-now">Publish immediately</Label>
            </div>

            {!formData.publish_now && (
              <div>
                <Label htmlFor="scheduled-publish">Schedule Publication</Label>
                <Input
                  id="scheduled-publish"
                  type="datetime-local"
                  value={formData.scheduled_publish || ''}
                  onChange={(e) => updateFormData({ scheduled_publish: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label>Sales Channels</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="website" defaultChecked />
                  <Label htmlFor="website">Website</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="mobile-app" defaultChecked />
                  <Label htmlFor="mobile-app">Mobile App</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="widgets" defaultChecked />
                  <Label htmlFor="widgets">Booking Widgets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="corporate" />
                  <Label htmlFor="corporate">Corporate Portal</Label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Class Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Type:</strong> {classTypes.find(t => t.value === formData.type)?.label}</div>
                <div><strong>Category:</strong> {formData.category}</div>
                <div><strong>Duration:</strong> {formData.duration_minutes} minutes</div>
                <div><strong>Price:</strong> CHF {formData.default_price}</div>
                <div><strong>Start:</strong> {formData.start_date} at {formData.time_window_start}</div>
                {formData.recurrence_pattern && (
                  <div><strong>Recurrence:</strong> Weekly</div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            {editingTemplate ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
          <DialogDescription>
            {editingTemplate 
              ? 'Edit your class template and scheduling settings'
              : 'Create a new class with all the details including scheduling, pricing, and policies'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                step.id === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id < currentStep
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <step.icon className="h-4 w-4" />
              {step.name}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === steps.length ? (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.category}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Class
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!formData.name || !formData.category)) ||
                isSubmitting
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}