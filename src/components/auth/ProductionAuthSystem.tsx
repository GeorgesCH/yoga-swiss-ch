import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Eye, EyeOff, Mail, Lock, Smartphone, ArrowLeft, 
  AlertCircle, Loader2, Shield, CheckCircle, User
} from 'lucide-react';
import { useAuth } from './ProductionAuthProvider';
import { supabase } from '../../utils/supabase/client';

interface ProductionAuthSystemProps {
  mode?: 'customer' | 'studio';
  onSuccess?: () => void;
  onBack?: () => void;
  initialTab?: 'signin' | 'signup' | 'forgot' | 'magic';
}

export function ProductionAuthSystem({ 
  mode = 'customer', 
  onSuccess, 
  onBack,
  initialTab = 'signin'
}: ProductionAuthSystemProps) {
  const { signIn, user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailConfirmationState, setEmailConfirmationState] = useState<{
    isWaitingForConfirmation: boolean;
    email: string;
    resendCooldown: number;
  }>({
    isWaitingForConfirmation: false,
    email: '',
    resendCooldown: 0
  });

  // Form states
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
    rememberMe: false
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

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading && onSuccess) {
      onSuccess();
    }
  }, [user, authLoading, onSuccess]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Countdown timer for resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailConfirmationState.resendCooldown > 0) {
      interval = setInterval(() => {
        setEmailConfirmationState(prev => ({
          ...prev,
          resendCooldown: Math.max(0, prev.resendCooldown - 1)
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailConfirmationState.resendCooldown]);

  const handleResendConfirmation = async () => {
    if (emailConfirmationState.resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailConfirmationState.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError('Failed to resend confirmation email. Please try again.');
      } else {
        setSuccess('Confirmation email sent! Please check your inbox.');
        setEmailConfirmationState(prev => ({
          ...prev,
          resendCooldown: 60 // 60 second cooldown
        }));
      }
    } catch (err) {
      console.error('Resend confirmation error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      // Validation
      if (!validateEmail(signInForm.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!signInForm.password) {
        setError('Password is required');
        return;
      }

      // Attempt sign in
      const result = await signIn(signInForm.email, signInForm.password);
      
      if (result.error) {
        // Handle specific error cases
        if (result.error.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (result.error.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (result.error.includes('Too many requests')) {
          setError('Too many sign-in attempts. Please wait a few minutes before trying again.');
        } else {
          setError('Sign in failed. Please try again or contact support if the problem persists.');
        }
      } else {
        // Success - handled by useEffect above
        console.log('Sign in successful');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      // Validation
      if (!signUpForm.firstName.trim()) {
        setError('First name is required');
        return;
      }

      if (!signUpForm.lastName.trim()) {
        setError('Last name is required');
        return;
      }

      if (!validateEmail(signUpForm.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!validatePassword(signUpForm.password)) {
        setError('Password must be at least 8 characters long');
        return;
      }

      if (!signUpForm.acceptTerms) {
        setError('You must accept the Terms of Service and Privacy Policy');
        return;
      }

      // No studio-specific validation needed - org will be created after signup

      // Prepare user metadata
      const userData = {
        firstName: signUpForm.firstName.trim(),
        lastName: signUpForm.lastName.trim(),
        phone: signUpForm.phone.trim(),
        role: mode === 'studio' ? 'owner' : 'customer',
        marketingEmails: signUpForm.marketingEmails,
        language: 'en'
      };

      // Studio mode will create organization after signup completion

      // Attempt sign up
      const { data, error } = await supabase.auth.signUp({
        email: signUpForm.email,
        password: signUpForm.password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be')) {
          setError('Password does not meet security requirements. Please choose a stronger password.');
        } else {
          setError(`Account creation failed: ${error.message}`);
        }
      } else {
        // Set email confirmation waiting state
        setEmailConfirmationState({
          isWaitingForConfirmation: true,
          email: signUpForm.email,
          resendCooldown: 0
        });
        
        setSuccess(
          `Account created successfully! Please check your email (${signUpForm.email}) and click the confirmation link to complete your registration.`
        );
        
        // Clear form
        setSignUpForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          acceptTerms: false,
          marketingEmails: true
        });
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred during account creation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (!validateEmail(forgotPasswordForm.email)) {
        setError('Please enter a valid email address');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordForm.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );

      if (error) {
        setError('Failed to send password reset email. Please try again.');
      } else {
        setSuccess(
          `Password reset email sent to ${forgotPasswordForm.email}. Please check your inbox and follow the instructions to reset your password.`
        );
        setForgotPasswordForm({ email: '' });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (!validateEmail(magicLinkForm.email)) {
        setError('Please enter a valid email address');
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkForm.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError('Failed to send magic link. Please try again.');
      } else {
        setSuccess(
          `Magic link sent to ${magicLinkForm.email}! Please check your inbox and click the link to sign in.`
        );
        setMagicLinkForm({ email: '' });
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Studio organizations will be created during onboarding process

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <span className="text-xl font-bold">Y</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">YogaSwiss</span>
              <span className="text-sm text-muted-foreground">Switzerland #1 Yoga Platform</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            {mode === 'studio' ? 'Join YogaSwiss as a Studio' : 'Welcome to Your Practice'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'studio' 
              ? 'Connect with students and grow your yoga business across Switzerland'
              : 'Book classes and discover studios across Switzerland'
            }
          </p>
        </div>

        <Card className="shadow-lg">
          {/* Email Confirmation Waiting State */}
          {emailConfirmationState.isWaitingForConfirmation ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    We've sent a confirmation link to{' '}
                    <span className="font-medium">{emailConfirmationState.email}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click the link in the email to activate your account and complete your registration.
                  </p>
                </div>
                
                <div className="flex flex-col space-y-3 w-full max-w-xs">
                  <Button
                    variant="outline"
                    onClick={handleResendConfirmation}
                    disabled={loading || emailConfirmationState.resendCooldown > 0}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : emailConfirmationState.resendCooldown > 0 ? (
                      `Resend in ${emailConfirmationState.resendCooldown}s`
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEmailConfirmationState({
                        isWaitingForConfirmation: false,
                        email: '',
                        resendCooldown: 0
                      });
                      setActiveTab('signin');
                      clearMessages();
                    }}
                    className="text-sm"
                  >
                    Back to Sign In
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 mt-4">
                  <p>• Check your spam/junk folder if you don't see the email</p>
                  <p>• The confirmation link expires in 24 hours</p>
                  <p>• Make sure to click the link from the same device</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Success/Error Messages */}
              {(error || success) && (
                <div className="p-4 pb-0">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); clearMessages(); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">
                    {mode === 'studio' ? 'Register Studio' : 'Sign Up'}
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin">
                  <CardHeader>
                    <CardTitle className="text-center">
                      {mode === 'studio' ? 'Sign In to Your Studio' : 'Sign In to Your Account'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder={mode === 'studio' ? 'studio@example.ch' : 'your@email.com'}
                            value={signInForm.email}
                            onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                            className="pl-10"
                            required
                            disabled={loading}
                          />
                        </div>
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
                            className="pl-10 pr-10"
                            required
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={signInForm.rememberMe}
                            onCheckedChange={(checked) => setSignInForm({ ...signInForm, rememberMe: checked as boolean })}
                            disabled={loading}
                          />
                          <Label htmlFor="remember" className="text-sm">Remember me</Label>
                        </div>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="px-0 text-sm"
                          onClick={() => { setActiveTab('forgot'); clearMessages(); }}
                          disabled={loading}
                        >
                          Forgot password?
                        </Button>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>

                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => { setActiveTab('magic'); clearMessages(); }}
                        disabled={loading}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Sign in with Magic Link
                      </Button>
                    </div>
                  </CardContent>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  <CardHeader>
                    <CardTitle className="text-center">
                      {mode === 'studio' ? 'Register Your Studio' : 'Create Your Account'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input
                            id="firstName"
                            placeholder="First name"
                            value={signUpForm.firstName}
                            onChange={(e) => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                            required
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            value={signUpForm.lastName}
                            onChange={(e) => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Studio-specific info */}
                      {mode === 'studio' && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <p className="text-sm font-medium">Studio Registration</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            After creating your account, you'll be guided through setting up your studio profile and workspace.
                          </p>
                        </div>
                      )}

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder={mode === 'studio' ? 'studio@example.ch' : 'your@email.com'}
                            value={signUpForm.email}
                            onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                            className="pl-10"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Phone */}
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
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={signUpForm.password}
                            onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                            className="pl-10 pr-10"
                            required
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          At least 8 characters
                        </p>
                      </div>

                      {/* Terms and Marketing */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="acceptTerms"
                            checked={signUpForm.acceptTerms}
                            onCheckedChange={(checked) => setSignUpForm({ ...signUpForm, acceptTerms: checked as boolean })}
                            required
                            disabled={loading}
                          />
                          <div className="leading-none">
                            <Label htmlFor="acceptTerms" className="text-sm">
                              I agree to the{' '}
                              <Button variant="link" className="h-auto p-0 text-sm" type="button">
                                Terms of Service
                              </Button>{' '}
                              and{' '}
                              <Button variant="link" className="h-auto p-0 text-sm" type="button">
                                Privacy Policy
                              </Button>
                            </Label>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="marketingEmails"
                            checked={signUpForm.marketingEmails}
                            onCheckedChange={(checked) => setSignUpForm({ ...signUpForm, marketingEmails: checked as boolean })}
                            disabled={loading}
                          />
                          <Label htmlFor="marketingEmails" className="text-sm">
                            {mode === 'studio' 
                              ? 'Send me business tips and platform updates'
                              : 'Send me yoga tips and special offers'
                            }
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
                          mode === 'studio' ? 'Register Studio' : 'Create Account'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>

                {/* Forgot Password Tab */}
                <TabsContent value="forgot">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold">Reset Your Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your email and we'll send you a secure link to reset your password
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
                              onChange={(e) => setForgotPasswordForm({ email: e.target.value })}
                              className="pl-10"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Reset Link'
                          )}
                        </Button>
                      </form>
                      <div className="text-center">
                        <Button 
                          variant="ghost" 
                          onClick={() => { setActiveTab('signin'); clearMessages(); }}
                          disabled={loading}
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>

                {/* Magic Link Tab */}
                <TabsContent value="magic">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold">Sign in with Magic Link</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your email and we'll send you a secure link to sign in
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
                              onChange={(e) => setMagicLinkForm({ email: e.target.value })}
                              className="pl-10"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Magic Link'
                          )}
                        </Button>
                      </form>
                      <div className="text-center">
                        <Button 
                          variant="ghost" 
                          onClick={() => { setActiveTab('signin'); clearMessages(); }}
                          disabled={loading}
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}