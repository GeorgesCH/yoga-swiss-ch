import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, User, Phone } from 'lucide-react';
import { useAuth } from './AuthProvider';


interface SimpleSignUpFormProps {
  onSwitchToSignIn: () => void;
  onSignUpSuccess?: () => void;
}

export function SimpleSignUpForm({ onSwitchToSignIn, onSignUpSuccess }: SimpleSignUpFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.mobile) errors.push('Mobile number is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.email.includes('@')) errors.push('Valid email is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password.length < 8) errors.push('Password must be at least 8 characters');
    if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    if (!formData.agreeToTerms) errors.push('You must agree to the terms');

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
    setLoading(true);

    try {
      const metadata = {
        role: 'customer',
        firstName: formData.firstName,
        mobile: formData.mobile,
        onboardingRequired: true
      };

      const result = await signUp(formData.email, formData.password, metadata);
      if (result.error) {
        setError(result.error);
      } else {
        // Successful signup - trigger onboarding
        onSignUpSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1687783615476-f4c12358ca9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMHBlYWNlZnVsJTIwc3R1ZGlvfGVufDF8fHx8MTc1Njg3MTMyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-white/80 z-10" />
      {/* Header Navigation */}
      <div className="bg-white/90 backdrop-blur-sm border-b relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">Y</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">YogaSwiss</h1>
                <p className="text-xs text-muted-foreground">Yoga Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <span>📍</span>
                Zürich
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <span>🛒</span>
                  Cart
                </span>
                <Badge variant="secondary">CHF 0.00</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onSwitchToSignIn}>
                Log in
              </Button>
              <Button size="sm">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-md w-full space-y-8">
          {/* Welcome Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">Y</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome to YogaSwiss!</h2>
            </div>
            <p className="text-lg text-gray-600">
              Let's personalize your yoga journey in Zürich
            </p>
          </div>

          {/* Progress indicator */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Step 1 of 5</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">20% complete</p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center space-y-2 mb-6">
              <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Tell us about yourself</h3>
              <p className="text-gray-600">
                Basic information to get started with your yoga journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={loading}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+41 79 123 45 67"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative mt-1">
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

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative mt-1">
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

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative mt-1">
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

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
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

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" disabled>
                  <span className="mr-2">←</span>
                  Previous
                </Button>

                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Next
                      <span>→</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Skip Option */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  Skip and explore classes
                </button>
              </div>
            </form>
          </div>

          {/* Already have account */}
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
        </div>
      </div>
    </div>
  );
}