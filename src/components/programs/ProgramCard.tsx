import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Star, User, Edit, Eye, MessageSquare } from 'lucide-react';
import { Program } from './constants';
import { formatCurrency, getCategoryBadge, getDeliveryModeBadge } from './utils';

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const categoryBadge = getCategoryBadge(program.category);
  const deliveryMode = getDeliveryModeBadge(program.delivery_mode);
  const DeliveryIcon = deliveryMode.icon;
  const conversionRate = program.total_bookings > 0 ? (program.confirmed_bookings / program.total_bookings) * 100 : 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{program.title}</h4>
                <Badge className={categoryBadge.color} variant="outline">
                  {categoryBadge.text}
                </Badge>
                {program.status === 'active' && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {program.instructor_name}
                </span>
                <span className="flex items-center gap-1">
                  <DeliveryIcon className={`h-3 w-3 ${deliveryMode.color}`} />
                  {deliveryMode.text}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {program.session_length_min}min
                </span>
                {program.is_multi_session && (
                  <Badge variant="outline" className="text-xs">Multi-Session</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{program.avg_rating}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {program.total_bookings} bookings
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {program.confirmed_bookings}
            </div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(program.revenue)}
            </div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {Math.round(conversionRate)}%
            </div>
            <div className="text-xs text-muted-foreground">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {program.visibility === 'public' ? 'Public' : 'Private'}
            </div>
            <div className="text-xs text-muted-foreground">Visibility</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Created {new Date(program.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Bookings
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}