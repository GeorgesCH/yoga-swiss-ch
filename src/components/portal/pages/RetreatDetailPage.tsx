import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  Check,
  Bed,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Mountain,
  Waves,
  TreePine,
  User,
  UserPlus,
  CreditCard,
  ShoppingCart,
  Info,
  Shield
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface RetreatDetailPageProps {
  onPageChange: (page: string) => void;
  retreatSlug?: string;
}

// Mock data for retreat
const mockRetreat = {
  id: 'alpine-serenity-2024',
  slug: 'alpine-serenity-retreat',
  title: 'Alpine Serenity Yoga Retreat',
  subtitle: 'Discover inner peace surrounded by the Swiss Alps',
  location: 'Interlaken, Switzerland',
  startDate: '2024-07-15',
  endDate: '2024-07-21',
  duration: '7 days, 6 nights',
  price: { from: 1850, currency: 'CHF' },
  heroImage: 'https://images.unsplash.com/photo-1679161551610-67dd4756f8db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwcmV0cmVhdCUyMG1vdW50YWlucyUyMGJlYXV0aWZ1bCUyMG5hdHVyZXxlbnwxfHx8fDE3NTY3NzEyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  gallery: [
    'https://images.unsplash.com/photo-1615275219949-b31d641fce23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMHRlYWNoaW5nJTIwY2xhc3MlMjBuYXR1cmV8ZW58MXx8fHwxNzU2NzcxMjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1696766984569-a33d52748dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvbW1vZGF0aW9uJTIwcm9vbSUyMGx1eHVyeSUyMGhvdGVsfGVufDF8fHx8MTc1Njc3MTI2MHww&ixlib=rb-4.1.0&q=80&w=1080'
  ],
  description: 'Immerse yourself in a transformative yoga retreat nestled in the heart of the Swiss Alps. This 7-day journey combines daily yoga practice with mindful meditation, breathwork, and the healing power of nature.',
  highlights: [
    'Daily sunrise yoga sessions with mountain views',
    'Guided meditation and breathwork workshops',
    'Nutritious organic meals sourced locally',
    'Optional hiking and outdoor activities',
    'Hot springs and spa treatments',
    'Small group size (max 16 participants)'
  ],
  status: 'published',
  availableSpots: 8,
  totalSpots: 16,
  instructors: [
    {
      id: '1',
      name: 'Sarah Müller',
      title: 'Lead Yoga Instructor',
      bio: 'Sarah is a certified yoga instructor with over 10 years of experience. She specializes in Hatha and Vinyasa yoga.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Marco Bianchi',
      title: 'Meditation Guide',
      bio: 'Marco brings 15 years of meditation practice and teaching experience, specializing in mindfulness and breathwork.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ],
  roomTypes: [
    {
      id: 'shared-dorm',
      name: 'Shared Dormitory',
      description: 'Comfortable 4-bed dormitory with mountain views',
      occupancy: { min: 1, max: 4 },
      price: 1850,
      amenities: ['Shared bathroom', 'Mountain view', 'Heating', 'Shared lounge'],
      available: 12,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop'
    },
    {
      id: 'private-twin',
      name: 'Private Twin Room',
      description: 'Private room with twin beds and ensuite bathroom',
      occupancy: { min: 1, max: 2 },
      price: 2350,
      amenities: ['Private bathroom', 'Mountain view', 'Heating', 'Mini-fridge'],
      available: 6,
      singleSupplement: 300,
      image: 'https://images.unsplash.com/photo-1696766984569-a33d52748dba?w=300&h=200&fit=crop'
    },
    {
      id: 'private-double',
      name: 'Private Double Room',
      description: 'Luxurious private room with king bed and mountain balcony',
      occupancy: { min: 1, max: 2 },
      price: 2850,
      amenities: ['Private bathroom', 'Balcony', 'Mountain view', 'Mini-bar', 'Heating'],
      available: 2,
      singleSupplement: 450,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop'
    }
  ],
  addOns: [
    {
      id: 'spa-package',
      name: 'Spa Package',
      description: '3 massage sessions and thermal spa access',
      price: 290,
      perPerson: true,
      available: true
    },
    {
      id: 'hiking-guide',
      name: 'Private Hiking Guide',
      description: 'Guided mountain hiking experiences',
      price: 150,
      perPerson: true,
      available: true
    },
    {
      id: 'airport-transfer',
      name: 'Airport Transfer',
      description: 'Private transfer to/from Zurich Airport',
      price: 120,
      perPerson: false,
      available: true
    }
  ],
  itinerary: [
    {
      day: 1,
      title: 'Arrival & Welcome',
      activities: [
        { time: '16:00', activity: 'Check-in and welcome tea' },
        { time: '18:00', activity: 'Welcome dinner and introductions' },
        { time: '20:00', activity: 'Gentle evening yoga and meditation' }
      ]
    },
    {
      day: 2,
      title: 'Mountain Morning',
      activities: [
        { time: '07:00', activity: 'Sunrise yoga on the terrace' },
        { time: '08:30', activity: 'Healthy breakfast' },
        { time: '10:00', activity: 'Guided nature walk' },
        { time: '16:00', activity: 'Restorative yoga session' },
        { time: '19:00', activity: 'Group dinner and reflection' }
      ]
    },
    {
      day: 3,
      title: 'Mindful Movement',
      activities: [
        { time: '07:00', activity: 'Vinyasa flow practice' },
        { time: '08:30', activity: 'Nutritious breakfast' },
        { time: '10:00', activity: 'Breathwork workshop' },
        { time: '14:00', activity: 'Free time / optional spa' },
        { time: '17:00', activity: 'Yin yoga and meditation' }
      ]
    }
    // Add more days...
  ],
  faqs: [
    {
      question: 'What is included in the retreat price?',
      answer: 'The retreat price includes accommodation, all meals (vegetarian/vegan options available), daily yoga sessions, meditation workshops, and guided activities. Airport transfers and spa treatments are available as add-ons.'
    },
    {
      question: 'What should I bring?',
      answer: 'Bring comfortable yoga clothes, warm layers for mountain weather, a yoga mat (or rent one), water bottle, and personal items. We provide bedding and towels.'
    },
    {
      question: 'Is this suitable for beginners?',
      answer: 'Yes! Our retreat welcomes all levels. Our instructors provide modifications and support for every practitioner, from complete beginners to advanced yogis.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation until 30 days before the retreat. 50% refund between 30-14 days, 25% refund between 14-7 days. No refund within 7 days unless medical emergency.'
    }
  ]
};

export function RetreatDetailPage({ onPageChange, retreatSlug }: RetreatDetailPageProps) {
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [occupancy, setOccupancy] = useState<number>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookingMode, setIsBookingMode] = useState(false);

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const calculateTotal = () => {
    const selectedRoom = mockRetreat.roomTypes.find(room => room.id === selectedRoomType);
    if (!selectedRoom) return 0;

    let total = selectedRoom.price;
    
    // Add single supplement if occupancy is 1 and room has supplement
    if (occupancy === 1 && selectedRoom.singleSupplement) {
      total += selectedRoom.singleSupplement;
    }

    // Add selected add-ons
    selectedAddOns.forEach(addOnId => {
      const addOn = mockRetreat.addOns.find(ao => ao.id === addOnId);
      if (addOn) {
        if (addOn.perPerson) {
          total += addOn.price * occupancy;
        } else {
          total += addOn.price;
        }
      }
    });

    return total;
  };

  const handleBookNow = () => {
    if (!selectedRoomType) {
      toast.error('Please select a room type to continue');
      return;
    }
    
    // Create booking data to pass to checkout
    const bookingData = {
      retreat: mockRetreat,
      selection: {
        roomType: mockRetreat.roomTypes.find(r => r.id === selectedRoomType),
        occupancy,
        addOns: mockRetreat.addOns.filter(ao => selectedAddOns.includes(ao.id))
      },
      pricing: {
        roomRate: mockRetreat.roomTypes.find(r => r.id === selectedRoomType)?.price || 0,
        singleSupplement: occupancy === 1 ? (mockRetreat.roomTypes.find(r => r.id === selectedRoomType)?.singleSupplement || 0) : 0,
        addOns: selectedAddOns.reduce((total, addOnId) => {
          const addOn = mockRetreat.addOns.find(ao => ao.id === addOnId);
          return total + (addOn ? (addOn.perPerson ? addOn.price * occupancy : addOn.price) : 0);
        }, 0),
        subtotal: calculateTotal(),
        taxes: Math.round(calculateTotal() * 0.077), // 7.7% Swiss VAT
        total: Math.round(calculateTotal() * 1.077)
      }
    };
    
    // Navigate to checkout with booking data
    onPageChange('retreat-checkout', { bookingData });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => onPageChange('retreats')}
                className="p-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{mockRetreat.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mockRetreat.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {mockRetreat.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">From</div>
                <div className="text-xl font-semibold">
                  CHF {mockRetreat.price.from.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <ImageWithFallback
                src={mockRetreat.heroImage}
                alt={mockRetreat.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground">
                  {mockRetreat.availableSpots} spots left
                </Badge>
              </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-3 gap-4">
              {mockRetreat.gallery.slice(0, 3).map((image, index) => (
                <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="instructors">Instructors</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Retreat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {mockRetreat.description}
                    </p>
                    
                    <div>
                      <h4 className="font-medium mb-3">What's Included</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mockRetreat.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-4">
                {mockRetreat.itinerary.map((day) => (
                  <Card key={day.day}>
                    <CardHeader>
                      <CardTitle className="text-lg">Day {day.day}: {day.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                              {activity.time}
                            </div>
                            <div className="text-sm">{activity.activity}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="instructors" className="space-y-4">
                {mockRetreat.instructors.map((instructor) => (
                  <Card key={instructor.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={instructor.image} alt={instructor.name} />
                          <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{instructor.name}</h4>
                          <p className="text-sm text-primary mb-2">{instructor.title}</p>
                          <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="faq" className="space-y-4">
                {mockRetreat.faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Book Your Retreat
                    <Badge variant="secondary">
                      {mockRetreat.availableSpots}/{mockRetreat.totalSpots} available
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Room Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Choose Room Type</Label>
                    {mockRetreat.roomTypes.map((room) => (
                      <div
                        key={room.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedRoomType === room.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedRoomType(room.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{room.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {room.available} left
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {room.description}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Up to {room.occupancy.max} guests
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.amenities.slice(0, 2).map((amenity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">CHF {room.price.toLocaleString()}</div>
                            {room.singleSupplement && (
                              <div className="text-xs text-muted-foreground">
                                +{room.singleSupplement} single
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Occupancy */}
                  {selectedRoomType && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Number of Guests</Label>
                      <Select
                        value={occupancy.toString()}
                        onValueChange={(value) => setOccupancy(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ 
                            length: mockRetreat.roomTypes.find(r => r.id === selectedRoomType)?.occupancy.max || 1 
                          }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Add-ons */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Add-ons (Optional)</Label>
                    {mockRetreat.addOns.map((addOn) => (
                      <div key={addOn.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={addOn.id}
                          checked={selectedAddOns.includes(addOn.id)}
                          onCheckedChange={() => handleAddOnToggle(addOn.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={addOn.id} className="text-sm font-medium cursor-pointer">
                            {addOn.name}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {addOn.description}
                          </p>
                          <div className="text-xs font-medium mt-1">
                            CHF {addOn.price} {addOn.perPerson ? 'per person' : 'per booking'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Room rate</span>
                      <span>CHF {selectedRoomType ? mockRetreat.roomTypes.find(r => r.id === selectedRoomType)?.price.toLocaleString() : '0'}</span>
                    </div>
                    {selectedRoomType && occupancy === 1 && mockRetreat.roomTypes.find(r => r.id === selectedRoomType)?.singleSupplement && (
                      <div className="flex justify-between text-sm">
                        <span>Single supplement</span>
                        <span>CHF {mockRetreat.roomTypes.find(r => r.id === selectedRoomType)?.singleSupplement?.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedAddOns.map(addOnId => {
                      const addOn = mockRetreat.addOns.find(ao => ao.id === addOnId);
                      if (!addOn) return null;
                      return (
                        <div key={addOnId} className="flex justify-between text-sm">
                          <span>{addOn.name}</span>
                          <span>CHF {(addOn.perPerson ? addOn.price * occupancy : addOn.price).toLocaleString()}</span>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>CHF {calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Includes taxes and fees
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button 
                    onClick={handleBookNow}
                    className="w-full"
                    disabled={!selectedRoomType}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      Free cancellation until 30 days before
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}