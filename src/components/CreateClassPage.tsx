import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Globe, Eye, Calendar, Clock, Users, DollarSign, BookOpen, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from './LanguageProvider';

import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { classesService } from '../utils/supabase/classes-service';

interface ClassTemplate {
  id?: string;
  name: string;
  description: string;
  duration_min: number;
  level: 'Anfänger' | 'Mittelstufe' | 'Fortgeschritten' | 'Alle Level';
  category: string;
  default_price: number;
  max_participants: number;
  image?: string;
  is_active: boolean;
  is_draft: boolean;
  requirements?: string;
  benefits?: string;
  equipment_needed?: string[];
  difficulty_description?: string;
  cancellation_policy?: string;
  special_instructions?: string;
  translations?: {
    [key: string]: {
      name: string;
      description: string;
      requirements?: string;
      benefits?: string;
      difficulty_description?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

interface CreateClassPageProps {
  onBack: () => void;
  templateToEdit?: ClassTemplate;
}

export function CreateClassPage({ onBack, templateToEdit }: CreateClassPageProps) {
  const [currentLang, setCurrentLang] = useState<'de' | 'fr' | 'it' | 'en'>('de');
  const [isDraft, setIsDraft] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { t } = useLanguage();
  const { currentOrg } = useMultiTenantAuth();

  const [formData, setFormData] = useState<ClassTemplate>(() => ({
    name: templateToEdit?.name || '',
    description: templateToEdit?.description || '',
    duration_min: templateToEdit?.duration_min || 60,
    level: templateToEdit?.level || 'Alle Level',
    category: templateToEdit?.category || 'Vinyasa',
    default_price: templateToEdit?.default_price || 25,
    max_participants: templateToEdit?.max_participants || 20,
    is_active: templateToEdit?.is_active ?? true,
    is_draft: templateToEdit?.is_draft ?? false,
    requirements: templateToEdit?.requirements || '',
    benefits: templateToEdit?.benefits || '',
    equipment_needed: templateToEdit?.equipment_needed || [],
    difficulty_description: templateToEdit?.difficulty_description || '',
    cancellation_policy: templateToEdit?.cancellation_policy || 'Kostenlose Stornierung bis 24h vor Kursbeginn',
    special_instructions: templateToEdit?.special_instructions || '',
    translations: templateToEdit?.translations || {
      de: { name: '', description: '', requirements: '', benefits: '', difficulty_description: '' },
      fr: { name: '', description: '', requirements: '', benefits: '', difficulty_description: '' },
      it: { name: '', description: '', requirements: '', benefits: '', difficulty_description: '' },
      en: { name: '', description: '', requirements: '', benefits: '', difficulty_description: '' }
    }
  }));

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const categories = [
    'Vinyasa', 'Hatha', 'Yin', 'Power Yoga', 'Ashtanga', 
    'Restorative', 'Prenatal', 'Hot Yoga', 'Meditation', 'Pilates'
  ];

  const levels = ['Anfänger', 'Mittelstufe', 'Fortgeschritten', 'Alle Level'] as const;

  const equipmentOptions = [
    'Yoga-Matte', 'Blöcke', 'Gurte', 'Bolster', 'Decken', 'Kissen', 
    'Handtuch', 'Wasserflasche', 'Keine spezielle Ausrüstung'
  ];

  // Auto-save draft functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (formData.name && !isSaving) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [formData.name, isSaving]);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Kurs-Name ist erforderlich');
    if (!formData.description.trim()) errors.push('Beschreibung ist erforderlich');
    if (formData.duration_min < 15) errors.push('Mindestdauer beträgt 15 Minuten');
    if (formData.max_participants < 1) errors.push('Mindestens 1 Teilnehmer erforderlich');
    if (formData.default_price < 0) errors.push('Preis kann nicht negativ sein');
    
    return errors;
  };

  const saveDraft = async () => {
    if (!currentOrg?.id) return;
    
    setIsSaving(true);
    try {
      const templateData = {
        name: formData.name,
        category: formData.category,
        level: formData.level,
        duration_minutes: formData.duration_min,
        description: {
          de: formData.description,
          ...formData.translations
        },
        default_price: formData.default_price,
        default_capacity: formData.max_participants,
        tags: formData.equipment_needed,
        is_active: false,
        draft_mode: true,
        visibility: 'public'
      };

      // Save to Supabase
      if (templateToEdit?.id) {
        await classesService.updateClassTemplate(templateToEdit.id, templateData);
      } else {
        await classesService.createClassTemplate(currentOrg.id, templateData);
      }

      setLastSaved(new Date());
      setIsDraft(true);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (publishNow: boolean = false) => {
    if (!currentOrg?.id) return;
    
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (errors.length > 0 && publishNow) {
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        name: formData.name,
        category: formData.category,
        level: formData.level,
        duration_minutes: formData.duration_min,
        description: {
          de: formData.description,
          ...formData.translations
        },
        default_price: formData.default_price,
        default_capacity: formData.max_participants,
        tags: formData.equipment_needed,
        is_active: publishNow,
        draft_mode: !publishNow,
        visibility: 'public'
      };

      if (templateToEdit?.id) {
        await classesService.updateClassTemplate(templateToEdit.id, templateData);
      } else {
        await classesService.createClassTemplate(currentOrg.id, templateData);
      }

      setLastSaved(new Date());
      setIsDraft(!publishNow);
      
      if (publishNow) {
        onBack(); // Return to classes management after publishing
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateTranslation = (field: keyof NonNullable<ClassTemplate['translations']>['de'], value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [currentLang]: {
          ...prev.translations?.[currentLang],
          [field]: value
        }
      }
    }));
  };

  const addEquipment = (equipment: string) => {
    if (!formData.equipment_needed?.includes(equipment)) {
      setFormData(prev => ({
        ...prev,
        equipment_needed: [...(prev.equipment_needed || []), equipment]
      }));
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment_needed: prev.equipment_needed?.filter(e => e !== equipment) || []
    }));
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Bearbeitung
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Vorschau: {formData.name}</h1>
              <p className="text-muted-foreground">Wie Kunden Ihren Kurs sehen werden</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => handleSave(false)}>
              <Save className="h-4 w-4 mr-2" />
              Als Entwurf speichern
            </Button>
            <Button onClick={() => handleSave(true)}>
              Veröffentlichen
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{formData.name}</CardTitle>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {formData.level}
                  </Badge>
                  <Badge variant="outline">{formData.category}</Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {formData.duration_min} Min
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">CHF {formData.default_price}</div>
                <div className="text-sm text-muted-foreground">inkl. MwSt.</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Beschreibung</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Kurs-Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dauer:</span>
                    <span>{formData.duration_min} Minuten</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max. Teilnehmer:</span>
                    <span>{formData.max_participants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span>{formData.level}</span>
                  </div>
                </div>
              </div>

              {formData.equipment_needed && formData.equipment_needed.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Benötigte Ausrüstung</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.equipment_needed.map((equipment, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {formData.benefits && (
              <div>
                <h4 className="font-medium mb-2">Vorteile</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.benefits}</p>
              </div>
            )}

            {formData.requirements && (
              <div>
                <h4 className="font-medium mb-2">Voraussetzungen</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.requirements}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Stornierungsbedingungen</h4>
              <p className="text-sm text-muted-foreground">{formData.cancellation_policy}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {templateToEdit ? 'Kurs-Vorlage bearbeiten' : 'Neue Kurs-Vorlage erstellen'}
            </h1>
            <p className="text-muted-foreground">
              Erstellen Sie professionelle Kurs-Vorlagen für Ihr Schweizer Yoga-Studio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Zuletzt gespeichert: {lastSaved.toLocaleTimeString('de-CH')}
            </div>
          )}
          <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Speichern...' : 'Als Entwurf speichern'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            {templateToEdit ? 'Aktualisieren' : 'Veröffentlichen'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Bitte korrigieren Sie folgende Fehler:</strong>
            <ul className="mt-2 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Grunddaten
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="translations" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Übersetzungen
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Erweitert
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Kurs-Name (Deutsch) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="z.B. Vinyasa Flow Morgen"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Kategorie</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="level">Schwierigkeitsgrad</Label>
                      <Select 
                        value={formData.level} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as any }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreiben Sie den Kurs-Stil und was Teilnehmer erwarten können..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Dauer (Minuten)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_min: parseInt(e.target.value) || 0 }))}
                        min="15"
                        max="180"
                        step="15"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">
                        <Users className="h-4 w-4 inline mr-1" />
                        Max. Teilnehmer
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 0 }))}
                        min="1"
                        max="50"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Standard-Preis (CHF)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.default_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, default_price: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.50"
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Inkl. MwSt. (wird bei der Buchung angezeigt)
                    </p>
                  </div>

                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground text-center mb-2">
                        Kurs-Bild hochladen
                      </p>
                      <p className="text-xs text-muted-foreground text-center mb-4">
                        JPG, PNG oder WebP • Max. 5MB
                      </p>
                      <Button variant="outline" size="sm">
                        Bild auswählen
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="benefits">Vorteile & Nutzen</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                      placeholder="Was können Teilnehmer von diesem Kurs erwarten? Welche Vorteile bietet er?"
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Voraussetzungen</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="Welche Vorkenntnisse oder körperlichen Voraussetzungen sind nötig?"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="difficulty_description">Schwierigkeitsgrad Details</Label>
                    <Textarea
                      id="difficulty_description"
                      value={formData.difficulty_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty_description: e.target.value }))}
                      placeholder="Detaillierte Beschreibung des Schwierigkeitsgrades..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>Benötigte Ausrüstung</Label>
                    <div className="mt-2 space-y-2">
                      <Select onValueChange={addEquipment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ausrüstung hinzufügen" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentOptions.map(equipment => (
                            <SelectItem key={equipment} value={equipment}>
                              {equipment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.equipment_needed?.map((equipment, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer">
                            {equipment}
                            <button
                              type="button"
                              onClick={() => removeEquipment(equipment)}
                              className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cancellation_policy">Stornierungsbedingungen</Label>
                    <Textarea
                      id="cancellation_policy"
                      value={formData.cancellation_policy}
                      onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="special_instructions">Besondere Hinweise</Label>
                    <Textarea
                      id="special_instructions"
                      value={formData.special_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                      placeholder="z.B. Bitte bringen Sie ein Handtuch mit..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-6 mt-6">
              <div className="flex gap-2 mb-6">
                {languages.map(lang => (
                  <Button
                    key={lang.code}
                    variant={currentLang === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentLang(lang.code as any)}
                    type="button"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor={`name-${currentLang}`}>
                      Kurs-Name ({languages.find(l => l.code === currentLang)?.name})
                    </Label>
                    <Input
                      id={`name-${currentLang}`}
                      value={formData.translations?.[currentLang]?.name || ''}
                      onChange={(e) => updateTranslation('name', e.target.value)}
                      placeholder={`Name in ${languages.find(l => l.code === currentLang)?.name}`}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`description-${currentLang}`}>
                      Beschreibung ({languages.find(l => l.code === currentLang)?.name})
                    </Label>
                    <Textarea
                      id={`description-${currentLang}`}
                      value={formData.translations?.[currentLang]?.description || ''}
                      onChange={(e) => updateTranslation('description', e.target.value)}
                      placeholder={`Beschreibung in ${languages.find(l => l.code === currentLang)?.name}`}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`benefits-${currentLang}`}>
                      Vorteile ({languages.find(l => l.code === currentLang)?.name})
                    </Label>
                    <Textarea
                      id={`benefits-${currentLang}`}
                      value={formData.translations?.[currentLang]?.benefits || ''}
                      onChange={(e) => updateTranslation('benefits', e.target.value)}
                      placeholder={`Vorteile in ${languages.find(l => l.code === currentLang)?.name}`}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor={`requirements-${currentLang}`}>
                      Voraussetzungen ({languages.find(l => l.code === currentLang)?.name})
                    </Label>
                    <Textarea
                      id={`requirements-${currentLang}`}
                      value={formData.translations?.[currentLang]?.requirements || ''}
                      onChange={(e) => updateTranslation('requirements', e.target.value)}
                      placeholder={`Voraussetzungen in ${languages.find(l => l.code === currentLang)?.name}`}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`difficulty-${currentLang}`}>
                      Schwierigkeitsgrad ({languages.find(l => l.code === currentLang)?.name})
                    </Label>
                    <Textarea
                      id={`difficulty-${currentLang}`}
                      value={formData.translations?.[currentLang]?.difficulty_description || ''}
                      onChange={(e) => updateTranslation('difficulty_description', e.target.value)}
                      placeholder={`Schwierigkeitsgrad-Details in ${languages.find(l => l.code === currentLang)?.name}`}
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-900 mb-2">🇨🇭 Schweizer Mehrsprachigkeit</h4>
                      <p className="text-sm text-blue-700">
                        Übersetzen Sie Ihre Kurse in alle Schweizer Landessprachen plus Englisch 
                        für maximale Reichweite. Die Standardsprache ist Deutsch.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Verfügbarkeit & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="is_active">Vorlage ist aktiv</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inaktive Vorlagen können nicht für neue Termine verwendet werden.
                    </p>
                    
                    {isDraft && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Diese Vorlage ist als Entwurf gespeichert und noch nicht veröffentlicht.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Schweizer Integration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      TWINT & Apple Pay für schnelle Buchungen
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      QR-Rechnung für Schweizer Banken
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Automatische MwSt.-Berechnung (7.7%)
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Google Calendar & Apple Calendar Export
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Zoom-Integration für Online-Kurse
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Automatisierungen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="auto_reminder" defaultChecked className="rounded" />
                      <Label htmlFor="auto_reminder" className="text-sm">
                        Automatische Erinnerungen
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="auto_waitlist" defaultChecked className="rounded" />
                      <Label htmlFor="auto_waitlist" className="text-sm">
                        Automatische Warteliste
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="auto_feedback" defaultChecked className="rounded" />
                      <Label htmlFor="auto_feedback" className="text-sm">
                        Feedback-Erinnerungen
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>GDPR & Datenschutz</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      GDPR-konforme Datenverarbeitung
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Schweizer Datenschutzgesetze
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Sichere Datenübertragung (SSL)
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Lokaler Datenserver in der Schweiz
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}