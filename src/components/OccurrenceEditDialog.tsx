import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, AlertTriangle, Info, ChevronRight, RefreshCw, Split, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from './LanguageProvider';

interface ClassOccurrence {
  id: string;
  series_id: string;
  series_name: string;
  date: string;
  start_time: string;
  end_time: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  location: {
    id: string;
    name: string;
    room?: string;
  };
  capacity: number;
  booked: number;
  waitlist: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  is_exception: boolean;
  price_chf: number;
  revenue_total: number;
  has_registrations: boolean;
  has_payments: boolean;
}

interface EditScope {
  type: 'this_only' | 'this_and_following' | 'entire_series';
  label: string;
  description: string;
  icon: any;
  affectedCount: number;
  affectedClients: number;
}

interface OccurrenceEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  occurrence: ClassOccurrence | null;
  onSave: (changes: any, scope: string) => void;
  instructors: Array<{ id: string; name: string; }>;
  locations: Array<{ id: string; name: string; rooms?: string[]; }>;
}

export function OccurrenceEditDialog({
  isOpen,
  onClose,
  occurrence,
  onSave,
  instructors,
  locations
}: OccurrenceEditDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('scope');
  const [selectedScope, setSelectedScope] = useState<EditScope | null>(null);
  const [showImpactPreview, setShowImpactPreview] = useState(false);
  
  const [changes, setChanges] = useState({
    start_time: occurrence?.start_time || '',
    end_time: occurrence?.end_time || '',
    instructor_id: occurrence?.instructor.id || '',
    location_id: occurrence?.location.id || '',
    room: occurrence?.location.room || '',
    capacity: occurrence?.capacity || 0,
    price_chf: occurrence?.price_chf || 0
  });

  const [clientResolution, setClientResolution] = useState({
    auto_move: true,
    offer_credit: true,
    allow_refund: false,
    send_rebook_links: true,
    preserve_seats: true
  });

  const editScopes: EditScope[] = [
    {
      type: 'this_only',
      label: 'Only this occurrence',
      description: 'Changes apply to this single class only',
      icon: Target,
      affectedCount: 1,
      affectedClients: occurrence?.booked || 0
    },
    {
      type: 'this_and_following',
      label: 'This and following',
      description: 'Creates a new series starting from this date',
      icon: Split,
      affectedCount: 12, // Mock value
      affectedClients: 145 // Mock value
    },
    {
      type: 'entire_series',
      label: 'Entire series',
      description: 'Changes apply to all future classes in the series',
      icon: RefreshCw,
      affectedCount: 17, // Mock value
      affectedClients: 238 // Mock value
    }
  ];

  const hasChanges = () => {
    if (!occurrence) return false;
    
    return (
      changes.start_time !== occurrence.start_time ||
      changes.end_time !== occurrence.end_time ||
      changes.instructor_id !== occurrence.instructor.id ||
      changes.location_id !== occurrence.location.id ||
      changes.room !== occurrence.location.room ||
      changes.capacity !== occurrence.capacity ||
      changes.price_chf !== occurrence.price_chf
    );
  };

  const getChangesSummary = () => {
    if (!occurrence) return [];
    
    const summary = [];
    
    if (changes.start_time !== occurrence.start_time || changes.end_time !== occurrence.end_time) {
      summary.push(`Time: ${changes.start_time} - ${changes.end_time}`);
    }
    
    if (changes.instructor_id !== occurrence.instructor.id) {
      const instructor = instructors.find(i => i.id === changes.instructor_id);
      summary.push(`Instructor: ${instructor?.name}`);
    }
    
    if (changes.location_id !== occurrence.location.id) {
      const location = locations.find(l => l.id === changes.location_id);
      summary.push(`Location: ${location?.name}`);
    }
    
    if (changes.capacity !== occurrence.capacity) {
      summary.push(`Capacity: ${changes.capacity} spots`);
    }
    
    if (changes.price_chf !== occurrence.price_chf) {
      summary.push(`Price: CHF ${changes.price_chf}`);
    }
    
    return summary;
  };

  const handleContinue = () => {
    if (selectedScope && hasChanges()) {
      setShowImpactPreview(true);
    }
  };

  const handleApplyChanges = () => {
    if (selectedScope) {
      onSave({
        ...changes,
        client_resolution: clientResolution
      }, selectedScope.type);
      onClose();
    }
  };

  const selectedLocation = locations.find(loc => loc.id === changes.location_id);

  if (!occurrence) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class Occurrence</DialogTitle>
            <DialogDescription>
              Modify {occurrence.series_name} on {new Date(occurrence.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scope">1. Choose Scope</TabsTrigger>
              <TabsTrigger value="changes" disabled={!selectedScope}>2. Make Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="scope" className="space-y-6">
              {occurrence.has_registrations && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This class has <strong>{occurrence.booked} active registrations</strong> and 
                    <strong> CHF {occurrence.revenue_total} in revenue</strong>. 
                    Choose carefully how you want to apply changes.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label>Choose the scope of your changes:</Label>
                {editScopes.map((scope) => (
                  <Card
                    key={scope.type}
                    className={`cursor-pointer transition-all ${
                      selectedScope?.type === scope.type 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'hover:shadow-sm hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedScope(scope)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          selectedScope?.type === scope.type ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <scope.icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{scope.label}</h4>
                            {selectedScope?.type === scope.type && (
                              <Badge variant="default" className="text-xs">Selected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {scope.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{scope.affectedCount} classes affected</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{scope.affectedClients} clients impacted</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedScope?.type === scope.type 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedScope?.type === scope.type && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedScope && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Next:</strong> You'll be able to modify the class details and see 
                    a preview of how changes will affect {selectedScope.affectedClients} clients.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="changes" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Time Changes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time & Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={changes.start_time}
                          onChange={(e) => setChanges(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={changes.end_time}
                          onChange={(e) => setChanges(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    {(changes.start_time !== occurrence.start_time || changes.end_time !== occurrence.end_time) && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Time change will trigger client notifications and rebooking options.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Location Changes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location & Space
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Location</Label>
                      <Select value={changes.location_id} onValueChange={(value) => setChanges(prev => ({ ...prev, location_id: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedLocation?.rooms && (
                      <div>
                        <Label>Room</Label>
                        <Select value={changes.room} onValueChange={(value) => setChanges(prev => ({ ...prev, room: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedLocation.rooms.map(room => (
                              <SelectItem key={room} value={room}>{room}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {changes.location_id !== occurrence.location.id && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Location change will update calendar invites and send notifications.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Instructor Changes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Instructor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label>Instructor</Label>
                      <Select value={changes.instructor_id} onValueChange={(value) => setChanges(prev => ({ ...prev, instructor_id: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {instructors.map(instructor => (
                            <SelectItem key={instructor.id} value={instructor.id}>
                              {instructor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {changes.instructor_id !== occurrence.instructor.id && (
                      <Alert className="mt-3">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Instructor change will notify clients but keep existing bookings.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Capacity & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Capacity & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={changes.capacity}
                        onChange={(e) => setChanges(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                        min="1"
                      />
                      {changes.capacity < occurrence.booked && (
                        <p className="text-xs text-destructive mt-1">
                          Reducing capacity below current bookings ({occurrence.booked}) will affect waitlist.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>Price (CHF)</Label>
                      <Input
                        type="number"
                        value={changes.price_chf}
                        onChange={(e) => setChanges(prev => ({ ...prev, price_chf: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        step="0.50"
                      />
                      {changes.price_chf !== occurrence.price_chf && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Price changes only apply to new bookings.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {hasChanges() && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Changes Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getChangesSummary().map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <ChevronRight className="h-3 w-3 text-primary" />
                          <span>{change}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {activeTab === 'changes' && (
                <Button variant="outline" onClick={() => setActiveTab('scope')}>
                  Back
                </Button>
              )}
              
              {activeTab === 'scope' && selectedScope && (
                <Button onClick={() => setActiveTab('changes')}>
                  Continue
                </Button>
              )}
              
              {activeTab === 'changes' && hasChanges() && (
                <Button onClick={handleContinue}>
                  Preview Impact
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impact Preview Dialog */}
      <Dialog open={showImpactPreview} onOpenChange={setShowImpactPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Impact Preview</DialogTitle>
            <DialogDescription>
              Review how your changes will affect clients and bookings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-blue-600">{selectedScope?.affectedCount}</div>
                  <div className="text-sm text-muted-foreground">Classes Affected</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-green-600">{selectedScope?.affectedClients}</div>
                  <div className="text-sm text-muted-foreground">Clients Impacted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-orange-600">CHF {occurrence.revenue_total * (selectedScope?.affectedCount || 1)}</div>
                  <div className="text-sm text-muted-foreground">Revenue at Risk</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-purple-600">{occurrence.waitlist * (selectedScope?.affectedCount || 1)}</div>
                  <div className="text-sm text-muted-foreground">Waitlist Spots</div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Studio-initiated change policy</strong> will apply - no client penalties, 
                automatic resolution options, and priority rebooking.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium">Client Resolution Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={clientResolution.auto_move}
                      onCheckedChange={(checked) => setClientResolution(prev => ({ ...prev, auto_move: !!checked }))}
                    />
                    <Label>Auto-move to equivalent time slots (when available)</Label>
                  </div>
                  <Badge variant="outline" className="text-xs">Recommended</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={clientResolution.offer_credit}
                    onCheckedChange={(checked) => setClientResolution(prev => ({ ...prev, offer_credit: !!checked }))}
                  />
                  <Label>Offer credit to studio wallet</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={clientResolution.allow_refund}
                    onCheckedChange={(checked) => setClientResolution(prev => ({ ...prev, allow_refund: !!checked }))}
                  />
                  <Label>Allow refunds to original payment method</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={clientResolution.send_rebook_links}
                    onCheckedChange={(checked) => setClientResolution(prev => ({ ...prev, send_rebook_links: !!checked }))}
                  />
                  <Label>Send rebook links for manual selection</Label>
                </div>
                
                {changes.location_id !== occurrence.location.id && (
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={clientResolution.preserve_seats}
                      onCheckedChange={(checked) => setClientResolution(prev => ({ ...prev, preserve_seats: !!checked }))}
                    />
                    <Label>Preserve seat assignments (if location supports seat selection)</Label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Additional Message for Clients</Label>
              <Textarea 
                placeholder="Optional message to include with change notifications..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpactPreview(false)}>
              Back to Edit
            </Button>
            <Button onClick={handleApplyChanges} className="bg-green-600 hover:bg-green-700">
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}