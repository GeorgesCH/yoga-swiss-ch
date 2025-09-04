-- =============================================
-- YogaSwiss Brand Management RLS Policies
-- Multi-tenant security for brand system
-- =============================================

-- Enable RLS on all brand tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BRANDS TABLE POLICIES
-- =============================================

-- Public can view active brands that are used by public entities
CREATE POLICY "brands_public_read" ON brands
    FOR SELECT
    USING (
        is_active = true AND (
            -- Brand is used by a public studio
            EXISTS (
                SELECT 1 FROM studios s 
                WHERE s.primary_brand_id = brands.id 
                AND s.is_public = true
            ) OR
            -- Brand is used by a public instructor
            EXISTS (
                SELECT 1 FROM instructors i
                WHERE i.personal_brand_id = brands.id
                AND i.is_public = true
            )
        )
    );

-- Brand members can read their brands
CREATE POLICY "brands_member_read" ON brands
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brands.id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.is_active = true
        )
    );

-- Brand owners and editors can update
CREATE POLICY "brands_member_update" ON brands
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brands.id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role IN ('owner', 'editor')
            AND bm.is_active = true
        )
    );

-- Authenticated users can create brands
CREATE POLICY "brands_authenticated_insert" ON brands
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Brand owners can delete
CREATE POLICY "brands_owner_delete" ON brands
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brands.id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role = 'owner'
            AND bm.is_active = true
        )
    );

-- =============================================
-- BRAND ASSETS POLICIES
-- =============================================

-- Public can view assets for public brands
CREATE POLICY "brand_assets_public_read" ON brand_assets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM brands b
            WHERE b.id = brand_assets.brand_id
            AND b.is_active = true AND (
                EXISTS (
                    SELECT 1 FROM studios s 
                    WHERE s.primary_brand_id = b.id 
                    AND s.is_public = true
                ) OR
                EXISTS (
                    SELECT 1 FROM instructors i
                    WHERE i.personal_brand_id = b.id
                    AND i.is_public = true
                )
            )
        )
    );

-- Brand members can read assets
CREATE POLICY "brand_assets_member_read" ON brand_assets
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_assets.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.is_active = true
        )
    );

-- Brand editors can insert/update/delete assets
CREATE POLICY "brand_assets_editor_all" ON brand_assets
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_assets.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role IN ('owner', 'editor')
            AND bm.is_active = true
        )
    );

-- =============================================
-- BRAND MEMBERS POLICIES
-- =============================================

-- Brand members can read memberships for their brands
CREATE POLICY "brand_members_read" ON brand_members
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- User is a member of this brand
            member_type = 'user' AND member_id = auth.uid() OR
            -- User is a member of the same brand
            EXISTS (
                SELECT 1 FROM brand_members bm2
                WHERE bm2.brand_id = brand_members.brand_id
                AND bm2.member_type = 'user'
                AND bm2.member_id = auth.uid()
                AND bm2.is_active = true
            )
        )
    );

-- Brand owners can manage memberships
CREATE POLICY "brand_members_owner_manage" ON brand_members
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_members.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role = 'owner'
            AND bm.is_active = true
        )
    );

-- Users can insert themselves as brand members (for joining)
CREATE POLICY "brand_members_self_insert" ON brand_members
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        member_type = 'user' AND
        member_id = auth.uid()
    );

-- =============================================
-- BRAND DOMAINS POLICIES
-- =============================================

-- Brand members can read domains
CREATE POLICY "brand_domains_member_read" ON brand_domains
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_domains.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.is_active = true
        )
    );

-- Brand owners can manage domains
CREATE POLICY "brand_domains_owner_manage" ON brand_domains
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_domains.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role = 'owner'
            AND bm.is_active = true
        )
    );

-- =============================================
-- BRAND POLICIES POLICIES
-- =============================================

-- Public can read published policies for public brands
CREATE POLICY "brand_policies_public_read" ON brand_policies
    FOR SELECT
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM brands b
            WHERE b.id = brand_policies.brand_id
            AND b.is_active = true AND (
                EXISTS (
                    SELECT 1 FROM studios s 
                    WHERE s.primary_brand_id = b.id 
                    AND s.is_public = true
                ) OR
                EXISTS (
                    SELECT 1 FROM instructors i
                    WHERE i.personal_brand_id = b.id
                    AND i.is_public = true
                )
            )
        )
    );

-- Brand members can read all policies
CREATE POLICY "brand_policies_member_read" ON brand_policies
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_policies.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.is_active = true
        )
    );

-- Brand editors can manage policies
CREATE POLICY "brand_policies_editor_manage" ON brand_policies
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_policies.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role IN ('owner', 'editor')
            AND bm.is_active = true
        )
    );

-- =============================================
-- BRAND ANALYTICS POLICIES
-- =============================================

-- Brand members can read analytics
CREATE POLICY "brand_analytics_member_read" ON brand_analytics
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_analytics.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.is_active = true
        )
    );

-- Anyone can insert analytics (for tracking)
CREATE POLICY "brand_analytics_insert" ON brand_analytics
    FOR INSERT
    WITH CHECK (true);

-- Only brand owners can delete analytics
CREATE POLICY "brand_analytics_owner_delete" ON brand_analytics
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM brand_members bm
            WHERE bm.brand_id = brand_analytics.brand_id
            AND bm.member_type = 'user'
            AND bm.member_id = auth.uid()
            AND bm.role = 'owner'
            AND bm.is_active = true
        )
    );

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to check if user has brand access
CREATE OR REPLACE FUNCTION user_has_brand_access(
    brand_id UUID,
    required_role TEXT DEFAULT 'viewer'
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM brand_members bm
        WHERE bm.brand_id = $1
        AND bm.member_type = 'user'
        AND bm.member_id = auth.uid()
        AND bm.is_active = true
        AND CASE required_role
            WHEN 'owner' THEN bm.role = 'owner'
            WHEN 'editor' THEN bm.role IN ('owner', 'editor')
            ELSE bm.role IN ('owner', 'editor', 'viewer')
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if brand is publicly accessible
CREATE OR REPLACE FUNCTION brand_is_public(brand_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM brands b
        WHERE b.id = brand_id
        AND b.is_active = true AND (
            EXISTS (
                SELECT 1 FROM studios s 
                WHERE s.primary_brand_id = b.id 
                AND s.is_public = true
            ) OR
            EXISTS (
                SELECT 1 FROM instructors i
                WHERE i.personal_brand_id = b.id
                AND i.is_public = true
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's accessible brands
CREATE OR REPLACE FUNCTION user_accessible_brands() 
RETURNS TABLE(brand_id UUID, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT bm.brand_id, bm.role
    FROM brand_members bm
    WHERE bm.member_type = 'user'
    AND bm.member_id = auth.uid()
    AND bm.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STUDIO/INSTRUCTOR BRAND ACCESS POLICIES
-- =============================================

-- Update studios RLS to include brand access
DROP POLICY IF EXISTS "studios_brand_read" ON studios;
CREATE POLICY "studios_brand_read" ON studios
    FOR SELECT
    USING (
        is_public = true OR
        auth.uid() IS NOT NULL AND (
            -- User is staff at studio
            EXISTS (
                SELECT 1 FROM studio_staff ss
                WHERE ss.studio_id = studios.id
                AND ss.user_id = auth.uid()
                AND ss.is_active = true
            ) OR
            -- User has access to studio's brand
            (primary_brand_id IS NOT NULL AND user_has_brand_access(primary_brand_id))
        )
    );

-- Update instructors RLS to include brand access
DROP POLICY IF EXISTS "instructors_brand_read" ON instructors;
CREATE POLICY "instructors_brand_read" ON instructors
    FOR SELECT
    USING (
        is_public = true OR
        auth.uid() IS NOT NULL AND (
            -- User is the instructor
            user_id = auth.uid() OR
            -- User has access to instructor's brand
            (personal_brand_id IS NOT NULL AND user_has_brand_access(personal_brand_id))
        )
    );