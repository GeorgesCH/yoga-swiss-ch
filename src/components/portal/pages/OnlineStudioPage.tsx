import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Play,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Heart,
  Download,
  Bookmark,
  Calendar,
  Wifi,
  Monitor,
  Smartphone,
  Volume2,
  Settings,
  CheckCircle
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

export function OnlineStudioPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { addToCart } = usePortal();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for online content
  const liveClasses = [
    {
      id: 'live-1',
      title: 'Morning Vinyasa Flow',
      instructor: {
        name: 'Sarah Miller',
        image: '/placeholder-instructor-1.jpg',
        rating: 4.9
      },
      scheduledTime: '08:00',
      duration: 60,
      level: 'All Levels',
      participants: 45,
      maxParticipants: 100,
      price: 18,
      category: 'vinyasa',
      image: '/placeholder-online-1.jpg',
      isLive: true
    },
    {
      id: 'live-2',
      title: 'Lunch Break Yin',
      instructor: {
        name: 'Marc Dubois',
        image: '/placeholder-instructor-2.jpg',
        rating: 4.8
      },
      scheduledTime: '12:30',
      duration: 30,
      level: 'Beginner',
      participants: 28,
      maxParticipants: 50,
      price: 12,
      category: 'yin',
      image: '/placeholder-online-2.jpg',
      isLive: false
    },
    {
      id: 'live-3',
      title: 'Evening Power Flow',
      instructor: {
        name: 'Lisa Chen',
        image: '/placeholder-instructor-3.jpg',
        rating: 4.7
      },
      scheduledTime: '19:00',
      duration: 75,
      level: 'Intermediate',
      participants: 67,
      maxParticipants: 80,
      price: 22,
      category: 'power',
      image: '/placeholder-online-3.jpg',
      isLive: false
    }
  ];

  const onDemandVideos = [
    {
      id: 'od-1',
      title: '20-Minute Morning Energizer',
      instructor: {
        name: 'Anna Müller',
        image: '/placeholder-instructor-4.jpg'
      },
      duration: 20,
      level: 'All Levels',
      views: 2450,
      rating: 4.9,
      price: 8,
      category: 'vinyasa',
      image: '/placeholder-video-1.jpg',
      isPremium: false,
      tags: ['Morning', 'Energy', 'Quick']
    },
    {
      id: 'od-2',
      title: 'Deep Hip Release Yin Sequence',
      instructor: {
        name: 'Sophie Laurent',
        image: '/placeholder-instructor-5.jpg'
      },
      duration: 45,
      level: 'Beginner',
      views: 3120,
      rating: 4.8,
      price: 12,
      category: 'yin',
      image: '/placeholder-video-2.jpg',
      isPremium: true,
      tags: ['Hip Opening', 'Relaxation', 'Evening']
    },
    {
      id: 'od-3',
      title: 'Advanced Arm Balance Workshop',
      instructor: {
        name: 'Peter Schmidt',
        image: '/placeholder-instructor-6.jpg'
      },
      duration: 90,
      level: 'Advanced',
      views: 1890,
      rating: 4.9,
      price: 25,
      category: 'power',
      image: '/placeholder-video-3.jpg',
      isPremium: true,
      tags: ['Arm Balances', 'Strength', 'Workshop']
    },
    {
      id: 'od-4',
      title: 'Meditation for Better Sleep',
      instructor: {
        name: 'Marie Dupont',
        image: '/placeholder-instructor-7.jpg'
      },
      duration: 15,
      level: 'All Levels',
      views: 5670,
      rating: 4.8,
      price: 5,
      category: 'meditation',
      image: '/placeholder-video-4.jpg',
      isPremium: false,
      tags: ['Sleep', 'Relaxation', 'Evening']
    }
  ];

  const programs = [
    {
      id: 'prog-1',
      title: '30-Day Beginner Yoga Journey',
      description: 'Complete yoga program for beginners with daily practice videos',
      instructor: 'Sarah Miller',
      duration: '30 days',
      totalClasses: 30,
      difficulty: 'Beginner',
      price: 89,
      originalPrice: 120,
      image: '/placeholder-program-1.jpg',
      features: ['Daily 20-30 min classes', 'Beginner-friendly poses', 'Progress tracking', 'Community support']
    },
    {
      id: 'prog-2',
      title: 'Power Yoga Intensive',
      description: '21-day strength-building yoga program for intermediate practitioners',
      instructor: 'Marc Dubois',
      duration: '21 days',
      totalClasses: 21,
      difficulty: 'Intermediate',
      price: 75,
      image: '/placeholder-program-2.jpg',
      features: ['Strength-focused classes', 'Progressive difficulty', 'Nutrition guide', 'Workout calendar']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Classes', count: liveClasses.length + onDemandVideos.length },
    { id: 'vinyasa', name: 'Vinyasa', count: 8 },
    { id: 'yin', name: 'Yin & Restorative', count: 12 },
    { id: 'power', name: 'Power & Strength', count: 6 },
    { id: 'meditation', name: 'Meditation', count: 15 },
    { id: 'prenatal', name: 'Prenatal', count: 4 }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const handleJoinLive = (liveClass: any) => {
    addToCart({
      id: liveClass.id,
      type: 'class',
      name: liveClass.title,
      time: liveClass.scheduledTime,
      price: liveClass.price,
      quantity: 1,
      instructorName: liveClass.instructor.name,
      metadata: { type: 'live', platform: 'online' }
    });
  };

  const handlePurchaseVideo = (video: any) => {
    addToCart({
      id: video.id,
      type: 'class',
      name: video.title,
      price: video.price,
      quantity: 1,
      instructorName: video.instructor.name,
      metadata: { type: 'on-demand', duration: video.duration }
    });
  };

  const LiveClassCard = ({ liveClass }: { liveClass: any }) => (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="relative h-48">
        <ImageWithFallback
          src={liveClass.image}
          alt={liveClass.title}
          className="w-full h-full object-cover"
        />
        {liveClass.isLive && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 text-white animate-pulse">
              <div className="h-2 w-2 bg-white rounded-full mr-1"></div>
              LIVE
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="lg" className="rounded-full h-16 w-16 p-0">
            <Play className="h-8 w-8 fill-white" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            {liveClass.title}
          </h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={liveClass.instructor.image} />
              <AvatarFallback>{liveClass.instructor.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {liveClass.instructor.name}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{liveClass.instructor.rating}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{liveClass.scheduledTime}</span>
          </div>
          <Badge variant="secondary">{liveClass.level}</Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{liveClass.participants}/{liveClass.maxParticipants} participants</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold">{formatPrice(liveClass.price)}</span>
          <Button 
            size="sm"
            onClick={() => handleJoinLive(liveClass)}
            disabled={liveClass.participants >= liveClass.maxParticipants}
          >
            {liveClass.isLive ? 'Join Live' : 'Reserve Spot'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const VideoCard = ({ video }: { video: any }) => (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="relative h-48">
        <ImageWithFallback
          src={video.image}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        {video.isPremium && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
              Premium
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-black/70 text-white">
            <Clock className="h-3 w-3 mr-1" />
            {video.duration}min
          </Badge>
        </div>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="lg" className="rounded-full h-16 w-16 p-0">
            <Play className="h-8 w-8 fill-white" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={video.instructor.image} />
              <AvatarFallback>{video.instructor.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {video.instructor.name}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {video.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{video.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{video.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold">{formatPrice(video.price)}</span>
          <Button size="sm" onClick={() => handlePurchaseVideo(video)}>
            Buy & Watch
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">YogaSwiss Online Studio</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice yoga from anywhere with live classes, on-demand videos, and comprehensive programs
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>High-quality streaming</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Multi-device support</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Offline downloads</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes, instructors, programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Classes</TabsTrigger>
          <TabsTrigger value="ondemand">On-Demand</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {/* Live Classes Status */}
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">2 classes live now</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Join thousands of yogis practicing together in real-time
              </p>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Live Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((liveClass) => (
              <LiveClassCard key={liveClass.id} liveClass={liveClass} />
            ))}
          </div>

          {/* Upcoming Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveClasses.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="font-medium">{class_.scheduledTime}</div>
                      <div className="text-xs text-muted-foreground">{class_.duration}min</div>
                    </div>
                    <div>
                      <h4 className="font-medium">{class_.title}</h4>
                      <p className="text-sm text-muted-foreground">{class_.instructor.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {class_.isLive && (
                      <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                    )}
                    <Button size="sm" variant="outline">
                      {class_.isLive ? 'Join' : 'Set Reminder'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ondemand" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* On-Demand Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onDemandVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Features */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <Download className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">Download for Offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice anywhere, even without internet
                  </p>
                </div>
                <div className="space-y-2">
                  <Settings className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">Customizable Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust playback speed and video quality
                  </p>
                </div>
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Mark completed classes and track your journey
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden">
                <div className="h-64 relative">
                  <ImageWithFallback
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  {program.originalPrice && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-100 text-green-700">
                        Save {formatPrice(program.originalPrice - program.price)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{program.title}</h3>
                    <p className="text-muted-foreground">{program.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span>{program.totalClasses} classes</span>
                    </div>
                    <Badge variant="outline">{program.difficulty}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">What's included:</h4>
                    <ul className="space-y-1 text-sm">
                      {program.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold">{formatPrice(program.price)}</span>
                        {program.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(program.originalPrice)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">One-time payment</p>
                    </div>
                    <Button size="lg">
                      Start Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Program Benefits */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-semibold">Why Choose Our Programs?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Structured learning paths designed by expert instructors to help you achieve your yoga goals
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="space-y-2">
                  <Users className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">Community Support</h3>
                  <p className="text-sm text-muted-foreground">Connect with fellow practitioners</p>
                </div>
                <div className="space-y-2">
                  <Calendar className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">Structured Progress</h3>
                  <p className="text-sm text-muted-foreground">Daily practices that build on each other</p>
                </div>
                <div className="space-y-2">
                  <Star className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">Expert Guidance</h3>
                  <p className="text-sm text-muted-foreground">Learn from certified instructors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}