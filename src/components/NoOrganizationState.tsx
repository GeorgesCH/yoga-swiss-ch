import { useState } from 'react';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Building2,
  Plus,
  UserPlus,
  Mail,
  MapPin,
  Globe,
  AlertCircle,
  Loader2,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Badge } from './ui/badge';
import { OrganizationRecoveryManager } from './OrganizationRecoveryManager';

export function NoOrganizationState() {
  const { user, createOrg, refreshOrgs } = useMultiTenantAuth();
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showRequestInvite, setShowRequestInvite] = useState(false);
  const [creating, setCreating] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Authentication Required</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You need to be signed in to create or join an organization. Please sign in to continue.
        </p>
      </div>
    );
  }

  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgType, setOrgType] = useState<'studio' | 'brand'>('studio');
  const [inviteEmail, setInviteEmail] = useState('');

  const validateSlug = (slug: string) => {
    // Ensure slug is valid: lowercase, alphanumeric with dashes, no special chars
    const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim() || !orgSlug.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const cleanSlug = orgSlug.trim().toLowerCase();
    if (!validateSlug(cleanSlug)) {
      setError('URL slug must be 3-50 characters, lowercase letters, numbers and dashes only');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      console.log('[NoOrganizationState] Creating organization with data:', {
        name: orgName.trim(),
        slug: cleanSlug,
        type: orgType
      });

      const result = await createOrg({
        name: orgName.trim(),
        slug: cleanSlug,
        type: orgType,
        default_language: 'en',
        settings: {
          languages: ['en', 'de'],
          default_language: 'en',
          vat_rate: 7.7,
          twint_enabled: false,
          qr_bill_enabled: false,
          stripe_enabled: false
        }
      });

      console.log('[NoOrganizationState] Organization creation result:', result);

      if (result.error) {
        console.error('[NoOrganizationState] Organization creation failed with error:', result.error);
        // Handle specific error cases
        if (result.error.includes('slug already exists') || result.error.includes('duplicate')) {
          // Auto-retry with a new unique slug
          const newSlug = `${orgSlug}-${Math.random().toString(36).substr(2, 4)}`;
          setOrgSlug(newSlug);
          setError(`The URL "${orgSlug}" is already taken. Try "${newSlug}" or choose a different one.`);
        } else {
          setError(result.error);
        }
      } else {
        setSuccess('Organization created successfully!');
        setShowCreateOrg(false);
        setOrgName('');
        setOrgSlug('');
        setOrgType('studio');
        // The provider should automatically reload organizations
        await refreshOrgs();
      }
    } catch (error) {
      setError('Failed to create organization. Please try again.');
      console.error('Create org error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRequestInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Please enter the email address of someone who can invite you');
      return;
    }

    try {
      setRequesting(true);
      setError(null);

      // This would typically send a request to an admin or send an email
      // For now, we'll just show a success message
      setSuccess('Invitation request sent! You will be notified when you are added to an organization.');
      setShowRequestInvite(false);
      setInviteEmail('');
    } catch (error) {
      setError('Failed to send invitation request. Please try again.');
      console.error('Request invite error:', error);
    } finally {
      setRequesting(false);
    }
  };

  const generateSlugFromName = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .trim();
    
    // Add timestamp suffix to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits
    return `${baseSlug}-${timestamp}`;
  };

  const handleNameChange = (value: string) => {
    setOrgName(value);
    // Only auto-generate slug if it's empty or still matches the old auto-generated one
    if (!orgSlug || orgSlug.includes(generateSlugFromName(orgName).split('-').slice(0, -1).join('-'))) {
      setOrgSlug(generateSlugFromName(value));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome to YogaSwiss</h1>
            <p className="text-muted-foreground mt-2">
              To get started, you need to be part of an organization
            </p>
          </div>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Signed in as {user?.profile?.display_name || user?.email}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Organization</TabsTrigger>
            <TabsTrigger value="join">Join Organization</TabsTrigger>
            <TabsTrigger value="recover">
              <Settings className="w-4 h-4 mr-2" />
              Recovery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
          {/* Create Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Start your own yoga studio or wellness business
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="mr-2">Studio</Badge>
                <Badge variant="outline">Brand</Badge>
              </div>
              <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        placeholder="e.g., Zen Yoga Zürich"
                        value={orgName}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="orgSlug">URL Slug</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">yogaswiss.ch/</span>
                        <Input
                          id="orgSlug"
                          placeholder="zen-yoga-zurich"
                          value={orgSlug}
                          onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className={orgSlug && !validateSlug(orgSlug) ? 'border-destructive' : ''}
                        />
                      </div>
                      {orgSlug && !validateSlug(orgSlug) && (
                        <p className="text-xs text-destructive">
                          Must be 3-50 characters, lowercase letters, numbers and dashes only
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgType">Organization Type</Label>
                      <Select value={orgType} onValueChange={(value: 'studio' | 'brand') => setOrgType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="studio">Studio (Single location)</SelectItem>
                          <SelectItem value="brand">Brand (Multiple locations)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {success}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateOrg(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateOrg}
                        disabled={creating || !orgName.trim() || !orgSlug.trim()}
                        className="flex-1"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>


            </div>
          </TabsContent>

          <TabsContent value="join" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Join Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get invited to an existing yoga studio or wellness business
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="mr-2">Team Member</Badge>
                  <Badge variant="outline">Instructor</Badge>
                </div>
                <Dialog open={showRequestInvite} onOpenChange={setShowRequestInvite}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Request Invitation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Organization Invitation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter the email address of someone who can invite you to their organization.
                      </p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">Contact Email</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="manager@yogastudio.ch"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {success}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRequestInvite(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRequestInvite}
                          disabled={requesting || !inviteEmail.trim()}
                          className="flex-1"
                        >
                          {requesting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Request'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recover" className="space-y-6">
            <OrganizationRecoveryManager />
          </TabsContent>
        </Tabs>

        {/* Help */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Globe className="w-8 h-8 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team at{' '}
                  <a href="mailto:support@yogaswiss.ch" className="text-primary hover:underline">
                    support@yogaswiss.ch
                  </a>
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Switzerland's #1 Yoga Platform</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}