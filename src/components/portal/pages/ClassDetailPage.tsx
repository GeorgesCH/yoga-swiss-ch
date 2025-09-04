import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
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
  ArrowLeft,
  ChevronRight,
  Target,
  Award,
  BookOpen,
  Zap,
  ShieldCheck,
  Gift,
  Plus,
  Minus,
  Smartphone
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface ClassDetailPageProps {
  classId: string;
  onPageChange: (page: string) => void;
}

export function ClassDetailPage({ classId, onPageChange }: ClassDetailPageProps) {
  const { addToCart, isAuthenticated, currentLocation } = usePortal();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock class data - in real app, this would be fetched based on classId
  const classData = {
    id: classId,
    name: 'Vinyasa Flow Mastery',
    subtitle: 'Energizing Flow for All Levels',
    instructor: {
      id: 'instructor-1',
      name: 'Sarah Miller',
      bio: 'Sarah has been teaching yoga for over 10 years and specializes in Vinyasa and Power Yoga. She believes in making yoga accessible to everyone and creates a welcoming environment for all levels. Her classes blend traditional asana practice with modern sequencing to create a transformative experience.',
      rating: 4.9,
      totalReviews: 324,
      image: '/placeholder-instructor-1.jpg',
      specialties: ['Vinyasa', 'Power Yoga', 'Meditation', 'Pranayama'],
      experience: '10+ years',
      certifications: ['RYT 500', 'Yin Yoga Certified', 'Meditation Teacher', 'Trauma-Informed Yoga'],
      email: 'sarah@flowstudio.ch',
      phone: '+41 44 123 4567',
      socialMedia: {
        instagram: '@sarahyoga_zurich',
        website: 'sarahyoga.ch'
      },
      achievements: ['Top Rated Instructor 2023', 'Yoga Alliance Continuing Education Provider']
    },
    studio: {
      id: 'studio-1',
      name: 'Flow Studio Zürich',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      distance: 0.8,
      rating: 4.8,
      totalReviews: 892,
      amenities: ['Parking', 'Showers', 'Mat Storage', 'Café', 'Shop', 'Lockers', 'WiFi'],
      image: '/placeholder-studio-1.jpg',
      phone: '+41 44 123 4567',
      website: 'flowstudio.ch',
      features: ['Heated Studios', 'Premium Sound System', 'Air Purification', 'Bamboo Floors']
    },
    schedule: {
      date: new Date(2024, 11, 15),
      time: '18:30',
      endTime: '19:45',
      duration: 75,
      timezone: 'CET'
    },
    pricing: {
      price: 32,
      originalPrice: 40,
      currency: 'CHF',
      discountPercentage: 20,
      packageOptions: [
        { name: 'Single Drop-in', price: 32, savings: 0 },
        { name: '5-Class Package', price: 140, savings: 20, pricePerClass: 28 },
        { name: '10-Class Package', price: 260, savings: 60, pricePerClass: 26 },
        { name: 'Monthly Unlimited', price: 149, savings: 'Best Value', unlimited: true }
      ]
    },
    capacity: {
      total: 20,
      booked: 15,
      waitlist: 3
    },
    details: {
      level: 'All Levels',
      style: 'Vinyasa',
      language: 'English',
      isOutdoor: false,
      isOnline: false,
      temperature: 'Heated (26-28°C)'
    },
    media: {
      image: '/placeholder-yoga-1.jpg',
      gallery: [
        '/placeholder-yoga-1.jpg',
        '/placeholder-studio-1.jpg', 
        '/placeholder-yoga-2.jpg',
        '/placeholder-yoga-3.jpg'
      ]
    },
    tags: ['Strength', 'Flow', 'Beginner Friendly', 'Heated', 'Core Focus', 'Mindfulness'],
    description: 'Join Sarah for a dynamic Vinyasa flow class that will challenge your strength and flexibility while calming your mind. This 75-minute session flows through creative sequences that build heat, improve coordination, and leave you feeling energized yet relaxed. Perfect for practitioners of all levels who want to deepen their practice and explore new movement patterns.',
    benefits: [
      'Improved flexibility and strength',
      'Better balance and coordination', 
      'Stress relief and mental clarity',
      'Enhanced breathing awareness',
      'Increased body awareness',
      'Improved posture and alignment',
      'Boosted energy levels',
      'Better sleep quality'
    ],
    requirements: [
      'No prior yoga experience required',
      'Arrive 10-15 minutes early for setup',
      'Bring water and a towel',
      'Wear comfortable, breathable clothing',
      'Avoid heavy meals 2 hours before class'
    ],
    equipment: [
      'Yoga mat (provided or bring your own)',
      'Yoga blocks (available)',
      'Yoga straps (available)',
      'Bolsters (available)',
      'Blankets (available)'
    ],
    policies: {
      cancellation: 'Free cancellation up to 12 hours before class start time',
      lateArrival: 'Late arrivals (>10 minutes) may not be admitted for safety reasons',
      refund: 'Refunds available up to 24 hours before class',
      transfers: 'Class transfers allowed up to 6 hours before start time'
    },
    features: {
      heatedRoom: true,
      musicIncluded: true,
      matsProvided: true,
      towelsProvided: false,
      waterIncluded: false,
      parkingAvailable: true,
      accessibleVenue: true,
      showerFacilities: true,
      lockerStorage: true,
      retailShop: true
    },
    reviews: [
      {
        id: 'review-1',
        author: 'Maria K.',
        rating: 5,
        date: '2024-02-10',
        comment: 'Amazing class! Sarah creates such a welcoming environment and her cues are perfect. I always leave feeling refreshed and strong.',
        verified: true
      },
      {
        id: 'review-2', 
        author: 'Thomas R.',
        rating: 5,
        date: '2024-02-08',
        comment: 'Perfect balance of challenge and accessibility. Great for building strength while staying mindful.',
        verified: true
      },
      {
        id: 'review-3',
        author: 'Lisa M.',
        rating: 4,
        date: '2024-02-05',
        comment: 'Love the heated room and Sarah\'s teaching style. The class flows beautifully from start to finish.',
        verified: true
      }
    ]
  };

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

  const spotsLeft = classData.capacity.total - classData.capacity.booked;
  const occupancyRate = (classData.capacity.booked / classData.capacity.total) * 100;
  const spotsColor = spotsLeft <= 3 ? 'text-red-600' : spotsLeft <= 8 ? 'text-orange-600' : 'text-green-600';

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        toast.error('Please log in to book a class');
        onPageChange('login');
        return;
      }

      const cartItem = {
        id: classData.id,
        type: 'class',
        name: classData.name,
        date: classData.schedule.date,
        time: classData.schedule.time,
        price: classData.pricing.price,
        quantity: quantity,
        instructorName: classData.instructor.name,
        studioName: classData.studio.name,
        location: classData.studio.address
      };

      addToCart(cartItem);
      toast.success(`Added ${classData.name} to cart`);
      onPageChange('checkout');
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

  const handleJoinWaitlist = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to join the waitlist');
      onPageChange('login');
      return;
    }
    toast.success('Added to waitlist! You\'ll be notified if a spot opens up.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onPageChange('schedule')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schedule
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{classData.details.style}</Badge>
              <Badge variant="outline">{classData.details.level}</Badge>
              {classData.pricing.discountPercentage > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  {classData.pricing.discountPercentage}% Off
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              {/* Image Gallery */}
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={classData.media.image}
                  alt={classData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Class info overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
                  <p className="text-lg text-white/90 mb-4">{classData.subtitle}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(classData.schedule.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{classData.schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className={spotsColor}>{spotsLeft} spots left</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">{classData.schedule.duration} min</div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">{classData.details.level}</div>
                        <div className="text-sm text-muted-foreground">Level</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <div>
                        <div className="font-semibold">{classData.instructor.rating}</div>
                        <div className="text-sm text-muted-foreground">Instructor Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-semibold">{classData.details.temperature}</div>
                        <div className="text-sm text-muted-foreground">Temperature</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tabs Content */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="studio">Studio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">About This Class</h3>
                    <p className="text-muted-foreground leading-relaxed">{classData.description}</p>
                  </CardContent>
                </Card>

                {/* Benefits */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      What You'll Gain
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {classData.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* What's Included */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-blue-600" />
                      What's Included
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(classData.features).map(([key, value]) => {
                        if (!value) return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Important Information */}
                <div className="space-y-4">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">Before You Come</h4>
                          <ul className="space-y-1 text-sm text-blue-800">
                            {classData.requirements.map((req, index) => (
                              <li key={index}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-2">Policies</h4>
                          <div className="space-y-2 text-sm text-orange-800">
                            <p><strong>Cancellation:</strong> {classData.policies.cancellation}</p>
                            <p><strong>Late Arrival:</strong> {classData.policies.lateArrival}</p>
                            <p><strong>Transfers:</strong> {classData.policies.transfers}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={classData.instructor.image} />
                        <AvatarFallback>
                          {classData.instructor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl">{classData.instructor.name}</h3>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{classData.instructor.rating}</span>
                            <span className="text-muted-foreground">({classData.instructor.totalReviews} reviews)</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{classData.instructor.experience}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6">{classData.instructor.bio}</p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {classData.instructor.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Certifications</h4>
                        <div className="space-y-2">
                          {classData.instructor.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="studio" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-xl mb-2">{classData.studio.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{classData.studio.rating}</span>
                            <span className="text-muted-foreground">({classData.studio.totalReviews} reviews)</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{classData.studio.distance}km away</span>
                        </div>

                        <div className="flex items-start gap-2 mb-4">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">{classData.studio.address}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            Directions
                          </Button>
                          <Button variant="outline" size="sm">
                            <Globe className="h-3 w-3 mr-1" />
                            Website
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Amenities</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {classData.studio.amenities.map((amenity) => (
                              <div key={amenity} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Features</h4>
                          <div className="space-y-2">
                            {classData.studio.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold">Student Reviews</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{classData.instructor.rating}</span>
                        <span className="text-muted-foreground">({classData.instructor.totalReviews} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {classData.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.author}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20 sticky top-6">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Pricing */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold">{formatPrice(classData.pricing.price)}</span>
                      {classData.pricing.originalPrice && classData.pricing.originalPrice > classData.pricing.price && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(classData.pricing.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Class Capacity</span>
                      <span className={`font-medium ${spotsColor}`}>
                        {spotsLeft} spots left
                      </span>
                    </div>
                    <Progress value={occupancyRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{classData.capacity.booked} booked</span>
                      <span>{classData.capacity.total} total</span>
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div>
                    <label className="block font-medium mb-2">Number of Spots</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(spotsLeft, quantity + 1))}
                        disabled={quantity >= spotsLeft}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Booking Actions */}
                  <div className="space-y-3">
                    {spotsLeft > 0 ? (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleBookNow}
                        disabled={isLoading}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isLoading ? 'Adding to Cart...' : `Book Now - ${formatPrice(classData.pricing.price * quantity)}`}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="lg"
                        onClick={handleJoinWaitlist}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Join Waitlist ({classData.capacity.waitlist} waiting)
                      </Button>
                    )}

                    <Button variant="outline" className="w-full" size="sm">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </Button>
                  </div>

                  {/* Package Options */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Save with Packages</h4>
                    <div className="space-y-2">
                      {classData.pricing.packageOptions.slice(1).map((option, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent cursor-pointer">
                          <div>
                            <div className="font-medium text-sm">{option.name}</div>
                            {option.pricePerClass && (
                              <div className="text-xs text-muted-foreground">
                                {formatPrice(option.pricePerClass)} per class
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatPrice(option.price)}</div>
                            <div className="text-xs text-green-600">
                              {typeof option.savings === 'string' ? option.savings : `Save ${formatPrice(option.savings)}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Free cancellation up to 12 hours before class
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Class Info */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Class Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium">
                      {formatDate(classData.schedule.date)}<br />
                      {classData.schedule.time} - {classData.schedule.endTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{classData.schedule.duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{classData.details.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-medium">{classData.details.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className="font-medium">{classData.details.temperature}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}