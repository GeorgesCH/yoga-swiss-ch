import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner@2.0.3';
import { 
  User,
  MapPin,
  Phone,
  Mail,
  Camera,
  Save,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Heart,
  Settings,
  Eye,
  EyeOff,
  ChevronLeft,
  Calendar,
  Clock,
  Languages,
  Palette,
  Activity,
  Download
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface EditableProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  profileImage: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    canton: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences: {
    favoriteStyles: string[];
    preferredLanguages: string[];
    levelExperience: string;
    availabilityWindows: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      showProfile: boolean;
      showActivity: boolean;
      allowMessaging: boolean;
    };
    accessibility: {
      fontSize: string;
      highContrast: boolean;
      screenReader: boolean;
    };
  };
  healthInfo: {
    injuries: string;
    medications: string;
    allergies: string;
    fitnessLevel: string;
    yogaExperience: string;
  };
}

export function ProfileSettingsPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { customerProfile, isAuthenticated, updateProfile } = usePortal();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !customerProfile) {
    onPageChange('login');
    return null;
  }

  // Initialize editable profile with current data + extended fields
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    firstName: customerProfile.firstName,
    lastName: customerProfile.lastName,
    email: customerProfile.email,
    phone: customerProfile.phone || '',
    dateOfBirth: '1990-05-15', // Mock data
    bio: 'Passionate about yoga and mindful living. Love exploring different styles and connecting with the yoga community in Switzerland.',
    profileImage: customerProfile.profileImage || '/placeholder-user.jpg',
    address: {
      street: 'Musterstrasse 123',
      city: 'Zürich',
      postalCode: '8001',
      canton: 'ZH',
      country: 'Switzerland'
    },
    emergencyContact: {
      name: 'Maria Müller',
      relationship: 'Sister',
      phone: '+41 79 987 65 43'
    },
    preferences: {
      favoriteStyles: customerProfile.preferences.favoriteStyles,
      preferredLanguages: customerProfile.preferences.preferredLanguages,
      levelExperience: customerProfile.preferences.levelExperience,
      availabilityWindows: customerProfile.preferences.availabilityWindows,
      notifications: {
        ...customerProfile.preferences.notifications,
        marketing: true
      },
      privacy: {
        showProfile: true,
        showActivity: false,
        allowMessaging: true
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        screenReader: false
      }
    },
    healthInfo: {
      injuries: '',
      medications: '',
      allergies: '',
      fitnessLevel: 'Good',
      yogaExperience: '3 years'
    }
  });

  const handleInputChange = (field: string, value: any, category?: string) => {
    setEditableProfile(prev => {
      if (category) {
        return {
          ...prev,
          [category]: {
            ...prev[category as keyof EditableProfile],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleArrayToggle = (array: string[], item: string, category: string, field: string) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    
    handleInputChange(field, newArray, category);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the profile in context
      updateProfile({
        firstName: editableProfile.firstName,
        lastName: editableProfile.lastName,
        email: editableProfile.email,
        phone: editableProfile.phone,
        profileImage: editableProfile.profileImage,
        preferences: {
          favoriteStyles: editableProfile.preferences.favoriteStyles,
          preferredLanguages: editableProfile.preferences.preferredLanguages,
          levelExperience: editableProfile.preferences.levelExperience,
          availabilityWindows: editableProfile.preferences.availabilityWindows,
          notifications: editableProfile.preferences.notifications
        }
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a cloud service
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableProfile(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const yogaStyles = [
    'Hatha', 'Vinyasa', 'Ashtanga', 'Yin', 'Restorative', 'Hot Yoga', 'Power Yoga', 
    'Kundalini', 'Bikram', 'Prenatal', 'Aerial', 'Iyengar'
  ];

  const availabilityOptions = [
    'early-morning', 'morning', 'midday', 'afternoon', 'evening', 'late-evening'
  ];

  const availabilityLabels: Record<string, string> = {
    'early-morning': '6:00 - 8:00',
    'morning': '8:00 - 12:00',
    'midday': '12:00 - 14:00',
    'afternoon': '14:00 - 17:00',
    'evening': '17:00 - 20:00',
    'late-evening': '20:00 - 22:00'
  };

  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => onPageChange('account')}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={editableProfile.profileImage} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {editableProfile.firstName[0]}{editableProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Picture
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={editableProfile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={editableProfile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editableProfile.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editableProfile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {editableProfile.bio.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={editableProfile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editableProfile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+41 79 123 45 67"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={editableProfile.address.street}
                  onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                  placeholder="Musterstrasse 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editableProfile.address.city}
                    onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                    placeholder="Zürich"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={editableProfile.address.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value, 'address')}
                    placeholder="8001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canton">Canton</Label>
                  <Select 
                    value={editableProfile.address.canton} 
                    onValueChange={(value) => handleInputChange('canton', value, 'address')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select canton" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AG">Aargau (AG)</SelectItem>
                      <SelectItem value="AR">Appenzell Ausserrhoden (AR)</SelectItem>
                      <SelectItem value="AI">Appenzell Innerrhoden (AI)</SelectItem>
                      <SelectItem value="BL">Basel-Landschaft (BL)</SelectItem>
                      <SelectItem value="BS">Basel-Stadt (BS)</SelectItem>
                      <SelectItem value="BE">Bern (BE)</SelectItem>
                      <SelectItem value="FR">Freiburg (FR)</SelectItem>
                      <SelectItem value="GE">Genf (GE)</SelectItem>
                      <SelectItem value="GL">Glarus (GL)</SelectItem>
                      <SelectItem value="GR">Graubünden (GR)</SelectItem>
                      <SelectItem value="JU">Jura (JU)</SelectItem>
                      <SelectItem value="LU">Luzern (LU)</SelectItem>
                      <SelectItem value="NE">Neuenburg (NE)</SelectItem>
                      <SelectItem value="NW">Nidwalden (NW)</SelectItem>
                      <SelectItem value="OW">Obwalden (OW)</SelectItem>
                      <SelectItem value="SH">Schaffhausen (SH)</SelectItem>
                      <SelectItem value="SZ">Schwyz (SZ)</SelectItem>
                      <SelectItem value="SO">Solothurn (SO)</SelectItem>
                      <SelectItem value="SG">St. Gallen (SG)</SelectItem>
                      <SelectItem value="TI">Tessin (TI)</SelectItem>
                      <SelectItem value="TG">Thurgau (TG)</SelectItem>
                      <SelectItem value="UR">Uri (UR)</SelectItem>
                      <SelectItem value="VS">Wallis (VS)</SelectItem>
                      <SelectItem value="VD">Waadt (VD)</SelectItem>
                      <SelectItem value="ZG">Zug (ZG)</SelectItem>
                      <SelectItem value="ZH">Zürich (ZH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={editableProfile.emergencyContact.name}
                    onChange={(e) => handleInputChange('name', e.target.value, 'emergencyContact')}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={editableProfile.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value, 'emergencyContact')}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={editableProfile.emergencyContact.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'emergencyContact')}
                  placeholder="+41 79 987 65 43"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Yoga Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Yoga Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Favorite Yoga Styles</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {yogaStyles.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <Checkbox
                        id={`style-${style}`}
                        checked={editableProfile.preferences.favoriteStyles.includes(style)}
                        onCheckedChange={() => 
                          handleArrayToggle(
                            editableProfile.preferences.favoriteStyles,
                            style,
                            'preferences',
                            'favoriteStyles'
                          )
                        }
                      />
                      <Label htmlFor={`style-${style}`} className="text-sm">
                        {style}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select 
                  value={editableProfile.preferences.levelExperience} 
                  onValueChange={(value) => handleInputChange('levelExperience', value, 'preferences')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert/Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Preferred Class Times</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availabilityOptions.map((window) => (
                    <div key={window} className="flex items-center space-x-2">
                      <Checkbox
                        id={`time-${window}`}
                        checked={editableProfile.preferences.availabilityWindows.includes(window)}
                        onCheckedChange={() => 
                          handleArrayToggle(
                            editableProfile.preferences.availabilityWindows,
                            window,
                            'preferences',
                            'availabilityWindows'
                          )
                        }
                      />
                      <Label htmlFor={`time-${window}`} className="text-sm">
                        {availabilityLabels[window]} ({window.replace('-', ' ')})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Preferred Languages for Classes</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang.code}`}
                        checked={editableProfile.preferences.preferredLanguages.includes(lang.code)}
                        onCheckedChange={() => 
                          handleArrayToggle(
                            editableProfile.preferences.preferredLanguages,
                            lang.code,
                            'preferences',
                            'preferredLanguages'
                          )
                        }
                      />
                      <Label htmlFor={`lang-${lang.code}`} className="text-sm">
                        {lang.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Class reminders, cancellations, and updates
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.notifications.email}
                  onCheckedChange={(checked) => 
                    handleInputChange('notifications', {
                      ...editableProfile.preferences.notifications,
                      email: checked
                    }, 'preferences')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Last-minute changes and urgent updates
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.notifications.sms}
                  onCheckedChange={(checked) => 
                    handleInputChange('notifications', {
                      ...editableProfile.preferences.notifications,
                      sms: checked
                    }, 'preferences')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Mobile app notifications
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.notifications.push}
                  onCheckedChange={(checked) => 
                    handleInputChange('notifications', {
                      ...editableProfile.preferences.notifications,
                      push: checked
                    }, 'preferences')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Promotions, new classes, and special offers
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.notifications.marketing}
                  onCheckedChange={(checked) => 
                    handleInputChange('notifications', {
                      ...editableProfile.preferences.notifications,
                      marketing: checked
                    }, 'preferences')
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health & Wellness Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                This information helps instructors provide safe and personalized guidance. 
                All health information is kept strictly confidential.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel">Overall Fitness Level</Label>
                  <Select 
                    value={editableProfile.healthInfo.fitnessLevel} 
                    onValueChange={(value) => handleInputChange('fitnessLevel', value, 'healthInfo')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low - Just starting fitness journey</SelectItem>
                      <SelectItem value="Moderate">Moderate - Regular light exercise</SelectItem>
                      <SelectItem value="Good">Good - Regular moderate exercise</SelectItem>
                      <SelectItem value="Excellent">Excellent - Very active lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yogaExperience">Yoga Experience</Label>
                  <Select 
                    value={editableProfile.healthInfo.yogaExperience} 
                    onValueChange={(value) => handleInputChange('yogaExperience', value, 'healthInfo')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">No previous experience</SelectItem>
                      <SelectItem value="< 6 months">Less than 6 months</SelectItem>
                      <SelectItem value="6-12 months">6-12 months</SelectItem>
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="3-5 years">3-5 years</SelectItem>
                      <SelectItem value="5+ years">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="injuries">Current Injuries or Physical Limitations</Label>
                <Textarea
                  id="injuries"
                  value={editableProfile.healthInfo.injuries}
                  onChange={(e) => handleInputChange('injuries', e.target.value, 'healthInfo')}
                  placeholder="Please describe any current injuries, chronic conditions, or physical limitations that instructors should be aware of..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea
                  id="medications"
                  value={editableProfile.healthInfo.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value, 'healthInfo')}
                  placeholder="List any medications that might affect your yoga practice (optional)..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={editableProfile.healthInfo.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value, 'healthInfo')}
                  placeholder="Any allergies (to props, scents, materials, etc.)..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Profile to Other Members</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other YogaSwiss members to view your profile
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.privacy.showProfile}
                  onCheckedChange={(checked) => 
                    handleInputChange('privacy', {
                      ...editableProfile.preferences.privacy,
                      showProfile: checked
                    }, 'preferences')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Activity Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you were last active
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.privacy.showActivity}
                  onCheckedChange={(checked) => 
                    handleInputChange('privacy', {
                      ...editableProfile.preferences.privacy,
                      showActivity: checked
                    }, 'preferences')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Direct Messaging</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other members and instructors to send you messages
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.privacy.allowMessaging}
                  onCheckedChange={(checked) => 
                    handleInputChange('privacy', {
                      ...editableProfile.preferences.privacy,
                      allowMessaging: checked
                    }, 'preferences')
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select 
                  value={editableProfile.preferences.accessibility.fontSize} 
                  onValueChange={(value) => handleInputChange('accessibility', {
                    ...editableProfile.preferences.accessibility,
                    fontSize: value
                  }, 'preferences')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Improve readability with higher contrast colors
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.accessibility.highContrast}
                  onCheckedChange={(checked) => 
                    handleInputChange('accessibility', {
                      ...editableProfile.preferences.accessibility,
                      highContrast: checked
                    }, 'preferences')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Screen Reader Compatible</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize interface for screen readers
                  </p>
                </div>
                <Switch
                  checked={editableProfile.preferences.accessibility.screenReader}
                  onCheckedChange={(checked) => 
                    handleInputChange('accessibility', {
                      ...editableProfile.preferences.accessibility,
                      screenReader: checked
                    }, 'preferences')
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>

              <Button variant="outline">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </Button>
                
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Shield className="h-4 w-4 mr-2" />
                  Request Account Deletion
                </Button>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Account Deletion:</strong> If you need to delete your account, 
                    please contact our support team. We'll ensure all your data is removed 
                    according to Swiss data protection laws (GDPR).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}