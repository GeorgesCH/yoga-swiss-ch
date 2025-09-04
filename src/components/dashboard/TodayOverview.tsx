import { Clock, Users, Video, MessageSquare, UserCheck, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
  const upcomingClasses: ClassItem[] = [
    {
      id: '1',
      name: 'Vinyasa Flow',
      time: '09:00',
      instructor: { name: 'Sarah Müller', avatar: '/avatars/sarah.jpg' },
      capacity: 20,
      booked: 18,
      waitlist: 3,
      location: 'Studio A',
      isLive: false
    },
    {
      id: '2',
      name: 'Hatha Yoga',
      time: '10:30',
      instructor: { name: 'Marcus Weber', avatar: '/avatars/marcus.jpg' },
      capacity: 15,
      booked: 12,
      waitlist: 0,
      location: 'Studio B',
      isLive: false
    },
    {
      id: '3',
      name: 'Power Yoga',
      time: '12:00',
      instructor: { name: 'Lisa Chen', avatar: '/avatars/lisa.jpg' },
      capacity: 25,
      booked: 25,
      waitlist: 7,
      location: 'Studio A',
      isLive: true
    },
    {
      id: '4',
      name: 'Yin Yoga',
      time: '18:00',
      instructor: { name: 'Anna Schmidt', avatar: '/avatars/anna.jpg' },
      capacity: 18,
      booked: 15,
      waitlist: 0,
      location: 'Studio C',
      isLive: true
    }
  ];

  const alerts = [
    { type: 'error', message: 'Zoom-Link fehlt für Power Yoga 12:00' },
    { type: 'warning', message: '3 unbezahlte Buchungen für heute' },
    { type: 'info', message: '5 Wartelisten-Plätze verfügbar' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Upcoming Classes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Heutige Klassen (nächste 8 Stunden)
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              {alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg text-sm ${
                  alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  alert.type === 'warning' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waitlist Management */}
        <Card>
          <CardHeader>
            <CardTitle>Wartelisten-Verwaltung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded border">
                <div>
                  <div className="text-sm font-medium">Power Yoga 12:00</div>
                  <div className="text-xs text-muted-foreground">7 auf der Warteliste</div>
                </div>
                <Button size="sm" variant="outline">
                  Befördern
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded border">
                <div>
                  <div className="text-sm font-medium">Vinyasa Flow 09:00</div>
                  <div className="text-xs text-muted-foreground">3 auf der Warteliste</div>
                </div>
                <Button size="sm" variant="outline">
                  Benachrichtigen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}