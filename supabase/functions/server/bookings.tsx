import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { supabaseAdmin } from './auth.tsx';

const bookings = new Hono();

// CORS configuration
bookings.use('*', cors({
  origin: ['https://*.supabase.co', 'https://*.vercel.app', 'https://*.netlify.app'],
  credentials: true,
}));

// ==================== REGISTRATIONS ====================

// Get registrations with filters
bookings.get('/registrations/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const { status, customer_id, class_id, date_from, date_to, limit = 50 } = c.req.query();

    let query = supabaseAdmin
      .from('registrations')
      .select(`
        *,
        class_occurrence:occurrence_id (
          id, start_time, end_time, capacity, booked_count,
          class_template:template_id (
            id, name, type, category, level, duration_minutes
          ),
          instructor:instructor_id (
            id, first_name, last_name, email
          ),
          location:location_id (
            id, name, type, capacity
          )
        ),
        customer:customer_id (
          id, first_name, last_name, email, phone
        )
      `)
      .eq('org_id', org_id);

    if (status) query = query.eq('status', status);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (class_id) query = query.eq('occurrence_id', class_id);
    if (date_from) query = query.gte('booked_at', date_from);
    if (date_to) query = query.lte('booked_at', date_to);
    
    query = query.order('booked_at', { ascending: false }).limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch registrations:', error);
      return c.json({ error: 'Failed to fetch registrations' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create registration (booking)
bookings.post('/registrations/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const body = await c.req.json();
    const { 
      occurrence_id, 
      customer_id, 
      payment_method = 'pending',
      notes,
      use_credits = false,
      credits_to_use = 0
    } = body;

    // Check class availability
    const { data: occurrence, error: occurrenceError } = await supabaseAdmin
      .from('class_occurrences')
      .select('*')
      .eq('id', occurrence_id)
      .eq('org_id', org_id)
      .single();

    if (occurrenceError || !occurrence) {
      return c.json({ error: 'Class not found' }, 404);
    }

    if (occurrence.status !== 'scheduled') {
      return c.json({ error: 'Class is not available for booking' }, 400);
    }

    if (occurrence.booked_count >= occurrence.capacity) {
      // Add to waitlist
      const waitlist_position = occurrence.waitlist_count + 1;
      
      const { data: registration, error: regError } = await supabaseAdmin
        .from('registrations')
        .insert({
          org_id,
          occurrence_id,
          customer_id,
          status: 'waitlisted',
          waitlist_position,
          payment_status: 'pending',
          notes
        })
        .select()
        .single();

      if (regError) {
        console.error('Failed to create waitlist registration:', regError);
        return c.json({ error: 'Failed to add to waitlist' }, 500);
      }

      // Update waitlist count
      await supabaseAdmin
        .from('class_occurrences')
        .update({ waitlist_count: occurrence.waitlist_count + 1 })
        .eq('id', occurrence_id);

      return c.json({ 
        success: true, 
        data: registration,
        waitlisted: true,
        position: waitlist_position
      });
    }

    // Create confirmed registration
    const registration_data: any = {
      org_id,
      occurrence_id,
      customer_id,
      status: 'confirmed',
      payment_status: use_credits ? 'paid' : 'pending',
      payment_method: use_credits ? 'credits' : payment_method,
      notes
    };

    const { data: registration, error: regError } = await supabaseAdmin
      .from('registrations')
      .insert(registration_data)
      .select()
      .single();

    if (regError) {
      console.error('Failed to create registration:', regError);
      return c.json({ error: 'Failed to create registration' }, 500);
    }

    // Update booked count
    await supabaseAdmin
      .from('class_occurrences')
      .update({ booked_count: occurrence.booked_count + 1 })
      .eq('id', occurrence_id);

    // If using credits, deduct from customer wallet
    if (use_credits && credits_to_use > 0) {
      await supabaseAdmin.rpc('deduct_wallet_credits', {
        p_customer_id: customer_id,
        p_org_id: org_id,
        p_credits: credits_to_use,
        p_reference_type: 'class_booking',
        p_reference_id: registration.id
      });
    }

    return c.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error creating registration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Cancel registration
bookings.post('/registrations/:registration_id/cancel', async (c) => {
  try {
    const registration_id = c.req.param('registration_id');
    const body = await c.req.json();
    const { reason, refund_amount_cents = 0 } = body;

    // Get registration details
    const { data: registration, error: regError } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        class_occurrence:occurrence_id (
          id, booked_count, waitlist_count, capacity
        )
      `)
      .eq('id', registration_id)
      .single();

    if (regError || !registration) {
      return c.json({ error: 'Registration not found' }, 404);
    }

    // Update registration status
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        notes: registration.notes ? `${registration.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`
      })
      .eq('id', registration_id);

    if (updateError) {
      console.error('Failed to update registration:', updateError);
      return c.json({ error: 'Failed to cancel registration' }, 500);
    }

    const occurrence = registration.class_occurrence;

    // Update class counts if confirmed booking
    if (registration.status === 'confirmed') {
      await supabaseAdmin
        .from('class_occurrences')
        .update({ booked_count: Math.max(0, occurrence.booked_count - 1) })
        .eq('id', registration.occurrence_id);

      // Move waitlisted customers up if there's space
      if (occurrence.waitlist_count > 0) {
        const { data: waitlistCustomers, error: waitlistError } = await supabaseAdmin
          .from('registrations')
          .select('*')
          .eq('occurrence_id', registration.occurrence_id)
          .eq('status', 'waitlisted')
          .order('waitlist_position')
          .limit(1);

        if (!waitlistError && waitlistCustomers && waitlistCustomers.length > 0) {
          const nextCustomer = waitlistCustomers[0];
          
          // Confirm the next waitlisted customer
          await supabaseAdmin
            .from('registrations')
            .update({
              status: 'confirmed',
              waitlist_position: null,
              payment_status: 'pending'
            })
            .eq('id', nextCustomer.id);

          // Update counts
          await supabaseAdmin
            .from('class_occurrences')
            .update({ 
              booked_count: occurrence.booked_count,
              waitlist_count: occurrence.waitlist_count - 1
            })
            .eq('id', registration.occurrence_id);
        }
      }
    } else if (registration.status === 'waitlisted') {
      // Update waitlist positions for customers below
      await supabaseAdmin.rpc('update_waitlist_positions', {
        p_occurrence_id: registration.occurrence_id,
        p_cancelled_position: registration.waitlist_position
      });

      await supabaseAdmin
        .from('class_occurrences')
        .update({ waitlist_count: Math.max(0, occurrence.waitlist_count - 1) })
        .eq('id', registration.occurrence_id);
    }

    // Process refund if applicable
    if (refund_amount_cents > 0) {
      await supabaseAdmin
        .from('refunds')
        .insert({
          tenant_id: registration.org_id,
          order_id: null, // Would link to order if available
          amount_cents: refund_amount_cents,
          currency: 'CHF',
          reason: 'Class cancellation',
          status: 'pending',
          initiated_by: 'customer'
        });
    }

    return c.json({ success: true, message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Check-in customer
bookings.post('/registrations/:registration_id/checkin', async (c) => {
  try {
    const registration_id = c.req.param('registration_id');

    const { error } = await supabaseAdmin
      .from('registrations')
      .update({
        status: 'attended',
        check_in_time: new Date().toISOString()
      })
      .eq('id', registration_id)
      .eq('status', 'confirmed');

    if (error) {
      console.error('Failed to check-in customer:', error);
      return c.json({ error: 'Failed to check-in customer' }, 500);
    }

    return c.json({ success: true, message: 'Customer checked in successfully' });
  } catch (error) {
    console.error('Error checking in customer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== WAITLIST MANAGEMENT ====================

// Get waitlist for a class
bookings.get('/classes/:class_id/waitlist', async (c) => {
  try {
    const class_id = c.req.param('class_id');

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        customer:customer_id (
          id, first_name, last_name, email, phone
        )
      `)
      .eq('occurrence_id', class_id)
      .eq('status', 'waitlisted')
      .order('waitlist_position');

    if (error) {
      console.error('Failed to fetch waitlist:', error);
      return c.json({ error: 'Failed to fetch waitlist' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Promote waitlisted customer
bookings.post('/waitlist/:registration_id/promote', async (c) => {
  try {
    const registration_id = c.req.param('registration_id');

    // Get registration and class details
    const { data: registration, error: regError } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        class_occurrence:occurrence_id (
          id, capacity, booked_count
        )
      `)
      .eq('id', registration_id)
      .eq('status', 'waitlisted')
      .single();

    if (regError || !registration) {
      return c.json({ error: 'Waitlisted registration not found' }, 404);
    }

    const occurrence = registration.class_occurrence;
    
    if (occurrence.booked_count >= occurrence.capacity) {
      return c.json({ error: 'Class is still full' }, 400);
    }

    // Promote customer
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({
        status: 'confirmed',
        waitlist_position: null,
        payment_status: 'pending'
      })
      .eq('id', registration_id);

    if (updateError) {
      console.error('Failed to promote customer:', updateError);
      return c.json({ error: 'Failed to promote customer' }, 500);
    }

    // Update class counts
    await supabaseAdmin
      .from('class_occurrences')
      .update({
        booked_count: occurrence.booked_count + 1,
        waitlist_count: Math.max(0, occurrence.waitlist_count - 1)
      })
      .eq('id', registration.occurrence_id);

    // Update waitlist positions for remaining customers
    await supabaseAdmin.rpc('update_waitlist_positions', {
      p_occurrence_id: registration.occurrence_id,
      p_cancelled_position: registration.waitlist_position
    });

    return c.json({ success: true, message: 'Customer promoted from waitlist' });
  } catch (error) {
    console.error('Error promoting from waitlist:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== BOOKING ANALYTICS ====================

// Get booking statistics
bookings.get('/analytics/bookings/:org_id', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const { period = '30d' } = c.req.query();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get booking data
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        class_occurrence:occurrence_id (
          start_time,
          class_template:template_id (
            category, type
          )
        )
      `)
      .eq('org_id', org_id)
      .gte('booked_at', startDate.toISOString())
      .lte('booked_at', endDate.toISOString());

    if (regError) {
      console.error('Failed to fetch registration analytics:', regError);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }

    // Process analytics
    const totalBookings = registrations?.length || 0;
    const confirmedBookings = registrations?.filter(r => r.status === 'confirmed').length || 0;
    const cancelledBookings = registrations?.filter(r => r.status === 'cancelled').length || 0;
    const noShows = registrations?.filter(r => r.status === 'no_show').length || 0;
    const attendanceRate = confirmedBookings > 0 ? 
      ((registrations?.filter(r => r.status === 'attended').length || 0) / confirmedBookings * 100) : 0;

    // Booking trends by day
    const bookingsByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayBookings = registrations?.filter(r => 
        new Date(r.booked_at).toDateString() === date.toDateString()
      ).length || 0;
      
      return {
        date: date.toISOString().split('T')[0],
        bookings: dayBookings
      };
    });

    // Popular class categories
    const categoryStats = registrations?.reduce((acc: any, reg) => {
      const category = reg.class_occurrence?.class_template?.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {}) || {};

    const analytics = {
      summary: {
        total_bookings: totalBookings,
        confirmed_bookings: confirmedBookings,
        cancelled_bookings: cancelledBookings,
        no_shows: noShows,
        attendance_rate: attendanceRate.toFixed(1),
        cancellation_rate: totalBookings > 0 ? (cancelledBookings / totalBookings * 100).toFixed(1) : '0'
      },
      trends: {
        bookings_by_day: bookingsByDay
      },
      categories: Object.entries(categoryStats).map(([category, count]) => ({
        category,
        bookings: count
      })).sort((a: any, b: any) => b.bookings - a.bookings)
    };

    return c.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching booking analytics:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default bookings;