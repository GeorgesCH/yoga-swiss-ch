import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify authentication
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  const orgId = request.headers.get('X-Org-ID');
  
  if (!accessToken) {
    return { user: null, orgUser: null, error: 'No access token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { user: null, orgUser: null, error: error?.message || 'Invalid token' };
  }

  // If org access is required, verify user belongs to org
  let orgUser = null;
  if (orgId) {
    orgUser = await kv.get(`org_user:${orgId}:${user.id}`);
    if (!orgUser || orgUser.status !== 'active') {
      return { user, orgUser: null, error: 'Access denied to organization' };
    }
  }
  
  return { user, orgUser, error: null };
};

// Generate unique slug
const generateSlug = (title: string, existingSlugs: string[] = []): string => {
  let baseSlug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// =====================================================
// PUBLIC PROGRAM DIRECTORY
// =====================================================

// Get public programs
app.get('/programs/public', async (c) => {
  try {
    const category = c.req.query('category');
    const delivery_mode = c.req.query('delivery_mode');
    const instructor_id = c.req.query('instructor_id');
    const location = c.req.query('location');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    // Demo programs with comprehensive data
    const demoPrograms = [
      {
        id: 'program-evolve-coaching',
        title: 'EVOLVE Holistic Life Coaching',
        slug: 'evolve-holistic-coaching',
        summary: 'Transform your life with personalized coaching sessions focusing on mindset, wellness, and personal growth.',
        category: 'coaching',
        delivery_mode: 'hybrid',
        session_length_min: 90,
        is_multi_session: true,
        default_sessions_count: 8,
        instructor: {
          id: 'instructor-sarah',
          name: 'Sarah Kumar',
          title: 'Certified Life Coach & Wellness Expert',
          rating: 4.9,
          sessions_completed: 450,
          image: '/api/placeholder/150/150'
        },
        variants: [
          {
            id: 'evolve-4pack',
            name: '4-Session Starter Pack',
            sessions_count: 4,
            price: 720.00,
            currency: 'CHF',
            description: 'Perfect for exploring life coaching'
          },
          {
            id: 'evolve-8pack',
            name: '8-Session Transformation',
            sessions_count: 8,
            price: 1280.00,
            currency: 'CHF',
            description: 'Complete transformation program'
          },
          {
            id: 'evolve-12pack',
            name: '12-Session Deep Dive',
            sessions_count: 12,
            price: 1800.00,
            currency: 'CHF',
            description: 'Comprehensive life transformation'
          }
        ],
        featured: true,
        visibility: 'public',
        rating: 4.9,
        review_count: 67,
        thumbnail_url: '/api/placeholder/300/200',
        tags: ['life coaching', 'wellness', 'mindset', 'transformation']
      },
      {
        id: 'program-split-flexibility',
        title: 'SPLIT Grand Écart Training',
        slug: 'split-grand-ecart-training',
        summary: 'Achieve full splits with this specialized flexibility and mobility program designed for all levels.',
        category: 'mobility',
        delivery_mode: 'in_person',
        session_length_min: 75,
        is_multi_session: true,
        default_sessions_count: 12,
        instructor: {
          id: 'instructor-elena',
          name: 'Elena Varga',
          title: 'Movement & Flexibility Specialist',
          rating: 4.8,
          sessions_completed: 280,
          image: '/api/placeholder/150/150'
        },
        variants: [
          {
            id: 'split-beginner-6',
            name: 'Beginner 6-Week Program',
            sessions_count: 6,
            price: 450.00,
            currency: 'CHF',
            description: 'Foundation flexibility training'
          },
          {
            id: 'split-intermediate-12',
            name: 'Intermediate 12-Week Program',
            sessions_count: 12,
            price: 840.00,
            currency: 'CHF',
            description: 'Progress to full splits'
          },
          {
            id: 'split-advanced-18',
            name: 'Advanced 18-Week Mastery',
            sessions_count: 18,
            price: 1200.00,
            currency: 'CHF',
            description: 'Master advanced splits & oversplits'
          }
        ],
        featured: true,
        visibility: 'public',
        rating: 4.8,
        review_count: 43,
        thumbnail_url: '/api/placeholder/300/200',
        tags: ['flexibility', 'splits', 'mobility', 'stretching', 'dance']
      },
      {
        id: 'program-reiki-healing',
        title: 'Reiki Energy Healing Sessions',
        slug: 'reiki-energy-healing',
        summary: 'Experience deep relaxation and energy balancing through traditional Reiki healing techniques.',
        category: 'reiki',
        delivery_mode: 'in_person',
        session_length_min: 60,
        is_multi_session: false,
        default_sessions_count: 1,
        instructor: {
          id: 'instructor-maria',
          name: 'Maria Santos',
          title: 'Reiki Master & Energy Healer',
          rating: 5.0,
          sessions_completed: 650,
          image: '/api/placeholder/150/150'
        },
        variants: [
          {
            id: 'reiki-single',
            name: 'Single Reiki Session',
            sessions_count: 1,
            price: 120.00,
            currency: 'CHF',
            description: 'One healing session'
          },
          {
            id: 'reiki-3pack',
            name: '3-Session Package',
            sessions_count: 3,
            price: 320.00,
            currency: 'CHF',
            description: 'Series for deeper healing'
          }
        ],
        featured: false,
        visibility: 'public',
        rating: 5.0,
        review_count: 89,
        thumbnail_url: '/api/placeholder/300/200',
        tags: ['reiki', 'energy healing', 'relaxation', 'wellness']
      },
      {
        id: 'program-private-yoga',
        title: 'Private Yoga Instruction',
        slug: 'private-yoga-instruction',
        summary: 'Personalized yoga sessions tailored to your specific needs, goals, and level of experience.',
        category: 'private_class',
        delivery_mode: 'hybrid',
        session_length_min: 60,
        is_multi_session: false,
        default_sessions_count: 1,
        instructor: {
          id: 'instructor-david',
          name: 'David Chen',
          title: 'E-RYT 500 Yoga Instructor',
          rating: 4.9,
          sessions_completed: 520,
          image: '/api/placeholder/150/150'
        },
        variants: [
          {
            id: 'private-single',
            name: 'Single Private Session',
            sessions_count: 1,
            price: 150.00,
            currency: 'CHF',
            description: '1-hour personalized session'
          },
          {
            id: 'private-5pack',
            name: '5-Session Package',
            sessions_count: 5,
            price: 700.00,
            currency: 'CHF',
            description: '5 sessions with progression tracking'
          },
          {
            id: 'private-10pack',
            name: '10-Session Program',
            sessions_count: 10,
            price: 1300.00,
            currency: 'CHF',
            description: 'Comprehensive personal practice development'
          }
        ],
        featured: false,
        visibility: 'public',
        rating: 4.9,
        review_count: 156,
        thumbnail_url: '/api/placeholder/300/200',
        tags: ['private yoga', 'personalized', 'one-on-one', 'alignment']
      }
    ];

    let filteredPrograms = demoPrograms;

    // Apply filters
    if (category) {
      filteredPrograms = filteredPrograms.filter(p => p.category === category);
    }
    if (delivery_mode) {
      filteredPrograms = filteredPrograms.filter(p => p.delivery_mode === delivery_mode);
    }
    if (instructor_id) {
      filteredPrograms = filteredPrograms.filter(p => p.instructor.id === instructor_id);
    }

    const total = filteredPrograms.length;
    const paginatedPrograms = filteredPrograms.slice(offset, offset + limit);

    return c.json({
      programs: paginatedPrograms,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
      categories: [
        { value: 'coaching', label: 'Life Coaching', count: 1 },
        { value: 'mobility', label: 'Mobility & Flexibility', count: 1 },
        { value: 'reiki', label: 'Energy Healing', count: 1 },
        { value: 'private_class', label: 'Private Classes', count: 1 },
        { value: 'therapy', label: 'Therapy', count: 0 },
        { value: 'assessment', label: 'Assessments', count: 0 }
      ],
      delivery_modes: [
        { value: 'in_person', label: 'In-Person', count: 2 },
        { value: 'online', label: 'Online', count: 0 },
        { value: 'hybrid', label: 'Hybrid', count: 2 }
      ]
    });

  } catch (error) {
    console.error('Error fetching public programs:', error);
    return c.json({ error: 'Failed to fetch programs' }, 500);
  }
});

// Get program details (public)
app.get('/programs/public/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');

    // Demo detailed program data
    const programDetails: any = {
      'evolve-holistic-coaching': {
        id: 'program-evolve-coaching',
        title: 'EVOLVE Holistic Life Coaching',
        slug: 'evolve-holistic-coaching',
        summary: 'Transform your life with personalized coaching sessions focusing on mindset, wellness, and personal growth.',
        long_description_md: `# Transform Your Life with EVOLVE Coaching

## What is EVOLVE?

EVOLVE is a comprehensive life coaching program designed to help you unlock your full potential and create lasting positive change. Through personalized 1-to-1 sessions, we work together to identify your goals, overcome limiting beliefs, and develop actionable strategies for success.

## What We'll Work On

- **Mindset Transformation**: Identify and overcome limiting beliefs that hold you back
- **Goal Setting & Achievement**: Create clear, actionable plans to reach your objectives  
- **Wellness Integration**: Balance physical, mental, and emotional well-being
- **Relationship Dynamics**: Improve communication and connection with others
- **Career & Purpose**: Align your work with your values and passions
- **Stress Management**: Develop healthy coping strategies and resilience

## The EVOLVE Method

### Assessment Phase (Sessions 1-2)
- Comprehensive life assessment
- Goal clarification and prioritization
- Identification of growth areas
- Custom program design

### Transformation Phase (Sessions 3-6)
- Weekly coaching sessions with homework
- Mindset work and belief restructuring
- Skill building and practice
- Progress tracking and adjustment

### Integration Phase (Sessions 7-8)
- Consolidation of learning
- Long-term planning
- Maintenance strategies
- Celebration of achievements

## Your Coach: Sarah Kumar

Sarah is a certified life coach with over 8 years of experience helping individuals create meaningful change. She combines traditional coaching methods with wellness practices, mindfulness techniques, and practical psychology.

**Qualifications:**
- Certified Professional Coach (CPC)
- Master's in Psychology  
- Mindfulness-Based Stress Reduction (MBSR) Certified
- 450+ successful coaching relationships

## Program Outcomes

Clients typically experience:
- 85% report improved confidence and self-awareness
- 78% achieve their primary goal within the program
- 92% would recommend the program to others
- Significant improvements in stress management and life satisfaction`,
        
        category: 'coaching',
        delivery_mode: 'hybrid',
        session_length_min: 90,
        is_multi_session: true,
        default_sessions_count: 8,
        
        instructor: {
          id: 'instructor-sarah',
          name: 'Sarah Kumar',
          title: 'Certified Life Coach & Wellness Expert',
          bio: 'Sarah specializes in helping high-achievers find balance and purpose. Her approach combines evidence-based coaching techniques with mindfulness and wellness practices.',
          rating: 4.9,
          sessions_completed: 450,
          years_experience: 8,
          specializations: ['Life Coaching', 'Mindfulness', 'Stress Management', 'Career Transition'],
          image: '/api/placeholder/150/150',
          credentials: [
            'Certified Professional Coach (CPC)',
            'Master\'s in Psychology',
            'MBSR Certified',
            'ICF Member'
          ]
        },
        
        variants: [
          {
            id: 'evolve-4pack',
            name: '4-Session Starter Pack',
            sessions_count: 4,
            price: 720.00,
            currency: 'CHF',
            vat_rate: 7.7,
            deposit_amount: 180.00,
            description: 'Perfect for exploring life coaching and making initial breakthroughs',
            includes: [
              '4 x 90-minute coaching sessions',
              'Initial life assessment',
              'Goal-setting workbook',
              'Email support between sessions',
              'Custom action plans'
            ]
          },
          {
            id: 'evolve-8pack',
            name: '8-Session Transformation',
            sessions_count: 8,
            price: 1280.00,
            currency: 'CHF',
            vat_rate: 7.7,
            deposit_amount: 320.00,
            description: 'Complete transformation program for lasting change',
            includes: [
              '8 x 90-minute coaching sessions',
              'Comprehensive life assessment',
              'Goal-setting & tracking tools',
              'Mindset transformation workbook',
              'Weekly email check-ins',
              'Resource library access',
              '30-day post-program support'
            ],
            most_popular: true
          },
          {
            id: 'evolve-12pack',
            name: '12-Session Deep Dive',
            sessions_count: 12,
            price: 1800.00,
            currency: 'CHF',
            vat_rate: 7.7,
            deposit_amount: 450.00,
            description: 'Comprehensive life transformation with extended support',
            includes: [
              '12 x 90-minute coaching sessions',
              'Full psychological assessment',
              'Custom program design',
              'All materials and workbooks',
              'Unlimited email support',
              'Monthly group coaching calls',
              '60-day post-program support',
              'Quarterly check-in sessions'
            ]
          }
        ],
        
        intake_form: {
          required: true,
          fields: [
            { type: 'text', name: 'current_situation', label: 'Describe your current life situation', required: true },
            { type: 'textarea', name: 'goals', label: 'What are your main goals for coaching?', required: true },
            { type: 'select', name: 'main_challenge', label: 'What\'s your biggest challenge right now?', 
              options: ['Career/Work', 'Relationships', 'Self-Confidence', 'Life Direction', 'Stress/Overwhelm', 'Other'], required: true },
            { type: 'textarea', name: 'previous_coaching', label: 'Have you worked with a coach before? What was your experience?', required: false },
            { type: 'select', name: 'commitment_level', label: 'How committed are you to making changes?',
              options: ['Very committed - ready to do the work', 'Moderately committed - willing to try', 'Exploring options'], required: true },
            { type: 'textarea', name: 'support_system', label: 'Describe your current support system', required: false }
          ]
        },
        
        milestones: [
          {
            id: 'milestone-assessment',
            name: 'Life Assessment Completion',
            description: 'Complete comprehensive life wheel assessment',
            due_day_offset: 3,
            milestone_type: 'assessment'
          },
          {
            id: 'milestone-goals',
            name: 'Goal Setting Workshop',
            description: 'Define SMART goals for the program',
            due_session_number: 2,
            milestone_type: 'checkpoint'
          },
          {
            id: 'milestone-midpoint',
            name: 'Midpoint Review',
            description: 'Progress assessment and program adjustment',
            due_session_number: 4,
            milestone_type: 'assessment'
          },
          {
            id: 'milestone-final',
            name: 'Program Completion & Planning',
            description: 'Final assessment and long-term planning',
            due_session_number: 8,
            milestone_type: 'completion'
          }
        ],
        
        availability: {
          monday: { available: true, slots: ['09:00', '11:00', '14:00', '16:00'] },
          tuesday: { available: true, slots: ['09:00', '11:00', '14:00', '16:00'] },
          wednesday: { available: true, slots: ['09:00', '11:00', '14:00'] },
          thursday: { available: true, slots: ['09:00', '11:00', '14:00', '16:00'] },
          friday: { available: true, slots: ['09:00', '11:00'] },
          saturday: { available: false, slots: [] },
          sunday: { available: false, slots: [] }
        },
        
        policies: {
          cancellation: '24 hours notice required. Less than 24 hours = 50% charge. No-show = full session charge.',
          rescheduling: 'Sessions can be rescheduled up to 2 times. Additional rescheduling subject to availability.',
          refunds: 'Refunds available within 7 days of first session. After session 2, no refunds but can pause program.',
          missed_sessions: 'Missed sessions without proper notice forfeit the session. Make-up sessions at coach discretion.'
        },
        
        testimonials: [
          {
            name: 'Jennifer M.',
            rating: 5,
            text: 'Sarah helped me completely transform my relationship with work and stress. The 8-session program was exactly what I needed.',
            program_variant: '8-Session Transformation'
          },
          {
            name: 'Michael R.',
            rating: 5,
            text: 'I was skeptical about coaching, but Sarah\'s approach is so practical and supportive. I achieved clarity I\'d been seeking for years.',
            program_variant: '4-Session Starter Pack'
          },
          {
            name: 'Anna K.',
            rating: 5,
            text: 'The EVOLVE program changed my life. Sarah\'s guidance helped me transition careers and find my true passion.',
            program_variant: '12-Session Deep Dive'
          }
        ],
        
        faq: [
          {
            question: 'How do I prepare for my first session?',
            answer: 'Complete the intake form and life assessment. Come with an open mind and specific goals you\'d like to work on.'
          },
          {
            question: 'Can sessions be conducted online?',
            answer: 'Yes! Sessions can be in-person at our Zurich location or online via secure video call.'
          },
          {
            question: 'What if I need to reschedule?',
            answer: 'Sessions can be rescheduled with 24+ hours notice. Same-day rescheduling depends on availability.'
          },
          {
            question: 'How quickly will I see results?',
            answer: 'Most clients report insights and clarity after the first session. Lasting changes typically emerge around session 3-4.'
          }
        ],
        
        featured: true,
        visibility: 'public',
        rating: 4.9,
        review_count: 67,
        completion_rate: 96,
        satisfaction_score: 4.8
      }
    };

    const program = programDetails[slug];

    if (!program) {
      return c.json({ error: 'Program not found' }, 404);
    }

    return c.json({ program });

  } catch (error) {
    console.error('Error fetching program details:', error);
    return c.json({ error: 'Failed to fetch program details' }, 500);
  }
});

// =====================================================
// BOOKINGS & CHECKOUT
// =====================================================

// Check availability for program booking
app.post('/programs/:programId/check-availability', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Authentication required' }, 401);
    }

    const programId = c.req.param('programId');
    const { variant_id, preferred_dates, timezone } = await c.req.json();

    // Demo availability check
    const availableSlots = [
      { date: '2024-02-15', time: '09:00', instructor: 'Sarah Kumar', location: 'Studio A' },
      { date: '2024-02-15', time: '11:00', instructor: 'Sarah Kumar', location: 'Online' },
      { date: '2024-02-16', time: '14:00', instructor: 'Sarah Kumar', location: 'Studio A' },
      { date: '2024-02-17', time: '09:00', instructor: 'Sarah Kumar', location: 'Studio A' },
      { date: '2024-02-17', time: '16:00', instructor: 'Sarah Kumar', location: 'Online' }
    ];

    return c.json({
      available_slots: availableSlots,
      booking_window: {
        earliest: '2024-02-15',
        latest: '2024-04-15'
      },
      instructor_availability: {
        weekly_hours: 25,
        next_available: '2024-02-15T09:00:00Z'
      }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return c.json({ error: 'Failed to check availability' }, 500);
  }
});

// Create program booking
app.post('/programs/:programId/book', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Authentication required' }, 401);
    }

    const programId = c.req.param('programId');
    const bookingData = await c.req.json();

    // Create booking
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const booking = {
      id: bookingId,
      program_id: programId,
      variant_id: bookingData.variant_id,
      customer_id: user.id,
      instructor_id: bookingData.instructor_id,
      status: 'reserved',
      total_price: bookingData.total_price,
      currency: 'CHF',
      payment_status: 'pending',
      source: bookingData.source || 'direct',
      intake_responses: bookingData.intake_responses || {},
      customer_notes: bookingData.customer_notes,
      private_link_token: crypto.randomUUID(),
      booked_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await kv.set(`program_booking:${bookingId}`, booking);

    // Create sessions if scheduling provided
    if (bookingData.sessions && bookingData.sessions.length > 0) {
      for (let i = 0; i < bookingData.sessions.length; i++) {
        const sessionData = bookingData.sessions[i];
        const sessionId = `session_${bookingId}_${i + 1}`;
        const session = {
          id: sessionId,
          booking_id: bookingId,
          session_number: i + 1,
          starts_at: sessionData.starts_at,
          ends_at: sessionData.ends_at,
          timezone: sessionData.timezone || 'Europe/Zurich',
          location_type: sessionData.location_type,
          location_id: sessionData.location_id,
          meeting_url: sessionData.meeting_url,
          status: 'scheduled',
          created_at: new Date().toISOString()
        };

        await kv.set(`program_session:${sessionId}`, session);
      }
    }

    // Create notification for instructor
    const instructorNotification = {
      id: `notification_${Date.now()}_instructor`,
      type: 'program_booking',
      priority: 'medium',
      title: 'New Program Booking',
      message: `New booking for EVOLVE Coaching program`,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: {
        booking_id: bookingId,
        program_id: programId,
        customer_id: user.id
      }
    };

    await kv.set(`notification:${instructorNotification.id}`, instructorNotification);

    return c.json({ 
      success: true, 
      booking_id: bookingId,
      status: 'reserved',
      message: 'Booking created successfully. Please complete payment to confirm.',
      payment_url: `/checkout/programs/${bookingId}`,
      private_link: `/programs/bookings/${booking.private_link_token}`
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Get customer's program bookings
app.get('/programs/my-bookings', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Authentication required' }, 401);
    }

    // Get all bookings for user
    const bookingKeys = await kv.getByPrefix(`program_booking:`);
    const userBookings = bookingKeys
      .filter(item => item.value.customer_id === user.id)
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ bookings: userBookings });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

// Get all programs for organization (admin)
app.get('/admin/programs', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    // Demo programs for admin
    const adminPrograms = [
      {
        id: 'program-evolve-coaching',
        title: 'EVOLVE Holistic Life Coaching',
        category: 'coaching',
        instructor_name: 'Sarah Kumar',
        status: 'active',
        visibility: 'public',
        total_bookings: 23,
        confirmed_bookings: 18,
        revenue: 23040.00,
        avg_rating: 4.9,
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        id: 'program-split-flexibility',
        title: 'SPLIT Grand Écart Training',
        category: 'mobility',
        instructor_name: 'Elena Varga',
        status: 'active',
        visibility: 'public',
        total_bookings: 15,
        confirmed_bookings: 12,
        revenue: 10080.00,
        avg_rating: 4.8,
        created_at: '2024-01-05T14:30:00Z'
      },
      {
        id: 'program-reiki-healing',
        title: 'Reiki Energy Healing Sessions',
        category: 'reiki',
        instructor_name: 'Maria Santos',
        status: 'active',
        visibility: 'public',
        total_bookings: 45,
        confirmed_bookings: 42,
        revenue: 5040.00,
        avg_rating: 5.0,
        created_at: '2023-12-15T11:00:00Z'
      }
    ];

    return c.json({ 
      programs: adminPrograms,
      total: adminPrograms.length,
      stats: {
        total_programs: 4,
        active_programs: 3,
        total_bookings: 83,
        total_revenue: 38160.00,
        avg_rating: 4.9
      }
    });

  } catch (error) {
    console.error('Error fetching admin programs:', error);
    return c.json({ error: 'Failed to fetch programs' }, 500);
  }
});

// Create new program (admin)
app.post('/admin/programs', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const programData = await c.req.json();
    const programId = `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate unique slug
    const existingPrograms = await kv.getByPrefix(`program:`);
    const existingSlugs = existingPrograms.map(p => p.value.slug);
    const slug = generateSlug(programData.title, existingSlugs);

    const program = {
      id: programId,
      org_id: orgUser.org_id,
      instructor_id: programData.instructor_id,
      title: programData.title,
      slug: slug,
      summary: programData.summary,
      long_description_md: programData.long_description_md,
      category: programData.category,
      delivery_mode: programData.delivery_mode,
      session_length_min: programData.session_length_min || 60,
      is_multi_session: programData.is_multi_session || false,
      default_sessions_count: programData.default_sessions_count || 1,
      visibility: 'draft',
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: user.id
    };

    await kv.set(`program:${programId}`, program);

    return c.json({ success: true, program_id: programId, program });

  } catch (error) {
    console.error('Error creating program:', error);
    return c.json({ error: 'Failed to create program' }, 500);
  }
});

// Update program (admin)
app.put('/admin/programs/:programId', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const programId = c.req.param('programId');
    const updateData = await c.req.json();

    const program = await kv.get(`program:${programId}`);
    if (!program || program.org_id !== orgUser.org_id) {
      return c.json({ error: 'Program not found' }, 404);
    }

    const updatedProgram = {
      ...program,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    await kv.set(`program:${programId}`, updatedProgram);

    return c.json({ success: true, program: updatedProgram });

  } catch (error) {
    console.error('Error updating program:', error);
    return c.json({ error: 'Failed to update program' }, 500);
  }
});

// Get program bookings (admin)
app.get('/admin/programs/:programId/bookings', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const programId = c.req.param('programId');
    const status = c.req.query('status') || 'all';

    // Get all bookings for program
    const bookingKeys = await kv.getByPrefix(`program_booking:`);
    let bookings = bookingKeys
      .filter(item => item.value.program_id === programId)
      .map(item => item.value);

    if (status !== 'all') {
      bookings = bookings.filter(booking => booking.status === status);
    }

    // Sort by booking date
    bookings.sort((a, b) => new Date(b.booked_at || b.created_at).getTime() - new Date(a.booked_at || a.created_at).getTime());

    return c.json({ bookings });

  } catch (error) {
    console.error('Error fetching program bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Update booking status (admin)
app.put('/admin/bookings/:bookingId/status', async (c) => {
  try {
    const { user, orgUser, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !orgUser) {
      return c.json({ error: authError || 'Admin access required' }, 401);
    }

    const bookingId = c.req.param('bookingId');
    const { status, admin_notes } = await c.req.json();

    const booking = await kv.get(`program_booking:${bookingId}`);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Update booking
    booking.status = status;
    booking.admin_notes = admin_notes;
    booking.status_updated_at = new Date().toISOString();
    
    if (status === 'confirmed') {
      booking.confirmed_at = new Date().toISOString();
      booking.payment_status = 'paid';
    } else if (status === 'completed') {
      booking.completed_at = new Date().toISOString();
    }

    await kv.set(`program_booking:${bookingId}`, booking);

    return c.json({ success: true, booking });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return c.json({ error: 'Failed to update booking status' }, 500);
  }
});

export default app;
