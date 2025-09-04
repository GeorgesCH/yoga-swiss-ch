import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

// Initialize Supabase clients
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Admin client for user creation and management
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for normal operations
export const supabaseClient = createClient(supabaseUrl, anonKey);

// Swiss role definitions with permissions
export const ROLES = {
  customer: {
    permissions: ['read:own_profile', 'update:own_profile', 'read:classes', 'create:registration']
  },
  instructor: {
    permissions: [
      'read:own_profile', 'update:own_profile', 'read:classes', 'update:own_classes',
      'read:registrations', 'read:roster_basic', 'create:class_notes'
    ]
  },
  front_desk: {
    permissions: [
      'read:customers', 'create:customer', 'update:customer', 'read:registrations',
      'create:registration', 'update:registration', 'read:classes', 'read:roster_full',
      'process:payment'
    ]
  },
  manager: {
    permissions: [
      'read:all', 'create:all', 'update:all', 'delete:non_critical',
      'read:finances', 'read:analytics', 'manage:schedule', 'manage:staff'
    ]
  },
  owner: {
    permissions: ['*'] // All permissions
  },
  accountant: {
    permissions: [
      'read:finances', 'create:invoice', 'update:invoice', 'read:orders',
      'read:payments', 'create:refund', 'read:analytics'
    ]
  },
  marketer: {
    permissions: [
      'read:customers', 'read:analytics', 'create:campaign', 'update:campaign',
      'read:segments', 'create:segment'
    ]
  }
} as const;

// Create user with role assignment
export async function createUserWithRole(
  email: string,
  password: string,
  fullName: string,
  orgId: string,
  role: keyof typeof ROLES,
  userMetadata: Record<string, any> = {}
) {
  try {
    // Create user with auto-confirmation (since we don't have email server configured)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: fullName,
        ...userMetadata 
      },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (authError) {
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    const user = authData.user;

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        preferred_locale: 'de-CH',
        marketing_consent: false,
        privacy_settings: {},
        is_active: true
      });

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // Create organization membership
    const { error: orgError } = await supabaseAdmin
      .from('org_users')
      .insert({
        org_id: orgId,
        user_id: user.id,
        role,
        permissions: ROLES[role].permissions,
        is_active: true,
        joined_at: new Date().toISOString()
      });

    if (orgError) {
      throw new Error(`Failed to create organization membership: ${orgError.message}`);
    }

    return { user, success: true };
  } catch (error) {
    console.error('Error creating user with role:', error);
    throw error;
  }
}

// Authenticate user and return session
export async function authenticateUser(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  return data;
}

// Get user from access token
export async function getUserFromToken(accessToken: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}

// Check if user has permission in organization
export async function checkPermission(
  userId: string, 
  orgId: string, 
  permission: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('org_users')
    .select('role, permissions')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return false;
  }

  // Owner has all permissions
  if (data.role === 'owner') {
    return true;
  }

  // Check specific permission
  return data.permissions.includes(permission) || data.permissions.includes('*');
}

// Get user's role in organization
export async function getUserRole(userId: string, orgId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('org_users')
    .select('role')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role;
}

// Middleware to require authentication
export function requireAuth() {
  return async (request: Request): Promise<{ userId: string; user: any } | Response> => {
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response('Authorization header required', { status: 401 });
    }

    try {
      const user = await getUserFromToken(accessToken);
      return { userId: user.id, user };
    } catch (error) {
      return new Response('Invalid or expired token', { status: 401 });
    }
  };
}

// Middleware to require specific permission
export function requirePermission(permission: string, orgId?: string) {
  return async (request: Request, userId: string): Promise<void | Response> => {
    // If orgId not provided, try to extract from request
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const url = new URL(request.url);
      targetOrgId = url.searchParams.get('org_id') || undefined;
    }

    if (!targetOrgId) {
      return new Response('Organization ID required', { status: 400 });
    }

    const hasPermission = await checkPermission(userId, targetOrgId, permission);
    
    if (!hasPermission) {
      return new Response('Insufficient permissions', { status: 403 });
    }
  };
}

// Password reset functionality
export async function initiatePasswordReset(email: string) {
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${Deno.env.get('FRONTEND_URL')}/auth/reset-password`
    }
  });

  if (error) {
    throw new Error(`Password reset failed: ${error.message}`);
  }

  return { success: true };
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    throw new Error(`Password update failed: ${error.message}`);
  }

  return { success: true };
}
