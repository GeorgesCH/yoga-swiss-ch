import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SwissFranc, Target, Calendar, Star, Clock, Heart, Award } from 'lucide-react';
import { Program } from './constants';
import { formatCurrency } from './utils';

interface ProgramMetricsProps {
  programs: Program[];
}

export function ProgramMetrics({ programs }: ProgramMetricsProps) {
  const totalRevenue = programs.reduce((sum, program) => sum + program.revenue, 0);
  const totalBookings = programs.reduce((sum, program) => sum + program.total_bookings, 0);
  const avgRating = programs.reduce((sum, program) => sum + program.avg_rating, 0) / programs.length;
  const activePrograms = programs.filter(p => p.status === 'active').length;

  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <SwissFranc className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+34% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
            <p className="text-xs text-muted-foreground">{programs.length} total programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Across all programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Avg Session Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(programs.reduce((sum, p) => sum + p.session_length_min, 0) / programs.length)} min
            </div>
            <p className="text-xs text-muted-foreground">Across all programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Client Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Complete their programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              Instructor Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9/5</div>
            <p className="text-xs text-muted-foreground">Average across instructors</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}