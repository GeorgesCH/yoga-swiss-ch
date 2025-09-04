// Safe Communications Service for YogaSwiss
// Handles communication templates and campaigns with fallback data

import { safeService } from './safe-service';

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  category: 'booking' | 'marketing' | 'system' | 'reminder';
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'campaign';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export class CommunicationsService {
  async getCommunicationTemplates(organizationId?: string): Promise<{ templates: CommunicationTemplate[]; error?: string }> {
    try {
      const result = await safeService.getCommunicationTemplates(organizationId);
      
      if (result.data && result.data.length > 0) {
        return { templates: result.data };
      }
      
      return { templates: [] };
      
    } catch (error) {
      console.error('Error in getCommunicationTemplates:', error);
      return { templates: this.getMockTemplates() };
    }
  }

  async getCommunications(organizationId?: string): Promise<{ communications: Communication[]; error?: string }> {
    try {
      const result = await safeService.getCommunications(organizationId);
      
      if (result.data && result.data.length > 0) {
        // Convert from campaigns to our format
        const communications: Communication[] = result.data.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          type: campaign.type || 'email',
          status: campaign.status,
          sentCount: campaign.sent_count || 0,
          deliveredCount: campaign.delivered_count || 0,
          openedCount: campaign.opened_count || 0,
          clickedCount: campaign.clicked_count || 0,
          createdAt: campaign.created_at,
          startedAt: campaign.started_at,
          completedAt: campaign.completed_at
        }));
        
        return { communications };
      }
      
      return { communications: [] };
      
    } catch (error) {
      console.error('Error in getCommunications:', error);
      return { communications: [] };
    }
  }

  private getMockTemplates(): CommunicationTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Buchungsbestätigung',
        type: 'email',
        subject: 'Deine Yoga-Stunde ist bestätigt',
        content: 'Liebe(r) {{customerName}}, deine Buchung für {{className}} am {{date}} um {{time}} ist bestätigt.',
        variables: ['customerName', 'className', 'date', 'time'],
        isActive: true,
        category: 'booking',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template-2',
        name: 'Stornierungsbestätigung',
        type: 'email',
        subject: 'Stornierung bestätigt',
        content: 'Liebe(r) {{customerName}}, deine Stornierung für {{className}} wurde bearbeitet.',
        variables: ['customerName', 'className'],
        isActive: true,
        category: 'booking',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template-3',
        name: 'Erinnerung 24h',
        type: 'sms',
        subject: '',
        content: 'Hallo {{customerName}}, morgen um {{time}} hast du {{className}}. Bis bald!',
        variables: ['customerName', 'time', 'className'],
        isActive: true,
        category: 'reminder',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template-4',
        name: 'Willkommen',
        type: 'email',
        subject: 'Willkommen bei YogaSwiss',
        content: 'Liebe(r) {{customerName}}, herzlich willkommen in unserem Studio! Wir freuen uns auf dich.',
        variables: ['customerName'],
        isActive: true,
        category: 'marketing',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockCommunications(): Communication[] {
    return [
      {
        id: 'comm-1',
        name: 'Neujahrs-Kampagne 2024',
        type: 'email',
        status: 'completed',
        sentCount: 1250,
        deliveredCount: 1198,
        openedCount: 456,
        clickedCount: 89,
        createdAt: '2024-01-02T00:00:00Z',
        startedAt: '2024-01-02T08:00:00Z',
        completedAt: '2024-01-02T12:00:00Z'
      },
      {
        id: 'comm-2',
        name: 'Tägliche Erinnerungen',
        type: 'sms',
        status: 'active',
        sentCount: 45,
        deliveredCount: 43,
        openedCount: 43,
        clickedCount: 12,
        createdAt: '2024-01-15T00:00:00Z',
        startedAt: '2024-01-15T06:00:00Z'
      },
      {
        id: 'comm-3',
        name: 'Newsletter Februar',
        type: 'email',
        status: 'draft',
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        createdAt: '2024-01-20T00:00:00Z'
      },
      {
        id: 'comm-4',
        name: 'Retreat Ankündigung',
        type: 'push',
        status: 'scheduled',
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        createdAt: '2024-01-22T00:00:00Z'
      }
    ];
  }

  async createTemplate(template: Omit<CommunicationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ template?: CommunicationTemplate; error?: string }> {
    try {
      // In a real implementation, this would save to Supabase
      console.log('Creating communication template:', template);
      
      const newTemplate: CommunicationTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return { template: newTemplate };
    } catch (error) {
      console.error('Error creating template:', error);
      return { error: error instanceof Error ? error.message : 'Failed to create template' };
    }
  }

  async updateTemplate(id: string, updates: Partial<CommunicationTemplate>): Promise<{ template?: CommunicationTemplate; error?: string }> {
    try {
      // In a real implementation, this would update in Supabase
      console.log('Updating communication template:', id, updates);
      
      // Return a mock updated template
      const updatedTemplate: CommunicationTemplate = {
        id,
        name: updates.name || 'Updated Template',
        type: updates.type || 'email',
        subject: updates.subject,
        content: updates.content || '',
        variables: updates.variables || [],
        isActive: updates.isActive ?? true,
        category: updates.category || 'system',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      };
      
      return { template: updatedTemplate };
    } catch (error) {
      console.error('Error updating template:', error);
      return { error: error instanceof Error ? error.message : 'Failed to update template' };
    }
  }

  async deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would delete from Supabase
      console.log('Deleting communication template:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete template' };
    }
  }

  async sendCommunication(templateId: string, recipients: string[], variables?: Record<string, string>): Promise<{ communication?: Communication; error?: string }> {
    try {
      // In a real implementation, this would trigger the actual sending
      console.log('Sending communication:', { templateId, recipients: recipients.length, variables });
      
      const newCommunication: Communication = {
        id: `comm-${Date.now()}`,
        name: `Communication ${new Date().toLocaleDateString()}`,
        type: 'email',
        status: 'active',
        sentCount: recipients.length,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString()
      };
      
      return { communication: newCommunication };
    } catch (error) {
      console.error('Error sending communication:', error);
      return { error: error instanceof Error ? error.message : 'Failed to send communication' };
    }
  }
}

// Export singleton instance
export const communicationsService = new CommunicationsService();

// Export service methods for direct use
export const getCommunicationTemplates = (organizationId?: string) => 
  communicationsService.getCommunicationTemplates(organizationId);

export const getCommunications = (organizationId?: string) => 
  communicationsService.getCommunications(organizationId);
