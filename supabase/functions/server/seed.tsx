import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { createUserWithRole, supabaseAdmin } from './auth.tsx';
import { 
  DEMO_ORGS, 
  DEMO_USERS, 
  DEMO_LOCATIONS, 
  DEMO_CLASS_TEMPLATES, 
  DEMO_PRODUCTS,
  DEMO_ORDERS,
  generateDemoClassOccurrences 
} from './seed-data.tsx';

const seed = new Hono();

// CORS for seed endpoints
seed.use('*', cors({
  origin: ['https://*.supabase.co', 'https://*.vercel.app', 'https://*.netlify.app'],
  credentials: true,
}));

// Seed demo data
seed.post('/demo', async (c) => {
  try {
    console.log('🌱 Starting demo data seeding...');

    // 1. Create organizations first
    console.log('📊 Creating organizations...');
    for (const org of DEMO_ORGS) {
      const { error } = await supabaseAdmin
        .from('orgs')
        .upsert(org, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create org ${org.name}:`, error);
      } else {
        console.log(`✅ Created org: ${org.name}`);
      }
    }

    // 2. Create users with roles
    console.log('👥 Creating demo users...');
    const createdUsers = new Map();
    
    for (const userData of DEMO_USERS) {
      try {
        const { user } = await createUserWithRole(
          userData.email,
          userData.password,
          userData.full_name,
          userData.org_id,
          userData.role,
          userData.user_metadata
        );
        
        createdUsers.set(userData.email, user.id);
        console.log(`✅ Created user: ${userData.full_name} (${userData.role})`);
      } catch (error) {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const found = existingUser.users.find(u => u.email === userData.email);
        
        if (found) {
          createdUsers.set(userData.email, found.id);
          console.log(`♻️  User exists: ${userData.full_name}`);
        } else {
          console.error(`Failed to create user ${userData.email}:`, error);
        }
      }
    }

    // 3. Create locations
    console.log('📍 Creating locations...');
    for (const location of DEMO_LOCATIONS) {
      const { error } = await supabaseAdmin
        .from('locations')
        .upsert(location, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create location ${location.name}:`, error);
      } else {
        console.log(`✅ Created location: ${location.name}`);
      }
    }

    // 4. Create class templates
    console.log('🧘 Creating class templates...');
    for (const template of DEMO_CLASS_TEMPLATES) {
      const { error } = await supabaseAdmin
        .from('class_templates')
        .upsert(template, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create template ${template.name}:`, error);
      } else {
        console.log(`✅ Created template: ${template.name}`);
      }
    }

    // 5. Create products
    console.log('🛍️ Creating products...');
    for (const product of DEMO_PRODUCTS) {
      const { error } = await supabaseAdmin
        .from('products')
        .upsert(product, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create product ${product.name['en-CH']}:`, error);
      } else {
        console.log(`✅ Created product: ${product.name['en-CH']}`);
      }
    }

    // 6. Create class occurrences
    console.log('📅 Creating class occurrences...');
    const instructorId = createdUsers.get('instructor@yogaswiss-demo.ch');
    const occurrences = generateDemoClassOccurrences().map(occ => ({
      ...occ,
      instructor_id: instructorId
    }));

    for (const occurrence of occurrences) {
      const { error } = await supabaseAdmin
        .from('class_occurrences')
        .upsert(occurrence, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create occurrence:`, error);
      }
    }
    console.log(`✅ Created ${occurrences.length} class occurrences`);

    // 7. Create customer wallet and pass
    console.log('💳 Creating customer wallet and passes...');
    const customerId = createdUsers.get('customer@yogaswiss-demo.ch');
    
    if (customerId) {
      // Create wallet
      const { error: walletError } = await supabaseAdmin
        .from('wallets')
        .upsert({
          id: `wallet_${customerId}`,
          customer_id: customerId,
          org_id: 'studio_zrh',
          balance: 5, // 5 credits
          currency: 'CHF',
          is_active: true
        }, { onConflict: 'id' });

      if (walletError) {
        console.error('Failed to create wallet:', walletError);
      } else {
        console.log('✅ Created customer wallet with 5 credits');
      }

      // Create an active 10-class pass
      const passValidFrom = new Date();
      const passValidUntil = new Date();
      passValidUntil.setDate(passValidUntil.getDate() + 120); // 4 months

      const { error: passError } = await supabaseAdmin
        .from('passes')
        .upsert({
          id: `pass_${customerId}_pack10`,
          customer_id: customerId,
          org_id: 'studio_zrh',
          product_id: 'product_pack_10',
          type: 'credits',
          credits_total: 10,
          credits_used: 2, // 2 used, 8 remaining
          valid_from: passValidFrom.toISOString(),
          valid_until: passValidUntil.toISOString(),
          is_active: true,
          auto_renew: false,
          notes: 'Demo 10-class package'
        }, { onConflict: 'id' });

      if (passError) {
        console.error('Failed to create pass:', passError);
      } else {
        console.log('✅ Created customer pass (10-class package, 8 remaining)');
      }
    }

    // 8. Create sample orders
    console.log('🛒 Creating sample orders...');
    const ordersWithCustomerId = DEMO_ORDERS.map(order => ({
      ...order,
      customer_id: customerId
    }));

    for (const order of ordersWithCustomerId) {
      const { error } = await supabaseAdmin
        .from('orders')
        .upsert(order, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create order ${order.id}:`, error);
      } else {
        console.log(`✅ Created order: ${order.id}`);
      }
    }

    // 9. Create sample registrations
    console.log('📝 Creating sample registrations...');
    const sampleOccurrences = occurrences.slice(0, 3); // First 3 occurrences
    
    for (let i = 0; i < sampleOccurrences.length; i++) {
      const occurrence = sampleOccurrences[i];
      const registration = {
        id: `registration_${occurrence.id}`,
        occurrence_id: occurrence.id,
        customer_id: customerId,
        org_id: 'studio_zrh',
        status: i === 0 ? 'attended' : 'confirmed',
        booked_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        payment_status: 'paid',
        payment_method: 'credits',
        check_in_time: i === 0 ? new Date(occurrence.start_time).toISOString() : null,
        feedback_rating: i === 0 ? 5 : null,
        feedback_comment: i === 0 ? 'Amazing class! Sophie is an excellent instructor.' : null
      };

      const { error } = await supabaseAdmin
        .from('registrations')
        .upsert(registration, { onConflict: 'id' });
      
      if (error) {
        console.error(`Failed to create registration:`, error);
      }
    }
    console.log(`✅ Created ${sampleOccurrences.length} sample registrations`);

    // 10. Update occurrence booking counts
    console.log('📊 Updating booking counts...');
    for (const occurrence of sampleOccurrences) {
      await supabaseAdmin
        .from('class_occurrences')
        .update({ booked_count: 1 })
        .eq('id', occurrence.id);
    }

    console.log('🎉 Demo data seeding completed successfully!');
    
    return c.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        orgs: DEMO_ORGS.length,
        users: DEMO_USERS.length,
        locations: DEMO_LOCATIONS.length,
        templates: DEMO_CLASS_TEMPLATES.length,
        products: DEMO_PRODUCTS.length,
        occurrences: occurrences.length,
        orders: DEMO_ORDERS.length,
        user_mappings: Object.fromEntries(createdUsers)
      }
    });

  } catch (error) {
    console.error('❌ Demo seeding failed:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Unknown error during seeding'
    }, 500);
  }
});

// Reset demo data (clean slate)
seed.post('/reset', async (c) => {
  try {
    console.log('🧹 Resetting demo data...');

    // Delete in reverse dependency order
    const tables = [
      'registrations',
      'class_occurrences', 
      'passes',
      'wallets',
      'invoices',
      'orders',
      'products',
      'class_templates',
      'locations',
      'org_users',
      'user_profiles'
      // Note: Don't delete auth.users or orgs to avoid cascading issues
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', ''); // Delete all records
      
      if (error) {
        console.error(`Failed to clear table ${table}:`, error);
      } else {
        console.log(`✅ Cleared table: ${table}`);
      }
    }

    // Delete auth users (demo accounts only)
    const demoEmails = DEMO_USERS.map(u => u.email);
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    
    for (const user of users.users) {
      if (demoEmails.includes(user.email || '')) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        console.log(`✅ Deleted user: ${user.email}`);
      }
    }

    console.log('🎉 Demo data reset completed!');
    
    return c.json({
      success: true,
      message: 'Demo data reset successfully'
    });

  } catch (error) {
    console.error('❌ Demo reset failed:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Unknown error during reset'
    }, 500);
  }
});

// Get current demo status
seed.get('/status', async (c) => {
  try {
    // Count records in key tables
    const tables = ['orgs', 'user_profiles', 'locations', 'class_templates', 'class_occurrences'];
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      counts[table] = error ? 0 : (count || 0);
    }

    // Check for demo users
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const demoUsers = users.users.filter(u => 
      u.email?.endsWith('@yogaswiss-demo.ch')
    );

    return c.json({
      success: true,
      counts,
      demoUsers: demoUsers.length,
      isSeeded: counts['class_templates'] > 0 && demoUsers.length > 0
    });

  } catch (error) {
    console.error('Failed to get demo status:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Unknown error'
    }, 500);
  }
});

export default seed;