import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { LuxuryButton } from '../../ui/luxury-button';
import { 
  Search, 
  Star, 
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Play,
  Grid3X3,
  List,
  Filter,
  Award,
  Users,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

export function InstructorsPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { currentLocation, searchQuery, setSearchQuery } = usePortal();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [followedInstructors, setFollowedInstructors] = useState<string[]>(['2']); // Marc is pre-followed


  // Mock instructors data with brand information
  const instructors = [
    {
      id: '1',
      name: 'Sarah Miller',
      slug: 'sarah-miller',
      bio: 'RYT-500 certified instructor with 8 years of teaching experience. Passionate about making yoga accessible to everyone.',
      longBio: 'Sarah discovered yoga during her university years and has been passionate about sharing its transformative power ever since. She completed her 200-hour training in Rishikesh, India, and later pursued advanced certifications in Vinyasa and Yin Yoga.',
      rating: 4.9,
      reviewCount: 450,
      studentCount: 1200,
      yearsTeaching: 8,
      avatar: 'https://images.unsplash.com/photo-1676578732408-134d55bc408d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwd29tYW58ZW58MXx8fHwxNzU2OTAzMTQxfDA&ixlib=rb-4.1.0&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1652347141247-5788de175766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwaW5zdHJ1Y3RvciUyMHRlYWNoaW5nJTIwY2xhc3MlMjBzdHVkaW98ZW58MXx8fHwxNzU2OTAyOTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      specialties: ['Vinyasa', 'Power Yoga', 'Meditation'],
      languages: ['English', 'German'],
      certifications: ['RYT-500', 'Yin Yoga Certified', 'Meditation Teacher'],
      studios: ['Flow Studio Zürich', 'Zen Space Geneva'],
      // Brand information
      brand: {
        id: 'mojo-univers-1',
        name: 'MŌJŌ UNIVERS',
        tagline: 'ESPACE DÉDIÉ AUX GOOD VIBES ET À L\'AUTHENTICITÉ, NOURRI PAR LA PRATIQUE DU YOGA',
        logo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center', // Lotus/yoga logo
        primaryColor: '#8B5A3C',
        secondaryColor: '#F5E6D3'
      },
      nextClasses: [
        {
          name: 'Vinyasa Flow',
          date: 'Today',
          time: '18:30',
          studio: 'Flow Studio Zürich',
          spotsLeft: 5,
          price: 32
        },
        {
          name: 'Power Yoga',
          date: 'Tomorrow',
          time: '07:00',
          studio: 'Flow Studio Zürich',
          spotsLeft: 8,
          price: 35
        }
      ],
      onlineVideos: [
        { title: 'Morning Flow Sequence', duration: '30 min', views: 1250 },
        { title: 'Stress Relief Yin', duration: '45 min', views: 890 }
      ],
      socialMedia: {
        instagram: '@sarah_flows',
        website: 'sarahmilleryoga.com'
      },
      philosophy: 'Yoga is not about being perfect, it\'s about being present. I believe in creating a safe space where students can explore their practice without judgment.',
      privateSessionsAvailable: true,
      privateSessionRate: 85,
      isFollowed: false
    },
    {
      id: '2',
      name: 'Marc Dubois',
      slug: 'marc-dubois',
      bio: 'Mindfulness teacher and former professional athlete. Specializes in Yin Yoga and meditation practices.',
      longBio: 'Marc transitioned from professional skiing to yoga after a career-ending injury. His unique approach combines athletic precision with mindful awareness, making his classes both challenging and deeply restorative.',
      rating: 4.8,
      reviewCount: 320,
      studentCount: 800,
      yearsTeaching: 6,
      avatar: 'https://images.unsplash.com/photo-1658279445014-dcc466ac1192?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIweW9nYSUyMGluc3RydWN0b3IlMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTY5MDMxNDR8MA&ixlib=rb-4.1.0&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1724833190236-0c25b6c94e90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIweW9nYSUyMGluc3RydWN0b3IlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NTY5MDI5MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      specialties: ['Yin Yoga', 'Meditation', 'Sports Recovery'],
      languages: ['French', 'English'],
      certifications: ['RYT-300', 'Yin Yoga Certified', 'Mindfulness Based Stress Reduction'],
      studios: ['Zen Space Geneva', 'Alpine Wellness Verbier'],
      // Brand information
      brand: {
        id: 'kosha-yoga-2',
        name: 'Kosha',
        tagline: 'INTEGRATED YOGA BY NŌOPUR',
        logo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&crop=center', // Meditation/zen logo
        primaryColor: '#6B9DC1',
        secondaryColor: '#E8F4F8'
      },
      nextClasses: [
        {
          name: 'Yin & Meditation',
          date: 'Today',
          time: '19:00',
          studio: 'Zen Space Geneva',
          spotsLeft: 12,
          price: 28
        }
      ],
      onlineVideos: [
        { title: 'Deep Release Yin', duration: '60 min', views: 2100 },
        { title: '10-Minute Meditation', duration: '10 min', views: 3400 }
      ],
      socialMedia: {
        instagram: '@marc_mindful',
        website: 'marcduboisyoga.ch'
      },
      philosophy: 'Through stillness, we find our strength. My goal is to help students discover the power of presence and patience.',
      privateSessionsAvailable: true,
      privateSessionRate: 75,
      isFollowed: true
    },
    {
      id: '3',
      name: 'Lisa Chen',
      slug: 'lisa-chen',
      bio: 'Dynamic instructor specializing in Power Yoga and Hot Yoga. Former dancer bringing creativity to movement.',
      longBio: 'Lisa brings her background in contemporary dance to create flowing, dynamic yoga sequences. She believes in the power of heat and movement to transform both body and mind.',
      rating: 4.7,
      reviewCount: 280,
      studentCount: 650,
      yearsTeaching: 5,
      avatar: 'https://images.unsplash.com/photo-1665627395850-d707065659aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHlvZ2ElMjB0ZWFjaGVyJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU2OTAzMTQ4fDA&ixlib=rb-4.1.0&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1658279445014-dcc466ac1192?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjB5b2dhJTIwcG93ZXIlMjBjbGFzcyUyMGluc3RydWN0b3J8ZW58MXx8fHwxNzU2OTAyOTI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      specialties: ['Power Yoga', 'Hot Yoga', 'Creative Sequencing'],
      languages: ['English', 'Chinese', 'German'],
      certifications: ['RYT-200', 'Hot Yoga Certified', 'Trauma-Informed Yoga'],
      studios: ['Heat Yoga Basel', 'Power House Zürich'],
      // Brand information
      brand: {
        id: 'satya-yoga-3',
        name: 'SATYA',
        tagline: 'YOGA ET SOINS',
        logo: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop&crop=center', // Natural/organic logo
        primaryColor: '#C17B4A',
        secondaryColor: '#F8E6D0'
      },
      nextClasses: [
        {
          name: 'Hot Power Flow',
          date: 'Today',
          time: '19:30',
          studio: 'Heat Yoga Basel',
          spotsLeft: 3,
          price: 35
        },
        {
          name: 'Creative Vinyasa',
          date: 'Tomorrow',
          time: '18:00',
          studio: 'Power House Zürich',
          spotsLeft: 6,
          price: 32
        }
      ],
      onlineVideos: [
        { title: 'Power Hour Challenge', duration: '60 min', views: 1800 },
        { title: 'Creative Flow Series', duration: '45 min', views: 1200 }
      ],
      socialMedia: {
        instagram: '@lisa_flows_hot'
      },
      philosophy: 'Movement is medicine. I create challenging classes that honor both strength and grace.',
      privateSessionsAvailable: true,
      privateSessionRate: 80,
      isFollowed: false
    },
    {
      id: '4',
      name: 'Elena Rossi',
      slug: 'elena-rossi',
      bio: 'Therapeutic yoga specialist and physiotherapist. Expert in gentle, accessible yoga for all bodies.',
      longBio: 'Elena combines her background in physiotherapy with yoga to create healing-focused classes. She specializes in working with students who have injuries or physical limitations.',
      rating: 4.9,
      reviewCount: 380,
      studentCount: 550,
      yearsTeaching: 10,
      avatar: 'https://images.unsplash.com/photo-1676578732408-134d55bc408d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjB5b2dhJTIwaW5zdHJ1Y3RvciUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NjkwMzE1MXww&ixlib=rb-4.1.0&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1581557521869-e3ffa367232f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXBldXRpYyUyMHlvZ2ElMjBnZW50bGUlMjBpbnN0cnVjdG9yfGVufDF8fHx8MTc1NjkwMjkzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      specialties: ['Therapeutic Yoga', 'Gentle Hatha', 'Chair Yoga'],
      languages: ['Italian', 'German', 'English'],
      certifications: ['RYT-500', 'Therapeutic Yoga Certified', 'Physiotherapy Degree'],
      studios: ['Lakeside Wellness', 'Healing Arts Center'],
      // Brand information
      brand: {
        id: 'temple-prana-4',
        name: 'Temple du Prāṇa',
        tagline: 'UN ESPACE POUR RECONNECTER ET ÉQUILIBRER CORPS, ESPRIT ET ÉNERGIE.',
        logo: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200&h=200&fit=crop&crop=center', // Temple/spiritual logo
        primaryColor: '#8B6B47',
        secondaryColor: '#F0E8D6'
      },
      nextClasses: [
        {
          name: 'Gentle Therapeutic',
          date: 'Tomorrow',
          time: '16:00',
          studio: 'Lakeside Wellness',
          spotsLeft: 10,
          price: 35
        }
      ],
      onlineVideos: [
        { title: 'Gentle Morning Practice', duration: '30 min', views: 950 },
        { title: 'Chair Yoga for Seniors', duration: '20 min', views: 1600 }
      ],
      socialMedia: {
        website: 'elenarossitherapy.ch'
      },
      philosophy: 'Yoga should be accessible to every body. I adapt poses to meet students where they are.',
      privateSessionsAvailable: true,
      privateSessionRate: 95,
      isFollowed: false
    }
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const handleToggleFollow = (instructorId: string) => {
    setFollowedInstructors(prev =>
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const InstructorCard = ({ instructor, isListView = false }: { instructor: any, isListView?: boolean }) => (
    <Card 
      className={`group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl border-2 hover:border-opacity-30 ${
        isListView ? 'flex' : 'h-[480px]'
      }`}
      style={{
        background: `linear-gradient(135deg, ${instructor.brand.primaryColor}08 0%, ${instructor.brand.secondaryColor}20 100%)`,
        borderColor: instructor.brand.primaryColor + '20'
      }}
      onClick={() => onPageChange(`instructor-${instructor.slug}`)}
    >
      <div className={`relative ${isListView ? 'w-64 flex-shrink-0' : 'h-60'}`}>
        <img
          src={instructor.coverImage}
          alt={instructor.name}
          className="w-full h-full object-cover"
        />
        
        {/* Brand Logo */}
        <div 
          className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/50"
          style={{ backgroundColor: instructor.brand.primaryColor + '20', backdropFilter: 'blur(8px)' }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-1">
            <ImageWithFallback 
              src={instructor.brand.logo}
              alt={`${instructor.brand.name} logo`}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* Heart/Follow button */}
        <div className="absolute top-4 left-4">
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFollow(instructor.id);
            }}
          >
            <Heart className={`h-4 w-4 ${followedInstructors.includes(instructor.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Brand Name and Tagline Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center overflow-hidden">
                <ImageWithFallback 
                  src={instructor.brand.logo}
                  alt={`${instructor.brand.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-bold tracking-wide" style={{ color: instructor.brand.secondaryColor }}>
                {instructor.brand.name}
              </h2>
            </div>
            <p className="text-xs leading-relaxed opacity-90 max-w-xs font-medium">
              {instructor.brand.tagline}
            </p>
          </div>
        </div>
      </div>
      
      <CardContent className={`${isListView ? 'flex-1' : ''} p-4 space-y-3`}>
        {/* Instructor Info */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-offset-2" style={{ ringColor: instructor.brand.primaryColor }}>
            <AvatarImage src={instructor.avatar} alt={instructor.name} />
            <AvatarFallback style={{ backgroundColor: instructor.brand.primaryColor + '20' }}>
              {instructor.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {instructor.name}
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{instructor.rating}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{instructor.yearsTeaching} years</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <Button
              size="sm"
              className="px-4"
              style={{ 
                backgroundColor: instructor.brand.primaryColor,
                color: 'white'
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Voir
            </Button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{instructor.studios[0]}</span>
        </div>

        {/* Specialties - condensed */}
        <div className="flex flex-wrap gap-1">
          {instructor.specialties.slice(0, 3).map((specialty: string) => (
            <Badge 
              key={specialty} 
              variant="secondary" 
              className="text-xs px-2 py-0.5 font-medium"
              style={{ 
                backgroundColor: instructor.brand.primaryColor + '15',
                color: instructor.brand.primaryColor,
                border: `1px solid ${instructor.brand.primaryColor}30`
              }}
            >
              {specialty}
            </Badge>
          ))}
        </div>

        {/* Next class - simplified */}
        {instructor.nextClasses.length > 0 && (
          <div className="border-t pt-2 mt-2" style={{ borderColor: instructor.brand.primaryColor + '20' }}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: instructor.brand.primaryColor }}
                ></div>
                <span className="font-medium">{instructor.nextClasses[0].name}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{instructor.nextClasses[0].date}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20 space-y-12">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold">
                Instructors in {currentLocation?.name}
              </h2>
              <p className="text-muted-foreground text-lg">
                {instructors.length} certified teachers found
              </p>
            </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden md:flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy('rating')}>
                  Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('students')}>
                  Most Students
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('experience')}>
                  Experience
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('reviews')}>
                  Most Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('availability')}>
                  Availability
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, style, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>



      {/* Instructors Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} isListView />
          ))}
        </div>
      )}



        {/* Student Community CTA */}
        <Card className="p-8 text-center bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Find Your Perfect Instructor</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create your account to book classes, follow your favorite instructors, and discover new yoga styles across Switzerland.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Sign Up
              </Button>
              <Button variant="outline" size="lg">
                Browse Classes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}