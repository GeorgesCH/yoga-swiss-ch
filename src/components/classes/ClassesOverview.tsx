import React, { useState } from 'react';
import { Calendar, CalendarPlus, CalendarClock, RefreshCw, ClipboardList, UserCheck, MapPin, Mountain } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ClassesManagement } from '../schedule/ClassesManagement';
import { BookingEngine } from '../core/BookingEngine';
import { AdvancedScheduleManager } from '../core/AdvancedScheduleManager';
import { RecurringClassManagement } from '../RecurringClassManagement';
import { RegistrationManagement } from '../registrations/RegistrationManagement';
import { ComprehensiveRegistrationSystem } from '../core/ComprehensiveRegistrationSystem';
import { CancellationRefundSystem } from '../core/CancellationRefundSystem';
import { LocationsManagement } from '../locations/LocationsManagement';
import { RetreatManagement } from '../retreats/RetreatManagement';
import { CreateRetreatWizard } from '../retreats/CreateRetreatWizard';
import { ClassScheduleManager } from './ClassScheduleManager';
import { ClassCreationWizard } from './ClassCreationWizard';

interface ClassesOverviewProps {
  onPageChange?: (page: string) => void;
  selectedTemplate?: any;
  setSelectedTemplate?: (template: any) => void;
  showCreateRetreat?: boolean;
  setShowCreateRetreat?: (show: boolean) => void;
  editingRetreat?: string | null;
  setEditingRetreat?: (id: string | null) => void;
}

export function ClassesOverview({ 
  onPageChange,
  selectedTemplate,
  setSelectedTemplate,
  showCreateRetreat = false,
  setShowCreateRetreat,
  editingRetreat,
  setEditingRetreat
}: ClassesOverviewProps) {
  const [activeTab, setActiveTab] = useState('schedule');

  const classStats = [
    {
      title: "Today's Classes",
      value: '12',
      change: '+2 from yesterday',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Total Bookings',
      value: '248',
      change: '+18 from yesterday',
      icon: ClipboardList,
      color: 'text-green-600'
    },
    {
      title: 'Active Registrations',
      value: '189',
      change: '3 pending confirmation',
      icon: UserCheck,
      color: 'text-orange-600'
    },
    {
      title: 'Available Spots',
      value: '67',
      change: 'Across all classes',
      icon: CalendarPlus,
      color: 'text-purple-600'
    }
  ];

  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const handleCreateClass = () => {
    setShowCreateWizard(true);
  };

  const handleWizardComplete = (classData: any) => {
    console.log('Class created:', classData);
    setShowCreateWizard(false);
    // Refresh data or navigate as needed
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Classes Management</h1>
          <p className="text-muted-foreground">
            Manage your class schedule, bookings, locations, and registrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Export Schedule
          </Button>
          <Button size="sm" onClick={handleCreateClass}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Classes Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="recurring" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Recurring
          </TabsTrigger>
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Registrations
          </TabsTrigger>
          <TabsTrigger value="registration-system" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Cancellations
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="outdoor" className="flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Outdoor
          </TabsTrigger>
          <TabsTrigger value="retreats" className="flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Retreats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Class Schedule</h3>
              <p className="text-muted-foreground">View and manage your class schedule</p>
            </div>
            <Badge variant="secondary">12 classes today</Badge>
          </div>
          <ClassScheduleManager />
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Booking Engine</h3>
              <p className="text-muted-foreground">Manage bookings and customer experience</p>
            </div>
            <Badge variant="secondary">248 active bookings</Badge>
          </div>
          <BookingEngine />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Advanced Scheduling</h3>
              <p className="text-muted-foreground">Advanced scheduling features and automation</p>
            </div>
            <Badge variant="secondary">Pro features</Badge>
          </div>
          <AdvancedScheduleManager />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recurring Classes</h3>
              <p className="text-muted-foreground">Manage recurring class series and templates</p>
            </div>
            <Badge variant="secondary">Active series</Badge>
          </div>
          <RecurringClassManagement />
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Registrations</h3>
              <p className="text-muted-foreground">View and manage class registrations</p>
            </div>
            <Badge variant="destructive">3 pending</Badge>
          </div>
          <RegistrationManagement />
        </TabsContent>

        <TabsContent value="registration-system" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Registration System</h3>
              <p className="text-muted-foreground">Comprehensive registration management</p>
            </div>
            <Badge variant="secondary">System settings</Badge>
          </div>
          <ComprehensiveRegistrationSystem />
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cancellations & Refunds</h3>
              <p className="text-muted-foreground">Handle cancellations and process refunds</p>
            </div>
            <Badge variant="secondary">CHF refund system</Badge>
          </div>
          <CancellationRefundSystem />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Locations & Resources</h3>
              <p className="text-muted-foreground">Manage studio locations and resources</p>
            </div>
            <Badge variant="secondary">5 locations</Badge>
          </div>
          <LocationsManagement />
        </TabsContent>

        {/* Outdoor locations disabled in production until backend is ready */}

        <TabsContent value="retreats" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Retreat Management</h3>
              <p className="text-muted-foreground">Manage yoga retreats and workshops</p>
            </div>
            <Badge variant="secondary">Swiss locations</Badge>
          </div>
          {showCreateRetreat || editingRetreat ? (
            <CreateRetreatWizard
              onCancel={() => {
                setShowCreateRetreat?.(false);
                setEditingRetreat?.(null);
              }}
              onComplete={() => {
                setShowCreateRetreat?.(false);
                setEditingRetreat?.(null);
              }}
              editingRetreat={editingRetreat}
            />
          ) : (
            <RetreatManagement
              onCreateRetreat={() => setShowCreateRetreat?.(true)}
              onEditRetreat={(id) => setEditingRetreat?.(id)}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Class Creation Wizard */}
      <ClassCreationWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
