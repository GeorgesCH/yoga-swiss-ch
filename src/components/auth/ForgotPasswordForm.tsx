import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Check your email</h3>
          <p className="text-muted-foreground mb-4">
            We've sent a password reset link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            If you don't see it, check your spam folder or try again with a different email.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={onBack} className="w-full">
            Back to Sign In
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setSuccess(false)}
            className="w-full"
          >
            Try Different Email
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Still having trouble? Contact{' '}
            <a href="mailto:support@yogaswiss.ch" className="text-primary hover:underline">
              support@yogaswiss.ch
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Reset your password</h3>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@studio.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !email}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">or</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="w-full"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>
      </div>

      {/* Help section */}
      <div className="bg-muted/30 rounded-lg p-4 text-sm">
        <h4 className="font-medium mb-2">Having trouble?</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Make sure you're using the email address associated with your account</li>
          <li>• Check your spam or junk folder for the reset email</li>
          <li>• Reset links expire after 1 hour for security</li>
          <li>• Contact support if you need help: 
            <a href="mailto:support@yogaswiss.ch" className="text-primary hover:underline ml-1">
              support@yogaswiss.ch
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}