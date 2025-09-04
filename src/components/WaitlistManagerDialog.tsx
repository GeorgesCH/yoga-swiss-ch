import { useState } from 'react';
import { Users, Clock, ArrowUp, ArrowDown, Send, Trash2, Plus, Search, Filter, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { useLanguage } from './LanguageProvider';

interface WaitlistEntry {
  id: string;
  participant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    membership_type?: 'none' | 'basic' | 'premium';
    booking_history_count: number;
    last_booking_date?: string;
    preferred_language: 'de' | 'fr' | 'it' | 'en';
  };
  class_occurrence: {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
  };
  position: number;
  added_date: string;
  auto_promote: boolean;
  notification_sent: boolean;
  expires_at?: string;
  promotion_deadline?: string;
  priority_score: number;
  source: 'manual' | 'auto_full' | 'customer_request';
}

interface WaitlistManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  waitlistEntries: WaitlistEntry[];
  onPromote: (entryId: string) => void;
  onRemove: (entryId: string) => void;
  onNotify: (entryIds: string[]) => void;
  onUpdateAutoPromote: (entryId: string, autoPromote: boolean) => void;
}

export function WaitlistManagerDialog({
  isOpen,
  onClose,
  waitlistEntries = [],
  onPromote,
  onRemove,
  onNotify,
  onUpdateAutoPromote
}: WaitlistManagerDialogProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'position' | 'date' | 'priority'>('position');

  // Group entries by class
  const groupedEntries = waitlistEntries.reduce((groups, entry) => {
    const classKey = `${entry.class_occurrence.id}`;
    if (!groups[classKey]) {
      groups[classKey] = [];
    }
    groups[classKey].push(entry);
    return groups;
  }, {} as Record<string, WaitlistEntry[]>);

  // Filter and sort entries
  const filteredEntries = waitlistEntries
    .filter(entry => {
      const matchesSearch = entry.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.class_occurrence.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = filterLocation === 'all' || 
                             entry.class_occurrence.location.toLowerCase().includes(filterLocation.toLowerCase());
      
      const matchesTimeframe = filterTimeframe === 'all' || (() => {
        const classDate = new Date(entry.class_occurrence.date);
        const now = new Date();
        const daysDiff = Math.ceil((classDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterTimeframe) {
          case 'today': return daysDiff === 0;
          case 'tomorrow': return daysDiff === 1;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesLocation && matchesTimeframe;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'position':
          return a.position - b.position;
        case 'date':
          return new Date(a.class_occurrence.date).getTime() - new Date(b.class_occurrence.date).getTime();
        case 'priority':
          return b.priority_score - a.priority_score;
        default:
          return 0;
      }
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map(entry => entry.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, entryId]);
    } else {
      setSelectedEntries(prev => prev.filter(id => id !== entryId));
    }
  };

  const handleBulkNotify = () => {
    if (selectedEntries.length > 0) {
      onNotify(selectedEntries);
      setSelectedEntries([]);
    }
  };

  const handleBulkRemove = () => {
    if (selectedEntries.length > 0) {
      selectedEntries.forEach(entryId => onRemove(entryId));
      setSelectedEntries([]);
    }
  };

  const getLanguageFlag = (lang: string) => {
    const flags = { de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', en: '🇬🇧' };
    return flags[lang as keyof typeof flags] || '🇩🇪';
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>;
    return <Badge className="bg-green-100 text-green-700 border-green-200">Low</Badge>;
  };

  const getMembershipBadge = (type?: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Premium</Badge>;
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Basic</Badge>;
      default:
        return <Badge variant="outline">Guest</Badge>;
    }
  };

  const formatTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Manager
          </DialogTitle>
          <DialogDescription>
            Manage waitlists across all classes. Promote participants, send notifications, and optimize class capacity.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">{waitlistEntries.length}</div>
              <div className="text-sm text-muted-foreground">Total Waitlist</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">
                {waitlistEntries.filter(e => e.auto_promote).length}
              </div>
              <div className="text-sm text-muted-foreground">Auto-Promote Enabled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">
                {waitlistEntries.filter(e => e.expires_at && new Date(e.expires_at) <= new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Expired Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-semibold">
                {Object.keys(groupedEntries).length}
              </div>
              <div className="text-sm text-muted-foreground">Classes with Waitlists</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants or classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="studio a">Studio A</SelectItem>
                <SelectItem value="studio b">Studio B</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="date">Class Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedEntries.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleBulkNotify}>
                <Send className="h-4 w-4 mr-2" />
                Notify ({selectedEntries.length})
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkRemove}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove ({selectedEntries.length})
              </Button>
            </div>
          )}
        </div>

        {/* Waitlist Table */}
        {filteredEntries.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEntries.length === filteredEntries.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEntries.includes(entry.id)}
                      onCheckedChange={(checked) => handleSelectEntry(entry.id, !!checked)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        #{entry.position}
                      </Badge>
                      {entry.priority_score > 75 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.participant.avatar} />
                        <AvatarFallback>
                          {entry.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.participant.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {entry.participant.email}
                          <span>{getLanguageFlag(entry.participant.preferred_language)}</span>
                        </div>
                        {entry.participant.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {entry.participant.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium">{entry.class_occurrence.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.class_occurrence.date).toLocaleDateString()} • {entry.class_occurrence.time}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.class_occurrence.location}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {getPriorityBadge(entry.priority_score)}
                      {getMembershipBadge(entry.participant.membership_type)}
                      <div className="text-xs text-muted-foreground">
                        {entry.participant.booking_history_count} bookings
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(entry.added_date).toLocaleDateString()}</div>
                      <div className="text-muted-foreground capitalize">
                        {entry.source.replace('_', ' ')}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={entry.auto_promote}
                          onCheckedChange={(checked) => onUpdateAutoPromote(entry.id, !!checked)}
                        />
                        <span className="text-xs">Auto-promote</span>
                      </div>
                      
                      {entry.notification_sent && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Notified
                        </div>
                      )}

                      {entry.expires_at && (
                        <div className="text-xs text-muted-foreground">
                          {formatTimeRemaining(entry.expires_at)}
                        </div>
                      )}

                      {entry.promotion_deadline && (
                        <div className="text-xs text-orange-600">
                          Promote by: {new Date(entry.promotion_deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => onPromote(entry.id)}
                        disabled={entry.position === 1}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNotify([entry.id])}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Waitlist Entries</h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchQuery || filterLocation !== 'all' || filterTimeframe !== 'all'
                  ? 'No entries match your current filters.'
                  : 'Waitlist entries will appear here when classes fill up.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grouped View */}
        {Object.keys(groupedEntries).length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Waitlists by Class</h3>
            <div className="space-y-4">
              {Object.entries(groupedEntries).map(([classId, entries]) => {
                const classInfo = entries[0].class_occurrence;
                return (
                  <Card key={classId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{classInfo.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {new Date(classInfo.date).toLocaleDateString()} • {classInfo.time} • {classInfo.location}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {entries.length} waiting
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {entries.slice(0, 5).map((entry, index) => (
                          <div key={entry.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                            <span className="text-xs font-mono">#{entry.position}</span>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={entry.participant.avatar} />
                              <AvatarFallback className="text-xs">
                                {entry.participant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{entry.participant.name}</span>
                          </div>
                        ))}
                        {entries.length > 5 && (
                          <div className="flex items-center px-3 py-1 text-sm text-muted-foreground">
                            +{entries.length - 5} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}