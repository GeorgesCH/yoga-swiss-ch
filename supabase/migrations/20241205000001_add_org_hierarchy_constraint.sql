-- Add constraint to ensure studios can only be children of brands
-- This prevents studios from being children of other studios

-- First, let's add a check constraint to the organizations table
-- This constraint ensures that if an organization is a studio, its parent must be a brand
ALTER TABLE organizations 
ADD CONSTRAINT check_studio_parent_is_brand 
CHECK (
  -- If this org is a studio and has a parent, the parent must be a brand
  (type = 'studio' AND parent_id IS NULL) OR  -- Independent studio (no parent)
  (type = 'studio' AND parent_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM organizations parent 
    WHERE parent.id = parent_id AND parent.type = 'brand'
  )) OR
  (type = 'brand')  -- Brands can have any parent or no parent
);

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT check_studio_parent_is_brand ON organizations IS 
'Ensures that studios can only be children of brands, not other studios. Studios can be independent (no parent) or children of brands only.';
