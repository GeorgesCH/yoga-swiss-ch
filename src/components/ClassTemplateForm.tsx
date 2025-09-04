import { useState } from 'react';
import { X, Upload, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
  translations?: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

interface ClassTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ClassTemplate) => void;
  template?: ClassTemplate;
}

export function ClassTemplateForm({ isOpen, onClose, onSave, template }: ClassTemplateFormProps) {
  const [currentLang, setCurrentLang] = useState<'de' | 'fr' | 'it' | 'en'>('de');
  const [formData, setFormData] = useState<ClassTemplate>(() => ({
    name: template?.name || '',
    description: template?.description || '',
    duration_min: template?.duration_min || 60,
    level: template?.level || 'Alle Level',
    category: template?.category || 'Vinyasa',
    default_price: template?.default_price || 25,
    max_participants: template?.max_participants || 20,
    is_active: template?.is_active ?? true,
    translations: template?.translations || {
      de: { name: '', description: '' },
      fr: { name: '', description: '' },
      it: { name: '', description: '' },
      en: { name: '', description: '' }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateTranslation = (field: 'name' | 'description', value: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template ? 'Vorlage bearbeiten' : 'Neue Kurs-Vorlage erstellen'}
            <Badge variant="outline" className="ml-2">
              Schweiz-optimiert
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Grunddaten</TabsTrigger>
              <TabsTrigger value="translations">
                <Globe className="h-4 w-4 mr-2" />
                Übersetzungen
              </TabsTrigger>
              <TabsTrigger value="advanced">Erweitert</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Kurs-Name (Deutsch)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="z.B. Vinyasa Flow Morgen"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategorie</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreiben Sie den Kurs-Stil und was Teilnehmer erwarten können..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Dauer (Minuten)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_min}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_min: parseInt(e.target.value) }))}
                        min="15"
                        max="180"
                        step="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Max. Teilnehmer</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price">Standard-Preis (CHF)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.default_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, default_price: parseFloat(e.target.value) }))}
                      min="0"
                      step="0.50"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Inkl. MwSt. (wird bei der Buchung angezeigt)
                    </p>
                  </div>

                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        Kurs-Bild hochladen
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Bild auswählen
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-6">
              <div className="flex gap-2 mb-4">
                {languages.map(lang => (
                  <Button
                    key={lang.code}
                    variant={currentLang === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentLang(lang.code as any)}
                    type="button"
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`name-${currentLang}`}>
                    Kurs-Name ({languages.find(l => l.code === currentLang)?.name})
                  </Label>
                  <Input
                    id={`name-${currentLang}`}
                    value={formData.translations?.[currentLang]?.name || ''}
                    onChange={(e) => updateTranslation('name', e.target.value)}
                    placeholder={`Name in ${languages.find(l => l.code === currentLang)?.name}`}
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
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🇨🇭 Schweizer Mehrsprachigkeit</h4>
                <p className="text-sm text-blue-700">
                  Übersetzen Sie Ihre Kurse in alle Schweizer Landessprachen plus Englisch 
                  für maximale Reichweite. Die Standardsprache ist Deutsch.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Verfügbarkeit</h4>
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
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Integration</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      • Automatische Zoom-Links für Online-Kurse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Google Calendar & Apple Calendar Export
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • TWINT & Apple Pay für schnelle Buchungen
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              {template ? 'Aktualisieren' : 'Vorlage erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}