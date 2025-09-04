import { useState } from 'react';
import { Copy, Calendar, Users, Clock, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useLanguage } from './LanguageProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface BulkAction {
  type: 'copy_week' | 'bulk_edit' | 'bulk_cancel';
}

interface BulkActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: BulkAction | null;
  selectedClasses?: string[];
}

export function BulkActionsDialog({ isOpen, onClose, action, selectedClasses = [] }: BulkActionsDialogProps) {
  const { t } = useLanguage();
  const [sourceWeek, setSourceWeek] = useState('');
  const [targetWeeks, setTargetWeeks] = useState<string[]>([]);
  const [copyOptions, setCopyOptions] = useState({
    instructors: true,
    pricing: true,
    capacity: true,
    notes: false
  });

  // Mock data for current week's classes
  const currentWeekClasses = [
    {
      id: '1',
      name: 'Vinyasa Flow',
      instructor: 'Sarah Müller',
      time: 'Mo 09:00-10:30',
      capacity: 20,
      price: 25
    },
    {
      id: '2',
      name: 'Hatha Yoga',
      instructor: 'Marcus Weber',
      time: 'Mo 18:00-19:00',
      capacity: 15,
      price: 20
    },
    {
      id: '3',
      name: 'Power Yoga',
      instructor: 'Lisa Chen',
      time: 'Di 12:00-13:00',
      capacity: 25,
      price: 28
    },
    {
      id: '4',
      name: 'Yin Yoga',
      instructor: 'Marie Dubois',
      time: 'Mi 19:00-20:15',
      capacity: 18,
      price: 22
    },
    {
      id: '5',
      name: 'Vinyasa Flow',
      instructor: 'Sarah Müller',
      time: 'Do 09:00-10:30',
      capacity: 20,
      price: 25
    },
    {
      id: '6',
      name: 'Meditation',
      instructor: 'Marcus Weber',
      time: 'Fr 07:30-08:00',
      capacity: 30,
      price: 15
    }
  ];

  const handleCopyWeek = () => {
    console.log('Copying week:', {
      sourceWeek,
      targetWeeks,
      copyOptions,
      selectedClasses: selectedClasses.length > 0 ? selectedClasses : currentWeekClasses.map(c => c.id)
    });
    onClose();
  };

  const renderCopyWeekDialog = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="source_week">Quellwoche</Label>
          <Input
            id="source_week"
            type="week"
            value={sourceWeek}
            onChange={(e) => setSourceWeek(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Woche, deren Stundenplan kopiert werden soll
          </p>
        </div>

        <div>
          <Label>Zielwochen</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Array.from({ length: 8 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + (i + 1) * 7);
              const weekString = `${date.getFullYear()}-W${String(Math.ceil(date.getDate() / 7)).padStart(2, '0')}`;
              const displayDate = date.toLocaleDateString('de-CH', { 
                day: '2-digit', 
                month: '2-digit' 
              });
              
              return (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox
                    id={`week-${i}`}
                    checked={targetWeeks.includes(weekString)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTargetWeeks(prev => [...prev, weekString]);
                      } else {
                        setTargetWeeks(prev => prev.filter(w => w !== weekString));
                      }
                    }}
                  />
                  <Label htmlFor={`week-${i}`} className="text-sm">
                    KW {i + 1} ({displayDate})
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Zu kopierende Klassen</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {currentWeekClasses.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between p-2 rounded border bg-muted/30">
              <div>
                <div className="font-medium text-sm">{cls.name}</div>
                <div className="text-xs text-muted-foreground">
                  {cls.instructor} • {cls.time}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {cls.capacity} Plätze
                </Badge>
                <Badge variant="outline" className="text-xs">
                  CHF {cls.price}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Kopieroptionen</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copy_instructors"
              checked={copyOptions.instructors}
              onCheckedChange={(checked) => 
                setCopyOptions(prev => ({ ...prev, instructors: checked as boolean }))
              }
            />
            <Label htmlFor="copy_instructors" className="text-sm">
              Instruktoren übernehmen
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copy_pricing"
              checked={copyOptions.pricing}
              onCheckedChange={(checked) => 
                setCopyOptions(prev => ({ ...prev, pricing: checked as boolean }))
              }
            />
            <Label htmlFor="copy_pricing" className="text-sm">
              Preise übernehmen
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copy_capacity"
              checked={copyOptions.capacity}
              onCheckedChange={(checked) => 
                setCopyOptions(prev => ({ ...prev, capacity: checked as boolean }))
              }
            />
            <Label htmlFor="copy_capacity" className="text-sm">
              Kapazitäten übernehmen
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copy_notes"
              checked={copyOptions.notes}
              onCheckedChange={(checked) => 
                setCopyOptions(prev => ({ ...prev, notes: checked as boolean }))
              }
            />
            <Label htmlFor="copy_notes" className="text-sm">
              Notizen übernehmen
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          📋 Vorschau der Änderungen
        </h4>
        <div className="text-sm text-blue-700">
          <p>• {currentWeekClasses.length} Klassen werden kopiert</p>
          <p>• {targetWeeks.length} Zielwochen ausgewählt</p>
          <p>• Insgesamt {currentWeekClasses.length * targetWeeks.length} neue Termine</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleCopyWeek}
          disabled={!sourceWeek || targetWeeks.length === 0}
        >
          Woche kopieren
        </Button>
      </div>
    </div>
  );

  const renderBulkEditDialog = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">Ausgewählte Klassen ({selectedClasses.length})</h4>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preise anpassen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_change_type">Änderungstyp</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Prozentual</SelectItem>
                    <SelectItem value="fixed">Fester Betrag</SelectItem>
                    <SelectItem value="set">Preis setzen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price_value">Wert</Label>
                <Input
                  id="price_value"
                  type="number"
                  placeholder="10"
                  step="0.50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Kapazität anpassen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity_change_type">Änderungstyp</Label>
                <Select defaultValue="set">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Erhöhen um</SelectItem>
                    <SelectItem value="decrease">Verringern um</SelectItem>
                    <SelectItem value="set">Setzen auf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity_value">Teilnehmer</Label>
                <Input
                  id="capacity_value"
                  type="number"
                  placeholder="20"
                  min="1"
                  max="50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Instruktor ändern</CardTitle>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Neuen Instruktor auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sarah">Sarah Müller</SelectItem>
                <SelectItem value="marcus">Marcus Weber</SelectItem>
                <SelectItem value="lisa">Lisa Chen</SelectItem>
                <SelectItem value="marie">Marie Dubois</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button>
          Änderungen anwenden
        </Button>
      </div>
    </div>
  );

  const getDialogTitle = () => {
    switch (action?.type) {
      case 'copy_week':
        return (
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Woche kopieren
          </div>
        );
      case 'bulk_edit':
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mehrere Klassen bearbeiten
          </div>
        );
      case 'bulk_cancel':
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Klassen absagen
          </div>
        );
      default:
        return 'Bulk-Aktion';
    }
  };

  const renderDialogContent = () => {
    switch (action?.type) {
      case 'copy_week':
        return renderCopyWeekDialog();
      case 'bulk_edit':
        return renderBulkEditDialog();
      default:
        return <div>Aktion nicht verfügbar</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}