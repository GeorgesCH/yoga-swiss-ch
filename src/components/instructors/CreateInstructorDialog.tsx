import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuth } from '../auth/AuthProvider';
import { peopleService, PeopleService } from '../../utils/supabase/people-service';
import { 
  UserPlus, Mail, Phone, Globe, Award, 
  CheckCircle, AlertCircle, X
} from 'lucide-react';

interface CreateInstructorDialogProps {
  onClose: () => void;
  onComplete?: () => void;
}

export function CreateInstructorDialog({ onClose, onComplete }: CreateInstructorDialogProps) {
  const { session } = useAuth();
  const [step, setStep] = useState<'basic' | 'qualifications' | 'complete'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('en-CH');
  
  // Qualifications
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  const availableSpecialties = [
    'Vinyasa', 'Hatha', 'Ashtanga', 'Yin Yoga', 'Hot Yoga', 'Power Yoga',
    'Restorative', 'Prenatal', 'Meditation', 'Pranayama', 'Kundalini'
  ];

  const availableCertifications = [
    'RYT-200', 'RYT-300', 'RYT-500', 'E-RYT-200', 'E-RYT-500',
    'Yin Yoga Certification', 'Prenatal Yoga', 'Trauma-Informed Yoga',
    'Meditation Teacher Training', 'Breathwork Certification'
  ];

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleCertification = (certification: string) => {
    setCertifications(prev => 
      prev.includes(certification) 
        ? prev.filter(c => c !== certification)
        : [...prev, certification]
    );
  };

  const handleCreateInstructor = async () => {
    if (!firstName || !lastName || !email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize service with access token
      const service = session?.access_token 
        ? new PeopleService(session.access_token)
        : peopleService;

      const { instructor, error: createError } = await service.createInstructor({
        email,
        firstName,
        lastName,
        phone,
        language,
        specialties
      });

      if (createError) {
        setError(createError);
        return;
      }

      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instructor');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input
                id="last-name"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="instructor@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="+41 79 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de-CH">German (Switzerland)</SelectItem>
                <SelectItem value="fr-CH">French (Switzerland)</SelectItem>
                <SelectItem value="it-CH">Italian (Switzerland)</SelectItem>
                <SelectItem value="en-CH">English (Switzerland)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={() => setStep('qualifications')}
          disabled={!firstName || !lastName || !email}
        >
          Next: Qualifications
        </Button>
      </div>
    </div>
  );

  const renderQualifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Qualifications & Experience</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Brief description about the instructor..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                <SelectItem value="1-2">1-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="more-than-10">More than 10 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Yoga Specialties</Label>
            <div className="grid grid-cols-3 gap-2">
              {availableSpecialties.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={specialties.includes(specialty)}
                    onCheckedChange={() => toggleSpecialty(specialty)}
                  />
                  <Label htmlFor={specialty} className="text-sm">
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Certifications</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableCertifications.map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Checkbox
                    id={cert}
                    checked={certifications.includes(cert)}
                    onCheckedChange={() => toggleCertification(cert)}
                  />
                  <Label htmlFor={cert} className="text-sm">
                    {cert}
                  </Label>
                </div>
              ))}
            </div>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {certifications.map((cert) => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep('basic')}>
          Back
        </Button>
        <Button 
          onClick={handleCreateInstructor}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Instructor'}
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Instructor Created Successfully</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800">
              {firstName} {lastName}
            </h3>
            <p className="text-sm text-green-600">{email}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <Alert>
            <Mail className="w-4 h-4" />
            <AlertDescription>
              A welcome email with login credentials has been sent to {email}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => {
          onComplete?.();
          onClose();
        }}>
          View Instructor List
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'basic' && 'Add New Instructor'}
            {step === 'qualifications' && 'Instructor Qualifications'}
            {step === 'complete' && 'Instructor Created'}
          </DialogTitle>
          <DialogDescription>
            {step === 'basic' && 'Enter the basic information for the new instructor'}
            {step === 'qualifications' && 'Add qualifications and teaching experience'}
            {step === 'complete' && 'The instructor has been successfully added to your team'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {step === 'basic' && renderBasicInfo()}
          {step === 'qualifications' && renderQualifications()}
          {step === 'complete' && renderComplete()}
        </div>
      </DialogContent>
    </Dialog>
  );
}