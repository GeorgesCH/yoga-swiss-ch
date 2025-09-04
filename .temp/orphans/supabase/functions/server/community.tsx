import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
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

// Initialize storage buckets for community features
async function initializeCommunityStorage() {
  const buckets = [
    'message-attachments-f0b2daa4',
    'message-media-f0b2daa4',
    'message-templates-f0b2daa4'
  ];

  for (const bucketName of buckets) {
    try {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 10485760, // 10MB limit
          allowedMimeTypes: [
            'image/*',
            'application/pdf',
            'text/*',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        });
        
        if (error) {
          console.error(`Error creating bucket ${bucketName}:`, error);
        } else {
          console.log(`Created storage bucket: ${bucketName}`);
        }
      }
    } catch (error) {
      console.error(`Error initializing bucket ${bucketName}:`, error);
    }
  }
}

// Initialize storage on startup
initializeCommunityStorage();

// =====================================================
// THREAD MANAGEMENT
// =====================================================

// Create a new thread
app.post('/make-server-f0b2daa4/community/threads', async (c) => {
  try {
    const { organization_id, type, title, initial_members } = await c.req.json();
    
    if (!organization_id || !type || !title) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create thread in KV store
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const thread = {
      id: threadId,
      organization_id,
      type,
      title,
      created_by: 'system', // Would be actual user in production
      visibility: 'org',
      locked: false,
      archived: false,
      message_count: 0,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await kv.set(`thread:${threadId}`, thread);
    
    // Add initial members
    if (initial_members && Array.isArray(initial_members)) {
      for (const memberId of initial_members) {
        const memberKey = `thread_member:${threadId}:${memberId}`;
        const member = {
          id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          thread_id: threadId,
          user_id: memberId,
          role: 'member',
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
          muted: false,
          notifications_enabled: true
        };
        await kv.set(memberKey, member);
      }
    }

    return c.json({ success: true, thread });
  } catch (error) {
    console.error('Error creating thread:', error);
    return c.json({ error: 'Failed to create thread' }, 500);
  }
});

// Get threads for organization
app.get('/make-server-f0b2daa4/community/threads/:orgId', async (c) => {
  try {
    const orgId = c.req.param('orgId');
    
    // Get all threads for organization
    const threadKeys = await kv.getByPrefix(`thread:`);
    const threads = threadKeys
      .filter(item => item.value.organization_id === orgId && !item.value.archived)
      .map(item => item.value)
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    return c.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return c.json({ error: 'Failed to fetch threads' }, 500);
  }
});

// =====================================================
// MESSAGE MANAGEMENT
// =====================================================

// Send a message
app.post('/make-server-f0b2daa4/community/messages', async (c) => {
  try {
    const { thread_id, body, sender_id, attachments = [] } = await c.req.json();
    
    if (!thread_id || !body || !sender_id) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const messageId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      thread_id,
      sender_id,
      body,
      body_html: body, // Would process markdown in production
      attachments,
      created_at: new Date().toISOString(),
      flagged: false
    };

    await kv.set(`message:${messageId}`, message);
    
    // Update thread last message time and count
    const thread = await kv.get(`thread:${thread_id}`);
    if (thread) {
      thread.last_message_at = new Date().toISOString();
      thread.message_count = (thread.message_count || 0) + 1;
      await kv.set(`thread:${thread_id}`, thread);
    }

    return c.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get messages for thread
app.get('/make-server-f0b2daa4/community/messages/:threadId', async (c) => {
  try {
    const threadId = c.req.param('threadId');
    
    // Get all messages for thread
    const messageKeys = await kv.getByPrefix(`message:`);
    const messages = messageKeys
      .filter(item => item.value.thread_id === threadId && !item.value.deleted_at)
      .map(item => ({
        ...item.value,
        sender: {
          display_name: `User ${item.value.sender_id}`,
          avatar_url: null
        }
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return c.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Flag a message
app.post('/make-server-f0b2daa4/community/messages/:messageId/flag', async (c) => {
  try {
    const messageId = c.req.param('messageId');
    const { reason, reporter_id } = await c.req.json();
    
    if (!reason || !reporter_id) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Update message to flagged
    const message = await kv.get(`message:${messageId}`);
    if (message) {
      message.flagged = true;
      message.flag_reason = reason;
      await kv.set(`message:${messageId}`, message);
    }

    // Create moderation queue entry
    const moderationId = `moderation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const moderationItem = {
      id: moderationId,
      message_id: messageId,
      reason,
      state: 'pending',
      reporter_id,
      created_at: new Date().toISOString()
    };

    await kv.set(`moderation:${moderationId}`, moderationItem);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error flagging message:', error);
    return c.json({ error: 'Failed to flag message' }, 500);
  }
});

// =====================================================
// MODERATION MANAGEMENT
// =====================================================

// Get moderation queue
app.get('/make-server-f0b2daa4/community/moderation/:orgId', async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const state = c.req.query('state') || 'pending';
    
    // Get all moderation items
    const moderationKeys = await kv.getByPrefix(`moderation:`);
    let items = moderationKeys.map(item => item.value);
    
    if (state !== 'all') {
      items = items.filter(item => item.state === state);
    }
    
    // Enrich with message data
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const message = await kv.get(`message:${item.message_id}`);
        return {
          ...item,
          message: message ? {
            ...message,
            sender: { display_name: `User ${message.sender_id}` },
            thread: { title: 'Sample Thread', type: 'discussion' }
          } : null,
          reporter: { display_name: `User ${item.reporter_id}` }
        };
      })
    );

    return c.json({ items: enrichedItems.filter(item => item.message) });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return c.json({ error: 'Failed to fetch moderation queue' }, 500);
  }
});

// Review moderation item
app.put('/make-server-f0b2daa4/community/moderation/:itemId', async (c) => {
  try {
    const itemId = c.req.param('itemId');
    const { state, reviewer_id, notes } = await c.req.json();
    
    if (!state || !reviewer_id) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const moderationItem = await kv.get(`moderation:${itemId}`);
    if (!moderationItem) {
      return c.json({ error: 'Moderation item not found' }, 404);
    }

    // Update moderation item
    moderationItem.state = state;
    moderationItem.reviewed_by = reviewer_id;
    moderationItem.reviewed_at = new Date().toISOString();
    moderationItem.notes = notes;

    await kv.set(`moderation:${itemId}`, moderationItem);

    // If rejected, hide the message
    if (state === 'rejected' && moderationItem.message_id) {
      const message = await kv.get(`message:${moderationItem.message_id}`);
      if (message) {
        message.deleted_at = new Date().toISOString();
        await kv.set(`message:${moderationItem.message_id}`, message);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error reviewing moderation item:', error);
    return c.json({ error: 'Failed to review item' }, 500);
  }
});

// =====================================================
// CLASS INTEGRATION
// =====================================================

// Auto-create thread for class
app.post('/make-server-f0b2daa4/community/class-thread', async (c) => {
  try {
    const { organization_id, class_id, class_name, instructor_id, instructor_name, start_time, roster_ids = [] } = await c.req.json();
    
    if (!organization_id || !class_id || !class_name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create thread for class
    const threadId = `thread_class_${class_id}_${Date.now()}`;
    const thread = {
      id: threadId,
      organization_id,
      type: 'class',
      title: `${class_name} - Class Discussion`,
      context_id: class_id,
      created_by: instructor_id || 'system',
      visibility: 'roster',
      locked: false,
      archived: false,
      message_count: 0,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      auto_created: true,
      class_info: {
        class_id,
        class_name,
        instructor_name,
        start_time
      }
    };

    await kv.set(`thread:${threadId}`, thread);
    
    // Add instructor as owner
    if (instructor_id) {
      const instructorMember = {
        id: `member_${Date.now()}_instructor`,
        thread_id: threadId,
        user_id: instructor_id,
        role: 'owner',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString(),
        muted: false,
        notifications_enabled: true
      };
      await kv.set(`thread_member:${threadId}:${instructor_id}`, instructorMember);
    }

    // Add roster members
    for (let i = 0; i < roster_ids.length; i++) {
      const userId = roster_ids[i];
      const member = {
        id: `member_${Date.now()}_${i}`,
        thread_id: threadId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
        last_read_at: new Date().toISOString(),
        muted: false,
        notifications_enabled: true
      };
      await kv.set(`thread_member:${threadId}:${userId}`, member);
    }

    // Send welcome message
    const welcomeMessageId = `message_${Date.now()}_welcome`;
    const welcomeMessage = {
      id: welcomeMessageId,
      thread_id: threadId,
      sender_id: instructor_id || 'system',
      body: `Namaste! 🙏 Welcome to the ${class_name} discussion. This is your space to ask questions, share insights, and connect with fellow practitioners. I'll be here to guide you through your practice and answer any questions you might have. Let's breathe and grow together!`,
      body_html: `Namaste! 🙏 Welcome to the <strong>${class_name}</strong> discussion. This is your space to ask questions, share insights, and connect with fellow practitioners. I'll be here to guide you through your practice and answer any questions you might have. Let's breathe and grow together!`,
      attachments: [],
      created_at: new Date().toISOString(),
      flagged: false,
      is_welcome_message: true
    };

    await kv.set(`message:${welcomeMessageId}`, welcomeMessage);

    // Update thread message count
    thread.message_count = 1;
    thread.last_message_at = new Date().toISOString();
    await kv.set(`thread:${threadId}`, thread);

    return c.json({ success: true, thread, welcome_message: welcomeMessage });
  } catch (error) {
    console.error('Error creating class thread:', error);
    return c.json({ error: 'Failed to create class thread' }, 500);
  }
});

// Get class threads
app.get('/make-server-f0b2daa4/community/class-threads/:orgId', async (c) => {
  try {
    const orgId = c.req.param('orgId');
    
    // Get all class threads for organization
    const threadKeys = await kv.getByPrefix(`thread:`);
    const classThreads = threadKeys
      .filter(item => 
        item.value.organization_id === orgId && 
        item.value.type === 'class' &&
        !item.value.archived
      )
      .map(item => ({
        ...item.value,
        // Calculate engagement metrics
        engagement_score: Math.random() * 3 + 7, // Demo calculation
        participant_count: Math.floor(Math.random() * 20) + 5
      }))
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    return c.json({ threads: classThreads });
  } catch (error) {
    console.error('Error fetching class threads:', error);
    return c.json({ error: 'Failed to fetch class threads' }, 500);
  }
});

// Archive class thread
app.put('/make-server-f0b2daa4/community/class-thread/:threadId/archive', async (c) => {
  try {
    const threadId = c.req.param('threadId');
    
    const thread = await kv.get(`thread:${threadId}`);
    if (!thread) {
      return c.json({ error: 'Thread not found' }, 404);
    }

    thread.archived = true;
    thread.archived_at = new Date().toISOString();
    
    await kv.set(`thread:${threadId}`, thread);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error archiving class thread:', error);
    return c.json({ error: 'Failed to archive thread' }, 500);
  }
});

// =====================================================
// NOTIFICATIONS
// =====================================================

// Create notification
app.post('/make-server-f0b2daa4/community/notifications', async (c) => {
  try {
    const { user_id, type, priority, title, message, metadata = {} } = await c.req.json();
    
    if (!user_id || !type || !title || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      id: notificationId,
      user_id,
      type,
      priority: priority || 'medium',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionable: !!metadata.action_url || !!metadata.thread_id || !!metadata.class_id,
      source: 'community',
      metadata
    };

    await kv.set(`notification:${notificationId}`, notification);
    await kv.set(`user_notification:${user_id}:${notificationId}`, notification);

    return c.json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

// Get user notifications
app.get('/make-server-f0b2daa4/community/notifications/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const notificationKeys = await kv.getByPrefix(`user_notification:${userId}:`);
    const notifications = notificationKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    const unreadCount = notifications.filter(n => !n.read).length;

    return c.json({ notifications, unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.put('/make-server-f0b2daa4/community/notifications/:notificationId/read', async (c) => {
  try {
    const notificationId = c.req.param('notificationId');
    
    const notification = await kv.get(`notification:${notificationId}`);
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    notification.read = true;
    notification.read_at = new Date().toISOString();

    await kv.set(`notification:${notificationId}`, notification);
    await kv.set(`user_notification:${notification.user_id}:${notificationId}`, notification);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Bulk mark notifications as read
app.put('/make-server-f0b2daa4/community/notifications/:userId/mark-all-read', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const notificationKeys = await kv.getByPrefix(`user_notification:${userId}:`);
    
    for (const item of notificationKeys) {
      if (!item.value.read) {
        item.value.read = true;
        item.value.read_at = new Date().toISOString();
        
        await kv.set(`notification:${item.value.id}`, item.value);
        await kv.set(item.key, item.value);
      }
    }

    return c.json({ success: true, marked_count: notificationKeys.filter(item => !item.value.read).length });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ error: 'Failed to mark notifications as read' }, 500);
  }
});

// =====================================================
// MESSAGE TEMPLATES
// =====================================================

// Get message templates
app.get('/make-server-f0b2daa4/community/templates/:orgId', async (c) => {
  try {
    const orgId = c.req.param('orgId');
    
    // Yoga studio specific templates
    const templates = [
      {
        id: 'welcome-new-student',
        name: 'Welcome New Student',
        category: 'Welcome',
        subject: 'Welcome to YogaSwiss!',
        body: 'Namaste! 🙏 Welcome to our yoga community. We\'re excited to have you join us on this beautiful journey. If you have any questions about classes, poses, or our studio, please don\'t hesitate to ask. Let\'s breathe and grow together!',
        variables: ['student_name', 'studio_name']
      },
      {
        id: 'class-reminder',
        name: 'Class Reminder',
        category: 'Classes',
        subject: 'Your yoga class starts soon',
        body: 'Hi there! 🧘‍♀️ Just a gentle reminder that your {{class_name}} class starts in {{time_until}}. Please arrive 5-10 minutes early to settle in. Don\'t forget your mat and water bottle. See you on the mat!',
        variables: ['class_name', 'time_until', 'instructor_name']
      },
      {
        id: 'class-cancellation',
        name: 'Class Cancellation',
        category: 'Classes',
        subject: 'Class Update',
        body: 'We sincerely apologize, but we need to cancel today\'s {{class_name}} class due to {{reason}}. Your class credit has been automatically restored to your account. You can rebook for another session anytime. Thank you for your understanding! 🙏',
        variables: ['class_name', 'reason', 'instructor_name']
      },
      {
        id: 'workshop-announcement',
        name: 'Workshop Announcement',
        category: 'Events',
        subject: 'Special Workshop Announcement',
        body: 'Exciting news! 🌟 We\'re hosting a special {{workshop_type}} workshop on {{date}} with {{instructor_name}}. This is a wonderful opportunity to deepen your practice and learn new techniques. Early bird discount available until {{early_bird_date}}. Reserve your spot today!',
        variables: ['workshop_type', 'date', 'instructor_name', 'early_bird_date']
      },
      {
        id: 'payment-reminder',
        name: 'Payment Reminder',
        category: 'Billing',
        subject: 'Gentle Payment Reminder',
        body: 'Hello! We hope you\'re enjoying your yoga journey with us. This is a friendly reminder that your payment of CHF {{amount}} for {{service}} is due on {{due_date}}. You can easily pay through TWINT or visit our studio. Thank you for your continued practice with us! 🙏',
        variables: ['amount', 'service', 'due_date']
      },
      {
        id: 'retreat-invitation',
        name: 'Retreat Invitation',
        category: 'Retreats',
        subject: 'Join us for a transformative retreat',
        body: 'Namaste! 🏔️ Escape to the beautiful Swiss mountains for our {{retreat_name}} retreat from {{start_date}} to {{end_date}}. Experience deep yoga practice, meditation, and connection with nature. Limited spaces available. Early bird pricing ends {{early_bird_end}}. Transform your practice in paradise!',
        variables: ['retreat_name', 'start_date', 'end_date', 'location', 'early_bird_end']
      },
      {
        id: 'instructor-substitute',
        name: 'Instructor Substitute',
        category: 'Classes',
        subject: 'Class Update - New Instructor',
        body: 'Hi! Quick update for your {{class_name}} class on {{date}}. {{original_instructor}} won\'t be able to teach today, but the amazing {{substitute_instructor}} will be leading the class instead. Same great energy, same transformative practice! See you there! 🧘‍♂️',
        variables: ['class_name', 'date', 'original_instructor', 'substitute_instructor']
      },
      {
        id: 'membership-renewal',
        name: 'Membership Renewal',
        category: 'Membership',
        subject: 'Time to renew your yoga journey',
        body: 'Your yoga membership expires on {{expiry_date}}. Continue your beautiful practice with us by renewing before {{renewal_deadline}} and enjoy a special {{discount}}% discount! Your yoga journey is important to us, and we\'d love to continue supporting your growth. 🌱',
        variables: ['expiry_date', 'renewal_deadline', 'discount']
      },
      {
        id: 'wellness-tip',
        name: 'Weekly Wellness Tip',
        category: 'Wellness',
        subject: 'Your weekly dose of wellness',
        body: 'Weekly Wisdom 🌟 This week, try incorporating {{tip_focus}} into your daily routine. {{tip_description}} Remember, small consistent steps lead to big transformations. Practice with intention, breathe with awareness. How are you honoring your body today?',
        variables: ['tip_focus', 'tip_description']
      },
      {
        id: 'community-event',
        name: 'Community Event',
        category: 'Community',
        subject: 'Join our yoga community event',
        body: 'You\'re invited! 🎉 Join us for {{event_name}} on {{event_date}} at {{event_time}}. This is a wonderful opportunity to connect with fellow yogis, share experiences, and strengthen our beautiful community. {{event_description}} Light refreshments provided. RSVP by {{rsvp_date}}.',
        variables: ['event_name', 'event_date', 'event_time', 'event_description', 'rsvp_date']
      }
    ];

    return c.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return c.json({ error: 'Failed to fetch templates' }, 500);
  }
});

// =====================================================
// FILE UPLOAD
// =====================================================

// Upload file attachment
app.post('/make-server-f0b2daa4/community/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const threadId = formData.get('threadId') as string;
    
    if (!file || !threadId) {
      return c.json({ error: 'Missing file or thread ID' }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${threadId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    // Upload to storage bucket
    const { data, error } = await supabase.storage
      .from('message-attachments-f0b2daa4')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }

    // Generate signed URL for download
    const { data: urlData } = await supabase.storage
      .from('message-attachments-f0b2daa4')
      .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours

    return c.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        path: fileName,
        url: urlData?.signedUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

export default app;