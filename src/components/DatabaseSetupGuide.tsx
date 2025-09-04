import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Database, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DatabaseSetupGuideProps {
  projectId?: string;
  className?: string;
}

export function DatabaseSetupGuide({ projectId, className = '' }: DatabaseSetupGuideProps) {
  const copySetupSQL = async () => {
    const sqlScript = `-- YogaSwiss Database Setup Script
-- Copy and paste this into your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (multi-tenant support)
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'studio' CHECK (type IN ('brand', 'studio')),
  parent_id UUID REFERENCES orgs(id),
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Switzerland',
  timezone TEXT DEFAULT 'Europe/Zurich',
  default_locale TEXT DEFAULT 'en-CH' CHECK (default_locale IN ('de-CH', 'fr-CH', 'it-CH', 'en-CH')),
  currency TEXT DEFAULT 'CHF',
  vat_rate DECIMAL(5,2) DEFAULT 7.7,
  payment_methods TEXT[] DEFAULT ARRAY['twint', 'credit_card'],
  features TEXT[] DEFAULT ARRAY['booking', 'payments'],
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  emergency_contact JSONB,
  medical_info JSONB,
  dietary_preferences TEXT[],
  preferred_locale TEXT DEFAULT 'en-CH' CHECK (preferred_locale IN ('de-CH', 'fr-CH', 'it-CH', 'en-CH')),
  marketing_consent BOOLEAN DEFAULT false,
  privacy_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization users (roles and permissions)
CREATE TABLE IF NOT EXISTS org_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'instructor', 'manager', 'owner', 'front_desk', 'accountant', 'marketer')),
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Locations table (studios, rooms, outdoor spaces)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'outdoor', 'online')),
  capacity INTEGER NOT NULL DEFAULT 20,
  address TEXT,
  coordinates JSONB,
  weather_dependent BOOLEAN DEFAULT false,
  backup_location_id UUID REFERENCES locations(id),
  equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  accessibility_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  booking_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class templates
CREATE TABLE IF NOT EXISTS class_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'class' CHECK (type IN ('class', 'workshop', 'course', 'private', 'retreat', 'hybrid')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  duration_minutes INTEGER NOT NULL,
  description JSONB DEFAULT '{}',
  image_url TEXT,
  color TEXT,
  default_price DECIMAL(10,2) NOT NULL,
  default_capacity INTEGER NOT NULL DEFAULT 20,
  instructor_pay_rate DECIMAL(10,2) DEFAULT 0,
  instructor_pay_type TEXT DEFAULT 'fixed' CHECK (instructor_pay_type IN ('fixed', 'hourly', 'percentage', 'per_participant')),
  requirements JSONB,
  benefits JSONB,
  equipment_needed TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  audience TEXT,
  revenue_category TEXT,
  default_policies JSONB,
  default_instructors TEXT[],
  default_locations TEXT[],
  virtual_settings JSONB,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  draft_mode BOOLEAN DEFAULT false,
  scheduled_publish TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class occurrences (actual sessions)
CREATE TABLE IF NOT EXISTS class_occurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES class_templates(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES org_users(id),
  location_id UUID REFERENCES locations(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  slug TEXT,
  price DECIMAL(10,2) NOT NULL,
  capacity INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed', 'moved')),
  cancellation_reason TEXT,
  notes TEXT,
  meeting_url TEXT,
  weather_backup_used BOOLEAN DEFAULT false,
  instructor_notes TEXT,
  actual_instructor_id UUID REFERENCES org_users(id),
  actual_location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations (bookings)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurrence_id UUID NOT NULL REFERENCES class_occurrences(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled', 'no_show', 'refunded', 'transferred', 'attended')),
  source_channel TEXT,
  price DECIMAL(10,2) NOT NULL,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  waitlist_position INTEGER,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'free')),
  payment_method TEXT,
  payment_link TEXT,
  refund_link TEXT,
  notes TEXT,
  check_in_time TIMESTAMPTZ,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets for customer credits/balance
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'CHF',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, org_id)
);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_users_updated_at BEFORE UPDATE ON org_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_templates_updated_at BEFORE UPDATE ON class_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_occurrences_updated_at BEFORE UPDATE ON class_occurrences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO orgs (name, slug, type, description, city, country) 
VALUES (
  'YogaSwiss Demo Studio',
  'yogaswiss-demo',
  'studio',
  'A beautiful yoga studio in the heart of Zurich',
  'Zürich',
  'Switzerland'
) ON CONFLICT (slug) DO NOTHING;

-- Insert demo location and class template
DO $$
DECLARE
  demo_org_id UUID;
BEGIN
  SELECT id INTO demo_org_id FROM orgs WHERE slug = 'yogaswiss-demo';
  
  IF demo_org_id IS NOT NULL THEN
    -- Insert demo location
    INSERT INTO locations (org_id, name, type, capacity, address) 
    VALUES (
      demo_org_id,
      'Main Studio',
      'room',
      25,
      'Bahnhofstrasse 45, 8001 Zürich'
    ) ON CONFLICT DO NOTHING;
    
    -- Insert demo class template
    INSERT INTO class_templates (org_id, name, category, level, duration_minutes, default_price, default_capacity, description)
    VALUES (
      demo_org_id,
      'Vinyasa Flow',
      'Vinyasa',
      'all_levels',
      75,
      45.00,
      20,
      '{"en": "Dynamic yoga practice connecting breath with movement"}'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Success message
SELECT 'YogaSwiss database setup completed successfully! 🧘‍♀️' as message;`;

    try {
      await navigator.clipboard.writeText(sqlScript);
      toast.success('SQL setup script copied to clipboard!', {
        description: 'Now paste it into your Supabase SQL Editor'
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const dashboardUrl = projectId 
    ? `https://supabase.com/dashboard/project/${projectId}/sql`
    : 'https://supabase.com/dashboard';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Database Setup Required
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Action Required
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your YogaSwiss database needs to be initialized with the required tables and schema.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Quick Setup (3 steps):</h4>
          
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm">Copy the database setup script</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySetupSQL}
                  className="mt-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy SQL Script
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm">Open your Supabase SQL Editor</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(dashboardUrl, '_blank')}
                  className="mt-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open SQL Editor
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm">Paste the script and click "Run"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will create all tables, triggers, and sample data
                </p>
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>What gets created:</strong> Organizations, user profiles, locations, class templates, 
            booking system, customer wallets, and a demo yoga studio with sample data.
          </AlertDescription>
        </Alert>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            After running the script, refresh this page or click "Health Check" to verify the setup.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}