import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, Building, User, Users } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { EmailConfirmationHandler } from './EmailConfirmationHandler';

interface SignUpFormProps {
  mode?: 'customer' | 'studio';
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ mode = 'customer', onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth();
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [activeTab, setActiveTab] = useState<'studio' | 'instructor' | 'customer'>(
    mode === 'studio' ? 'studio' : 'customer'
  );
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Studio owner fields
    studioName: '',
    studioSlug: '',
    ownerName: '',
    // Instructor fields
    instructorName: '',
    inviteCode: '',
    // Customer fields
    firstName: '',
    lastName: '',
    // Common
    locale: 'de' as 'de' | 'fr' | 'it' | 'en',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.email) errors.push('Email is required');
    if (!formData.email.includes('@')) errors.push('Valid email is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 8) errors.push('Password must be at least 8 characters');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    if (!formData.agreeToTerms) errors.push('You must agree to the terms');

    if (activeTab === 'studio') {
      if (!formData.studioName) errors.push('Studio name is required');
      if (!formData.ownerName) errors.push('Owner name is required');
      if (!formData.studioSlug) errors.push('Studio slug is required');
      if (formData.studioSlug.includes(' ')) errors.push('Studio slug cannot contain spaces');
    }

    if (activeTab === 'instructor') {
      if (!formData.instructorName) errors.push('Instructor name is required');
      if (!formData.inviteCode) errors.push('Invitation code is required');
    }

    if (activeTab === 'customer') {
      if (!formData.firstName) errors.push('First name is required');
      if (!formData.lastName) errors.push('Last name is required');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const metadata = {
        role: activeTab === 'studio' ? 'owner' : activeTab,
        locale: formData.locale,
        ...(activeTab === 'studio' && {
          orgName: formData.studioName,
          orgSlug: formData.studioSlug,
          ownerName: formData.ownerName
        }),
        ...(activeTab === 'instructor' && {
          instructorName: formData.instructorName,
          inviteCode: formData.inviteCode
        }),
        ...(activeTab === 'customer' && {
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      };

      const result = await signUp(formData.email, formData.password, metadata);
      if (result.error) {
        setError(result.error);
        setSuccess('');
        setNeedsEmailConfirmation(false);
      } else if (result.success) {
        setError('');
        if (result.needsConfirmation) {
          // Show email confirmation handler instead of just a message
          setPendingConfirmationEmail(formData.email);
          setShowEmailConfirmation(true);
          setNeedsEmailConfirmation(true);
        } else {
          setSuccess(result.message || 'Account created and logged in successfully!');
          setNeedsEmailConfirmation(false);
          
          // If user is immediately authenticated, they should see the dashboard
          // The AppLayout will handle the transition automatically
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleStudioNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      studioName: name,
      studioSlug: prev.studioSlug || generateSlug(name)
    }));
  };

  // Show email confirmation handler if needed
  if (showEmailConfirmation && pendingConfirmationEmail) {
    return (
      <EmailConfirmationHandler
        email={pendingConfirmationEmail}
        onBack={() => {
          setShowEmailConfirmation(false);
          setPendingConfirmationEmail('');
          setSuccess('');
          setError('');
        }}
        onConfirmed={() => {
          setShowEmailConfirmation(false);
          setPendingConfirmationEmail('');
          setSuccess('Account confirmed! You can now sign in.');
          setError('');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Development Mode Indicator */}
      {isDevelopment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-700">
            🔧 <strong>Development Mode:</strong> Email confirmation is bypassed for faster testing
          </p>
        </div>
      )}
      
      {/* Account Type Selection */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="studio" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Studio Owner
          </TabsTrigger>
          <TabsTrigger value="instructor" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Instructor
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Success Display */}
          {success && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {success}
                {needsEmailConfirmation && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      type="button" 
                      className="text-primary hover:underline"
                      onClick={() => {
                        // Could add resend functionality here
                      }}
                    >
                      try again
                    </button>.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {(error || validationErrors.length > 0) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error && <div>{error}</div>}
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside mt-2">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Studio Owner Fields */}
          <TabsContent value="studio" className="space-y-4 mt-0">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Create Your Studio</h4>
              </div>
              <p className="text-sm text-blue-700">
                You'll get full access to manage your studio, team, and customers with a 14-day free trial.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studioName">Studio Name *</Label>
                <Input
                  id="studioName"
                  placeholder="e.g. YogaZen Zürich"
                  value={formData.studioName}
                  onChange={(e) => handleStudioNameChange(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Your Name *</Label>
                <Input
                  id="ownerName"
                  placeholder="Your full name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studioSlug">Studio URL *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  yogaswiss.ch/
                </span>
                <Input
                  id="studioSlug"
                  placeholder="your-studio"
                  value={formData.studioSlug}
                  onChange={(e) => setFormData({ ...formData, studioSlug: generateSlug(e.target.value) })}
                  className="rounded-l-none"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your studio's public URL. Only letters, numbers, and hyphens allowed.
              </p>
            </div>
          </TabsContent>

          {/* Instructor Fields */}
          <TabsContent value="instructor" className="space-y-4 mt-0">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">Join as Instructor</h4>
              </div>
              <p className="text-sm text-green-700">
                You'll need an invitation code from a studio to join as an instructor.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructorName">Your Name *</Label>
              <Input
                id="instructorName"
                placeholder="Your full name"
                value={formData.instructorName}
                onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invitation Code *</Label>
              <Input
                id="inviteCode"
                placeholder="Enter invitation code from studio"
                value={formData.inviteCode}
                onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Don't have a code? Contact the studio that invited you.
              </p>
            </div>
          </TabsContent>

          {/* Customer Fields */}
          <TabsContent value="customer" className="space-y-4 mt-0">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-purple-900">Book Classes</h4>
              </div>
              <p className="text-sm text-purple-700">
                Create an account to book classes, manage memberships, and track your yoga journey.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </TabsContent>

          {/* Common Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Preferred Language</Label>
              <Select value={formData.locale} onValueChange={(value) => setFormData({ ...formData, locale: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 rounded border-gray-300"
                required
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-tight">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>,{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>, and{' '}
                <a href="#" className="text-primary hover:underline">Data Processing Agreement</a>
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create {activeTab === 'studio' ? 'Studio' : activeTab === 'instructor' ? 'Instructor' : 'Customer'} Account
              </>
            )}
          </Button>
        </form>
      </Tabs>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-primary hover:underline font-medium"
          disabled={loading}
        >
          Sign in here
        </button>
      </div>

      {/* Trial Info */}
      {activeTab === 'studio' && (
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>✨ 14-day free trial • No credit card required</p>
          <p>🇨🇭 TWINT & QR-bill ready • GDPR compliant</p>
        </div>
      )}
    </div>
  );
}