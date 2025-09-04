import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../../utils/supabase/client';
import { EmailConfirmationHandler } from './EmailConfirmationHandler';
import { DevEmailConfirmationHelper } from './DevEmailConfirmationHelper';
import { AuthStatusDebugger } from './AuthStatusDebugger';
import { isEmailNotConfirmedError } from '../../utils/auth-bypass';

interface SignInFormProps {
  mode?: 'customer' | 'studio';
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToMagicLink: () => void;
}

export function SignInForm({ mode = 'customer', onSwitchToSignUp, onSwitchToForgotPassword, onSwitchToMagicLink }: SignInFormProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [showDevHelper, setShowDevHelper] = useState(false);
  const [showAuthDebugger, setShowAuthDebugger] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      if (result.error) {
        // Check if it's an email confirmation error
        if (isEmailNotConfirmedError(result.error)) {
          console.log(`[SignInForm] Email not confirmed for ${formData.email}, showing confirmation handler`);
          setPendingConfirmationEmail(formData.email);
          setShowEmailConfirmation(true);
          return;
        }
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'studio@yogaswiss.ch',
      password: 'password123'
    });
    setError('');
    setLoading(true);

    try {
      console.log('[SignInForm] Starting demo login process...');
      
      // First, try to create the demo account if it doesn't exist
      console.log('[SignInForm] Creating demo account if needed...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'studio@yogaswiss.ch',
        password: 'password123',
        options: {
          data: {
            firstName: 'Studio',
            lastName: 'Owner',
            role: 'owner',
            language: 'en',
            orgName: 'YogaZen Demo',
            orgSlug: 'yogazen-demo'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('[SignInForm] Demo account creation failed:', signUpError);
        setError(`Demo account creation failed: ${signUpError.message}`);
        return;
      }

      console.log('[SignInForm] Demo account exists or created, attempting sign in...');
      
      // Now try to sign in
      const result = await signIn('studio@yogaswiss.ch', 'password123');
      if (result.error) {
        console.error('[SignInForm] Demo sign in error:', result.error);
        
        // If it's an email confirmation error, show confirmation handler
        if (isEmailNotConfirmedError(result.error)) {
          console.log(`[SignInForm] Demo account email not confirmed, showing confirmation handler`);
          setPendingConfirmationEmail('studio@yogaswiss.ch');
          setShowEmailConfirmation(true);
          return;
        } else {
          setError(`Demo login failed: ${result.error}`);
        }
      } else {
        console.log('[SignInForm] Demo sign in successful');
      }
    } catch (err) {
      console.error('[SignInForm] Demo login error:', err);
      setError('Demo login failed: Network or server error');
    } finally {
      setLoading(false);
    }
  };

  // Show email confirmation handler if needed
  if (showEmailConfirmation && pendingConfirmationEmail) {
    return (
      <EmailConfirmationHandler
        email={pendingConfirmationEmail}
        onBack={() => {
          setShowEmailConfirmation(false);
          setPendingConfirmationEmail('');
          setError('');
        }}
        onConfirmed={() => {
          setShowEmailConfirmation(false);
          setPendingConfirmationEmail('');
          setError('');
          // Optionally try to sign in automatically or show success message
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Login Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleDemoLogin}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Eye className="h-4 w-4 mr-2" />
        )}
        Quick Demo Login
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={mode === 'studio' ? 'your.email@studio.ch' : 'your.email@example.com'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="rounded border-gray-300"
            />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            Forgot password?
          </button>
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

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSwitchToMagicLink}
          disabled={loading}
        >
          <Mail className="h-4 w-4 mr-2" />
          Sign in with Magic Link
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {mode === 'studio' ? "Don't have a studio account? " : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary hover:underline font-medium"
            disabled={loading}
          >
            {mode === 'studio' ? 'Register your studio' : 'Create one now'}
          </button>
        </div>
      </div>

      {/* Help text */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        {mode === 'studio' ? (
          <>
            <p>Join Switzerland's leading yoga platform</p>
            <p>Manage your studio • Connect with students • Grow your business</p>
          </>
        ) : (
          <>
            <p>New to YogaSwiss? Start with a 14-day free trial</p>
            <p>No credit card required • Cancel anytime</p>
          </>
        )}
      </div>

      {/* Development Helper Buttons - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center space-y-2">
          <div className="flex gap-2 justify-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDevHelper(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              🔧 Email Helper
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAuthDebugger(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              🔍 Auth Status
            </Button>
          </div>
        </div>
      )}

      {/* Development Helper Modals */}
      {showDevHelper && (
        <DevEmailConfirmationHelper 
          onClose={() => setShowDevHelper(false)} 
        />
      )}

      {showAuthDebugger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-1 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-medium">Authentication Debugger</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthDebugger(false)}>×</Button>
            </div>
            <div className="p-4">
              <AuthStatusDebugger />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}