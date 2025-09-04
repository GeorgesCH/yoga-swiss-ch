import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Eye, EyeOff, Copy, Check, Lock, User, Shield, Users, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

// YogaSwiss Admin Login Credentials Component
export function AdminCredentialsDisplay() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const adminAccounts = [
    {
      title: 'Super Admin',
      role: 'owner',
      email: 'super@yogaswiss.ch',
      password: 'YogaSwiss2025!Super',
      name: 'Maria Schneider',
      description: 'Full platform access, can manage all organizations',
      icon: Shield,
      badgeColor: 'bg-red-100 text-red-700 border-red-300'
    },
    {
      title: 'Platform Administrator',
      role: 'studio_manager',
      email: 'admin@yogaswiss.ch',
      password: 'YogaSwiss2025!Admin',
      name: 'Thomas Müller',
      description: 'Studio management, staff oversight, reports',
      icon: Building2,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-300'
    },
    {
      title: 'Yoga Instructor',
      role: 'instructor',
      email: 'instructor@yogaswiss.ch',
      password: 'YogaSwiss2025!Instructor',
      name: 'Sophie Laurent',
      description: 'Class management, student records, scheduling',
      icon: Users,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-300'
    },
    {
      title: 'Front Desk Staff',
      role: 'front_desk',
      email: 'frontdesk@yogaswiss.ch',
      password: 'YogaSwiss2025!FrontDesk',
      name: 'Lisa Weber',
      description: 'Customer service, bookings, check-ins',
      icon: User,
      badgeColor: 'bg-green-100 text-green-700 border-green-300'
    },
    {
      title: 'Finance Manager',
      role: 'accountant',
      email: 'accounting@yogaswiss.ch',
      password: 'YogaSwiss2025!Finance',
      name: 'Robert Zimmermann',
      description: 'Financial reports, invoicing, payments',
      icon: Lock,
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-300'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="luxury-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                YogaSwiss Admin Credentials
                <Badge variant="outline">🇨🇭 Production Ready</Badge>
              </CardTitle>
              <CardDescription>
                Complete login credentials for all YogaSwiss admin roles - Use these to access the dashboard
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? 'Hide' : 'Show'} Passwords
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-amber-200 bg-amber-50 mb-6">
            <Lock className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <strong>Security Notice:</strong> These are development credentials. Change all passwords in production!
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {adminAccounts.map((account, index) => {
              const IconComponent = account.icon;
              return (
                <Card key={index} className="border-l-4 border-primary/20 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{account.title}</h3>
                          <p className="text-xs text-muted-foreground">{account.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={account.badgeColor}>
                        {account.role.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{account.description}</p>

                    <Separator />

                    <div className="space-y-2">
                      {/* Email */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-muted-foreground">Email</label>
                          <p className="text-sm font-mono">{account.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.email, `${account.title}-email`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItem === `${account.title}-email` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {/* Password */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-muted-foreground">Password</label>
                          <p className="text-sm font-mono">
                            {showPasswords ? account.password : '•'.repeat(account.password.length)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.password, `${account.title}-password`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedItem === `${account.title}-password` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator className="my-6" />

          {/* Usage Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Login Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Navigate to the admin dashboard (toggle to Admin mode if needed)</li>
              <li>Use any of the email/password combinations above</li>
              <li>Each account has role-specific permissions and access levels</li>
              <li>Super Admin account has full platform access for testing</li>
            </ol>
          </div>

          {/* Customer Account */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Customer Test Account:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-mono">customer@yogaswiss.ch</p>
              </div>
              <div>
                <span className="text-muted-foreground">Password:</span>
                <p className="font-mono">{showPasswords ? 'YogaSwiss2025!Customer' : '•'.repeat(22)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this for testing the customer portal experience
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}