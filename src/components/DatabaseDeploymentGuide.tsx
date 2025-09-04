import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, CheckCircle2, XCircle, Clock, AlertTriangle, 
  RefreshCw, Settings, Zap, Server, GitBranch, Package,
  ExternalLink, Loader2, CheckCircle, Copy, Play, Terminal,
  FileText, ChevronRight, ArrowRight, Workflow
} from 'lucide-react';

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string;
  action?: () => void;
  actionLabel?: string;
}

export function DatabaseDeploymentGuide() {
  const [activeTab, setActiveTab] = useState('guide');
  const [activeStep, setActiveStep] = useState(0);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    {
      id: 'verify-connection',
      title: 'Verify Supabase Connection',
      description: 'Ensure your YogaSwiss platform can connect to Supabase',
      status: 'pending'
    },
    {
      id: 'run-migrations',
      title: 'Run Database Migrations',
      description: 'Deploy the normalized YogaSwiss schema to your database',
      status: 'pending'
    },
    {
      id: 'verify-schema',
      title: 'Verify Schema Deployment',
      description: 'Confirm all tables and views are properly created',
      status: 'pending'
    },
    {
      id: 'test-functionality',
      title: 'Test Core Functionality',
      description: 'Verify organization creation and basic operations work',
      status: 'pending'
    }
  ]);

  const [databaseStatus, setDatabaseStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setIsChecking(true);
    try {
      // Check database status using the new endpoint
      const statusResponse = await fetch(`https://okvreiyhuxjosgauqaqq.supabase.co/functions/v1/make-server-f0b2daa4/setup/status`);
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        setDatabaseStatus(status);
        updateStepsBasedOnStatus(status);
      }
    } catch (error) {
      console.error('Failed to check database status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const updateStepsBasedOnStatus = (status: any) => {
    const newSteps = [...deploymentSteps];
    
    // Update step statuses based on database status
    if (status?.success) {
      newSteps[0].status = 'completed';
      
      if (status?.status?.normalized_schema) {
        newSteps[1].status = 'completed';
        newSteps[2].status = 'completed';
      }
      
      if (status?.ready) {
        newSteps[3].status = 'completed';
        setActiveStep(4); // All done
      } else {
        setActiveStep(1); // Need to run migrations
      }
    } else {
      setActiveStep(0); // Start from connection check
    }
    
    setDeploymentSteps(newSteps);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const migrationSQL1 = `-- Step 1: Create the normalized schema
-- Copy and paste this into Supabase SQL Editor

-- Trimmed, normalized schema for a multi-tenant studio platform
-- Focus: template + occurrence as the single source of truth for scheduling
-- Uses gen_random_uuid(); requires pgcrypto

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('owner','admin','manager','instructor','staff','customer');
CREATE TYPE class_status AS ENUM ('scheduled','canceled','completed');
CREATE TYPE payment_status AS ENUM ('pending','authorized','captured','refunded','failed','canceled');
CREATE TYPE payment_method AS ENUM ('card','cash','bank_transfer','wallet','other');
CREATE TYPE campaign_type AS ENUM ('email','sms','push','webhook');
CREATE TYPE campaign_status AS ENUM ('draft','scheduled','sending','completed','canceled');

-- Utility trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;`;

  const migrationSQL2 = `-- Step 2: Create compatibility layer and auth system
-- Copy and paste this into Supabase SQL Editor AFTER Step 1

-- Legacy endpoint compatibility (UI expects orgs / org_users)
CREATE OR REPLACE VIEW public.orgs AS
SELECT
  o.id,
  o.name,
  o.slug,
  o.locale AS primary_locale,
  o.timezone,
  COALESCE(o.settings->>'currency','CHF') AS currency,
  COALESCE(o.settings->>'status','active') AS status,
  o.created_at
FROM public.organizations o;

CREATE OR REPLACE VIEW public.org_users AS
SELECT
  m.id,
  m.organization_id AS org_id,
  m.user_id,
  m.role::text AS role,
  CASE WHEN m.is_active THEN 'active' ELSE 'inactive' END AS status,
  m.is_active,
  m.joined_at
FROM public.organization_members m;`;

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepBadge = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">YogaSwiss Database Deployment</h1>
        <p className="text-muted-foreground">
          Deploy the normalized Swiss studio management schema to your Supabase project
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>🇨🇭 Swiss Quality</span>
          <span>•</span>
          <span>Multi-tenant Architecture</span>
          <span>•</span>
          <span>Production Ready</span>
        </div>
      </div>

      {/* Current Status */}
      {databaseStatus && (
        <Alert className={databaseStatus.ready ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <Database className={`h-4 w-4 ${databaseStatus.ready ? 'text-green-600' : 'text-yellow-600'}`} />
          <AlertDescription className={databaseStatus.ready ? 'text-green-800' : 'text-yellow-800'}>
            <div className="flex items-center justify-between">
              <span>
                {databaseStatus.ready 
                  ? 'Database is fully deployed and ready!' 
                  : 'Database deployment required - follow the steps below'
                }
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkDatabaseStatus}
                disabled={isChecking}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Simple tab implementation */}
      <div className="w-full">
        <div className="flex border-b border-border mb-6">
          <button 
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'guide' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Deployment Guide
          </button>
          <button 
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'sql' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            SQL Scripts
          </button>
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'status' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            System Status
          </button>
        </div>

        {activeTab === 'guide' && (
          <div className="space-y-6">
          {/* Deployment Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                Deployment Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deploymentSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{step.title}</h4>
                      {getStepBadge(step.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    
                    {step.details && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        {step.details}
                      </div>
                    )}
                    
                    {step.action && step.actionLabel && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={step.action}
                        className="mt-2"
                      >
                        {step.actionLabel}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Manual Deployment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Manual Deployment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <h4 className="font-medium">Open Supabase SQL Editor</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to your Supabase project dashboard → SQL Editor
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <h4 className="font-medium">Run Schema Migration</h4>
                    <p className="text-sm text-muted-foreground">
                      Copy and paste the SQL from the "SQL Scripts" tab in order
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <div>
                    <h4 className="font-medium">Verify Deployment</h4>
                    <p className="text-sm text-muted-foreground">
                      Click "Refresh" above to verify the deployment was successful
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Run the SQL scripts in the exact order shown in the SQL Scripts tab. 
                  The compatibility layer depends on the normalized schema being created first.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-6">
          {/* SQL Scripts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Step 1: Normalized Schema
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(migrationSQL1)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy SQL
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {migrationSQL1}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This creates the normalized database schema with all tables, enums, and triggers.
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Step 2: Compatibility & Auth
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(migrationSQL2)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy SQL
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {migrationSQL2}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This creates compatibility views and authentication functions for your existing frontend.
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Deployment Order:</strong> Always run Step 1 completely before running Step 2. 
              The compatibility views depend on the normalized schema tables existing first.
            </AlertDescription>
          </Alert>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
          {/* System Status */}
          {databaseStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Normalized Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Core Tables</span>
                    {databaseStatus.status?.normalized_schema ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Compatibility Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legacy API Support</span>
                    {databaseStatus.status?.compatibility_views ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Auth Functions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">RPC Functions</span>
                    {databaseStatus.status?.auth_functions ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Overall Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Ready</span>
                    {databaseStatus.ready ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Deployment Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={checkDatabaseStatus}
                disabled={isChecking}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Check Database Status
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase Dashboard
              </Button>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}