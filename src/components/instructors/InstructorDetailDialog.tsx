import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  User, Mail, Phone, Calendar, Star, BookOpen, Clock,
  Award, Globe, MessageSquare, Settings, Edit2
} from 'lucide-react';

interface InstructorDetailDialogProps {
  instructor: any;
  onClose: () => void;
  onSchedule?: () => void;
}

export function InstructorDetailDialog({ instructor, onClose, onSchedule }: InstructorDetailDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={instructor.avatar} />
                <AvatarFallback>{getInitials(instructor.firstName, instructor.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {instructor.firstName} {instructor.lastName}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Instructor since {formatDate(instructor.joinedDate)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onSchedule}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{instructor.email}</span>
              </div>
              {instructor.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{instructor.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline">{instructor.language}</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={
                  instructor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }>
                  {instructor.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Teaching Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Classes</span>
                <span className="font-semibold">{instructor.totalClasses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="font-semibold">{formatDate(instructor.joinedDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Activity</span>
                <span className="font-semibold">
                  {instructor.lastActivity ? formatDate(instructor.lastActivity) : 'Never'}
                </span>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full" onClick={onSchedule}>
                <Calendar className="w-4 h-4 mr-2" />
                View Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Qualifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Language</span>
                <Badge variant="outline">{instructor.language}</Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={
                  instructor.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }>
                  {instructor.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Classes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Recent classes will appear here</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}