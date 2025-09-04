import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calendar, 
  TrendingUp,
  Star,
  Target,
  Activity,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';

import { Program, Booking } from './constants';
import { formatCurrency, getCategoryBadge, getDeliveryModeBadge, getStatusBadge } from './utils';
import { ProgramCard } from './ProgramCard';

interface ProgramTabsProps {
  programs: Program[];
  bookings: Booking[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ProgramTabs({ programs, bookings, activeTab, setActiveTab }: ProgramTabsProps) {
  const recentBookings = bookings
    .filter(b => ['confirmed', 'in_progress'].includes(b.status))
    .sort((a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())
    .slice(0, 5);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="programs" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Programs
        </TabsTrigger>
        <TabsTrigger value="bookings" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Bookings
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Program Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5" />
                Program Performance
              </CardTitle>
              <CardDescription>Revenue and booking performance by program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.slice(0, 4).map((program) => {
                  const conversionRate = program.total_bookings > 0 ? (program.confirmed_bookings / program.total_bookings) * 100 : 0;
                  const categoryBadge = getCategoryBadge(program.category);
                  const deliveryMode = getDeliveryModeBadge(program.delivery_mode);
                  const DeliveryIcon = deliveryMode.icon;
                  
                  return (
                    <div key={program.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{program.title}</h4>
                          <Badge className={categoryBadge.color} variant="outline">
                            {categoryBadge.text}
                          </Badge>
                          <DeliveryIcon className={`h-3 w-3 ${deliveryMode.color}`} />
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(program.revenue)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={conversionRate} className="flex-1" />
                        <div className="text-sm text-muted-foreground">
                          {program.confirmed_bookings}/{program.total_bookings}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{program.instructor_name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{program.avg_rating}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
              <CardDescription>Latest program bookings and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const progress = booking.total_sessions > 0 ? (booking.sessions_completed / booking.total_sessions) * 100 : 0;

                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`/api/placeholder/32/32`} />
                          <AvatarFallback>
                            {booking.customer_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{booking.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{booking.program_title}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.sessions_completed}/{booking.total_sessions} sessions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={statusBadge.color} variant="outline">
                          {statusBadge.text}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(booking.total_price)}
                        </div>
                        {booking.total_sessions > 1 && (
                          <div className="w-16 mt-1">
                            <Progress value={progress} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="programs" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">All Programs</h3>
            <p className="text-muted-foreground">Manage your individual service programs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search programs..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="bookings" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">All Bookings</h3>
            <p className="text-muted-foreground">Manage program bookings and sessions</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            const progress = booking.total_sessions > 0 ? (booking.sessions_completed / booking.total_sessions) * 100 : 0;

            return (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/40/40`} />
                        <AvatarFallback>
                          {booking.customer_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{booking.customer_name}</h4>
                          <Badge className={statusBadge.color} variant="outline">
                            {statusBadge.text}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.program_title} • {booking.variant_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Instructor: {booking.instructor_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold mb-1">
                        {formatCurrency(booking.total_price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.sessions_completed}/{booking.total_sessions} sessions
                      </div>
                      {booking.total_sessions > 1 && (
                        <div className="w-24 mt-2">
                          <Progress value={progress} />
                        </div>
                      )}
                      {booking.next_session_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Next: {new Date(booking.next_session_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Program Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Coaching</span>
                  <span className="text-sm font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mobility</span>
                  <span className="text-sm font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Reiki</span>
                  <span className="text-sm font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Private Classes</span>
                  <span className="text-sm font-medium">1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Delivery Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">In-Person</span>
                  <span className="text-sm font-medium">50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Hybrid</span>
                  <span className="text-sm font-medium">50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Online</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Confirmed</span>
                  <span className="text-sm font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="text-sm font-medium">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="text-sm font-medium">11%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-medium">96%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Rating</span>
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rebooking Rate</span>
                  <span className="text-sm font-medium">43%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}