import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Checkbox } from '../../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { 
  User, 
  Heart,
  Calendar,
  Bell,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  MapPin,
  Globe,
  Mail,
  Smartphone,
  MessageCircle
} from 'lucide-react';

export function CustomerOnboardingPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { currentLocation, guestPreferences, setGuestPreferences } = usePortal();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    yogaExperience: 'beginner',
    medicalConditions: '',
    goals: [],
    availabilityWindows: [],
    preferredStyles: [],
    preferredLanguages: ['en'],
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    }
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const yogaStyles = [
    { id: 'vinyasa', name: 'Vinyasa Flow', description: 'Dynamic, flowing sequences' },
    { id: 'hatha', name: 'Hatha Yoga', description: 'Gentle, slower-paced practice' },
    { id: 'yin', name: 'Yin Yoga', description: 'Deep stretches, meditative' },
    { id: 'power', name: 'Power Yoga', description: 'Strength-building, athletic' },
    { id: 'hot', name: 'Hot Yoga', description: 'Heated room practice' },
    { id: 'prenatal', name: 'Prenatal Yoga', description: 'Safe practice for pregnancy' },
    { id: 'meditation', name: 'Meditation', description: 'Mindfulness and breathing' },
    { id: 'aerial', name: 'Aerial Yoga', description: 'Suspended yoga practice' }
  ];

  const goalOptions = [
    { id: 'flexibility', name: 'Improve Flexibility' },
    { id: 'strength', name: 'Build Strength' },
    { id: 'stress', name: 'Reduce Stress' },
    { id: 'balance', name: 'Better Balance' },
    { id: 'mindfulness', name: 'Mindfulness' },
    { id: 'fitness', name: 'General Fitness' },
    { id: 'recovery', name: 'Injury Recovery' },
    { id: 'community', name: 'Meet People' }
  ];

  const timeSlots = [
    { id: 'early', name: 'Early Morning', time: '6-9 AM' },
    { id: 'morning', name: 'Morning', time: '9-12 PM' },
    { id: 'lunch', name: 'Lunch Time', time: '12-2 PM' },
    { id: 'afternoon', name: 'Afternoon', time: '2-6 PM' },
    { id: 'evening', name: 'Evening', time: '6-9 PM' },
    { id: 'night', name: 'Night', time: '9+ PM' },
    { id: 'weekend', name: 'Weekends', time: 'Sat/Sun' }
  ];

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    
    // Update guest preferences
    setGuestPreferences({
      favoriteStyles: profile.preferredStyles,
      preferredLanguages: profile.preferredLanguages,
      availabilityWindows: profile.availabilityWindows,
      levelExperience: profile.yogaExperience,
      notifications: profile.notifications
    });

    // Mock account creation
    setTimeout(() => {
      setIsCompleting(false);
      onPageChange('home');
    }, 2000);
  };

  const canProceedStep1 = profile.firstName && profile.lastName && profile.email;
  const canProceedStep2 = profile.yogaExperience;
  const canProceedStep3 = profile.preferredStyles.length > 0;
  const canProceedStep4 = profile.goals.length > 0;
  const canProceedStep5 = true; // Availability and notifications are optional

  const handleStyleToggle = (styleId: string) => {
    setProfile(prev => ({
      ...prev,
      preferredStyles: prev.preferredStyles.includes(styleId)
        ? prev.preferredStyles.filter(id => id !== styleId)
        : [...prev.preferredStyles, styleId]
    }));
  };

  const handleGoalToggle = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleAvailabilityToggle = (timeId: string) => {
    setProfile(prev => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.includes(timeId)
        ? prev.availabilityWindows.filter(id => id !== timeId)
        : [...prev.availabilityWindows, timeId]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-semibold">Welcome to YogaSwiss!</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Let's personalize your yoga journey in {currentLocation?.name || 'Zürich'}
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <Card className="mx-auto">
        <CardContent className="p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
                <p className="text-muted-foreground">
                  Basic information to get started with your yoga journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+41 79 123 45 67"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth (Optional)</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency">Emergency Contact (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Contact name"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
                  />
                  <Input
                    placeholder="Contact phone"
                    value={profile.emergencyPhone}
                    onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medical">Medical Conditions or Injuries (Optional)</Label>
                <Textarea
                  id="medical"
                  placeholder="Please share any conditions or injuries your instructors should know about..."
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile({...profile, medicalConditions: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Step 2: Yoga Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold">Your yoga experience</h2>
                <p className="text-muted-foreground">
                  Help us recommend the right classes for your level
                </p>
              </div>

              <RadioGroup 
                value={profile.yogaExperience} 
                onValueChange={(value) => setProfile({...profile, yogaExperience: value})}
                className="space-y-4"
              >
                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <div className="flex-1">
                      <Label htmlFor="beginner" className="font-medium cursor-pointer">
                        Complete Beginner
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I'm new to yoga and want to learn the basics
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="some-experience" id="some-experience" />
                    <div className="flex-1">
                      <Label htmlFor="some-experience" className="font-medium cursor-pointer">
                        Some Experience
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I've done yoga a few times and know basic poses
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <div className="flex-1">
                      <Label htmlFor="intermediate" className="font-medium cursor-pointer">
                        Regular Practitioner
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I practice regularly and am comfortable with most poses
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <div className="flex-1">
                      <Label htmlFor="advanced" className="font-medium cursor-pointer">
                        Advanced Yogi
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I have extensive experience and enjoy challenging practices
                      </p>
                    </div>
                  </div>
                </Card>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Preferred Styles */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold">What styles interest you?</h2>
                <p className="text-muted-foreground">
                  Select all that appeal to you - we'll help you discover new favorites too!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yogaStyles.map((style) => (
                  <Card 
                    key={style.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      profile.preferredStyles.includes(style.id) 
                        ? 'border-primary bg-primary/5' 
                        : ''
                    }`}
                    onClick={() => handleStyleToggle(style.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{style.name}</h3>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </div>
                      {profile.preferredStyles.includes(style.id) && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Selected {profile.preferredStyles.length} style{profile.preferredStyles.length !== 1 ? 's' : ''}
                {profile.preferredStyles.length === 0 && ' - Choose at least one to continue'}
              </p>
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-semibold">What are your goals?</h2>
                <p className="text-muted-foreground">
                  Tell us what you hope to achieve through your yoga practice
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {goalOptions.map((goal) => (
                  <Card 
                    key={goal.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${
                      profile.goals.includes(goal.id) 
                        ? 'border-primary bg-primary/5' 
                        : ''
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{goal.name}</p>
                      {profile.goals.includes(goal.id) && (
                        <CheckCircle className="h-4 w-4 text-primary mx-auto" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Selected {profile.goals.length} goal{profile.goals.length !== 1 ? 's' : ''}
                {profile.goals.length === 0 && ' - Choose at least one to continue'}
              </p>
            </div>
          )}

          {/* Step 5: Availability & Notifications */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold">When do you prefer to practice?</h2>
                <p className="text-muted-foreground">
                  Optional: Help us show you classes at your preferred times
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Preferred Time Slots</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => (
                      <Card 
                        key={slot.id}
                        className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${
                          profile.availabilityWindows.includes(slot.id) 
                            ? 'border-primary bg-primary/5' 
                            : ''
                        }`}
                        onClick={() => handleAvailabilityToggle(slot.id)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{slot.name}</p>
                          <p className="text-xs text-muted-foreground">{slot.time}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email-notifications"
                        checked={profile.notifications.email}
                        onCheckedChange={(checked) => 
                          setProfile({
                            ...profile, 
                            notifications: {...profile.notifications, email: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="email-notifications" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email notifications for bookings and reminders
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="push-notifications"
                        checked={profile.notifications.push}
                        onCheckedChange={(checked) => 
                          setProfile({
                            ...profile, 
                            notifications: {...profile.notifications, push: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="push-notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Push notifications for class reminders
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sms-notifications"
                        checked={profile.notifications.sms}
                        onCheckedChange={(checked) => 
                          setProfile({
                            ...profile, 
                            notifications: {...profile.notifications, sms: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="sms-notifications" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        SMS notifications (charges may apply)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="marketing"
                        checked={profile.notifications.marketing}
                        onCheckedChange={(checked) => 
                          setProfile({
                            ...profile, 
                            notifications: {...profile.notifications, marketing: checked as boolean}
                          })
                        }
                      />
                      <Label htmlFor="marketing" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Marketing emails about new classes and special offers
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Language Preference</h3>
                  <RadioGroup 
                    value={profile.preferredLanguages[0]} 
                    onValueChange={(value) => setProfile({...profile, preferredLanguages: [value]})}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    <Card className="p-3 cursor-pointer hover:bg-accent">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="en" id="lang-en" />
                        <Label htmlFor="lang-en" className="cursor-pointer">English</Label>
                      </div>
                    </Card>
                    <Card className="p-3 cursor-pointer hover:bg-accent">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="de" id="lang-de" />
                        <Label htmlFor="lang-de" className="cursor-pointer">Deutsch</Label>
                      </div>
                    </Card>
                    <Card className="p-3 cursor-pointer hover:bg-accent">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fr" id="lang-fr" />
                        <Label htmlFor="lang-fr" className="cursor-pointer">Français</Label>
                      </div>
                    </Card>
                    <Card className="p-3 cursor-pointer hover:bg-accent">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="it" id="lang-it" />
                        <Label htmlFor="lang-it" className="cursor-pointer">Italiano</Label>
                      </div>
                    </Card>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3) ||
                  (currentStep === 4 && !canProceedStep4)
                }
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isCompleting}
                className="flex items-center gap-2 min-w-32"
              >
                {isCompleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Skip Option */}
          {currentStep < totalSteps && (
            <div className="text-center pt-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onPageChange('home')}
                className="text-muted-foreground"
              >
                Skip and explore classes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}