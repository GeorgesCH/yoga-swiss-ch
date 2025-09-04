import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { Checkbox } from '../../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Smartphone,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

import { usePortal } from '../PortalProvider';

export function CustomerLoginPage({ 
  onPageChange, 
  initialTab = 'signin' 
}: { 
  onPageChange: (page: string) => void;
  initialTab?: string;
}) {
  const { login } = usePortal();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  
  // Form states
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });
  
  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    acceptTerms: false,
    marketingEmails: true
  });
  
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ''
  });
  
  const [magicLinkForm, setMagicLinkForm] = useState({
    email: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!signInForm.email) newErrors.email = 'Email is required';
    if (!signInForm.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // Mock successful login - create mock user profile
      const mockProfile = {
        id: 'customer-123',
        firstName: 'Emma',
        lastName: 'Müller',
        email: signInForm.email || 'emma.mueller@example.com',
        phone: '+41 79 123 45 67',
        profileImage: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1Njc3MTAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        preferences: {
          favoriteStyles: ['Hatha', 'Vinyasa', 'Yin'],
          preferredLanguages: ['de', 'en'],
          availabilityWindows: ['morning', 'evening'],
          levelExperience: 'intermediate',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        },
        membershipStatus: 'Premium',
        creditsBalance: 12,
        upcomingBookings: 3
      };
      login(mockProfile);
      onPageChange('account');
    }, 2000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!signUpForm.firstName) newErrors.firstName = 'First name is required';
    if (!signUpForm.lastName) newErrors.lastName = 'Last name is required';
    if (!signUpForm.email) newErrors.email = 'Email is required';
    if (signUpForm.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!signUpForm.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      // Mock successful signup - create mock user profile
      const mockProfile = {
        id: 'customer-' + Date.now(),
        firstName: signUpForm.firstName,
        lastName: signUpForm.lastName,
        email: signUpForm.email,
        phone: signUpForm.phone,
        profileImage: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1Njc3MTAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        preferences: {
          favoriteStyles: [],
          preferredLanguages: ['en'],
          availabilityWindows: [],
          levelExperience: 'beginner',
          notifications: {
            email: signUpForm.marketingEmails,
            sms: false,
            push: false
          }
        },
        membershipStatus: 'Free',
        creditsBalance: 0,
        upcomingBookings: 0
      };
      login(mockProfile);
      onPageChange('onboarding');
    }, 2000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!forgotPasswordForm.email) {
      setErrors({ email: 'Email is required' });
      setIsLoading(false);
      return;
    }

    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false);
      // Show success message
      alert('Password reset link sent to your email!');
    }, 1500);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!magicLinkForm.email) {
      setErrors({ email: 'Email is required' });
      setIsLoading(false);
      return;
    }

    // Simulate sending magic link
    setTimeout(() => {
      setIsLoading(false);
      alert('Magic link sent to your email! Check your inbox.');
    }, 1500);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => onPageChange('home')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              Y
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold">YogaSwiss</span>
              <span className="text-sm text-muted-foreground -mt-1">Switzerland #1 Yoga Platform</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Welcome to Your Practice</h1>
          <p className="text-muted-foreground">
            Book classes and discover studios across Switzerland
          </p>
        </div>

        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="text-center">Sign In to Your Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm">Remember me</Label>
                    </div>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="px-0 text-sm"
                      onClick={() => setActiveTab('forgot')}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab('magic')}
                    className="text-sm"
                  >
                    Or try passwordless sign-in
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-center">Create Your Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={signUpForm.firstName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={signUpForm.lastName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+41 XX XXX XX XX"
                        value={signUpForm.phone}
                        onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      At least 8 characters
                    </p>
                  </div>



                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTerms"
                        checked={signUpForm.acceptTerms}
                        onCheckedChange={(checked) => setSignUpForm({ ...signUpForm, acceptTerms: checked as boolean })}
                        className={errors.acceptTerms ? 'border-red-500' : ''}
                      />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor="acceptTerms" className="text-sm">
                          I agree to the{' '}
                          <Button variant="link" className="h-auto p-0 text-sm">
                            Terms of Service
                          </Button>{' '}
                          and{' '}
                          <Button variant="link" className="h-auto p-0 text-sm">
                            Privacy Policy
                          </Button>
                        </Label>
                        {errors.acceptTerms && (
                          <p className="text-xs text-red-600">{errors.acceptTerms}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketingEmails"
                        checked={signUpForm.marketingEmails}
                        onCheckedChange={(checked) => setSignUpForm({ ...signUpForm, marketingEmails: checked as boolean })}
                      />
                      <Label htmlFor="marketingEmails" className="text-sm">
                        Send me yoga tips and special offers
                      </Label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>

          {/* Additional quick tabs for special auth methods */}
          {activeTab === 'forgot' && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Reset Your Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password
                  </p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={forgotPasswordForm.email}
                        onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab('signin')}
                    className="text-sm"
                  >
                    Back to sign in
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          {activeTab === 'magic' && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Magic Link Sign In</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a magic link to sign in without a password
                  </p>
                </div>
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="your@email.com"
                        value={magicLinkForm.email}
                        onChange={(e) => setMagicLinkForm({ ...magicLinkForm, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Magic Link'}
                  </Button>
                </form>
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab('signin')}
                    className="text-sm"
                  >
                    Back to sign in
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>


      </div>
    </div>
  );
}