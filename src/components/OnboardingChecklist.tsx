import { useState } from 'react';
import { Check, ChevronRight, CreditCard, MapPin, Users, Settings, Package, Calendar, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  required: boolean;
  category: 'setup' | 'payments' | 'content' | 'launch';
}

export function OnboardingChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'create-org',
      title: 'Organisation erstellen',
      description: 'Name, Währung CHF, Sprachen (DE/FR/IT/EN)',
      icon: Settings,
      completed: true,
      required: true,
      category: 'setup'
    },
    {
      id: 'connect-payments',
      title: 'Zahlungen verbinden',
      description: 'Stripe Connect + TWINT für Schweizer Kunden',
      icon: CreditCard,
      completed: true,
      required: true,
      category: 'payments'
    },
    {
      id: 'add-locations',
      title: 'Standorte hinzufügen',
      description: 'Adressen, Kapazitäten, Räume definieren',
      icon: MapPin,
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'invite-staff',
      title: 'Team einladen',
      description: 'Instruktoren und Personal mit Rollen',
      icon: Users,
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'set-policies',
      title: 'Richtlinien festlegen',
      description: 'Storno-Regeln, No-Show Gebühren, Wartelisten',
      icon: Settings,
      completed: false,
      required: true,
      category: 'setup'
    },
    {
      id: 'create-products',
      title: 'Produkte erstellen',
      description: 'Einzelstunden, Karten, Mitgliedschaften, MwSt.',
      icon: Package,
      completed: false,
      required: true,
      category: 'content'
    },
    {
      id: 'class-templates',
      title: 'Kurs-Vorlagen',
      description: 'Yoga-Stile, Dauer, Level, Preise',
      icon: Calendar,
      completed: false,
      required: true,
      category: 'content'
    },
    {
      id: 'schedule-week',
      title: 'Erste Woche planen',
      description: 'Wiederholungen, Instruktoren, Räume',
      icon: Calendar,
      completed: false,
      required: true,
      category: 'content'
    },
    {
      id: 'setup-automations',
      title: 'Automatisierungen',
      description: 'Erinnerungen, Willkommens-E-Mails',
      icon: Mail,
      completed: false,
      required: false,
      category: 'launch'
    },
    {
      id: 'embed-widget',
      title: 'Website-Integration',
      description: 'Buchungs-Widget, Deep Links, Google Reserve',
      icon: Globe,
      completed: false,
      required: false,
      category: 'launch'
    },
    {
      id: 'test-booking',
      title: 'Test-Buchung',
      description: 'Sandbox-Zahlung mit TWINT & Apple Pay',
      icon: CreditCard,
      completed: false,
      required: true,
      category: 'launch'
    }
  ]);

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const requiredItems = checklist.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed).length;
  const progressPercentage = (completedItems / totalItems) * 100;

  const toggleComplete = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const categories = [
    { key: 'setup' as const, name: 'Grundeinstellungen', color: 'bg-blue-100 text-blue-700' },
    { key: 'payments' as const, name: 'Zahlungen', color: 'bg-green-100 text-green-700' },
    { key: 'content' as const, name: 'Inhalte', color: 'bg-purple-100 text-purple-700' },
    { key: 'launch' as const, name: 'Go Live', color: 'bg-orange-100 text-orange-700' }
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Studio Einrichtung</CardTitle>
            <p className="text-muted-foreground mt-1">
              Bereiten Sie Ihr Yoga-Studio für die ersten Buchungen vor
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{completedItems}/{totalItems}</div>
            <div className="text-sm text-muted-foreground">Abgeschlossen</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Gesamtfortschritt</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {completedRequired}/{requiredItems.length} Pflichtfelder
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Schweiz-optimiert
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {categories.map(category => {
          const categoryItems = checklist.filter(item => item.category === category.key);
          const categoryCompleted = categoryItems.filter(item => item.completed).length;
          
          return (
            <div key={category.key}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={category.color}>
                  {category.name} ({categoryCompleted}/{categoryItems.length})
                </Badge>
              </div>
              
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                      item.completed ? 'bg-green-50 border-green-200' : 'bg-card'
                    }`}
                    onClick={() => toggleComplete(item.id)}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-muted-foreground/30 hover:border-primary'
                    }`}>
                      {item.completed && <Check className="h-4 w-4" />}
                    </div>
                    
                    <item.icon className={`h-5 w-5 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${item.completed ? 'text-green-900' : ''}`}>
                          {item.title}
                        </h4>
                        {item.required && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            Pflicht
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${item.completed ? 'text-green-700' : 'text-muted-foreground'}`}>
                        {item.description}
                      </p>
                    </div>
                    
                    <ChevronRight className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                ))}
              </div>
              
              {category.key !== 'launch' && <Separator className="mt-4" />}
            </div>
          );
        })}
        
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium">🇨🇭 Schweiz-spezifische Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>TWINT Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>QR-Rechnung Generator</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>CHF MwSt. Handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>GDPR + nLPD Konform</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            disabled={completedRequired < requiredItems.length}
          >
            Test-Buchung starten
          </Button>
          <Button variant="outline">
            Demo-Daten erstellen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}