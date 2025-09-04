import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Plus, Settings, Zap, User } from 'lucide-react';

import { Program, Booking, DEMO_PROGRAMS, DEMO_BOOKINGS } from './constants';
import { ProgramMetrics } from './ProgramMetrics';
import { ProgramTabs } from './ProgramTabs';
import { CreateProgramDialog } from './CreateProgramDialog';

interface ProgramManagementDashboardProps {
  onPageChange?: (page: string) => void;
}

export function ProgramManagementDashboard({ onPageChange }: ProgramManagementDashboardProps = {}) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setPrograms(DEMO_PROGRAMS);
      setBookings(DEMO_BOOKINGS);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading programs dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <User className="h-7 w-7 text-primary" />
            Programs Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage individual 1-to-1 programs, bookings, and instructor services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            Appointment-Based
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPageChange?.('programs-booking')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Test Booking
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      <ProgramMetrics programs={programs} />

      <ProgramTabs 
        programs={programs}
        bookings={bookings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <CreateProgramDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}