import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Mail, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface EmailConfirmationHandlerProps {
  email: string;
  onBack: () => void;
  onConfirmed: () => void;
}

export function EmailConfirmationHandler({ email, onBack, onConfirmed }: EmailConfirmationHandlerProps) {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number>(0);

  // Check for confirmation in URL hash on mount
  React.useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if there's a confirmation hash in the URL
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('confirmation')) {
        console.log('[EmailConfirmation] Found confirmation parameters in URL, processing...');
        setLoading(true);
        
        try {
          // Let Supabase handle the confirmation automatically
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('[EmailConfirmation] Confirmation failed:', error.message);
            setError(`Confirmation failed: ${error.message}`);
          } else if (data.session?.user) {
            console.log('[EmailConfirmation] Email confirmed successfully via URL');
            toast.success('Email confirmed successfully!');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            onConfirmed();
            return;
          }
        } catch (err) {
          console.error('[EmailConfirmation] URL confirmation error:', err);
          setError('Failed to process email confirmation.');
        } finally {
          setLoading(false);
        }
      }
    };

    handleEmailConfirmation();
  }, [onConfirmed]);

  const handleResendConfirmation = async () => {
    // Rate limiting: only allow resend every 60 seconds
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const minDelay = 60000; // 60 seconds

    if (timeSinceLastResend < minDelay && resendCount > 0) {
      const waitTime = Math.ceil((minDelay - timeSinceLastResend) / 1000);
      setError(`Please wait ${waitTime} seconds before requesting another confirmation email.`);
      return;
    }

    setError('');
    setResendLoading(true);

    try {
      console.log(`[EmailConfirmation] Resending confirmation email to ${email}`);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('[EmailConfirmation] Resend failed:', error.message);
        if (error.message.includes('already confirmed')) {
          toast.success('Your email is already confirmed! Please try signing in again.');
          onConfirmed();
          return;
        }
        setError(error.message);
      } else {
        setResendCount(prev => prev + 1);
        setLastResendTime(now);
        toast.success(`Confirmation email sent to ${email}`);
        console.log(`[EmailConfirmation] Confirmation email sent successfully to ${email}`);
      }
    } catch (err) {
      console.error('[EmailConfirmation] Resend error:', err);
      setError('Failed to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckConfirmation = async () => {
    setError('');
    setLoading(true);

    try {
      console.log(`[EmailConfirmation] Checking confirmation status for ${email}`);

      // Try to refresh the session to see if email has been confirmed
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[EmailConfirmation] Session refresh failed:', error.message);
        
        // If still not confirmed, show appropriate message
        if (error.message.includes('not confirmed')) {
          setError('Email not confirmed yet. Please check your email and click the confirmation link.');
        } else {
          setError(error.message);
        }
      } else if (data?.session?.user) {
        console.log('[EmailConfirmation] Email confirmed successfully');
        toast.success('Email confirmed successfully! You can now sign in.');
        onConfirmed();
      } else {
        setError('Please check your email and click the confirmation link.');
      }
    } catch (err) {
      console.error('[EmailConfirmation] Confirmation check error:', err);
      setError('Failed to check confirmation status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canResend = () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    return resendCount === 0 || timeSinceLastResend >= 60000;
  };

  const getRemainingTime = () => {
    if (canResend()) return 0;
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    return Math.ceil((60000 - timeSinceLastResend) / 1000);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the confirmation link in your email to activate your account, then come back here.
              </p>
              
              {resendCount > 0 && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <CheckCircle className="h-3 w-3 inline mr-1 text-green-500" />
                  Confirmation email sent {resendCount} time{resendCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Check if confirmed button */}
            <Button 
              onClick={handleCheckConfirmation} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  I've Confirmed My Email
                </>
              )}
            </Button>

            {/* Resend button */}
            <Button
              variant="outline"
              onClick={handleResendConfirmation}
              disabled={resendLoading || !canResend()}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {canResend() 
                    ? `Resend Confirmation Email${resendCount > 0 ? ` (${resendCount + 1})` : ''}` 
                    : `Resend in ${getRemainingTime()}s`
                  }
                </>
              )}
            </Button>

            {/* Back button */}
            <Button variant="ghost" onClick={onBack} className="w-full">
              Back to Sign In
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Troubleshooting:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• The confirmation link expires after 24 hours</li>
              <li>• Make sure to click the link in the same browser</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}