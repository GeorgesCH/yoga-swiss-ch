import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Key, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle, 
  CheckCircle, Clock, Shield, Zap, Settings, Globe
} from 'lucide-react';
import { SettingsService } from '../../utils/supabase/settings-service';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes?: string[];
  permissions?: string[];
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
}

interface ApiKeysManagementProps {
  orgId: string;
}

export function ApiKeysManagement({ orgId }: ApiKeysManagementProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeyData, setNewKeyData] = useState<any>(null);

  useEffect(() => {
    loadApiKeys();
  }, [orgId]);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      // Mock API keys data since SettingsService doesn't have getApiKeys method
      setApiKeys([]);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const CreateApiKeyDialog = () => {
    const [formData, setFormData] = useState({
      name: '',
      scopes: [] as string[],
      permissions: [] as string[],
      expiresDays: 365,
      description: ''
    });
    const [creating, setCreating] = useState(false);

    const availableScopes = [
      { id: 'read', name: 'Read Access', description: 'Read data from APIs' },
      { id: 'write', name: 'Write Access', description: 'Create and update data' },
      { id: 'delete', name: 'Delete Access', description: 'Delete data (use with caution)' },
      { id: 'admin', name: 'Admin Access', description: 'Full administrative access' }
    ];

    const availablePermissions = [
      { id: 'classes.read', name: 'Read Classes', group: 'Classes' },
      { id: 'classes.write', name: 'Manage Classes', group: 'Classes' },
      { id: 'customers.read', name: 'Read Customers', group: 'Customers' },
      { id: 'customers.write', name: 'Manage Customers', group: 'Customers' },
      { id: 'bookings.read', name: 'Read Bookings', group: 'Bookings' },
      { id: 'bookings.write', name: 'Manage Bookings', group: 'Bookings' },
      { id: 'payments.read', name: 'Read Payments', group: 'Payments' },
      { id: 'payments.write', name: 'Process Payments', group: 'Payments' },
      { id: 'reports.read', name: 'Access Reports', group: 'Reports' },
      { id: 'webhooks.manage', name: 'Manage Webhooks', group: 'Integrations' }
    ];

    const handleCreate = async () => {
      if (!formData.name.trim()) return;
      
      setCreating(true);
      try {
        // Mock API key generation since SettingsService doesn't have generateApiKey method
        const data = {
          api_key: 'ys_live_' + Math.random().toString(36).substring(2, 32),
          key_id: 'key_' + Math.random().toString(36).substring(2, 8),
          key_prefix: 'ys_live_' + Math.random().toString(36).substring(2, 8)
        };
        
        if (data) {
          setNewKeyData(data);
          await loadApiKeys();
        }
      } catch (error) {
        console.error('Error creating API key:', error);
      } finally {
        setCreating(false);
      }
    };

    const resetForm = () => {
      setFormData({
        name: '',
        scopes: [],
        permissions: [],
        expiresDays: 365,
        description: ''
      });
      setNewKeyData(null);
    };

    return (
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {newKeyData ? 'API Key Created' : 'Create New API Key'}
            </DialogTitle>
            <DialogDescription>
              {newKeyData 
                ? 'Your API key has been generated. Copy it now as it won\'t be shown again.'
                : 'Generate a new API key with specific permissions and access levels.'
              }
            </DialogDescription>
          </DialogHeader>

          {newKeyData ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This is the only time you'll see the full API key. 
                  Store it securely as it cannot be retrieved later.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Your New API Key</Label>
                <div className="flex gap-2">
                  <Input value={newKeyData.api_key} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(newKeyData.api_key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Key ID</div>
                  <div className="font-mono">{newKeyData.key_id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Prefix</div>
                  <div className="font-mono">{newKeyData.key_prefix}...</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => navigator.clipboard.writeText(newKeyData.api_key)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Key
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">API Key Name *</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Mobile App API, Analytics Dashboard"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of what this key will be used for"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Expires After</Label>
                  <Select
                    value={formData.expiresDays.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expiresDays: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Access Scopes</Label>
                  <div className="space-y-3 mt-2">
                    {availableScopes.map(scope => (
                      <div key={scope.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={scope.id}
                          checked={formData.scopes.includes(scope.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                scopes: [...prev.scopes, scope.id] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                scopes: prev.scopes.filter(s => s !== scope.id) 
                              }));
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <Label htmlFor={scope.id} className="text-sm font-medium">
                            {scope.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {scope.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Specific Permissions</Label>
                  <div className="space-y-4 mt-2">
                    {Object.entries(
                      availablePermissions.reduce((groups: any, perm) => {
                        if (!groups[perm.group]) groups[perm.group] = [];
                        groups[perm.group].push(perm);
                        return groups;
                      }, {})
                    ).map(([group, perms]: [string, any]) => (
                      <div key={group} className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          {group}
                        </Label>
                        <div className="space-y-2 ml-4">
                          {perms.map((perm: any) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={perm.id}
                                checked={formData.permissions.includes(perm.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      permissions: [...prev.permissions, perm.id] 
                                    }));
                                  } else {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      permissions: prev.permissions.filter(p => p !== perm.id) 
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={perm.id} className="text-sm">
                                {perm.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!formData.name.trim() || creating}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {creating ? 'Creating...' : 'Generate API Key'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const ApiKeyCard = ({ apiKey }: { apiKey: ApiKey }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const handleRevoke = async () => {
      if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
      
      setRevoking(true);
      try {
        // Mock API key revocation since SettingsService doesn't have revokeApiKey method
        await loadApiKeys();
      } catch (error) {
        console.error('Error revoking API key:', error);
      } finally {
        setRevoking(false);
      }
    };

    const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
    const isExpiringSoon = apiKey.expires_at && 
      new Date(apiKey.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
      <Card className={`${!apiKey.is_active ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{apiKey.name}</h3>
                <Badge
                  variant={apiKey.is_active ? (isExpired ? 'destructive' : 'default') : 'secondary'}
                >
                  {!apiKey.is_active ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                </Badge>
                {isExpiringSoon && !isExpired && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Expiring Soon
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {apiKey.key_prefix}...
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {apiKey.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Created</div>
                <div>{new Date(apiKey.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last Used</div>
                <div>
                  {apiKey.last_used_at 
                    ? new Date(apiKey.last_used_at).toLocaleDateString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>

            {apiKey.expires_at && (
              <div className="text-sm">
                <div className="text-muted-foreground">Expires</div>
                <div className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : ''}>
                  {new Date(apiKey.expires_at).toLocaleDateString()}
                </div>
              </div>
            )}

            {showDetails && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <div className="text-sm font-medium mb-2">Scopes</div>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.scopes?.map(scope => (
                      <Badge key={scope} variant="outline" className="text-xs">
                        {scope}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">No scopes</span>}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Permissions</div>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions?.map(permission => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">No specific permissions</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage API keys for secure access to YogaSwiss APIs
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate API Key
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Keys</div>
                <div className="text-2xl font-bold">{apiKeys.length}</div>
              </div>
              <Key className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active Keys</div>
                <div className="text-2xl font-bold text-green-600">
                  {apiKeys.filter(k => k.is_active).length}
                </div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Expiring Soon</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {apiKeys.filter(k => 
                    k.expires_at && 
                    new Date(k.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
                    new Date(k.expires_at) > new Date()
                  ).length}
                </div>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Last 30 Days</div>
                <div className="text-2xl font-bold">
                  {apiKeys.filter(k => 
                    k.last_used_at && 
                    new Date(k.last_used_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
                  ).length}
                </div>
              </div>
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't created any API keys yet. Generate your first key to start integrating with YogaSwiss APIs.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate First API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map(apiKey => (
            <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
          ))}
        </div>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API Documentation
          </CardTitle>
          <CardDescription>
            Learn how to use YogaSwiss APIs with your generated keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Include your API key in the Authorization header:
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Base URL</h4>
              <p className="text-sm text-muted-foreground mb-3">
                All API requests should be made to:
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                https://api.yogaswiss.ch/v1/
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              View Full Documentation
            </Button>
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              API Reference
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateApiKeyDialog />
    </div>
  );
}