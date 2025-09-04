import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';

interface MagicLinkFormProps {
  onBack: () => void;
}

export function MagicLinkForm({ onBack }: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock magic link send
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Magic link sent! ✨</h3>
          <p className="text-muted-foreground mb-4">
            We've sent a secure sign-in link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in instantly. No password needed!
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-900">What's a magic link?</span>
          </div>
          <p className="text-sm text-purple-700">
            Magic links are secure, one-time sign-in links that eliminate the need for passwords. 
            They're more secure and convenient than traditional login methods.
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
          <p>Link expires in 10 minutes for security</p>
          <p>Need help? Contact{' '}
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
        <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Sign in with Magic Link</h3>
        <p className="text-muted-foreground">
          Enter your email and we'll send you a secure link to sign in instantly. No password required!
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
          <p className="text-xs text-muted-foreground">
            Use the same email address associated with your YogaSwiss account
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !email}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending magic link...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Send Magic Link
            </>
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

      {/* Benefits of Magic Links */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Why magic links?</h4>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-muted-foreground">More secure than passwords</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-muted-foreground">No password to remember or type</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <span className="text-muted-foreground">Works on any device</span>
          </div>
        </div>
      </div>
    </div>
  );
}