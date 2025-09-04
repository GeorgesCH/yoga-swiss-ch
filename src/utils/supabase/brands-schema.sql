-- =============================================
-- YogaSwiss Brand Management Schema
-- Comprehensive branding system with multi-tenant support
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE BRAND TABLES
-- =============================================

-- Main brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    locale_default TEXT DEFAULT 'en',
    
    -- Theme tokens (design system)
    theme JSONB NOT NULL DEFAULT '{
        "color": {
            "primary": "#030213",
            "secondary": "#F3B61F", 
            "accent": "#2ECC71",
            "onPrimary": "#FFFFFF",
            "surface": "#FFFFFF",
            "onSurface": "#111111"
        },
        "typography": {
            "brandFont": "Inter:600",
            "bodyFont": "Inter:400"
        },
        "radius": { "sm": 8, "md": 12, "lg": 20 },
        "elevation": { "card": 8 },
        "email": { "headerBg": "#030213" }
    }'::JSONB,
    
    -- Content blocks (copy, descriptions)
    content JSONB NOT NULL DEFAULT '{
        "about": "",
        "short_bio": "",
        "mission": "",
        "social_links": {},
        "contact_info": {}
    }'::JSONB,
    
    -- Status and versioning
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT brands_slug_format CHECK (slug ~ '^[a-z0-9\-]+$'),
    CONSTRAINT brands_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100)
);

-- Brand assets (logos, images, etc.)
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Asset type and metadata
    kind TEXT NOT NULL CHECK (kind IN (
        'logo_primary', 'logo_dark', 'logo_light', 'logo_square',
        'email_header', 'favicon', 'hero', 'og_image',
        'background', 'pattern', 'icon'
    )),
    
    -- Storage and dimensions
    storage_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    mime_type TEXT,
    file_size INTEGER,
    
    -- Variants for responsive images
    variants JSONB DEFAULT '[]'::JSONB,
    
    -- Metadata
    alt_text TEXT,
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (brand_id, kind),
    CONSTRAINT brand_assets_dimensions CHECK (width > 0 AND height > 0)
);

-- Brand membership (who can access/edit brands)
CREATE TABLE IF NOT EXISTS brand_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Member details
    member_type TEXT NOT NULL CHECK (member_type IN ('studio', 'instructor', 'org', 'user')),
    member_id UUID NOT NULL,
    
    -- Role and permissions
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'owner',
    permissions JSONB DEFAULT '[]'::JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique membership per entity
    UNIQUE (brand_id, member_type, member_id)
);

-- White-label domains (optional)
CREATE TABLE IF NOT EXISTS brand_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Domain configuration
    domain TEXT UNIQUE NOT NULL,
    subdomain TEXT,
    
    -- Email configuration
    email_from TEXT,
    email_from_name TEXT,
    email_dkim_record TEXT,
    email_spf_record TEXT,
    
    -- SSL and verification
    ssl_cert_path TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMPTZ,
    
    -- DNS records for verification
    verification_record TEXT,
    verification_method TEXT CHECK (verification_method IN ('DNS_TXT', 'DNS_CNAME', 'FILE')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT brand_domains_domain_format CHECK (domain ~ '^[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}$')
);

-- Brand policies (legal docs, cancellation, etc.)
CREATE TABLE IF NOT EXISTS brand_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Policy details
    kind TEXT NOT NULL CHECK (kind IN (
        'cancellation', 'late_no_show', 'waiver', 'privacy', 
        'terms', 'refund', 'covid', 'accessibility'
    )),
    
    -- Content
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    content_html TEXT,
    
    -- Localization
    locale TEXT DEFAULT 'en',
    
    -- Versioning and status
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    
    -- Metadata
    summary TEXT,
    effective_date DATE,
    last_reviewed DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique policy per type/locale
    UNIQUE (brand_id, kind, locale)
);

-- =============================================
-- BRAND INTEGRATION TABLES
-- =============================================

-- Update existing tables to support branding
-- Note: These are ALTER statements for existing tables

-- Studios table brand integration
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'primary_brand_id') THEN
        ALTER TABLE studios ADD COLUMN primary_brand_id UUID REFERENCES brands(id);
        ALTER TABLE studios ADD COLUMN secondary_brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- Instructors table brand integration  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instructors' AND column_name = 'personal_brand_id') THEN
        ALTER TABLE instructors ADD COLUMN personal_brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- Classes table brand override
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_templates' AND column_name = 'override_brand_id') THEN
        ALTER TABLE class_templates ADD COLUMN override_brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- Class instances brand override
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_instances' AND column_name = 'override_brand_id') THEN
        ALTER TABLE class_instances ADD COLUMN override_brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- Programs brand integration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'brand_id') THEN
        ALTER TABLE programs ADD COLUMN brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- Retreats brand integration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'brand_id') THEN
        ALTER TABLE retreats ADD COLUMN brand_id UUID REFERENCES brands(id);
    END IF;
END $$;

-- =============================================
-- BRAND ANALYTICS & TRACKING
-- =============================================

-- Brand analytics events
CREATE TABLE IF NOT EXISTS brand_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'page_view', 'brand_follow', 'booking_start', 'booking_complete',
        'asset_view', 'policy_view', 'email_open', 'link_click'
    )),
    
    -- Context
    entity_type TEXT, -- 'studio', 'instructor', 'class', etc.
    entity_id UUID,
    page_path TEXT,
    referrer TEXT,
    
    -- User context
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Metrics
    value DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'CHF',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for analytics queries
    INDEX (brand_id, event_type, created_at),
    INDEX (created_at) WHERE created_at >= NOW() - INTERVAL '30 days'
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Brand lookups
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active, created_at);

-- Asset lookups
CREATE INDEX IF NOT EXISTS idx_brand_assets_brand_kind ON brand_assets(brand_id, kind);
CREATE INDEX IF NOT EXISTS idx_brand_assets_storage ON brand_assets(storage_path);

-- Member lookups
CREATE INDEX IF NOT EXISTS idx_brand_members_brand ON brand_members(brand_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brand_members_entity ON brand_members(member_type, member_id) WHERE is_active = true;

-- Domain lookups
CREATE INDEX IF NOT EXISTS idx_brand_domains_domain ON brand_domains(domain) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brand_domains_brand ON brand_domains(brand_id) WHERE is_active = true;

-- Policy lookups
CREATE INDEX IF NOT EXISTS idx_brand_policies_brand_kind ON brand_policies(brand_id, kind, locale) WHERE is_published = true;

-- Integration lookups
CREATE INDEX IF NOT EXISTS idx_studios_primary_brand ON studios(primary_brand_id) WHERE primary_brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instructors_personal_brand ON instructors(personal_brand_id) WHERE personal_brand_id IS NOT NULL;

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to resolve brand for an entity
CREATE OR REPLACE FUNCTION resolve_entity_brand(
    entity_type TEXT,
    entity_id UUID,
    override_brand_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    brand_id UUID;
BEGIN
    -- If override provided, use it
    IF override_brand_id IS NOT NULL THEN
        RETURN override_brand_id;
    END IF;
    
    -- Resolve based on entity type
    CASE entity_type
        WHEN 'studio' THEN
            SELECT primary_brand_id INTO brand_id FROM studios WHERE id = entity_id;
        WHEN 'instructor' THEN
            SELECT personal_brand_id INTO brand_id FROM instructors WHERE id = entity_id;
        WHEN 'class' THEN
            -- Get from class template or hosting studio
            SELECT COALESCE(ct.override_brand_id, s.primary_brand_id) INTO brand_id
            FROM class_templates ct
            JOIN studios s ON ct.studio_id = s.id
            WHERE ct.id = entity_id;
        WHEN 'program' THEN
            SELECT p.brand_id INTO brand_id FROM programs p WHERE p.id = entity_id;
        WHEN 'retreat' THEN
            SELECT r.brand_id INTO brand_id FROM retreats r WHERE r.id = entity_id;
    END CASE;
    
    RETURN brand_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get brand theme variables as CSS
CREATE OR REPLACE FUNCTION get_brand_css_variables(brand_slug TEXT)
RETURNS TEXT AS $$
DECLARE
    theme_json JSONB;
    css_vars TEXT := '';
    color_key TEXT;
    color_value TEXT;
BEGIN
    -- Get theme from brand
    SELECT theme INTO theme_json FROM brands WHERE slug = brand_slug AND is_active = true;
    
    IF theme_json IS NULL THEN
        RETURN '';
    END IF;
    
    -- Convert colors to CSS variables
    FOR color_key, color_value IN 
        SELECT key, value::TEXT FROM jsonb_each_text(theme_json->'color')
    LOOP
        css_vars := css_vars || '--brand-' || replace(color_key, '_', '-') || ': ' || color_value || '; ';
    END LOOP;
    
    -- Add typography variables
    IF theme_json ? 'typography' THEN
        css_vars := css_vars || '--brand-font: ' || (theme_json->'typography'->>'brandFont') || '; ';
        css_vars := css_vars || '--brand-body-font: ' || (theme_json->'typography'->>'bodyFont') || '; ';
    END IF;
    
    -- Add radius variables
    IF theme_json ? 'radius' THEN
        css_vars := css_vars || '--brand-radius-sm: ' || (theme_json->'radius'->>'sm') || 'px; ';
        css_vars := css_vars || '--brand-radius-md: ' || (theme_json->'radius'->>'md') || 'px; ';
        css_vars := css_vars || '--brand-radius-lg: ' || (theme_json->'radius'->>'lg') || 'px; ';
    END IF;
    
    RETURN css_vars;
END;
$$ LANGUAGE plpgsql;

-- Function to update brand version (for cache busting)
CREATE OR REPLACE FUNCTION increment_brand_version(brand_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_version INTEGER;
BEGIN
    UPDATE brands 
    SET version = version + 1, updated_at = NOW()
    WHERE id = brand_id
    RETURNING version INTO new_version;
    
    RETURN new_version;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_domains_updated_at 
    BEFORE UPDATE ON brand_domains FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_policies_updated_at 
    BEFORE UPDATE ON brand_policies FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to increment brand version when assets or theme change
CREATE OR REPLACE FUNCTION brand_change_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment version when theme or assets change
    IF TG_TABLE_NAME = 'brands' AND (OLD.theme != NEW.theme OR OLD.content != NEW.content) THEN
        NEW.version = OLD.version + 1;
    ELSIF TG_TABLE_NAME = 'brand_assets' THEN
        PERFORM increment_brand_version(NEW.brand_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_version_update 
    BEFORE UPDATE ON brands FOR EACH ROW 
    EXECUTE FUNCTION brand_change_trigger();

CREATE TRIGGER brand_asset_version_update 
    AFTER INSERT OR UPDATE OR DELETE ON brand_assets FOR EACH ROW 
    EXECUTE FUNCTION brand_change_trigger();