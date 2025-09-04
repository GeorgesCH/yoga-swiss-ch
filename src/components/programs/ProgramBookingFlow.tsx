import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  SwissFranc,
  CreditCard,
  Globe,
  Users,
  Zap,
  Target,
  AlertCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

interface Program {
  id: string;
  title: string;
  summary: string;
  category: string;
  delivery_mode: string;
  session_length_min: number;
  is_multi_session: boolean;
  instructor: {
    id: string;
    name: string;
    title: string;
    rating: number;
    image: string;
  };
  selected_variant: {
    id: string;
    name: string;
    sessions_count: number;
    price: number;
    currency: string;
    description: string;
    includes?: string[];
  };
  intake_form?: {
    required: boolean;
    fields: Array<{
      type: string;
      name: string;
      label: string;
      required: boolean;
      options?: string[];
    }>;
  };
  availability?: {
    [key: string]: {
      available: boolean;
      slots: string[];
    };
  };
}

interface BookingData {
  program_id: string;
  variant_id: string;
  instructor_id: string;
  sessions: Array<{
    starts_at: string;
    ends_at: string;
    location_type: string;
    location_id?: string;
    meeting_url?: string;
  }>;
  intake_responses: { [key: string]: any };
  customer_notes?: string;
  total_price: number;
  source: string;
}

interface ProgramBookingFlowProps {
  program: Program;
  onComplete: (bookingData: BookingData) => void;
  onCancel: () => void;
}

export function ProgramBookingFlow({ program, onComplete, onCancel }: ProgramBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedLocationType, setSelectedLocationType] = useState<string>('studio');
  const [intakeResponses, setIntakeResponses] = useState<{ [key: string]: any }>({});
  const [customerNotes, setCustomerNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const totalSteps = 4; // 1: Schedule, 2: Location, 3: Intake Form, 4: Review & Payment
  const progress = (currentStep / totalSteps) * 100;

  const availableSlots = [
    { date: '2024-02-20', slots: ['09:00', '11:00', '14:00', '16:00'] },
    { date: '2024-02-21', slots: ['09:00', '11:00', '14:00'] },
    { date: '2024-02-22', slots: ['09:00', '11:00', '16:00'] },
    { date: '2024-02-23', slots: ['09:00', '14:00', '16:00'] },
    { date: '2024-02-24', slots: ['09:00', '11:00'] }
  ];

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'in_person': return { icon: Users, text: 'In-Person', color: 'text-blue-600' };
      case 'online': return { icon: Globe, text: 'Online', color: 'text-green-600' };
      case 'hybrid': return { icon: Zap, text: 'Hybrid', color: 'text-purple-600' };
      default: return { icon: Users, text: 'In-Person', color: 'text-blue-600' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount);
  };

  const handleDateSelect = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const availableOnDate = availableSlots.find(slot => slot.date === dateString);
    
    if (!availableOnDate || availableOnDate.slots.length === 0) return;

    if (program.is_multi_session) {
      const newDates = [...selectedDates];
      const existingIndex = newDates.findIndex(d => format(d, 'yyyy-MM-dd') === dateString);
      
      if (existingIndex >= 0) {
        newDates.splice(existingIndex, 1);
        setSelectedTimes(prev => prev.filter((_, index) => index !== existingIndex));
      } else if (newDates.length < program.selected_variant.sessions_count) {
        newDates.push(date);
        setSelectedTimes(prev => [...prev, availableOnDate.slots[0]]);
      }
      
      setSelectedDates(newDates);
    } else {
      setSelectedDates([date]);
      setSelectedTimes([availableOnDate.slots[0]]);
    }
  };

  const handleTimeSelect = (timeSlot: string, sessionIndex: number) => {
    const newTimes = [...selectedTimes];
    newTimes[sessionIndex] = timeSlot;
    setSelectedTimes(newTimes);
  };

  const validateCurrentStep = () => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1: // Schedule
        if (selectedDates.length === 0) {
          newErrors.schedule = 'Please select at least one date';
        } else if (program.is_multi_session && selectedDates.length !== program.selected_variant.sessions_count) {
          newErrors.schedule = `Please select ${program.selected_variant.sessions_count} dates for all sessions`;
        }
        if (selectedTimes.length === 0) {
          newErrors.times = 'Please select times for all sessions';
        }
        break;

      case 2: // Location
        if (!selectedLocationType) {
          newErrors.location = 'Please select a location type';
        }
        break;

      case 3: // Intake Form
        if (program.intake_form?.required) {
          program.intake_form.fields.forEach(field => {
            if (field.required && !intakeResponses[field.name]) {
              newErrors[field.name] = `${field.label} is required`;
            }
          });
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleIntakeResponseChange = (fieldName: string, value: any) => {
    setIntakeResponses(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    
    try {
      const sessions = selectedDates.map((date, index) => {
        const startTime = selectedTimes[index];
        const startDateTime = new Date(date);
        const [hours, minutes] = startTime.split(':').map(Number);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + program.session_length_min);

        return {
          starts_at: startDateTime.toISOString(),
          ends_at: endDateTime.toISOString(),
          location_type: selectedLocationType,
          location_id: selectedLocationType === 'studio' ? 'studio-main' : undefined,
          meeting_url: selectedLocationType === 'online' ? 'https://meet.example.com/session' : undefined
        };
      });

      const bookingData: BookingData = {
        program_id: program.id,
        variant_id: program.selected_variant.id,
        instructor_id: program.instructor.id,
        sessions,
        intake_responses: intakeResponses,
        customer_notes: customerNotes,
        total_price: program.selected_variant.price,
        source: 'direct'
      };

      onComplete(bookingData);
    } catch (error) {
      console.error('Error completing booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Schedule Your Sessions</h3>
              <p className="text-muted-foreground">
                {program.is_multi_session 
                  ? `Select ${program.selected_variant.sessions_count} dates for your program`
                  : 'Choose your preferred date and time'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Available Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {availableSlots.map((slot) => {
                      const date = new Date(slot.date);
                      const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === slot.date);
                      
                      return (
                        <div key={slot.date} className="space-y-2">
                          <div 
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-border hover:border-blue-300'
                            }`}
                            onClick={() => handleDateSelect(date)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  {format(date, 'EEEE, MMMM d, yyyy')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {slot.slots.length} time slots available
                                </div>
                              </div>
                              {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {slot.slots.map((time) => (
                                <Badge key={time} variant="outline" className="text-xs">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.schedule && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.schedule}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Times</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDates.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDates.map((date, index) => {
                        const dateString = format(date, 'yyyy-MM-dd');
                        const availableOnDate = availableSlots.find(slot => slot.date === dateString);
                        
                        return (
                          <div key={index} className="space-y-2">
                            <Label className="text-sm">
                              Session {index + 1} - {format(date, 'MMM d')}
                            </Label>
                            <Select
                              value={selectedTimes[index] || ''}
                              onValueChange={(value) => handleTimeSelect(value, index)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOnDate?.slots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p>Select dates to see available times</p>
                    </div>
                  )}
                  {errors.times && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.times}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Location</h3>
              <p className="text-muted-foreground">
                How would you like to attend your sessions?
              </p>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto">
              {program.delivery_mode === 'in_person' || program.delivery_mode === 'hybrid' ? (
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedLocationType === 'studio' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedLocationType('studio')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedLocationType === 'studio'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedLocationType === 'studio' && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <Users className="h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Studio Location</div>
                        <div className="text-sm text-muted-foreground">
                          Bahnhofstrasse 123, 8001 Zurich
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          In-person session with full equipment access
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {program.delivery_mode === 'online' || program.delivery_mode === 'hybrid' ? (
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedLocationType === 'online' 
                      ? 'border-green-500 bg-green-50' 
                      : 'hover:border-green-300'
                  }`}
                  onClick={() => setSelectedLocationType('online')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedLocationType === 'online'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedLocationType === 'online' && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <Globe className="h-6 w-6 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Online Session</div>
                        <div className="text-sm text-muted-foreground">
                          Secure video call from anywhere
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Join from the comfort of your home
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {errors.location && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.location}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Program Intake Form</h3>
              <p className="text-muted-foreground">
                Help your instructor personalize your experience
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <CardDescription>
                  This information helps your instructor provide the best possible experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.intake_form?.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label className={field.required ? 'after:content-["*"] after:text-red-500' : ''}>
                      {field.label}
                    </Label>
                    
                    {field.type === 'text' && (
                      <Input
                        value={intakeResponses[field.name] || ''}
                        onChange={(e) => handleIntakeResponseChange(field.name, e.target.value)}
                        placeholder={field.label}
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <Textarea
                        value={intakeResponses[field.name] || ''}
                        onChange={(e) => handleIntakeResponseChange(field.name, e.target.value)}
                        placeholder={field.label}
                        rows={3}
                      />
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <Select
                        value={intakeResponses[field.name] || ''}
                        onValueChange={(value) => handleIntakeResponseChange(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {errors[field.name] && (
                      <div className="text-red-500 text-sm">{errors[field.name]}</div>
                    )}
                  </div>
                ))}

                <div className="space-y-2">
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Any additional information you'd like to share with your instructor..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review & Payment</h3>
              <p className="text-muted-foreground">
                Please review your booking details before payment
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Program Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Program Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{program.title}</h4>
                      <p className="text-sm text-muted-foreground">{program.selected_variant.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {program.selected_variant.sessions_count} session{program.selected_variant.sessions_count > 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {program.session_length_min} min each
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(program.selected_variant.price)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={program.instructor.image} />
                      <AvatarFallback>
                        {program.instructor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{program.instructor.name}</div>
                      <div className="text-sm text-muted-foreground">{program.instructor.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedTimes[index]} - {(() => {
                                const [hours, minutes] = selectedTimes[index].split(':').map(Number);
                                const endTime = new Date();
                                endTime.setHours(hours, minutes + program.session_length_min);
                                return format(endTime, 'HH:mm');
                              })()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {selectedLocationType === 'online' ? 'Online' : 'In-Person'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You'll be redirected to our secure payment page to complete your booking.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Card</Badge>
                        <Badge variant="outline" className="text-xs">TWINT</Badge>
                        <Badge variant="outline" className="text-xs">Apple Pay</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Booking Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? 'Processing...' : 'Complete Booking'}
            <SwissFranc className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}