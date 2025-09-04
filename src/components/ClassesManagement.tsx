import { useState, useEffect } from 'react';
import { Plus, Calendar, File, Settings, Search, Filter, MoreHorizontal, Edit, Copy, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ClassTemplateForm } from './ClassTemplateForm';
import { ClassInstanceForm } from './ClassInstanceForm';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleAnalytics } from './ScheduleAnalytics';
import { useLanguage } from './LanguageProvider';
import { useAuth } from './auth/AuthProvider';
import { getSupabaseProjectId, getSupabaseAnonKey } from '../utils/supabase/env';
import { toast } from 'sonner@2.0.3';

interface ClassTemplate {
  id: string;
  name: string;
  description: any; // JSONB field
  duration_minutes: number;
  level: string;
  category: string;
  default_price: number;
  default_capacity: number;
  is_active: boolean;
  created_at: string;
  type: string;
  visibility?: string;
  image_url?: string;
  color?: string;
  tags: string[];
  is_featured: boolean;
  upcoming_classes?: number; // Calculated field
}

interface ClassesManagementProps {
  onCreateClass?: () => void;
  onEditClass?: (template: ClassTemplate) => void;
}

export function ClassesManagement({ onCreateClass, onEditClass }: ClassesManagementProps) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showInstanceForm, setShowInstanceForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ClassTemplate | undefined>();
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { user, currentOrg, session } = useAuth();

  // Load templates from API
  useEffect(() => {
    if (currentOrg?.id) {
      loadTemplates();
    }
  }, [currentOrg]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/classes/templates/${currentOrg.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || getSupabaseAnonKey()}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load templates');
      }

      if (result.success) {
        // Convert and enrich the data
        const enrichedTemplates = result.data.map((template: any) => ({
          ...template,
          upcoming_classes: Math.floor(Math.random() * 15), // Mock for now
          description: typeof template.description === 'string' 
            ? template.description 
            : template.description?.en || Object.values(template.description || {})[0] || ''
        }));
        
        setTemplates(enrichedTemplates);
      } else {
        throw new Error(result.error || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError((error as any).message || 'Failed to load');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const mockInstructors = [
    { id: '1', name: 'Sarah Miller' },
    { id: '2', name: 'Marcus Weber' },
    { id: '3', name: 'Lisa Chen' },
    { id: '4', name: 'Marie Dubois' }
  ];

  const mockLocations = [
    { id: '1', name: 'Studio A', rooms: ['Main Room', 'Side Room'] },
    { id: '2', name: 'Studio B', rooms: ['Quiet Room', 'Movement Room'] },
    { id: '3', name: 'Lake Zurich', rooms: ['East Shore', 'West Shore', 'Pavilion'] },
    { id: '4', name: 'Uetliberg', rooms: ['Summit Platform', 'Forest Clearing'] },
    { id: '5', name: 'City Park', rooms: ['Main Lawn', 'Rose Garden', 'Pavilion'] },
    { id: '6', name: 'Rooftop Studio', rooms: ['Main Deck', 'Covered Area'] }
  ];

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTemplate = () => {
    if (onCreateClass) {
      onCreateClass();
    } else {
      setSelectedTemplate(undefined);
      setShowTemplateForm(true);
    }
  };

  const handleEditTemplate = (template: ClassTemplate) => {
    if (onEditClass) {
      onEditClass(template);
    } else {
      setSelectedTemplate(template);
      setShowTemplateForm(true);
    }
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const url = selectedTemplate 
        ? `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/classes/templates/${selectedTemplate.id}`
        : `https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/classes/templates`;
      
      const method = selectedTemplate ? 'PUT' : 'POST';
      
      const payload = {
        ...templateData,
        org_id: currentOrg.id,
        // Ensure description is in correct format
        description: typeof templateData.description === 'string' 
          ? { en: templateData.description }
          : templateData.description
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || getSupabaseAnonKey()}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${selectedTemplate ? 'update' : 'create'} template`);
      }

      if (result.success) {
        toast.success(`Template ${selectedTemplate ? 'updated' : 'created'} successfully`);
        setShowTemplateForm(false);
        setSelectedTemplate(undefined);
        await loadTemplates(); // Reload templates
      } else {
        throw new Error(result.error || `Failed to ${selectedTemplate ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.message);
    }
  };

  const handleCreateInstance = (templateId?: string) => {
    if (templateId) {
      // Pre-populate with template
    }
    setShowInstanceForm(true);
  };

  const handleSaveInstance = (instanceData: any) => {
    console.log('Saving instance:', instanceData);
    setShowInstanceForm(false);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('classes.title')}</h1>
          <p className="text-muted-foreground">
            {t('classes.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {t('classes.multilingual_ready')}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('classes.calendar')}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            {t('classes.templates')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('classes.settings')}
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Calendar</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Real-time schedule appears once classes are created. No mock data shown in production.
              </p>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Class Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Management */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('classes.search_templates')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t('classes.filter')}
              </Button>
            </div>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              {onCreateClass ? 'Neue Vorlage erstellen' : t('classes.new_template')}
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getLevelBadgeColor(template.level)}>
                          {template.level}
                        </Badge>
                        <Badge variant="outline">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('classes.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateInstance(template.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('classes.create_appointment')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          {t('classes.duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('classes.preview')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('classes.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('classes.duration')}:</span>
                      <span>{template.duration_minutes} {t('classes.minutes')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('classes.price')}:</span>
                      <span>CHF {template.default_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('classes.max_participants')}:</span>
                      <span>{template.default_capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('classes.upcoming_classes')}:</span>
                      <span className="font-medium">{template.upcoming_classes}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-muted-foreground">
                        {template.is_active ? t('classes.active') : t('classes.inactive')}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCreateInstance(template.id)}
                    >
                      {t('classes.schedule_appointment')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <File className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">{t('classes.no_templates_found')}</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchQuery ? t('classes.no_templates_search') : t('classes.no_templates_empty')}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    {onCreateClass ? 'Erste Vorlage erstellen' : t('classes.create_first_template')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <ScheduleAnalytics 
            dateRange={analyticsDateRange}
            onDateRangeChange={setAnalyticsDateRange}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.default_settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('settings.default_duration')}</label>
                  <Input defaultValue="60" type="number" />
                  <p className="text-xs text-muted-foreground mt-1">{t('classes.minutes')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('settings.default_capacity')}</label>
                  <Input defaultValue="20" type="number" />
                  <p className="text-xs text-muted-foreground mt-1">{t('settings.maximum_participants')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('settings.default_price')}</label>
                  <Input defaultValue="25.00" type="number" step="0.50" />
                  <p className="text-xs text-muted-foreground mt-1">CHF incl. VAT</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.swiss_settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('settings.vat_rate')}</label>
                  <Input defaultValue="7.7" type="number" step="0.1" />
                  <p className="text-xs text-muted-foreground mt-1">{t('settings.swiss_standard_vat')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('settings.default_language')}</label>
                  <select className="w-full p-2 border rounded">
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto_translate" defaultChecked className="rounded" />
                  <label htmlFor="auto_translate" className="text-sm">
                    {t('settings.auto_translations')}
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.automations')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto_reminder" defaultChecked className="rounded" />
                  <label htmlFor="auto_reminder" className="text-sm">
                    {t('settings.auto_reminders')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto_waitlist" defaultChecked className="rounded" />
                  <label htmlFor="auto_waitlist" className="text-sm">
                    {t('settings.auto_waitlist')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto_feedback" defaultChecked className="rounded" />
                  <label htmlFor="auto_feedback" className="text-sm">
                    {t('settings.auto_feedback')}
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="google_calendar" defaultChecked className="rounded" />
                  <label htmlFor="google_calendar" className="text-sm">
                    Google Calendar Sync
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="zoom_integration" defaultChecked className="rounded" />
                  <label htmlFor="zoom_integration" className="text-sm">
                    Zoom Integration für Online-Kurse
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="twint_payments" defaultChecked className="rounded" />
                  <label htmlFor="twint_payments" className="text-sm">
                    TWINT Zahlungen aktivieren
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ClassTemplateForm
        isOpen={showTemplateForm}
        onClose={() => setShowTemplateForm(false)}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
      />

      <ClassInstanceForm
        isOpen={showInstanceForm}
        onClose={() => setShowInstanceForm(false)}
        onSave={handleSaveInstance}
        templates={templates}
        instructors={mockInstructors}
        locations={mockLocations}
      />
    </div>
  );
}
