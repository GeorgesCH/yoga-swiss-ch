import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface DevEmailConfirmationHelperProps {
  onClose: () => void;
}

export function DevEmailConfirmationHelper({ onClose }: DevEmailConfirmationHelperProps) {
  const [email, setEmail] = useState('emmastudio@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConfirmEmail = async () => {
    if (!email) {
      setResult({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log(`[DevHelper] Attempting to create/confirm dev account: ${email}`);
      
      // First, try to create the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: 'password123', // Default password for development
        options: {
          data: {
            firstName: email.split('@')[0],
            lastName: 'DevUser',
            role: 'owner',
            language: 'en',
            orgName: `${email.split('@')[0]} Studio`,
            orgSlug: `${email.split('@')[0].toLowerCase()}-studio`
          },
          emailRedirectTo: `${window.location.origin}`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log(`[DevHelper] User exists, checking confirmation status`);
          
          // Try to sign in to check if confirmed
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: 'password123'
          });

          if (signInError) {
            if (signInError.message.includes('not confirmed')) {
              // Try to resend confirmation
              const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
              });

              if (resendError && resendError.message.includes('already confirmed')) {
                setResult({ 
                  type: 'success', 
                  message: 'Email is already confirmed! Try signing in with password: password123' 
                });
              } else if (resendError) {
                setResult({ 
                  type: 'error', 
                  message: `Resend failed: ${resendError.message}` 
                });
              } else {
                setResult({ 
                  type: 'success', 
                  message: 'Confirmation email sent! Check your email inbox.' 
                });
              }
            } else {
              setResult({ 
                type: 'error', 
                message: `Sign in test failed: ${signInError.message}` 
              });
            }
          } else {
            setResult({ 
              type: 'success', 
              message: 'Account exists and is confirmed! You can sign in with password: password123' 
            });
          }
        } else {
          setResult({ 
            type: 'error', 
            message: `Account creation failed: ${signUpError.message}` 
          });
        }
      } else {
        if (signUpData.session) {
          setResult({ 
            type: 'success', 
            message: 'Account created and automatically signed in! Password: password123' 
          });
        } else {
          setResult({ 
            type: 'success', 
            message: 'Account created! Check your email for confirmation link. Password: password123' 
          });
        }
      }
    } catch (error) {
      console.error('[DevHelper] Error:', error);
      setResult({ 
        type: 'error', 
        message: `Unexpected error: ${error}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserInfo = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult({ 
          type: 'error', 
          message: `Session error: ${error.message}` 
        });
      } else if (session?.user) {
        console.log('[DevHelper] Current user session:', {
          id: session.user.id,
          email: session.user.email,
          confirmed_at: session.user.email_confirmed_at,
          metadata: session.user.user_metadata
        });
        
        setResult({ 
          type: 'success', 
          message: `Current user: ${session.user.email} (Confirmed: ${session.user.email_confirmed_at ? 'YES' : 'NO'})` 
        });
      } else {
        setResult({ 
          type: 'error', 
          message: 'No active session found' 
        });
      }
    } catch (error) {
      console.error('[DevHelper] Error:', error);
      setResult({ 
        type: 'error', 
        message: `Unexpected error: ${error}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Development Email Helper</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
          <CardDescription>
            Create/confirm test accounts for development
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Development Only:</strong> This helper is for testing email confirmation flows. 
              It will create test accounts or resend confirmation emails.
            </AlertDescription>
          </Alert>

          {result && (
            <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
              {result.type === 'success' ? 
                <CheckCircle className="h-4 w-4" /> : 
                <AlertTriangle className="h-4 w-4" />
              }
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="dev-email">Email Address</Label>
            <Input
              id="dev-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={handleConfirmEmail} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Create/Confirm Test Account'
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={handleGetUserInfo} 
              disabled={loading}
              className="w-full"
            >
              Check Current Session Info
            </Button>

            <Button 
              variant="secondary"
              onClick={() => {
                setEmail('studio@yogaswiss.ch');
                setTimeout(() => handleConfirmEmail(), 100);
              }}
              disabled={loading}
              className="w-full"
            >
              Quick Demo Account Setup
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-medium mb-1">What this does:</p>
            <ul className="space-y-1">
              <li>• Creates a test account if it doesn't exist</li>
              <li>• Sends a confirmation email</li>
              <li>• Shows current session status</li>
              <li>• Uses default password: "password123"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}