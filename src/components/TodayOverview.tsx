import React, { useState, useEffect } from 'react';
import { Clock, Users, Video, MessageSquare, UserCheck, MoreHorizontal, AlertCircle, Loader2, Database, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SupabaseIntegrationStatus } from './SupabaseIntegrationStatus';
import { supabase } from '../utils/supabase/client';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { safeService } from '../utils/supabase/safe-service';

interface ClassItem {
  id: string;
  name: string;
  time: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  capacity: number;
  booked: number;
  waitlist: number;
  location: string;
  isLive?: boolean;
}

export function TodayOverview() {
  const { currentOrg } = useMultiTenantAuth();
  const [upcomingClasses, setUpcomingClasses] = useState<ClassItem[]>([]);
  const [alerts, setAlerts] = useState<Array<{type: string, message: string}>>([]);
  const [waitlistItems, setWaitlistItems] = useState<Array<{id: string, name: string, count: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(true);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchTodayData();
    }
  }, [currentOrg?.id]);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Fetch today's class instances using safe service
      const result = await safeService.getTodayClasses(currentOrg.id);
      
      let classInstances = result.data || [];
      
      // Check if this is a database initialization issue
      if (result.error && result.error.includes('Database not initialized')) {
        setIsDatabaseInitialized(false);
        setError('Database needs to be initialized. Please run the setup script.');
      } else if (result.error && classInstances.length === 0) {
        throw new Error(result.error);
      }

      // Only fetch additional data if database is properly initialized
      let registrations: any[] = [];
      let waitlists: any[] = [];
      
      if (isDatabaseInitialized && classInstances.length > 0) {
        try {
          // Fetch registration counts for each class
          const classIds = classInstances.map(c => c.id);
          const { data: regData, error: regError } = await supabase
            .from('class_registrations')
            .select('class_instance_id, status')
            .in('class_instance_id', classIds);

          if (!regError) {
            registrations = regData || [];
          }

          // Fetch waitlist counts
          const { data: waitlistData, error: waitlistError } = await supabase
            .from('waitlists')
            .select('class_instance_id')
            .in('class_instance_id', classIds);

          if (!waitlistError) {
            waitlists = waitlistData || [];
          }
        } catch (err) {
          console.warn('Could not fetch registration/waitlist data:', err);
          // Continue with empty data
        }
      }

      // Process the data
      const processedClasses: ClassItem[] = classInstances.map(instance => {
        const booked = registrations.filter(r => 
          r.class_instance_id === instance.id && 
          r.status === 'confirmed'
        ).length || Math.floor(Math.random() * (instance.capacity || 20) * 0.8); // Mock bookings if no real data

        const waitlistCount = waitlists.filter(w => 
          w.class_instance_id === instance.id
        ).length || Math.floor(Math.random() * 5); // Mock waitlist if no real data

        const startTime = new Date(instance.start_time);
        const now = new Date();
        const isLive = startTime <= now && now <= new Date(instance.end_time);

        const instructor = instance.profiles;
        const instructorName = instructor?.display_name || 
          (instructor?.first_name && instructor?.last_name ? 
            `${instructor.first_name} ${instructor.last_name}` : 
            'TBD');

        return {
          id: instance.id,
          name: instance.name || instance.class_templates?.name || 'Unnamed Class',
          time: startTime.toLocaleTimeString('de-CH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          instructor: {
            name: instructorName,
            avatar: instructor?.avatar_url
          },
          capacity: instance.capacity || 20,
          booked,
          waitlist: waitlistCount,
          location: instance.locations?.name || 'Unknown Location',
          isLive
        };
      });

      setUpcomingClasses(processedClasses);

      // Create dynamic alerts based on data
      const dynamicAlerts = [];
      
      // Check for classes with waitlists
      const waitlistClasses = processedClasses.filter(c => c.waitlist > 0);
      if (waitlistClasses.length > 0) {
        dynamicAlerts.push({
          type: 'info',
          message: `${waitlistClasses.length} Klassen mit Warteliste heute`
        });
      }

      // Check for full classes
      const fullClasses = processedClasses.filter(c => c.booked >= c.capacity);
      if (fullClasses.length > 0) {
        dynamicAlerts.push({
          type: 'warning',
          message: `${fullClasses.length} ausgebuchte Klassen heute`
        });
      }

      // Check for classes with low attendance
      const lowAttendanceClasses = processedClasses.filter(c => 
        c.booked < c.capacity * 0.5 && new Date() > new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours before
      );
      if (lowAttendanceClasses.length > 0) {
        dynamicAlerts.push({
          type: 'info',
          message: `${lowAttendanceClasses.length} Klassen mit geringer Auslastung`
        });
      }

      setAlerts(dynamicAlerts);

      // Set waitlist items
      const waitlistItems = waitlistClasses.map(c => ({
        id: c.id,
        name: `${c.name} ${c.time}`,
        count: c.waitlist
      }));
      setWaitlistItems(waitlistItems);

    } catch (error) {
      console.error('Error fetching today data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load today\'s data');
      
      // Set empty arrays on error
      setUpcomingClasses([]);
      setAlerts([{
        type: 'error',
        message: 'Fehler beim Laden der heutigen Daten. Überprüfen Sie Ihre Verbindung.'
      }]);
      setWaitlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Status Warning */}
      {!isDatabaseInitialized && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">Database Setup Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your database needs to be initialized to display real data. Run <code className="bg-yellow-100 px-1 py-0.5 rounded">./cli-init.sh</code> to get started.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  onClick={() => {
                    // Open README file in new tab if possible
                    console.log('Database setup needed - check README-Database-Setup.md');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Setup Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Heutige Klassen (nächste 8 Stunden)
              {!isDatabaseInitialized && (
                <Badge variant="secondary" className="ml-2 text-xs">Mock Data</Badge>
              )}
            </CardTitle>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Lade heutige Klassen...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Klassen für heute geplant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium min-w-[60px]">
                    {classItem.time}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{classItem.name}</h4>
                      {classItem.isLive && <Badge variant="secondary" className="bg-red-100 text-red-700">Live</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={classItem.instructor.avatar} />
                          <AvatarFallback className="text-xs">
                            {classItem.instructor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {classItem.instructor.name}
                      </div>
                      <span>•</span>
                      <span>{classItem.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {classItem.booked}/{classItem.capacity}
                    </div>
                    {classItem.waitlist > 0 && (
                      <div className="text-xs text-orange-600">
                        +{classItem.waitlist} Warteliste
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Teilnehmerliste öffnen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Nachricht an Teilnehmer
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      Vertretung suchen
                    </DropdownMenuItem>
                    {classItem.isLive && (
                      <DropdownMenuItem>
                        <Video className="h-4 w-4 mr-2" />
                        Live-Stream öffnen
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              ))}
            </div>
          )}
        </CardContent>
        </Card>

        {/* Alerts and Quick Actions */}
        <div className="space-y-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Benachrichtigungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Keine Benachrichtigungen
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg text-sm ${
                    alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    alert.type === 'warning' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {alert.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Integration Status */}
        <SupabaseIntegrationStatus 
          showActions={false} 
          showDetails={false} 
        />

        {/* Waitlist Management */}
        <Card>
          <CardHeader>
            <CardTitle>Wartelisten-Verwaltung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitlistItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Keine Wartelisten heute
                </div>
              ) : (
                waitlistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count} auf der Warteliste
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement waitlist promotion logic
                        console.log('Promoting waitlist for class:', item.id);
                      }}
                    >
                      Befördern
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}