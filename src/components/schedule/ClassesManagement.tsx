import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Plus, Search, Filter, Calendar, Users, Clock, MapPin, Edit, Trash2, Copy, MoreHorizontal, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { AdvancedScheduleFilters } from './AdvancedScheduleFilters';
import { ClassDetailDialog } from '../ClassDetailDialog';
import { BulkActionsDialog } from '../BulkActionsDialog';
import { ScheduleCalendar } from '../ScheduleCalendar';
import { ScheduleAnalytics } from '../ScheduleAnalytics';
import { classesService } from '../../utils/supabase/classes-service';
import { Alert, AlertDescription } from '../ui/alert';

interface ClassTemplate {
  id: string;
  name: string;
  type: string;
  duration_minutes: number;
  default_capacity: number;
  instructor: string;
  location: string;
  recurrence: string | null;
  default_price: number;
  is_active: boolean;
  draft_mode: boolean;
  description?: Record<string, string>;
  level: string;
  tags?: string[];
  bookings: number;
  waitlist: number;
  nextSession?: string;
  category: string;
  visibility: 'public' | 'private' | 'members_only';
}

interface ClassesManagementProps {
  onCreateClass: () => void;
  onEditClass: (template: ClassTemplate) => void;
}

export function ClassesManagement({ onCreateClass, onEditClass }: ClassesManagementProps) {
  const [view, setView] = useState<'calendar' | 'list' | 'analytics'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ClassTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [classTemplates, setClassTemplates] = useState<ClassTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { currentOrg } = useMultiTenantAuth();

  // Load class templates on component mount
  useEffect(() => {
    loadClassTemplates();
  }, [currentOrg]);

  const loadClassTemplates = async () => {
    if (!currentOrg?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const templates = await classesService.getClassTemplates(currentOrg.id, {
        is_active: true
      });
      
      // Transform data to match UI interface
      const transformedTemplates: ClassTemplate[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.category || 'Yoga',
        duration_minutes: template.duration_minutes,
        default_capacity: template.default_capacity,
        instructor: 'Loading...', // Would need to join with user_profiles
        location: 'Loading...', // Would need to join with locations
        recurrence: null, // Would come from class_instances
        default_price: template.default_price,
        is_active: template.is_active,
        draft_mode: template.draft_mode || false,
        description: template.description,
        level: template.level || 'All Levels',
        tags: template.tags,
        bookings: 0, // Would need to calculate from registrations
        waitlist: 0, // Would need to calculate from waitlist_entries
        nextSession: undefined, // Would come from class_occurrences
        category: template.category,
        visibility: template.visibility || 'public'
      }));
      
      setClassTemplates(transformedTemplates);
    } catch (err) {
      console.error('Error loading class templates:', err);
      setError('Failed to load class templates');
      // Keep using empty array in case of error
      setClassTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!currentOrg?.id) return;
    
    try {
      // In a real implementation, you'd want to show a confirmation dialog first
      const confirm = window.confirm('Are you sure you want to delete this class template?');
      if (!confirm) return;
      
      // Note: We don't have a delete method in the service yet, 
      // but we'd typically update is_active to false instead of hard delete
      await classesService.updateClassTemplate(classId, { is_active: false });
      
      // Reload templates
      loadClassTemplates();
    } catch (err) {
      setError('Failed to delete class template');
      console.error('Error deleting class:', err);
    }
  };

  const handleDuplicateClass = async (template: ClassTemplate) => {
    if (!currentOrg?.id) return;
    
    try {
      // Create a duplicate template
      const duplicateData = {
        name: `${template.name} (Copy)`,
        category: template.category,
        level: template.level,
        duration_minutes: template.duration_minutes,
        description: template.description,
        default_price: template.default_price,
        default_capacity: template.default_capacity,
        tags: template.tags,
        visibility: template.visibility,
        is_active: false, // Create as draft
        draft_mode: true
      };
      
      await classesService.createClassTemplate(currentOrg.id, duplicateData);
      
      // Reload templates
      loadClassTemplates();
    } catch (err) {
      setError('Failed to duplicate class template');
      console.error('Error duplicating class:', err);
    }
  };

  const toggleClassSelection = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const filteredTemplates = classTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('schedule.title')}</h1>
          <p className="text-muted-foreground">
            {t('schedule.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView('calendar')}
            className={view === 'calendar' ? 'bg-muted' : ''}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {t('schedule.calendar_view')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-muted' : ''}
          >
            {t('schedule.list_view')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView('analytics')}
            className={view === 'analytics' ? 'bg-muted' : ''}
          >
            {t('schedule.analytics')}
          </Button>
          <Button onClick={onCreateClass}>
            <Plus className="h-4 w-4 mr-2" />
            {t('schedule.create_class')}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('schedule.search_classes')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {t('schedule.filters')}
        </Button>
        {selectedClasses.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(true)}
          >
            {t('schedule.bulk_actions')} ({selectedClasses.length})
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedScheduleFilters onClose={() => setShowFilters(false)} />
      )}

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={loadClassTemplates}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading class templates...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {view === 'calendar' && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Calendar</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Real-time schedule appears once classes are created. No mock data shown in production.
                </p>
                <Button onClick={onCreateClass}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Class Template
                </Button>
              </CardContent>
            </Card>
          )}

          {view === 'analytics' && (
            <ScheduleAnalytics />
          )}

          {view === 'list' && (
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(template.id)}
                          onChange={() => toggleClassSelection(template.id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant={
                              template.is_active ? 'default' : 
                              template.draft_mode ? 'secondary' : 'outline'
                            }>
                              {template.is_active ? 'active' : template.draft_mode ? 'draft' : 'inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.duration_minutes}min
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {template.bookings}/{template.default_capacity}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {template.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          CHF {template.default_price.toFixed(2)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                              {t('schedule.view_details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditClass(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('schedule.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateClass(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              {t('schedule.duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClass(template.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('schedule.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">{t('schedule.instructor')}:</span>
                        <p>{template.instructor}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('schedule.type')}:</span>
                        <p>{template.type}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('schedule.level')}:</span>
                        <p>{template.level}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">{t('schedule.recurrence')}:</span>
                        <p>{template.recurrence || 'One-time'}</p>
                      </div>
                    </div>
                    {template.description && typeof template.description === 'object' && template.description.en && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {template.description.en}
                      </p>
                    )}
                    {template.description && typeof template.description === 'string' && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    {template.waitlist > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                          {template.waitlist} {t('schedule.on_waitlist')}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {!loading && filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No class templates found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No templates match your search criteria.' : 'Get started by creating your first class template.'}
                  </p>
                  <Button onClick={onCreateClass}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class Template
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      {selectedTemplate && (
        <ClassDetailDialog
          classTemplate={selectedTemplate}
          open={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}

      {showBulkActions && (
        <BulkActionsDialog
          selectedClasses={selectedClasses}
          open={showBulkActions}
          onClose={() => setShowBulkActions(false)}
          onComplete={() => {
            setSelectedClasses([]);
            setShowBulkActions(false);
          }}
        />
      )}
    </div>
  );
}
