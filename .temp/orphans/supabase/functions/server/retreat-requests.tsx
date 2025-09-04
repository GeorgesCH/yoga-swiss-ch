import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const app = new Hono();

// Add CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Submit a new retreat inquiry
app.post('/submit', async (c) => {
  try {
    const formData = await c.req.formData();
    
    // Extract form fields
    const teacherName = formData.get('teacherName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const brandStudio = formData.get('brandStudio') as string;
    const city = formData.get('city') as string;
    const language = formData.get('language') as string;
    const yogaswissProfile = formData.get('yogaswissProfile') as string;
    
    // Retreat details
    const preferredCountry = formData.get('preferredCountry') as string;
    const preferredRegion = formData.get('preferredRegion') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const lengthNights = parseInt(formData.get('lengthNights') as string) || 3;
    const groupSizeMin = parseInt(formData.get('groupSizeMin') as string) || 8;
    const groupSizeMax = parseInt(formData.get('groupSizeMax') as string) || 16;
    const roomPreference = formData.get('roomPreference') as string;
    const yogaStyle = formData.get('yogaStyle') as string;
    const dailySchedule = formData.get('dailySchedule') as string;
    const budgetLow = parseInt(formData.get('budgetLow') as string) || 1500;
    const budgetHigh = parseInt(formData.get('budgetHigh') as string) || 3000;
    const currency = formData.get('currency') as string || 'CHF';
    
    // Services (JSON)
    const services = JSON.parse(formData.get('services') as string || '{}');
    const supportLevel = formData.get('supportLevel') as string;
    const amenities = JSON.parse(formData.get('amenities') as string || '{}');
    const marketing = JSON.parse(formData.get('marketing') as string || '{}');
    
    // Additional requirements
    const accessibility = formData.get('accessibility') as string;
    const familyFriendly = formData.get('familyFriendly') === 'true';
    const alcoholPolicy = formData.get('alcoholPolicy') as string;
    const additionalRequirements = formData.get('additionalRequirements') as string;
    
    // Consent
    const consentContact = formData.get('consentContact') === 'true';
    const consentData = formData.get('consentData') === 'true';
    const newsletterOptIn = formData.get('newsletterOptIn') === 'true';
    
    // Validate required fields
    if (!teacherName || !email || !consentContact || !consentData) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Handle file uploads
    const attachments: string[] = [];
    const files = formData.getAll('attachments') as File[];
    
    for (const file of files) {
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `retreat-attachments/${fileName}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('retreat-leads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('File upload error:', uploadError);
          // Continue without failing the whole request
        } else {
          attachments.push(filePath);
        }
      }
    }
    
    // Get user ID if authenticated
    const authorization = c.req.header('Authorization');
    let userId = null;
    
    if (authorization) {
      const accessToken = authorization.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      userId = user?.id || null;
    }
    
    // Create retreat request
    const { data: retreatRequest, error: insertError } = await supabase
      .from('retreat_requests')
      .insert({
        user_id: userId,
        teacher_name: teacherName,
        email,
        phone,
        brand_studio: brandStudio,
        city,
        language,
        yogaswiss_profile: yogaswissProfile,
        preferred_country: preferredCountry,
        preferred_region: preferredRegion,
        start_date: startDate,
        end_date: endDate,
        length_nights: lengthNights,
        group_size_min: groupSizeMin,
        group_size_max: groupSizeMax,
        room_preference: roomPreference,
        yoga_style: yogaStyle,
        daily_schedule: dailySchedule,
        budget_low: budgetLow,
        budget_high: budgetHigh,
        currency,
        services,
        support_level: supportLevel,
        amenities,
        marketing_preferences: marketing,
        accessibility,
        family_friendly: familyFriendly,
        alcohol_policy: alcoholPolicy,
        additional_requirements: additionalRequirements,
        attachments,
        consent_contact: consentContact,
        consent_data: consentData,
        newsletter_opt_in: newsletterOptIn,
        status: 'new'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating retreat request:', insertError);
      return c.json({ error: 'Failed to create retreat request' }, 500);
    }
    
    // Create status history entry
    await supabase
      .from('retreat_request_status_history')
      .insert({
        request_id: retreatRequest.id,
        status: 'new',
        note: 'Initial retreat inquiry submitted',
        actor_id: userId
      });
    
    // TODO: Send confirmation email to teacher
    // TODO: Create task for retreat manager
    // TODO: Send notification to admin team
    
    return c.json({ 
      success: true,
      requestId: retreatRequest.id,
      message: 'Retreat inquiry submitted successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get retreat requests (admin/manager access)
app.get('/requests', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    
    if (!authorization) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const accessToken = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    // TODO: Check if user has admin/manager permissions
    
    const { status, assigned_manager } = c.req.query();
    
    let query = supabase
      .from('retreat_requests')
      .select(`
        *,
        status_history:retreat_request_status_history(*)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (assigned_manager) {
      query = query.eq('assigned_manager_id', assigned_manager);
    }
    
    const { data: requests, error } = await query;
    
    if (error) {
      console.error('Error fetching requests:', error);
      return c.json({ error: 'Failed to fetch requests' }, 500);
    }
    
    return c.json({ requests });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get specific retreat request details
app.get('/requests/:id', async (c) => {
  try {
    const requestId = c.req.param('id');
    const authorization = c.req.header('Authorization');
    
    if (!authorization) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const accessToken = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    const { data: request, error } = await supabase
      .from('retreat_requests')
      .select(`
        *,
        status_history:retreat_request_status_history(*),
        quotes:partner_quotes(*)
      `)
      .eq('id', requestId)
      .single();
    
    if (error) {
      console.error('Error fetching request:', error);
      return c.json({ error: 'Request not found' }, 404);
    }
    
    // Check access permissions
    const isOwner = request.user_id === user.id || request.email === user.email;
    // TODO: Check if user is admin/manager
    
    if (!isOwner) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    // Get signed URLs for attachments
    const attachmentUrls = [];
    if (request.attachments) {
      for (const attachment of request.attachments) {
        const { data: signedUrl } = await supabase.storage
          .from('retreat-leads')
          .createSignedUrl(attachment, 3600); // 1 hour expiry
        
        if (signedUrl) {
          attachmentUrls.push({
            name: attachment.split('/').pop(),
            url: signedUrl.signedUrl
          });
        }
      }
    }
    
    return c.json({ 
      request: {
        ...request,
        attachmentUrls
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update retreat request status (admin/manager only)
app.put('/requests/:id/status', async (c) => {
  try {
    const requestId = c.req.param('id');
    const authorization = c.req.header('Authorization');
    const { status, note, assigned_manager_id } = await c.req.json();
    
    if (!authorization) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const accessToken = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    // TODO: Check if user has admin/manager permissions
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (assigned_manager_id) updateData.assigned_manager_id = assigned_manager_id;
    
    // Update request
    const { error: updateError } = await supabase
      .from('retreat_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (updateError) {
      console.error('Error updating request:', updateError);
      return c.json({ error: 'Failed to update request' }, 500);
    }
    
    // Add status history entry
    if (status) {
      await supabase
        .from('retreat_request_status_history')
        .insert({
          request_id: requestId,
          status,
          note: note || `Status updated to ${status}`,
          actor_id: user.id
        });
    }
    
    return c.json({ message: 'Request updated successfully' });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user's own retreat requests
app.get('/my-requests', async (c) => {
  try {
    const authorization = c.req.header('Authorization');
    
    if (!authorization) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const accessToken = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    const { data: requests, error } = await supabase
      .from('retreat_requests')
      .select(`
        *,
        status_history:retreat_request_status_history(*)
      `)
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user requests:', error);
      return c.json({ error: 'Failed to fetch requests' }, 500);
    }
    
    return c.json({ requests });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { app as retreatRequestsApp };