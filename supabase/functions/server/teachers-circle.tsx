import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

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

// Get upcoming Teachers Circle events
app.get('/events', async (c) => {
  try {
    const { city } = c.req.query();
    
    let query = supabase
      .from('teachers_circle_events')
      .select(`
        *,
        venues (*),
        registration_count:teachers_circle_registrations!event_id(count),
        waitlist_count:teachers_circle_registrations!event_id(count)
      `)
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true });
    
    if (city) {
      query = query.eq('city', city);
    }
    
    const { data: events, error } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      return c.json({ error: 'Failed to fetch events' }, 500);
    }
    
    // Process the data to calculate actual counts
    const processedEvents = events?.map(event => {
      const registeredCount = event.registration_count?.filter((r: any) => 
        r.status === 'registered' || r.status === 'attended'
      ).length || 0;
      
      const waitlistCount = event.registration_count?.filter((r: any) => 
        r.status === 'waitlisted'
      ).length || 0;
      
      return {
        ...event,
        registeredCount,
        waitlistCount
      };
    }) || [];
    
    return c.json({ events: processedEvents });
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get event details by ID
app.get('/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    
    const { data: event, error } = await supabase
      .from('teachers_circle_events')
      .select(`
        *,
        venues (*),
        registrations:teachers_circle_registrations(*)
      `)
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error('Error fetching event:', error);
      return c.json({ error: 'Event not found' }, 404);
    }
    
    return c.json({ event });
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Register for an event
app.post('/events/:id/register', async (c) => {
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();
    const { email, name, phone, consentPolicy, consentPhoto, userId } = body;
    
    if (!email || !name || !consentPolicy) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Check if event exists and get capacity
    const { data: event, error: eventError } = await supabase
      .from('teachers_circle_events')
      .select('*, registration_count:teachers_circle_registrations!event_id(count)')
      .eq('id', eventId)
      .eq('status', 'open')
      .single();
    
    if (eventError) {
      console.error('Error fetching event:', eventError);
      return c.json({ error: 'Event not found or not open for registration' }, 404);
    }
    
    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('teachers_circle_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email)
      .single();
    
    if (existingRegistration) {
      return c.json({ error: 'You are already registered for this event' }, 400);
    }
    
    // Calculate current registration count
    const { data: registrations } = await supabase
      .from('teachers_circle_registrations')
      .select('status')
      .eq('event_id', eventId)
      .in('status', ['registered', 'attended']);
    
    const currentCount = registrations?.length || 0;
    const isWaitlist = currentCount >= event.capacity;
    
    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('teachers_circle_registrations')
      .insert({
        event_id: eventId,
        user_id: userId || null,
        email,
        name,
        phone: phone || null,
        status: isWaitlist ? 'waitlisted' : 'registered',
        consent_photo: consentPhoto || false,
        consent_policy: consentPolicy
      })
      .select()
      .single();
    
    if (regError) {
      console.error('Error creating registration:', regError);
      return c.json({ error: 'Failed to create registration' }, 500);
    }
    
    // TODO: Send confirmation email with calendar invite
    // This would integrate with your email service
    
    return c.json({ 
      registration,
      isWaitlist,
      message: isWaitlist ? 'Added to waitlist' : 'Registration successful'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Cancel registration
app.delete('/registrations/:id', async (c) => {
  try {
    const registrationId = c.req.param('id');
    const authorization = c.req.header('Authorization');
    
    if (!authorization) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const accessToken = authorization.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    // Get registration details
    const { data: registration, error: regError } = await supabase
      .from('teachers_circle_registrations')
      .select('*, events:teachers_circle_events(*)')
      .eq('id', registrationId)
      .single();
    
    if (regError) {
      return c.json({ error: 'Registration not found' }, 404);
    }
    
    // Check if user owns this registration
    if (registration.user_id !== user.id && registration.email !== user.email) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Check cancellation policy (e.g., can't cancel within 24 hours)
    const eventStart = new Date(registration.events.start_at);
    const now = new Date();
    const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilEvent < 24) {
      return c.json({ error: 'Cannot cancel within 24 hours of event' }, 400);
    }
    
    // Update registration status
    const { error: updateError } = await supabase
      .from('teachers_circle_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);
    
    if (updateError) {
      console.error('Error cancelling registration:', updateError);
      return c.json({ error: 'Failed to cancel registration' }, 500);
    }
    
    // TODO: Handle waitlist promotion if there's a waitlist
    
    return c.json({ message: 'Registration cancelled successfully' });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user's registrations
app.get('/my-registrations', async (c) => {
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
    
    const { data: registrations, error } = await supabase
      .from('teachers_circle_registrations')
      .select(`
        *,
        event:teachers_circle_events(*),
        venue:venues(*)
      `)
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching registrations:', error);
      return c.json({ error: 'Failed to fetch registrations' }, 500);
    }
    
    return c.json({ registrations });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { app as teachersCircleApp };
