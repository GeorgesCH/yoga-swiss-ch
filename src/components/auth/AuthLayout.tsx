import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, Globe, Users, CheckCircle } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showFeatures?: boolean;
}

export function AuthLayout({ children, title, description, showFeatures = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      {/* Left side - Branding and Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-center p-12 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-lg">
          {/* Logo and Branding */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-forest to-forest-light flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-white">YS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">YogaSwiss</h1>
                <p className="text-muted-foreground">Studio Management Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Swiss-First
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                GDPR Compliant
              </Badge>
            </div>
            
            <p className="text-muted-foreground">
              The comprehensive studio management platform designed specifically for Swiss and EU yoga studios.
            </p>
          </div>

          {showFeatures && (
            <>
              {/* Key Features */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Multi-Tenant Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Org-scoped data isolation with role-based access control and complete audit trails.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Swiss Payments</h3>
                    <p className="text-sm text-muted-foreground">
                      TWINT, QR-bills, and credit cards with Swiss tax compliance and CHF currency.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />  
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Privacy-First</h3>
                    <p className="text-sm text-muted-foreground">
                      Customer data is org-scoped. Instructors see masked PII by default with explicit consent.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">Trusted by Swiss studios</p>
                <div className="flex items-center gap-6 opacity-60">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">Y</span>
              </div>
              <h1 className="text-xl font-bold">YogaSwiss</h1>
            </div>
            <p className="text-muted-foreground">Swiss Studio Management</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
            <p className="mt-2">
              Questions? Contact{' '}
              <a href="mailto:support@yogaswiss.ch" className="text-primary hover:underline">
                support@yogaswiss.ch
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}