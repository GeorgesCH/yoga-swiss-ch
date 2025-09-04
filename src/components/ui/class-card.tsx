import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { PolicyBadge, CancellationPolicyBadge } from './policy-badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  CreditCard,
  Wifi,
  Mountain,
  ChevronRight,
  Eye,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Zap,
  Ticket
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from './utils';
import { toast } from 'sonner';

export interface ClassData {
  id: string;
  name: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  studio: {
    name: string;
    location: string;
    distance?: number;
  };
  schedule: {
    date: Date | string;
    time: string;
    duration: number;
  };
  pricing: {
    price: number;
    originalPrice?: number;
    currency?: string;
  };
  capacity: {
    total: number;
    booked: number;
    waitlist?: number;
  };
  details: {
    level: string;
    style: string;
    language?: string;
    isOnline?: boolean;
    isOutdoor?: boolean;
    isHotRoom?: boolean;
    cancellationPolicy?: string;
    passesAccepted?: string[];
    hasDropInPrice?: boolean;
  };
  image?: string;
  tags?: string[];
  status?: 'scheduled' | 'cancelled' | 'completed' | 'in_progress';
  featured?: boolean;
}

interface ClassCardProps {
  classData: ClassData;
  variant?: 'default' | 'compact' | 'detailed' | 'admin';
  showQuickBook?: boolean;
  showFavorite?: boolean;
  onBook?: (classData: ClassData) => void;
  onViewDetails?: (classId: string) => void;
  onFavorite?: (classId: string, favorited: boolean) => void;
  onEdit?: (classId: string) => void;
  className?: string;
}

export function ClassCard({
  classData,
  variant = 'default',
  showQuickBook = true,
  showFavorite = true,
  onBook,
  onViewDetails,
  onFavorite,
  onEdit,
  className
}: ClassCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (amount: number) => {
    const currency = classData.pricing.currency || 'CHF';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes === 60) {
      return '1h';
    } else if (minutes === 75) {
      return '1h 15min';
    } else if (minutes === 90) {
      return '1h 30min';
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  const spotsLeft = classData.capacity.total - classData.capacity.booked;
  const occupancyRate = (classData.capacity.booked / classData.capacity.total) * 100;
  const spotsColor = spotsLeft <= 3 ? 'text-red-600' : spotsLeft <= 8 ? 'text-orange-600' : 'text-green-600';
  const isFull = spotsLeft <= 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorited = !isFavorited;
    setIsFavorited(newFavorited);
    onFavorite?.(classData.id, newFavorited);
    toast.success(newFavorited ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleBook = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFull) return;
    
    setIsBooking(true);
    try {
      onBook?.(classData);
      toast.success(`Added ${classData.name} to cart`);
    } catch (error) {
      toast.error('Failed to book class');
    } finally {
      setIsBooking(false);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(classData.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(classData.id);
  };

  // Compact variant for lists and small spaces
  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-md transition-all duration-200",
          className
        )}
        onClick={handleViewDetails}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={classData.image || '/placeholder-yoga-1.jpg'}
                alt={classData.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium group-hover:text-primary transition-colors truncate">
                    {classData.name}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {classData.instructor.name} • {classData.studio.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(classData.schedule.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatTime(classData.schedule.time)} ({formatDuration(classData.schedule.duration)})</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-medium">{formatPrice(classData.pricing.price)}</div>
                  <div className={`text-sm ${spotsColor}`}>
                    {spotsLeft} spots left
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin variant for management interfaces
  if (variant === 'admin') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-md transition-all duration-200",
          className
        )}
        onClick={handleViewDetails}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={classData.image || '/placeholder-yoga-1.jpg'}
                alt={classData.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{classData.name}</h4>
                    {classData.status && (
                      <Badge 
                        className={
                          classData.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          classData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          classData.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {classData.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {classData.instructor.name} • {classData.studio.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(classData.schedule.date)} at {formatTime(classData.schedule.time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{classData.capacity.booked}/{classData.capacity.total}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">{formatPrice(classData.pricing.price)}</div>
                  <div className="text-sm text-muted-foreground">{Math.round(occupancyRate)}% full</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleViewDetails}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - detailed card for main displays
  return (
    <Card 
      className={cn(
        "group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden",
        classData.featured && "border-primary/50 shadow-md",
        className
      )}
      onClick={handleViewDetails}
    >
      {/* Image Header */}
      <div className="relative aspect-video overflow-hidden">
        <ImageWithFallback
          src={classData.image || '/placeholder-yoga-1.jpg'}
          alt={classData.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {classData.details.isOnline && (
            <Badge className="bg-blue-100 text-blue-700">
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </Badge>
          )}
          {classData.details.isOutdoor && (
            <Badge className="bg-green-100 text-green-700">
              <Mountain className="h-3 w-3 mr-1" />
              Outdoor
            </Badge>
          )}
          {classData.details.isHotRoom && (
            <Badge className="bg-orange-100 text-orange-700">
              <Zap className="h-3 w-3 mr-1" />
              Heated
            </Badge>
          )}
          {classData.pricing.originalPrice && classData.pricing.originalPrice > classData.pricing.price && (
            <Badge className="bg-red-100 text-red-700">
              Sale
            </Badge>
          )}
          {classData.featured && (
            <Badge className="bg-yellow-100 text-yellow-700">
              Featured
            </Badge>
          )}
          {classData.schedule.duration === 75 && (
            <Badge className="bg-purple-100 text-purple-700">
              75 min
            </Badge>
          )}
          {classData.schedule.duration === 90 && (
            <Badge className="bg-purple-100 text-purple-700">
              90 min
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        {showFavorite && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-lg">{classData.name}</div>
              <div className="text-sm text-white/90">{classData.details.style} • {classData.details.level}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">{formatPrice(classData.pricing.price)}</div>
              {classData.pricing.originalPrice && classData.pricing.originalPrice > classData.pricing.price && (
                <div className="text-sm text-white/70 line-through">
                  {formatPrice(classData.pricing.originalPrice)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Instructor */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={classData.instructor.avatar} />
            <AvatarFallback>
              {classData.instructor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{classData.instructor.name}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{classData.instructor.rating}</span>
              <span>•</span>
              <span>{classData.studio.name}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(classData.schedule.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(classData.schedule.time)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(classData.schedule.duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{classData.studio.location}</span>
            {classData.studio.distance && (
              <>
                <span>•</span>
                <span>{classData.studio.distance}km away</span>
              </>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span className={`font-medium ${spotsColor}`}>
              {spotsLeft} spots left
            </span>
          </div>
          <Progress value={occupancyRate} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{classData.capacity.booked} booked</span>
            <span>{classData.capacity.total} total</span>
          </div>
        </div>

        {/* Policies and Payment Options */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <CancellationPolicyBadge 
              timeLimit={classData.details.cancellationPolicy || "24h"} 
              className="text-xs" 
            />
          </div>
          
          {/* Payment Options */}
          <div className="flex items-center gap-2 text-xs">
            {classData.details.hasDropInPrice !== false && (
              <div className="flex items-center gap-1 text-green-600">
                <CreditCard className="h-3 w-3" />
                <span>Drop-in: {formatPrice(classData.pricing.price)}</span>
              </div>
            )}
            {classData.details.passesAccepted && classData.details.passesAccepted.length > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <Ticket className="h-3 w-3" />
                <span>{classData.details.passesAccepted.length} pass{classData.details.passesAccepted.length > 1 ? 'es' : ''} accepted</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {classData.tags && classData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {classData.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {classData.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{classData.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showQuickBook && (
            <>
              {isFull ? (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleBook}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Waitlist
                  {classData.capacity.waitlist && classData.capacity.waitlist > 0 && (
                    <span className="ml-1">({classData.capacity.waitlist})</span>
                  )}
                </Button>
              ) : (
                <Button 
                  className="flex-1" 
                  onClick={handleBook}
                  disabled={isBooking}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isBooking ? 'Booking...' : 'Book Now'}
                </Button>
              )}
            </>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleViewDetails}
          >
            {variant === 'detailed' ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Status indicators */}
        {isFull && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>This class is fully booked</span>
          </div>
        )}
        
        {classData.status === 'cancelled' && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>This class has been cancelled</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}