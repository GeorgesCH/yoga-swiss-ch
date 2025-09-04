-- =====================================================
-- YogaSwiss Storage Configuration
-- Supabase Storage buckets and policies for media assets
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Bucket for product images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for class and instructor images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'class-media',
  'class-media',
  true,
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for customer and staff avatars
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for location and studio images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'location-media',
  'location-media',
  true,
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for documents (invoices, contracts, etc.)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Bucket for marketing assets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'marketing-assets',
  'marketing-assets',
  true,
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Product Media Policies
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

CREATE POLICY "Staff can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager')
      AND om.is_active = true
    )
  );

CREATE POLICY "Staff can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager')
      AND om.is_active = true
    )
  );

CREATE POLICY "Staff can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager')
      AND om.is_active = true
    )
  );

-- Class Media Policies
CREATE POLICY "Public can view class images" ON storage.objects
  FOR SELECT USING (bucket_id = 'class-media');

CREATE POLICY "Staff can manage class images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'class-media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager', 'instructor')
      AND om.is_active = true
    )
  );

-- Avatar Policies
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Location Media Policies
CREATE POLICY "Public can view location images" ON storage.objects
  FOR SELECT USING (bucket_id = 'location-media');

CREATE POLICY "Staff can manage location images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'location-media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager')
      AND om.is_active = true
    )
  );

-- Document Policies (Private)
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (
      -- Users can see their own documents
      (storage.foldername(name))[1] = auth.uid()::text OR
      -- Staff can see organization documents
      EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'studio_manager', 'accountant')
        AND om.is_active = true
      )
    )
  );

CREATE POLICY "Staff can manage documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager', 'accountant')
      AND om.is_active = true
    )
  );

-- Marketing Assets Policies
CREATE POLICY "Public can view marketing assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'marketing-assets');

CREATE POLICY "Marketing staff can manage assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'marketing-assets' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'studio_manager', 'marketer')
      AND om.is_active = true
    )
  );

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Generate signed URL for private files
CREATE OR REPLACE FUNCTION get_signed_url(
  bucket_name TEXT,
  object_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- This would integrate with Supabase Storage API
  -- For now, return a placeholder that would be replaced by actual Supabase function
  signed_url := 'https://your-project.supabase.co/storage/v1/object/sign/' || bucket_name || '/' || object_path || '?token=placeholder';
  
  RETURN signed_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upload validation function
CREATE OR REPLACE FUNCTION validate_upload(
  bucket_name TEXT,
  object_path TEXT,
  mime_type TEXT,
  file_size BIGINT
)
RETURNS JSONB AS $$
DECLARE
  bucket_config RECORD;
  is_valid BOOLEAN := true;
  errors TEXT[] := '{}';
BEGIN
  -- Get bucket configuration
  SELECT * INTO bucket_config
  FROM storage.buckets
  WHERE name = bucket_name;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'errors', ARRAY['Bucket not found']
    );
  END IF;
  
  -- Check file size
  IF bucket_config.file_size_limit IS NOT NULL AND file_size > bucket_config.file_size_limit THEN
    is_valid := false;
    errors := array_append(errors, 'File size exceeds limit of ' || bucket_config.file_size_limit || ' bytes');
  END IF;
  
  -- Check MIME type
  IF bucket_config.allowed_mime_types IS NOT NULL AND NOT (mime_type = ANY(bucket_config.allowed_mime_types)) THEN
    is_valid := false;
    errors := array_append(errors, 'MIME type ' || mime_type || ' not allowed for this bucket');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', is_valid,
    'errors', errors,
    'bucket_config', row_to_json(bucket_config)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORAGE CLEANUP FUNCTIONS
-- =====================================================

-- Clean up orphaned files (files not referenced in database)
CREATE OR REPLACE FUNCTION cleanup_orphaned_files(bucket_name TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  cleanup_count INTEGER := 0;
  bucket_names TEXT[];
  bucket TEXT;
BEGIN
  -- Get bucket names to process
  IF bucket_name IS NOT NULL THEN
    bucket_names := ARRAY[bucket_name];
  ELSE
    bucket_names := ARRAY['product-media', 'class-media', 'avatars', 'location-media', 'marketing-assets'];
  END IF;
  
  FOREACH bucket IN ARRAY bucket_names LOOP
    CASE bucket
      WHEN 'product-media' THEN
        -- Delete product images not referenced in products table
        DELETE FROM storage.objects
        WHERE bucket_id = 'product-media'
        AND name NOT IN (
          SELECT UNNEST(images) FROM products WHERE images IS NOT NULL
        );
        
      WHEN 'avatars' THEN
        -- Delete avatars not referenced in profiles table
        DELETE FROM storage.objects
        WHERE bucket_id = 'avatars'
        AND name NOT IN (
          SELECT avatar_url FROM profiles WHERE avatar_url IS NOT NULL
        );
        
      -- Add other bucket cleanup logic as needed
    END CASE;
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'files_cleaned', cleanup_count,
    'buckets_processed', bucket_names
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORAGE USAGE ANALYTICS
-- =====================================================

-- Get storage usage statistics
CREATE OR REPLACE FUNCTION get_storage_usage(organization_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  usage_stats JSONB;
BEGIN
  WITH bucket_usage AS (
    SELECT 
      bucket_id,
      COUNT(*) as file_count,
      SUM(metadata->>'size')::BIGINT as total_size_bytes
    FROM storage.objects
    WHERE (organization_id IS NULL OR 
           (metadata->>'organization_id')::UUID = get_storage_usage.organization_id)
    GROUP BY bucket_id
  )
  SELECT jsonb_object_agg(
    bucket_id,
    jsonb_build_object(
      'file_count', file_count,
      'total_size_bytes', total_size_bytes,
      'total_size_mb', ROUND(total_size_bytes / 1048576.0, 2)
    )
  ) INTO usage_stats
  FROM bucket_usage;
  
  RETURN COALESCE(usage_stats, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;