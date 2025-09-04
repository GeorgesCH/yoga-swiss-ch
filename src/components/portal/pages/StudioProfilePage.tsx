import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { 
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Calendar,
  Users,
  Heart,
  Share,
  Camera,
  Wifi,
  Car,
  Coffee,
  Shirt,
  Droplets,
  Wind,
  ArrowLeft,
  ThermometerSun,
  Volume2,
  Baby
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

export function StudioProfilePage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { addToCart, searchClasses, getInstructors, getStudioReviews } = usePortal();
  const [activeTab, setActiveTab] = useState('schedule');
  const [studioSchedule, setStudioSchedule] = useState<any[]>([]);
  const [studioInstructors, setStudioInstructors] = useState<any[]>([]);
  const [studioReviews, setStudioReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // In real app, studio ID would come from URL params
  const studioId = 'flow-studio-zurich';

  // Load studio-specific data from backend
  useEffect(() => {
    const loadStudioData = async () => {
      setIsLoading(true);
      try {
        // Fetch studio schedule
        const schedule = await searchClasses({
          studio: studioData.name,
          date: new Date().toISOString().split('T')[0]
        });
        setStudioSchedule(schedule);

        // Fetch studio instructors
        const instructors = await getInstructors('all', '');
        const studioInstructorsData = instructors.filter((instructor: any) => 
          instructor.studios?.includes(studioData.name)
        );
        setStudioInstructors(studioInstructorsData);

        // Fetch studio reviews
        const reviews = await getStudioReviews(studioId);
        setStudioReviews(reviews);

      } catch (error) {
        console.log('Error loading studio data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudioData();
  }, [studioId, searchClasses, getInstructors]);



  // Mock studio data - in real app this would be fetched based on URL params
  const studioData = {
    id: 'flow-studio-zurich',
    name: 'Flow Studio Zürich',
    description: 'A contemporary yoga studio in the heart of Zürich, offering a variety of yoga styles in a welcoming environment. Our experienced instructors guide practitioners of all levels through transformative classes.',
    rating: 4.9,
    totalReviews: 1247,
    address: 'Bahnhofstrasse 45, 8001 Zürich',
    phone: '+41 44 123 45 67',
    website: 'www.flowstudio.ch',
    email: 'info@flowstudio.ch',
    images: [
      '/placeholder-studio-1.jpg',
      '/placeholder-studio-interior-1.jpg',
      '/placeholder-studio-interior-2.jpg',
      '/placeholder-studio-interior-3.jpg'
    ],
    openingHours: {
      'Monday': '06:00 - 22:00',
      'Tuesday': '06:00 - 22:00',
      'Wednesday': '06:00 - 22:00',
      'Thursday': '06:00 - 22:00',
      'Friday': '06:00 - 22:00',
      'Saturday': '07:00 - 20:00',
      'Sunday': '08:00 - 19:00'
    },
    amenities: [
      { icon: Wifi, name: 'Free WiFi', available: true },
      { icon: Car, name: 'Parking', available: true },
      { icon: Coffee, name: 'Tea & Coffee', available: true },
      { icon: Shirt, name: 'Mat Rental', available: true },
      { icon: Droplets, name: 'Showers', available: true },
      { icon: Wind, name: 'Air Conditioning', available: true },
      { icon: ThermometerSun, name: 'Heated Studio', available: true },
      { icon: Volume2, name: 'Sound System', available: true },
      { icon: Baby, name: 'Baby Changing', available: false }
    ],
    styles: ['Vinyasa', 'Yin', 'Hot Yoga', 'Power Yoga', 'Prenatal', 'Meditation'],
    priceRange: { min: 25, max: 40 },
    totalClasses: 156,
    followers: 2847
  };

  // Use real schedule data from backend with fallback
  const todayClasses = studioSchedule.length > 0 ? studioSchedule : [
    {
      id: '1',
      name: 'Morning Vinyasa Flow',
      instructor: 'Sarah Miller',
      time: '07:00',
      duration: 75,
      level: 'All Levels',
      style: 'Vinyasa',
      price: 32,
      spotsLeft: 3,
      totalSpots: 20,
      image: '/placeholder-yoga-1.jpg'
    },
    {
      id: '2',
      name: 'Lunch Break Yoga',
      instructor: 'Marc Dubois',
      time: '12:30',
      duration: 45,
      level: 'Beginner',
      style: 'Hatha',
      price: 28,
      spotsLeft: 8,
      totalSpots: 15,
      image: '/placeholder-yoga-2.jpg'
    },
    {
      id: '3',
      name: 'Hot Power Flow',
      instructor: 'Lisa Chen',
      time: '18:30',
      duration: 90,
      level: 'Intermediate',
      style: 'Hot Yoga',
      price: 35,
      spotsLeft: 2,
      totalSpots: 25,
      image: '/placeholder-yoga-3.jpg'
    },
    {
      id: '4',
      name: 'Evening Yin & Meditation',
      instructor: 'Anna Müller',
      time: '20:00',
      duration: 75,
      level: 'All Levels',
      style: 'Yin',
      price: 30,
      spotsLeft: 12,
      totalSpots: 18,
      image: '/placeholder-yoga-4.jpg'
    }
  ];

  // Use real instructor data from backend with fallback  
  const instructors = studioInstructors.length > 0 ? studioInstructors : [
    {
      id: '1',
      name: 'Sarah Miller',
      specialties: ['Vinyasa', 'Power Yoga'],
      image: '/placeholder-instructor-1.jpg',
      bio: 'RYT-500 certified instructor with 8 years of experience',
      rating: 4.9,
      classesCount: 45
    },
    {
      id: '2',
      name: 'Marc Dubois',
      specialties: ['Yin', 'Meditation', 'Hatha'],
      image: '/placeholder-instructor-2.jpg',
      bio: 'Mindfulness teacher and former professional athlete',
      rating: 4.8,
      classesCount: 38
    },
    {
      id: '3',
      name: 'Lisa Chen',
      specialties: ['Hot Yoga', 'Ashtanga'],
      image: '/placeholder-instructor-3.jpg',
      bio: 'Former dancer turned yoga teacher, specializing in heated practices',
      rating: 4.7,
      classesCount: 32
    }
  ];

  // Use real reviews from backend with fallback
  const reviews = studioReviews.length > 0 ? studioReviews : [
    {
      id: '1',
      user: 'Sophie M.',
      rating: 5,
      date: '2 days ago',
      comment: 'Amazing studio! The atmosphere is so welcoming and the instructors are top-notch. Love the variety of classes offered.',
      verified: true
    },
    {
      id: '2',
      user: 'Michael R.',
      rating: 5,
      date: '1 week ago',
      comment: 'Beautiful space with excellent facilities. The hot yoga classes are particularly good - great temperature control.',
      verified: true
    },
    {
      id: '3',
      user: 'Emma K.',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Really enjoy the variety of classes. Only wish they had more evening beginner classes available.',
      verified: true
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const handleBookClass = (classItem: any) => {
    addToCart({
      id: classItem.id,
      type: 'class',
      name: classItem.name,
      time: classItem.time,
      price: classItem.price,
      quantity: 1,
      instructorName: classItem.instructor,
      studioName: studioData.name,
      location: studioData.address
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => onPageChange('studios')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Studios
        </Button>
      </div>

      {/* Studio Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <div className="relative h-96 rounded-xl overflow-hidden">
            <ImageWithFallback
              src={studioData.images[0]}
              alt={studioData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-semibold mb-2">{studioData.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(studioData.rating)}
                  </div>
                  <span className="font-medium">{studioData.rating}</span>
                  <span className="opacity-80">({studioData.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="opacity-80">Zürich Center</span>
                </div>
              </div>
            </div>
            <div className="absolute top-6 right-6 flex gap-2">
              <Button size="sm" variant="secondary">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Images */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {studioData.images.slice(1, 4).map((image, index) => (
              <div key={index} className="h-24 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={image}
                  alt={`${studioData.name} interior ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Studio Info */}
        <Card>
          <CardHeader>
            <CardTitle>Studio Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">{studioData.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{studioData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Website</p>
                  <p className="text-primary">{studioData.website}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price Range</span>
                <span className="text-sm font-medium">
                  {formatPrice(studioData.priceRange.min)} - {formatPrice(studioData.priceRange.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Classes</span>
                <span className="text-sm font-medium">{studioData.totalClasses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="text-sm font-medium">{studioData.followers.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Yoga Styles</p>
              <div className="flex flex-wrap gap-1">
                {studioData.styles.map((style) => (
                  <Badge key={style} variant="secondary" className="text-xs">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Follow Studio
              </Button>
              <Button variant="outline" className="w-full" onClick={() => onPageChange(`schedule?studio=${encodeURIComponent(studioData.name)}`)}>
                <Calendar className="h-4 w-4 mr-2" />
                View Full Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today's Classes</h2>
            <Button variant="outline" onClick={() => onPageChange(`schedule?studio=${encodeURIComponent(studioData.name)}`)}>
              View Full Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={classItem.image}
                        alt={classItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{classItem.name}</h4>
                          <button 
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => onPageChange(`schedule?studio=${encodeURIComponent(studioData.name)}&instructor=${encodeURIComponent(classItem.instructor)}`)}
                          >
                            with {classItem.instructor}
                          </button>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {classItem.style}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {classItem.time}
                        </div>
                        <span>{classItem.duration}min</span>
                        <Badge variant="outline" className="text-xs">
                          {classItem.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{formatPrice(classItem.price)}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{classItem.spotsLeft}/{classItem.totalSpots} spots left</span>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleBookClass(classItem)}
                          disabled={classItem.spotsLeft === 0}
                        >
                          {classItem.spotsLeft === 0 ? 'Full' : 'Book'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>About {studioData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {studioData.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(studioData.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium">{day}</span>
                      <span className="text-muted-foreground">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-6">
          <h2 className="text-xl font-semibold">Meet Our Instructors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center space-y-4">
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarImage src={instructor.image} alt={instructor.name} />
                    <AvatarFallback>
                      {instructor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                    
                    <div className="flex items-center justify-center gap-1">
                      {renderStars(instructor.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({instructor.classesCount} classes)
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 justify-center">
                      {instructor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onPageChange(`instructor-${instructor.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onPageChange(`schedule?studio=${encodeURIComponent(studioData.name)}&instructor=${encodeURIComponent(instructor.name)}`)}
                    >
                      View Classes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-6">
          <h2 className="text-xl font-semibold">Studio Amenities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studioData.amenities.map((amenity, index) => {
              const IconComponent = amenity.icon;
              return (
                <Card key={index} className={`${
                  amenity.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
                }`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${
                      amenity.available ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      amenity.available ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {amenity.name}
                    </span>
                    {amenity.available && (
                      <Badge className="ml-auto bg-green-100 text-green-700">Available</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {renderStars(studioData.rating)}
                </div>
                <span className="font-medium">{studioData.rating}</span>
                <span className="text-muted-foreground">
                  ({studioData.totalReviews} reviews)
                </span>
              </div>
            </div>
            <Button variant="outline">Write Review</Button>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{review.user[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline">Load More Reviews</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}