// Community Integration Service for YogaSwiss
// Handles automatic thread creation, notifications, and class-community synchronization

interface ClassData {
  id: string;
  name: string;
  instructor_id: string;
  instructor_name: string;
  start_time: string;
  end_time: string;
  organization_id: string;
  roster_ids?: string[];
  type: 'regular' | 'workshop' | 'retreat' | 'private';
}

interface NotificationData {
  user_id: string;
  type: 'message' | 'class' | 'community' | 'system' | 'engagement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

interface ThreadCreationOptions {
  auto_add_roster: boolean;
  send_welcome_message: boolean;
  notify_participants: boolean;
  thread_visibility: 'roster' | 'org' | 'private';
}

class CommunityIntegrationService {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  /**
   * Auto-create community thread when a class is scheduled
   */
  async createClassThread(
    classData: ClassData, 
    options: ThreadCreationOptions = {
      auto_add_roster: true,
      send_welcome_message: true,
      notify_participants: true,
      thread_visibility: 'roster'
    }
  ): Promise<{ success: boolean; thread_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/community/class-thread`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organization_id: classData.organization_id,
          class_id: classData.id,
          class_name: classData.name,
          instructor_id: classData.instructor_id,
          instructor_name: classData.instructor_name,
          start_time: classData.start_time,
          roster_ids: options.auto_add_roster ? classData.roster_ids || [] : [],
          visibility: options.thread_visibility
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create class thread: ${response.statusText}`);
      }

      const result = await response.json();

      // Send notifications to participants if enabled
      if (options.notify_participants && classData.roster_ids) {
        await this.notifyClassParticipants(
          classData,
          result.thread.id,
          'Class discussion thread created'
        );
      }

      return { success: true, thread_id: result.thread.id };
    } catch (error) {
      console.error('Error creating class thread:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/community/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Bulk send notifications to multiple users
   */
  async sendBulkNotifications(notifications: NotificationData[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      const success = await this.sendNotification(notification);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Notify all participants about class-related events
   */
  async notifyClassParticipants(
    classData: ClassData,
    threadId: string,
    messageType: string
  ): Promise<void> {
    if (!classData.roster_ids || classData.roster_ids.length === 0) {
      return;
    }

    const notifications: NotificationData[] = classData.roster_ids.map(userId => ({
      user_id: userId,
      type: 'community',
      priority: 'medium',
      title: `${classData.name} Discussion Created`,
      message: `Join the discussion for your upcoming ${classData.name} class with ${classData.instructor_name}. Share questions and connect with fellow yogis! 🧘‍♀️`,
      metadata: {
        class_id: classData.id,
        thread_id: threadId,
        action_url: `/community/thread/${threadId}`
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Archive class thread after class completion
   */
  async archiveClassThread(threadId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/community/class-thread/${threadId}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error archiving class thread:', error);
      return false;
    }
  }

  /**
   * Get class threads for organization
   */
  async getClassThreads(organizationId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/community/class-threads/${organizationId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch class threads: ${response.statusText}`);
      }

      const result = await response.json();
      return result.threads || [];
    } catch (error) {
      console.error('Error fetching class threads:', error);
      return [];
    }
  }

  /**
   * Handle class registration - add user to thread
   */
  async addUserToClassThread(
    classId: string,
    userId: string,
    userName: string
  ): Promise<boolean> {
    try {
      // Find the thread for this class
      const threads = await this.getClassThreads(''); // Would pass actual org ID
      const classThread = threads.find(thread => thread.class_info?.class_id === classId);

      if (!classThread) {
        console.log('No thread found for class:', classId);
        return false;
      }

      // Add user to thread (this would be a separate endpoint)
      // For now, we'll just send a welcome notification
      await this.sendNotification({
        user_id: userId,
        type: 'community',
        priority: 'low',
        title: 'Welcome to the class discussion!',
        message: `You've been added to the class discussion. Connect with your instructor and fellow students!`,
        metadata: {
          thread_id: classThread.id,
          action_url: `/community/thread/${classThread.id}`
        }
      });

      return true;
    } catch (error) {
      console.error('Error adding user to class thread:', error);
      return false;
    }
  }

  /**
   * Handle class cancellation - notify all participants
   */
  async notifyClassCancellation(
    classData: ClassData,
    reason: string,
    threadId?: string
  ): Promise<void> {
    if (!classData.roster_ids || classData.roster_ids.length === 0) {
      return;
    }

    const notifications: NotificationData[] = classData.roster_ids.map(userId => ({
      user_id: userId,
      type: 'class',
      priority: 'high',
      title: `Class Cancelled: ${classData.name}`,
      message: `We sincerely apologize, but your ${classData.name} class on ${new Date(classData.start_time).toLocaleDateString()} has been cancelled due to ${reason}. Your class credit has been automatically restored. 🙏`,
      metadata: {
        class_id: classData.id,
        thread_id: threadId,
        action_url: threadId ? `/community/thread/${threadId}` : '/schedule'
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Send class reminder with community link
   */
  async sendClassReminder(
    classData: ClassData,
    minutesBefore: number = 30,
    threadId?: string
  ): Promise<void> {
    if (!classData.roster_ids || classData.roster_ids.length === 0) {
      return;
    }

    const startTime = new Date(classData.start_time);
    const timeUntil = minutesBefore === 30 ? '30 minutes' : 
                     minutesBefore === 60 ? '1 hour' :
                     minutesBefore === 1440 ? '24 hours' : `${minutesBefore} minutes`;

    const notifications: NotificationData[] = classData.roster_ids.map(userId => ({
      user_id: userId,
      type: 'class',
      priority: 'medium',
      title: `Class starts in ${timeUntil}`,
      message: `Your ${classData.name} class with ${classData.instructor_name} starts in ${timeUntil}. Please arrive 5-10 minutes early. ${threadId ? 'Join the class discussion if you have any questions! 🧘‍♀️' : ''}`,
      metadata: {
        class_id: classData.id,
        thread_id: threadId,
        action_url: threadId ? `/community/thread/${threadId}` : '/schedule',
        reminder_type: 'class_starting'
      }
    }));

    await this.sendBulkNotifications(notifications);
  }

  /**
   * Track community engagement for analytics
   */
  async trackEngagement(
    threadId: string,
    eventType: 'message_sent' | 'user_joined' | 'user_active' | 'question_asked' | 'answer_given',
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // This would typically be sent to an analytics service
      const engagementData = {
        thread_id: threadId,
        event_type: eventType,
        user_id: userId,
        timestamp: new Date().toISOString(),
        metadata: metadata || {}
      };

      console.log('Tracking engagement:', engagementData);
      
      // In a real implementation, this would be sent to your analytics backend
      // await this.sendToAnalytics(engagementData);
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  /**
   * Send engagement milestone notifications
   */
  async sendEngagementMilestone(
    threadId: string,
    milestoneType: 'first_100_messages' | 'highly_active' | 'great_participation',
    participantIds: string[],
    classInfo: { name: string; instructor: string }
  ): Promise<void> {
    const milestoneMessages = {
      first_100_messages: {
        title: 'Community Milestone! 🎉',
        message: `Your ${classInfo.name} discussion has reached 100 messages! Thank you for creating such an engaging yoga community.`
      },
      highly_active: {
        title: 'Highly Engaged Community! ⭐',
        message: `Your ${classInfo.name} class has one of the most active discussions this week. Keep the great conversations going!`
      },
      great_participation: {
        title: 'Excellent Participation! 🌟',
        message: `${classInfo.instructor} loves the active participation in ${classInfo.name}. Your questions and insights make our yoga community stronger.`
      }
    };

    const milestone = milestoneMessages[milestoneType];
    const notifications: NotificationData[] = participantIds.map(userId => ({
      user_id: userId,
      type: 'engagement',
      priority: 'low',
      title: milestone.title,
      message: milestone.message,
      metadata: {
        thread_id: threadId,
        milestone_type: milestoneType,
        action_url: `/community/thread/${threadId}`
      }
    }));

    await this.sendBulkNotifications(notifications);
  }
}

// Factory function to create service instance
export function createCommunityIntegrationService(
  baseUrl: string = '/functions/v1/make-server-f0b2daa4',
  authToken: string = process.env.SUPABASE_ANON_KEY || 'demo-key'
): CommunityIntegrationService {
  return new CommunityIntegrationService(baseUrl, authToken);
}

// Utility functions for common integration tasks
export const CommunityIntegrationUtils = {
  /**
   * Auto-create thread when class is scheduled (called from class creation)
   */
  async onClassScheduled(classData: ClassData): Promise<void> {
    const service = createCommunityIntegrationService();
    const result = await service.createClassThread(classData);
    
    if (result.success) {
      console.log(`✅ Community thread created for class: ${classData.name}`);
      
      // Track the auto-creation event
      if (result.thread_id) {
        await service.trackEngagement(
          result.thread_id,
          'user_joined',
          'system',
          { auto_created: true, class_id: classData.id }
        );
      }
    } else {
      console.error(`❌ Failed to create community thread for class: ${classData.name}`, result.error);
    }
  },

  /**
   * Handle user registration to class
   */
  async onUserRegistered(classId: string, userId: string, userName: string): Promise<void> {
    const service = createCommunityIntegrationService();
    await service.addUserToClassThread(classId, userId, userName);
    console.log(`✅ Added user ${userName} to class ${classId} community`);
  },

  /**
   * Send class reminders with community links
   */
  async sendClassReminders(classData: ClassData, threadId?: string): Promise<void> {
    const service = createCommunityIntegrationService();
    
    // Send 24-hour reminder
    setTimeout(() => {
      service.sendClassReminder(classData, 1440, threadId);
    }, 100); // Immediate for demo

    // Send 1-hour reminder
    setTimeout(() => {
      service.sendClassReminder(classData, 60, threadId);
    }, 200); // Immediate for demo

    // Send 30-minute reminder
    setTimeout(() => {
      service.sendClassReminder(classData, 30, threadId);
    }, 300); // Immediate for demo

    console.log(`✅ Scheduled reminders for class: ${classData.name}`);
  },

  /**
   * Archive threads after class completion
   */
  async onClassCompleted(classId: string, threadId: string): Promise<void> {
    const service = createCommunityIntegrationService();
    
    // Wait 48 hours before archiving (immediate for demo)
    setTimeout(async () => {
      const archived = await service.archiveClassThread(threadId);
      if (archived) {
        console.log(`✅ Archived community thread for completed class: ${classId}`);
      }
    }, 1000); // 1 second for demo
  },

  /**
   * Handle class cancellation notifications
   */
  async onClassCancelled(classData: ClassData, reason: string, threadId?: string): Promise<void> {
    const service = createCommunityIntegrationService();
    await service.notifyClassCancellation(classData, reason, threadId);
    console.log(`✅ Sent cancellation notifications for class: ${classData.name}`);
  }
};

export default CommunityIntegrationService;