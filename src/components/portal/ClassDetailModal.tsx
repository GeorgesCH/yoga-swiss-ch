import React, { useState } from 'react';
import { usePortal } from './PortalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  Share2,
  CreditCard,
  Wifi,
  Mountain,
  CheckCircle,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Globe,
  X
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface ClassDetail {
  id: string;
  name: string;
  instructor: {
    name: string;
    bio?: string;
    rating: number;
    image: string;
    specialties?: string[];
    experience?: string;
    certifications?: string[];
    email?: string;
    phone?: string;
    website?: string;
  };
  studio: {
    name: string;
    address: string;
    distance: number;
    rating?: number;
    amenities?: string[];
    image?: string;
    phone?: string;
    website?: string;
  };
  date: Date;
  time: string;
  duration: number;
  level: string;
  style: string;
  language: string;
  price: number;
  originalPrice?: number;
  spotsTotal: number;
  spotsLeft: number;
  isOutdoor: boolean;
  image: string;
  tags: string[];
  description?: string;
  benefits?: string[];
  requirements?: string[];
  equipment?: string[];
  cancellationPolicy?: string;
  isOnline?: boolean;
  onlineUrl?: string;
  features?: {
    heatedRoom?: boolean;
    musicIncluded?: boolean;
    matsProvided?: boolean;
    towelsProvided?: boolean;
    waterIncluded?: boolean;
    parkingAvailable?: boolean;
    accessibleVenue?: boolean;
  };
}

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string | null;
  onBook?: (classData: any) => void;
}

export function ClassDetailModal({ isOpen, onClose, classId, onBook }: ClassDetailModalProps) {
  const { addToCart, isAuthenticated } = usePortal();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock class data - in real app, this would be fetched based on classId
  const classData: ClassDetail | null = classId ? {
    id: classId,
    name: 'Vinyasa Flow Mastery',
    instructor: {
      name: 'Sarah Miller',
      bio: 'Sarah has been teaching yoga for over 10 years and specializes in Vinyasa and Power Yoga. She believes in making yoga accessible to everyone and creates a welcoming environment for all levels.',
      rating: 4.9,
      image: '/placeholder-instructor-1.jpg',
      specialties: ['Vinyasa', 'Power Yoga', 'Meditation'],
      experience: '10+ years',
      certifications: ['RYT 500', 'Yin Yoga Certified', 'Meditation Teacher'],
      email: 'sarah@flowstudio.ch',
      phone: '+41 44 123 4567'
    },
    studio: {
      name: 'Flow Studio Zürich',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      distance: 0.8,
      rating: 4.8,
      amenities: ['Parking', 'Showers', 'Mat Storage', 'Café', 'Shop'],
      image: '/placeholder-studio-1.jpg',
      phone: '+41 44 123 4567',
      website: 'flowstudio.ch'
    },
    date: new Date(2024, 11, 15),
    time: '18:30',
    duration: 75,
    level: 'All Levels',
    style: 'Vinyasa',
    language: 'English',
    price: 32,
    originalPrice: 40,
    spotsTotal: 20,
    spotsLeft: 5,
    isOutdoor: false,
    image: '/placeholder-yoga-1.jpg',
    tags: ['Strength', 'Flow', 'Beginner Friendly', 'Heated'],
    description: 'Join Sarah for a dynamic Vinyasa flow class that will challenge your strength and flexibility while calming your mind. This class is perfect for practitioners of all levels who want to deepen their practice.',
    benefits: [
      'Improved flexibility and strength',
      'Better balance and coordination', 
      'Stress relief and mental clarity',
      'Enhanced breathing awareness'
    ],
    requirements: [
      'No prior yoga experience required',
      'Arrive 10 minutes early for setup',
      'Bring water and a towel'
    ],
    equipment: ['Yoga mat (provided)', 'Blocks (available)', 'Straps (available)'],
    cancellationPolicy: 'Free cancellation up to 12 hours before class start time',
    features: {
      heatedRoom: true,
      musicIncluded: true,
      matsProvided: true,
      towelsProvided: false,
      waterIncluded: false,
      parkingAvailable: true,
      accessibleVenue: true
    }
  } : null;

  if (!classData) return null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to book a class');
        return;
      }

      const cartItem = {
        id: classData.id,
        type: 'class',
        name: classData.name,
        date: classData.date,
        time: classData.time,
        price: classData.price,
        quantity: quantity,
        instructorName: classData.instructor.name,
        studioName: classData.studio.name,
        location: classData.studio.address
      };

      addToCart(cartItem);
      
      if (onBook) {
        onBook(cartItem);
      }

      toast.success(`Added ${classData.name} to cart`);
      onClose();
    } catch (error) {
      toast.error('Failed to add class to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: classData.name,
        text: `Join me for ${classData.name} with ${classData.instructor.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const spotsColor = classData.spotsLeft <= 3 ? 'text-red-600' : classData.spotsLeft <= 8 ? 'text-orange-600' : 'text-green-600';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        {/* Header Image */}
        <div className="relative h-64 w-full">
          <ImageWithFallback
            src={classData.image}
            alt={classData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Close button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 rounded-full w-8 h-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Action buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full w-8 h-8 p-0"
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full w-8 h-8 p-0"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Class info overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${classData.isOutdoor ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white'}`}>
                {classData.isOutdoor ? (
                  <>
                    <Mountain className="h-3 w-3 mr-1" />
                    Outdoor
                  </>
                ) : (
                  'Indoor'
                )}
              </Badge>
              {classData.originalPrice && classData.originalPrice > classData.price && (
                <Badge className="bg-red-100 text-red-700">
                  Sale
                </Badge>
              )}
              {classData.isOnline && (
                <Badge className="bg-blue-100 text-blue-700">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold mb-1">{classData.name}</h1>
            <p className="text-white/90">with {classData.instructor.name}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">{formatDate(classData.date)}</div>
                <div className="text-muted-foreground">{classData.time}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">{classData.duration} minutes</div>
                <div className="text-muted-foreground">{classData.level}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className={`font-medium ${spotsColor}`}>
                  {classData.spotsLeft} spots left
                </div>
                <div className="text-muted-foreground">of {classData.spotsTotal}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">{classData.studio.distance}km away</div>
                <div className="text-muted-foreground">{classData.language}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {classData.description && (
            <div className="space-y-2">
              <h3>About This Class</h3>
              <p className="text-muted-foreground">{classData.description}</p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {classData.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Instructor */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={classData.instructor.image} />
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
                      <span>{classData.instructor.experience}</span>
                    </div>
                  </div>
                </div>

                {classData.instructor.bio && (
                  <p className="text-sm text-muted-foreground mb-3">{classData.instructor.bio}</p>
                )}

                {classData.instructor.specialties && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Specialties</div>
                    <div className="flex flex-wrap gap-1">
                      {classData.instructor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {classData.instructor.email && (
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Studio */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">{classData.studio.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{classData.studio.rating}</span>
                      <span>•</span>
                      <span>{classData.studio.distance}km away</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-muted-foreground">{classData.studio.address}</span>
                  </div>

                  {classData.studio.amenities && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Amenities</div>
                      <div className="flex flex-wrap gap-1">
                        {classData.studio.amenities.map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class Features */}
          {classData.features && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">What's Included</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {classData.features.heatedRoom && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Heated Room
                    </div>
                  )}
                  {classData.features.musicIncluded && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Music Included
                    </div>
                  )}
                  {classData.features.matsProvided && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Mats Provided
                    </div>
                  )}
                  {classData.features.parkingAvailable && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Parking Available
                    </div>
                  )}
                  {classData.features.accessibleVenue && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Wheelchair Accessible
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Information */}
          <div className="space-y-4">
            {classData.requirements && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 mb-2">Before You Come</div>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {classData.requirements.map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {classData.cancellationPolicy && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-900 mb-1">Cancellation Policy</div>
                    <p className="text-sm text-orange-800">{classData.cancellationPolicy}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Section */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{formatPrice(classData.price)}</span>
                    {classData.originalPrice && classData.originalPrice > classData.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(classData.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">per person</div>
                </div>
                <div className={`text-right ${spotsColor}`}>
                  <div className="font-medium">{classData.spotsLeft} spots left</div>
                  <div className="text-sm">of {classData.spotsTotal} total</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleBookNow}
                  disabled={classData.spotsLeft === 0 || isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Adding...' : classData.spotsLeft === 0 ? 'Fully Booked' : 'Book Now'}
                </Button>
                {classData.spotsLeft === 0 && (
                  <Button variant="outline" size="lg">
                    Join Waitlist
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center mt-3">
                You'll be redirected to checkout to complete your booking
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}