import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { 
  Star,
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Share,
  Award,
  BookOpen,
  MessageCircle,
  Instagram,
  Globe,
  ArrowLeft,
  Play,
  CheckCircle,
  Quote
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

export function InstructorProfilePage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { 
    addToCart, 
    searchClasses, 
    bookClass, 
    getInstructorReviews, 
    getInstructorAvailability, 
    bookPrivateLesson 
  } = usePortal();
  const [activeTab, setActiveTab] = useState('schedule');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [instructorClasses, setInstructorClasses] = useState<any[]>([]);
  const [instructorReviews, setInstructorReviews] = useState<any[]>([]);
  const [availabilityCalendar, setAvailabilityCalendar] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // In real app, instructor ID would come from URL params
  const instructorId = 'sarah-miller';

  // Mock instructor data - in real app this would be fetched based on URL params
  const instructorData = {
    id: 'sarah-miller',
    name: 'Sarah Miller',
    bio: 'Sarah is a passionate yoga instructor with over 8 years of experience in various yoga styles. Originally from California, she moved to Switzerland in 2018 and has been inspiring students across Zürich with her dynamic and heart-opening classes.',
    fullBio: 'Sarah Miller discovered yoga during her college years while studying abroad in India. What started as a way to cope with stress quickly became a life-changing practice. After completing her 200-hour teacher training in Rishikesh and later her 500-hour advanced certification in California, Sarah has dedicated her life to sharing the transformative power of yoga.\\n\\nHer teaching style combines traditional alignment principles with creative sequencing, always emphasizing breath awareness and mindful movement. Sarah believes yoga is for everyone and creates a welcoming space where students can explore their practice without judgment.\\n\\nWhen not teaching, Sarah enjoys hiking in the Swiss Alps, practicing meditation, and exploring local farmers markets for fresh, organic ingredients.',
    image: '/placeholder-instructor-1.jpg',
    coverImage: '/placeholder-instructor-cover.jpg',
    rating: 4.9,
    totalReviews: 324,
    totalStudents: 1847,
    totalClasses: 456,
    yearsTeaching: 8,
    specialties: ['Vinyasa', 'Power Yoga', 'Yin Yang', 'Meditation'],
    certifications: [
      'RYT-500 (Registered Yoga Teacher)',
      'Yin Yoga Teacher Training (50h)',
      'Meditation Teacher Certification',
      'Prenatal Yoga Certified'
    ],
    languages: ['English (Native)', 'German (Conversational)', 'French (Basic)'],
    socialMedia: {
      instagram: '@sarahmiller_yoga',
      website: 'www.sarahmilleryoga.com'
    },
    studios: [
      'Flow Studio Zürich',
      'Zen Space Geneva',
      'Mountain Yoga Basel'
    ],
    priceRange: { min: 28, max: 45 }
  };

  // Load instructor-specific data from backend
  useEffect(() => {
    const loadInstructorData = async () => {
      setIsLoading(true);
      try {
        // Fetch instructor's upcoming classes
        const classes = await searchClasses({
          instructor: instructorData.name
        });
        setInstructorClasses(classes || []);

        // Load instructor reviews
        const reviews = await getInstructorReviews(instructorId);
        setInstructorReviews(reviews || []);

        // Load availability calendar
        const today = new Date();
        const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const availability = await getInstructorAvailability(instructorId, {
          start: today.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        });
        setAvailabilityCalendar(availability || []);

      } catch (error) {
        console.log('Error loading instructor data:', error);
        // Set empty arrays as fallback
        setInstructorClasses([]);
        setInstructorReviews([]);
        setAvailabilityCalendar([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInstructorData();
  }, [instructorId, searchClasses, getInstructorReviews, getInstructorAvailability]);

  // Use real class data from backend with fallback
  const upcomingClasses = instructorClasses.length > 0 ? instructorClasses : [
    {
      id: '1',
      name: 'Morning Vinyasa Flow',
      studio: 'Flow Studio Zürich',
      date: new Date(2024, 11, 16),
      time: '07:00',
      duration: 75,
      level: 'All Levels',
      price: 32,
      spotsLeft: 5,
      totalSpots: 20,
      image: '/placeholder-yoga-1.jpg'
    },
    {
      id: '2',
      name: 'Power Yoga Intensive',
      studio: 'Zen Space Geneva',
      date: new Date(2024, 11, 17),
      time: '18:30',
      duration: 90,
      level: 'Intermediate',
      price: 38,
      spotsLeft: 3,
      totalSpots: 15,
      image: '/placeholder-yoga-2.jpg'
    },
    {
      id: '3',
      name: 'Yin Yang Balance',
      studio: 'Mountain Yoga Basel',
      date: new Date(2024, 11, 18),
      time: '19:00',
      duration: 75,
      level: 'All Levels',
      price: 35,
      spotsLeft: 8,
      totalSpots: 18,
      image: '/placeholder-yoga-3.jpg'
    }
  ];

  // Use real reviews from backend with fallback
  const reviews = instructorReviews.length > 0 ? instructorReviews : [
    {
      id: '1',
      user: 'Emma K.',
      rating: 5,
      date: '3 days ago',
      comment: 'Sarah is an amazing teacher! Her classes are challenging yet accessible, and she creates such a welcoming atmosphere. Her cues are clear and her energy is infectious.',
      verified: true,
      className: 'Vinyasa Flow'
    },
    {
      id: '2',
      user: 'Michael R.',
      rating: 5,
      date: '1 week ago',
      comment: 'Incredible instructor. Sarah helped me deepen my practice and overcome some fears I had about inversions. Highly recommend her classes!',
      verified: true,
      className: 'Power Yoga'
    },
    {
      id: '3',
      user: 'Lisa M.',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Great teacher with excellent alignment cues. The music selection is perfect and the flow sequences are creative and fun.',
      verified: true,
      className: 'Vinyasa Flow'
    }
  ];

  // Mock achievements
  const achievements = [
    { name: 'Top Rated Teacher', description: 'Consistently rated 4.8+ stars', icon: Star },
    { name: '1000+ Students', description: 'Taught over 1000 unique students', icon: Users },
    { name: '5 Years at YogaSwiss', description: 'Long-standing community member', icon: Award },
    { name: 'Student Favorite', description: 'Most favorited instructor 2023', icon: Heart }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (date: Date | string | number) => {
    try {
      // Convert to Date object safely
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        // Fallback to current date if invalid
        dateObj = new Date();
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to formatDate:', date);
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Date Error';
    }
  };

  const handleBookClass = (classItem: any) => {
    addToCart({
      id: classItem.id,
      type: 'class',
      name: classItem.name,
      time: classItem.time,
      price: classItem.price,
      quantity: 1,
      instructorName: instructorData.name,
      studioName: classItem.studio
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
        <Button variant="ghost" onClick={() => onPageChange('instructors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Instructors
        </Button>
      </div>

      {/* Instructor Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
          <ImageWithFallback
            src={instructorData.coverImage}
            alt={`${instructorData.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={instructorData.image} alt={instructorData.name} />
              <AvatarFallback className="text-xl">
                {instructorData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-white flex-1">
              <h1 className="text-3xl font-semibold mb-2">{instructorData.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(instructorData.rating)}
                  </div>
                  <span className="font-medium">{instructorData.rating}</span>
                  <span className="opacity-90">({instructorData.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 opacity-90">
                  <Users className="h-4 w-4" />
                  <span>{instructorData.totalStudents.toLocaleString()} students</span>
                </div>
              </div>
              <p className="opacity-90 max-w-2xl">{instructorData.bio}</p>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* Enhanced Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          size="lg" 
          onClick={() => setIsFollowing(!isFollowing)}
          className={isFollowing ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
          {isFollowing ? 'Following' : 'Follow Instructor'}
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => setShowContactForm(!showContactForm)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Teacher
        </Button>
        <Button variant="outline" size="lg">
          <Calendar className="h-4 w-4 mr-2" />
          Book Private Session
        </Button>
      </div>



      {/* Contact Form Modal */}
      {showContactForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact {instructorData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Private Session Inquiry</option>
                <option>General Question</option>
                <option>Class Feedback</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                className="w-full p-3 border rounded-lg h-24 resize-none"
                placeholder="Hi Sarah, I'm interested in booking a private yoga session..."
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>💬</span>
              <span>Messages are sent directly to the instructor</span>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Send Message</Button>
              <Button variant="outline" onClick={() => setShowContactForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="private">Private Lessons</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Classes</h2>
            <Button variant="outline" onClick={() => onPageChange(`schedule?instructor=${encodeURIComponent(instructorData.name)}`)}>
              View All Classes
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={classItem.image}
                        alt={classItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{classItem.name}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{classItem.studio}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{formatPrice(classItem.price)}</div>
                          <div className="text-sm text-muted-foreground">
                            {classItem.spotsLeft}/{classItem.totalSpots} spots left
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(classItem.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{classItem.time} ({classItem.duration}min)</span>
                        </div>
                        <Badge variant="outline">{classItem.level}</Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleBookClass(classItem)}
                          disabled={classItem.spotsLeft === 0}
                        >
                          {classItem.spotsLeft === 0 ? 'Full' : 'Book Class'}
                        </Button>
                        <Button variant="outline">
                          View Details
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {instructorData.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    {instructorData.fullBio.split('\\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teaching Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {instructorData.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="px-3 py-1">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Price Range</h4>
                    <p className="text-muted-foreground">
                      {formatPrice(instructorData.priceRange.min)} - {formatPrice(instructorData.priceRange.max)} per class
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {instructorData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {instructorData.languages.map((language, index) => (
                      <div key={index} className="text-sm">{language}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Teaching Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {instructorData.studios.map((studio, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{studio}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Instagram className="h-4 w-4 mr-2" />
                    {instructorData.socialMedia.instagram}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="private" className="space-y-6">
          <h2 className="text-xl font-semibold">Book Private Session</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Availability Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availabilityCalendar.length > 0 ? (
                  availabilityCalendar.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium">{day?.date ? formatDate(day.date) : 'Date unavailable'}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(day?.timeSlots || []).map((timeSlot, slotIndex) => (
                          <Button
                            key={slotIndex}
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            disabled={!day?.available}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {timeSlot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p>Loading availability...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Private Lesson Details */}
            <Card>
              <CardHeader>
                <CardTitle>Private Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">60-90 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">Studio or Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">{formatPrice(120)} - {formatPrice(180)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <span className="font-medium">English, German</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium">What's Included:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Personalized yoga sequence</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Individual posture corrections</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Breathing & meditation guidance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Take-home practice recommendations</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Book Private Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <h2 className="text-xl font-semibold">Achievements & Recognition</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Student Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(instructorData.rating)}
              </div>
              <span className="font-medium">{instructorData.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({instructorData.totalReviews} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium">{review.user[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.user}</span>
                            {review.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
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
                      <Badge variant="outline" className="text-xs">
                        {review.className}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <h2 className="text-xl font-semibold">Media Gallery</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Practice Videos */}
            <Card>
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Morning Flow Practice</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">20-min Morning Vinyasa</h3>
                  <p className="text-sm text-muted-foreground">Start your day with energy</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Meditation Guide</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">Breathing & Mindfulness</h3>
                  <p className="text-sm text-muted-foreground">10-min guided meditation</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-orange-500 to-red-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Advanced Practice</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">Power Yoga Flow</h3>
                  <p className="text-sm text-muted-foreground">45-min intensive practice</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}