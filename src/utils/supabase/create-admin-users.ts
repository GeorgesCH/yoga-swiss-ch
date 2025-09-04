import { supabase } from './client';
import { YOGASWISS_ADMIN_USERS, YOGASWISS_CUSTOMER_USERS } from './seed-data';

// YogaSwiss Admin User Creation System
// Creates real users in Supabase Auth and corresponding database records

interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

// Organization ID for YogaSwiss
const YOGASWISS_ORG_ID = '11111111-1111-1111-1111-111111111111';

export async function createYogaSwissAdminUsers(): Promise<{ success: boolean; results: CreateUserResult[]; errors: string[] }> {
  console.log('🚀 Creating YogaSwiss Admin Users...');
  
  const results: CreateUserResult[] = [];
  const errors: string[] = [];
  
  // Create all admin users
  for (const userData of YOGASWISS_ADMIN_USERS) {
    try {
      console.log(`Creating admin user: ${userData.email}`);
      
      // Step 1: Create user in Supabase Auth using Admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: userData.role,
          display_name: userData.display_name,
          ...userData.user_metadata
        }
      });

      if (authError) {
        const errorMsg = `Auth creation failed for ${userData.email}: ${authError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        results.push({ success: false, error: authError.message });
        continue;
      }

      if (!authUser.user) {
        const errorMsg = `No user returned from auth for ${userData.email}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        results.push({ success: false, error: 'No user returned' });
        continue;
      }

      console.log(`✅ Auth user created: ${authUser.user.id}`);

      // Step 2: Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.user.id,
          email: userData.email,
          display_name: userData.display_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          default_organization_id: YOGASWISS_ORG_ID,
          preferences: userData.user_metadata,
          swiss_resident: true
        });

      if (profileError) {
        const errorMsg = `Profile creation failed for ${userData.email}: ${profileError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        results.push({ success: false, userId: authUser.user.id, error: profileError.message });
        continue;
      }

      console.log(`✅ Profile created for: ${userData.email}`);

      // Step 3: Create organization membership
      const { error: memberError } = await supabase
        .from('organization_members')
        .upsert({
          organization_id: YOGASWISS_ORG_ID,
          user_id: authUser.user.id,
          role: userData.role,
          permissions: userData.user_metadata.permissions ? { permissions: userData.user_metadata.permissions } : {},
          is_active: true,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        const errorMsg = `Organization membership failed for ${userData.email}: ${memberError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        results.push({ success: false, userId: authUser.user.id, error: memberError.message });
        continue;
      }

      console.log(`✅ Organization membership created for: ${userData.email}`);

      // Step 4: Create instructor record if user is an instructor
      if (userData.role === 'instructor' && userData.user_metadata.specialties) {
        const { error: instructorError } = await supabase
          .from('instructors')
          .upsert({
            organization_id: YOGASWISS_ORG_ID,
            user_id: authUser.user.id,
            specialties: userData.user_metadata.specialties || [],
            bio: userData.user_metadata.bio || '',
            qualifications: { 
              certifications: userData.user_metadata.certifications || []
            },
            hourly_rate_cents: userData.user_metadata.hourly_rate ? userData.user_metadata.hourly_rate * 100 : null,
            is_active: true
          });

        if (instructorError) {
          console.warn(`Instructor record creation failed for ${userData.email}: ${instructorError.message}`);
          // Don't fail the entire user creation for this
        } else {
          console.log(`✅ Instructor record created for: ${userData.email}`);
        }
      }

      results.push({ success: true, userId: authUser.user.id });
      console.log(`🎉 Successfully created complete user: ${userData.email}`);

    } catch (error) {
      const errorMsg = `Unexpected error creating user ${userData.email}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      results.push({ success: false, error: errorMsg });
    }
  }

  // Create customer users
  for (const userData of YOGASWISS_CUSTOMER_USERS) {
    try {
      console.log(`Creating customer user: ${userData.email}`);
      
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          role: userData.role,
          display_name: userData.display_name,
          ...userData.user_metadata
        }
      });

      if (authError) {
        const errorMsg = `Customer auth creation failed for ${userData.email}: ${authError.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        results.push({ success: false, error: authError.message });
        continue;
      }

      if (!authUser.user) {
        const errorMsg = `No customer user returned from auth for ${userData.email}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        results.push({ success: false, error: 'No user returned' });
        continue;
      }

      // Create profile and membership for customer
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.user.id,
          email: userData.email,
          display_name: userData.display_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          default_organization_id: YOGASWISS_ORG_ID,
          emergency_contact: userData.user_metadata.emergency_contact,
          preferences: userData.user_metadata,
          swiss_resident: true
        });

      if (profileError) {
        console.warn(`Customer profile creation failed for ${userData.email}: ${profileError.message}`);
      }

      const { error: memberError } = await supabase
        .from('organization_members')
        .upsert({
          organization_id: YOGASWISS_ORG_ID,
          user_id: authUser.user.id,
          role: userData.role,
          permissions: {},
          is_active: true,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.warn(`Customer membership failed for ${userData.email}: ${memberError.message}`);
      }

      results.push({ success: true, userId: authUser.user.id });
      console.log(`🎉 Successfully created customer: ${userData.email}`);

    } catch (error) {
      const errorMsg = `Unexpected error creating customer ${userData.email}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      results.push({ success: false, error: errorMsg });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const totalCount = YOGASWISS_ADMIN_USERS.length + YOGASWISS_CUSTOMER_USERS.length;

  console.log(`\n📊 User Creation Summary:`);
  console.log(`✅ Successfully created: ${successCount}/${totalCount} users`);
  console.log(`❌ Failed: ${totalCount - successCount} users`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors encountered:`);
    errors.forEach(error => console.log(`   ${error}`));
  }

  return {
    success: successCount === totalCount,
    results,
    errors
  };
}

// Function to check if admin users already exist
export async function checkExistingAdminUsers(): Promise<{ existing: string[]; missing: string[] }> {
  const existing: string[] = [];
  const missing: string[] = [];

  for (const userData of YOGASWISS_ADMIN_USERS) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (profile && !error) {
        existing.push(userData.email);
      } else {
        missing.push(userData.email);
      }
    } catch (error) {
      missing.push(userData.email);
    }
  }

  return { existing, missing };
}

// Function to display admin login credentials
export function displayAdminCredentials(): void {
  console.log('\n🔐 YogaSwiss Admin Login Credentials:');
  console.log('=====================================');
  
  YOGASWISS_ADMIN_USERS.forEach(user => {
    console.log(`\n👤 ${user.user_metadata.title} (${user.role})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
  });

  console.log(`\n👥 Customer Test Account:`);
  YOGASWISS_CUSTOMER_USERS.forEach(user => {
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
  });

  console.log('\n📝 Login Instructions:');
  console.log('1. Navigate to the admin dashboard');
  console.log('2. Use any of the admin emails and passwords above');
  console.log('3. All accounts have full access to their respective roles');
  console.log('4. The super admin account has full platform access');
  console.log('\n🚨 IMPORTANT: Change these passwords in production!');
}