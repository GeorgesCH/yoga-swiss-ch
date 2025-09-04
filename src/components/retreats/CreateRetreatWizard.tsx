import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Image,
  FileText,
  Settings,
  Eye,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';

interface CreateRetreatWizardProps {
  onCancel: () => void;
  onComplete: () => void;
  editingRetreat?: any; // For editing existing retreats
}

interface RetreatData {
  // Basic Info
  title: string;
  subtitle: string;
  description: string;
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  heroImage: string;
  gallery: string[];
  
  // Instructors & Hosts
  instructors: string[];
  
  // Room Types & Pricing
  roomTypes: Array<{
    id: string;
    name: string;
    description: string;
    occupancyMin: number;
    occupancyMax: number;
    totalUnits: number;
    basePrice: number;
    singleSupplement: number;
    amenities: string[];
  }>;
  
  // Add-ons
  addOns: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    perPerson: boolean;
    inventory?: number;
  }>;
  
  // Payment Plans
  paymentPlans: Array<{
    id: string;
    name: string;
    depositMin: number;
    schedule: Array<{
      dueAt: string;
      amount: number;
    }>;
  }>;
  
  // Policies
  cancellationPolicy: string;
  waiverTemplate: string;
  
  // Forms
  forms: Array<{
    id: string;
    type: string;
    required: boolean;
    requiredBefore: number; // days
  }>;
  
  // SEO & Localization
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  languageCodes: string[];
  
  // Status
  status: 'draft' | 'published';
}

const initialRetreatData: RetreatData = {
  title: '',
  subtitle: '',
  description: '',
  location: '',
  country: 'Switzerland',
  startDate: '',
  endDate: '',
  heroImage: '',
  gallery: [],
  instructors: [],
  roomTypes: [
    {
      id: '1',
      name: 'Shared Dormitory',
      description: 'Comfortable shared accommodation',
      occupancyMin: 1,
      occupancyMax: 4,
      totalUnits: 4,
      basePrice: 1500,
      singleSupplement: 0,
      amenities: ['Shared bathroom', 'Mountain view', 'Heating']
    }
  ],
  addOns: [],
  paymentPlans: [
    {
      id: '1',
      name: 'Full Payment',
      depositMin: 100,
      schedule: [
        { dueAt: 'booking', amount: 100 }
      ]
    },
    {
      id: '2',
      name: 'Deposit + Balance',
      depositMin: 30,
      schedule: [
        { dueAt: 'booking', amount: 30 },
        { dueAt: '30_days_before', amount: 70 }
      ]
    }
  ],
  cancellationPolicy: 'standard',
  waiverTemplate: 'standard',
  forms: [
    { id: '1', type: 'dietary', required: true, requiredBefore: 14 },
    { id: '2', type: 'medical', required: true, requiredBefore: 14 },
    { id: '3', type: 'emergency', required: true, requiredBefore: 7 }
  ],
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: []
  },
  languageCodes: ['en'],
  status: 'draft'
};

const wizardSteps = [
  { id: 'basics', title: 'Basic Information', icon: FileText },
  { id: 'media', title: 'Media & Gallery', icon: Image },
  { id: 'instructors', title: 'Instructors & Hosts', icon: Users },
  { id: 'rooms', title: 'Room Types & Pricing', icon: DollarSign },
  { id: 'policies', title: 'Policies & Forms', icon: Settings },
  { id: 'preview', title: 'Preview & Publish', icon: Eye }
];

export function CreateRetreatWizard({ onCancel, onComplete, editingRetreat }: CreateRetreatWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [retreatData, setRetreatData] = useState<RetreatData>(
    editingRetreat || initialRetreatData
  );
  const [isLoading, setIsLoading] = useState(false);

  const updateRetreatData = (updates: Partial<RetreatData>) => {
    setRetreatData(prev => ({ ...prev, ...updates }));
  };

  const updateRoomType = (index: number, updates: any) => {
    const newRoomTypes = [...retreatData.roomTypes];
    newRoomTypes[index] = { ...newRoomTypes[index], ...updates };
    updateRetreatData({ roomTypes: newRoomTypes });
  };

  const addRoomType = () => {
    const newRoomType = {
      id: Date.now().toString(),
      name: '',
      description: '',
      occupancyMin: 1,
      occupancyMax: 2,
      totalUnits: 1,
      basePrice: 1500,
      singleSupplement: 0,
      amenities: []
    };
    updateRetreatData({
      roomTypes: [...retreatData.roomTypes, newRoomType]
    });
  };

  const removeRoomType = (index: number) => {
    if (retreatData.roomTypes.length > 1) {
      const newRoomTypes = retreatData.roomTypes.filter((_, i) => i !== index);
      updateRetreatData({ roomTypes: newRoomTypes });
    }
  };

  const addAddOn = () => {
    const newAddOn = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      perPerson: true
    };
    updateRetreatData({
      addOns: [...retreatData.addOns, newAddOn]
    });
  };

  const updateAddOn = (index: number, updates: any) => {
    const newAddOns = [...retreatData.addOns];
    newAddOns[index] = { ...newAddOns[index], ...updates };
    updateRetreatData({ addOns: newAddOns });
  };

  const removeAddOn = (index: number) => {
    const newAddOns = retreatData.addOns.filter((_, i) => i !== index);
    updateRetreatData({ addOns: newAddOns });
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async (publish = false) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (publish) {
        updateRetreatData({ status: 'published' });
        toast.success('Retreat published successfully!');
      } else {
        toast.success('Retreat saved as draft');
      }
      
      onComplete();
    } catch (error) {
      toast.error('Failed to save retreat');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return retreatData.title && retreatData.location && retreatData.startDate && retreatData.endDate;
      case 1: // Media
        return retreatData.heroImage;
      case 2: // Instructors
        return retreatData.instructors.length > 0;
      case 3: // Rooms
        return retreatData.roomTypes.length > 0 && retreatData.roomTypes.every(room => room.name && room.basePrice > 0);
      case 4: // Policies
        return true;
      case 5: // Preview
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Retreat Title *</Label>
                <Input
                  id="title"
                  value={retreatData.title}
                  onChange={(e) => updateRetreatData({ title: e.target.value })}
                  placeholder="e.g., Alpine Serenity Yoga Retreat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={retreatData.subtitle}
                  onChange={(e) => updateRetreatData({ subtitle: e.target.value })}
                  placeholder="e.g., Discover inner peace in the Swiss Alps"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={retreatData.description}
                onChange={(e) => updateRetreatData({ description: e.target.value })}
                placeholder="Describe your retreat experience..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={retreatData.location}
                  onChange={(e) => updateRetreatData({ location: e.target.value })}
                  placeholder="e.g., Interlaken, Switzerland"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={retreatData.country} 
                  onValueChange={(value) => updateRetreatData({ country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Switzerland">Switzerland</SelectItem>
                    <SelectItem value="Austria">Austria</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={retreatData.startDate}
                  onChange={(e) => updateRetreatData({ startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={retreatData.endDate}
                  onChange={(e) => updateRetreatData({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Media & Gallery
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Hero Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {retreatData.heroImage ? (
                  <div className="relative">
                    <img
                      src={retreatData.heroImage}
                      alt="Hero"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => updateRetreatData({ heroImage: '' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Upload a high-quality hero image for your retreat
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Simulate image upload
                        updateRetreatData({ 
                          heroImage: 'https://images.unsplash.com/photo-1679161551610-67dd4756f8db?w=800&h=400&fit=crop' 
                        });
                      }}
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="grid grid-cols-3 gap-4">
                {retreatData.gallery.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        const newGallery = retreatData.gallery.filter((_, i) => i !== index);
                        updateRetreatData({ gallery: newGallery });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <button
                  className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                  onClick={() => {
                    // Simulate adding gallery image
                    const sampleImages = [
                      'https://images.unsplash.com/photo-1615275219949-b31d641fce23?w=300&h=300&fit=crop',
                      'https://images.unsplash.com/photo-1696766984569-a33d52748dba?w=300&h=300&fit=crop'
                    ];
                    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                    updateRetreatData({ 
                      gallery: [...retreatData.gallery, randomImage] 
                    });
                  }}
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        );

      case 2: // Instructors & Hosts
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Lead Instructors *</Label>
              <p className="text-sm text-muted-foreground">
                Select the instructors who will be leading this retreat
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mock instructor selection */}
                {[
                  { id: '1', name: 'Sarah Müller', title: 'Senior Yoga Instructor' },
                  { id: '2', name: 'Marco Bianchi', title: 'Meditation Guide' },
                  { id: '3', name: 'Elena Weber', title: 'Breathwork Specialist' }
                ].map((instructor) => (
                  <div
                    key={instructor.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      retreatData.instructors.includes(instructor.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      const isSelected = retreatData.instructors.includes(instructor.id);
                      if (isSelected) {
                        updateRetreatData({
                          instructors: retreatData.instructors.filter(id => id !== instructor.id)
                        });
                      } else {
                        updateRetreatData({
                          instructors: [...retreatData.instructors, instructor.id]
                        });
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        {instructor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{instructor.name}</p>
                        <p className="text-sm text-muted-foreground">{instructor.title}</p>
                      </div>
                      {retreatData.instructors.includes(instructor.id) && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Room Types & Pricing
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Room Types & Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Configure accommodation options and pricing
                </p>
              </div>
              <Button onClick={addRoomType} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Room Type
              </Button>
            </div>

            <div className="space-y-4">
              {retreatData.roomTypes.map((room, index) => (
                <Card key={room.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Room Type {index + 1}</Label>
                        {retreatData.roomTypes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRoomType(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Room Name *</Label>
                          <Input
                            value={room.name}
                            onChange={(e) => updateRoomType(index, { name: e.target.value })}
                            placeholder="e.g., Private Double Room"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Base Price (CHF) *</Label>
                          <Input
                            type="number"
                            value={room.basePrice}
                            onChange={(e) => updateRoomType(index, { basePrice: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={room.description}
                          onChange={(e) => updateRoomType(index, { description: e.target.value })}
                          placeholder="Describe this room type..."
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Min Occupancy</Label>
                          <Select
                            value={room.occupancyMin.toString()}
                            onValueChange={(value) => updateRoomType(index, { occupancyMin: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Max Occupancy</Label>
                          <Select
                            value={room.occupancyMax.toString()}
                            onValueChange={(value) => updateRoomType(index, { occupancyMax: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Total Units</Label>
                          <Input
                            type="number"
                            value={room.totalUnits}
                            onChange={(e) => updateRoomType(index, { totalUnits: parseInt(e.target.value) || 1 })}
                            min="1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Single Supplement</Label>
                          <Input
                            type="number"
                            value={room.singleSupplement}
                            onChange={(e) => updateRoomType(index, { singleSupplement: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add-ons Section */}
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Add-ons (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    Additional services guests can purchase
                  </p>
                </div>
                <Button onClick={addAddOn} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Add-on
                </Button>
              </div>

              {retreatData.addOns.map((addOn, index) => (
                <Card key={addOn.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={addOn.name}
                          onChange={(e) => updateAddOn(index, { name: e.target.value })}
                          placeholder="e.g., Spa Package"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (CHF)</Label>
                        <Input
                          type="number"
                          value={addOn.price}
                          onChange={(e) => updateAddOn(index, { price: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`per-person-${index}`}
                            checked={addOn.perPerson}
                            onCheckedChange={(checked) => updateAddOn(index, { perPerson: checked })}
                          />
                          <Label htmlFor={`per-person-${index}`} className="text-sm">
                            Per person
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAddOn(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={addOn.description}
                        onChange={(e) => updateAddOn(index, { description: e.target.value })}
                        placeholder="Describe this add-on..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4: // Policies & Forms
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Policies & Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Configure cancellation policies and required forms
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cancellation Policy</Label>
                <Select 
                  value={retreatData.cancellationPolicy} 
                  onValueChange={(value) => updateRetreatData({ cancellationPolicy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible - Free cancellation until 7 days</SelectItem>
                    <SelectItem value="standard">Standard - Free cancellation until 30 days</SelectItem>
                    <SelectItem value="strict">Strict - Non-refundable deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Waiver Template</Label>
                <Select 
                  value={retreatData.waiverTemplate} 
                  onValueChange={(value) => updateRetreatData({ waiverTemplate: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Liability Waiver</SelectItem>
                    <SelectItem value="adventure">Adventure Activities Waiver</SelectItem>
                    <SelectItem value="wellness">Wellness & Spa Waiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Required Forms</h4>
              {retreatData.forms.map((form, index) => (
                <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{form.type} Information</p>
                    <p className="text-sm text-muted-foreground">
                      Required {form.requiredBefore} days before retreat
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={form.required}
                      onCheckedChange={(checked) => {
                        const newForms = [...retreatData.forms];
                        newForms[index] = { ...newForms[index], required: Boolean(checked) };
                        updateRetreatData({ forms: newForms });
                      }}
                    />
                    <Label>Required</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5: // Preview & Publish
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Preview & Publish</h3>
              <p className="text-sm text-muted-foreground">
                Review your retreat before publishing
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {retreatData.title}
                  <Badge variant="outline">{retreatData.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{retreatData.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dates</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(retreatData.startDate).toLocaleDateString()} - {new Date(retreatData.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Room Types</p>
                    <p className="text-sm text-muted-foreground">{retreatData.roomTypes.length} types configured</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Starting Price</p>
                    <p className="text-sm text-muted-foreground">
                      CHF {Math.min(...retreatData.roomTypes.map(r => r.basePrice)).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{retreatData.description}</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/30 border rounded-lg p-4">
              <h4 className="font-medium mb-2">Publishing Checklist</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic information completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Hero image uploaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Room types configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Policies set</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {editingRetreat ? 'Edit Retreat' : 'Create New Retreat'}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {wizardSteps.length}: {wizardSteps[currentStep].title}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isLoading}
          >
            Save Draft
          </Button>

          {currentStep === wizardSteps.length - 1 ? (
            <Button
              onClick={() => handleSave(true)}
              disabled={isLoading || !canProceed()}
            >
              Publish Retreat
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}