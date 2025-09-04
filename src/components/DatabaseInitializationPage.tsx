import React from 'react';
import { DatabaseInitializationRunner } from './DatabaseInitializationRunner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { InfoIcon, AlertTriangle, Database, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export function DatabaseInitializationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Database className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">YogaSwiss Database Setup</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Initialize your complete studio management platform with Swiss-specific features and multi-tenant architecture
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              🇨🇭 Swiss Business Ready
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Multi-Tenant Architecture
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Production Ready
            </Badge>
          </div>
        </div>

        {/* Important Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Alert className="border-blue-200 bg-blue-50">
            <InfoIcon className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>First Time Setup:</strong> This process will create all necessary database tables, 
              indexes, security policies, and sample data for your YogaSwiss platform. It's safe to run 
              multiple times.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure your Supabase project is properly configured with 
              the correct environment variables in your .env.local file before proceeding.
            </AlertDescription>
          </Alert>
        </div>

        {/* Prerequisites Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="w-5 h-5" />
              Prerequisites & Requirements
            </CardTitle>
            <CardDescription>
              Ensure your environment is ready before initializing the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Supabase Configuration</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Active Supabase project
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Environment variables configured
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Database connection working
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    RLS and functions enabled
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Swiss Business Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    TWINT payment support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    QR-bill invoice system
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Swiss VAT compliance (7.7%)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Multi-language support (DE/FR/IT)
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Supabase Dashboard
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Setup Documentation
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Environment Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Initialization Component */}
        <DatabaseInitializationRunner />

        {/* What Gets Created */}
        <Card>
          <CardHeader>
            <CardTitle>Database Schema Overview</CardTitle>
            <CardDescription>
              Complete overview of what will be created during initialization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Core Business Tables</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• organizations (multi-tenancy)</li>
                  <li>• profiles (user management)</li>
                  <li>• organization_members (RBAC)</li>
                  <li>• locations & rooms</li>
                  <li>• resources & equipment</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Class Management</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• class_templates</li>
                  <li>• class_instances</li>
                  <li>• recurring_class_rules</li>
                  <li>• class_registrations</li>
                  <li>• waitlists</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Commerce & Payments</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• products & packages</li>
                  <li>• orders & order_items</li>
                  <li>• payments (TWINT, QR-bills)</li>
                  <li>• wallets & transactions</li>
                  <li>• invoices (Swiss compliant)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Staff Management</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• instructors</li>
                  <li>• instructor_availability</li>
                  <li>• earnings & payroll</li>
                  <li>• timesheets</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Advanced Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• retreats & programs</li>
                  <li>• marketing campaigns</li>
                  <li>• customer segments</li>
                  <li>• referral system</li>
                  <li>• community messaging</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary">System & Security</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• brands (white-labeling)</li>
                  <li>• system_alerts</li>
                  <li>• audit_logs</li>
                  <li>• webhook_deliveries</li>
                  <li>• moderation_queue</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-blue-600" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h5 className="font-medium">Row Level Security (RLS)</h5>
                <p className="text-sm text-muted-foreground">
                  Comprehensive RLS policies ensure data isolation between organizations and proper access control based on user roles.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Multi-Tenant Architecture</h5>
                <p className="text-sm text-muted-foreground">
                  Built-in organization-level data separation with role-based permissions for studio owners, managers, instructors, and customers.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Audit Logging</h5>
                <p className="text-sm text-muted-foreground">
                  Complete audit trail for all business operations with user tracking and change history.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="w-5 h-5 text-green-600" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h5 className="font-medium">Strategic Indexing</h5>
                <p className="text-sm text-muted-foreground">
                  Optimized indexes for multi-tenant queries, class scheduling, payment processing, and reporting.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Automated Triggers</h5>
                <p className="text-sm text-muted-foreground">
                  Database triggers for timestamp updates, data consistency, and business rule enforcement.
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">Business Functions</h5>
                <p className="text-sm text-muted-foreground">
                  Stored procedures for complex operations like order processing, wallet management, and reporting.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground">
            YogaSwiss - Switzerland's #1 Yoga Platform • Built for Swiss Business Requirements
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1">
              🇨🇭 Swiss-first design
            </span>
            <span className="flex items-center gap-1">
              🏢 Multi-tenant ready
            </span>
            <span className="flex items-center gap-1">
              🔒 Security compliant
            </span>
            <span className="flex items-center gap-1">
              ⚡ Production optimized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}