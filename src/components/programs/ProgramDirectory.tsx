import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Globe, 
  MapPin,
  Heart,
  Zap,
  User,
  Calendar,
  SwissFranc,
  CheckCircle,
  PlayCircle,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';

interface Program {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  delivery_mode: string;
  session_length_min: number;
  is_multi_session: boolean;
  default_sessions_count: number;
  instructor: {
    id: string;
    name: string;
    title: string;
    rating: number;
    sessions_completed: number;
    image: string;
  };
  variants: Array<{
    id: string;
    name: string;
    sessions_count: number;
    price: number;
    currency: string;
    description: string;
    most_popular?: boolean;
  }>;
  featured: boolean;
  visibility: string;
  rating: number;
  review_count: number;
  thumbnail_url: string;
  tags: string[];
}

export function ProgramDirectory() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deliveryModeFilter, setDeliveryModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);

      // Demo programs data
      const demoPrograms: Program[] = [
        {
          id: 'program-evolve-coaching',
          title: 'EVOLVE Holistic Life Coaching',
          slug: 'evolve-holistic-coaching',
          summary: 'Transform your life with personalized coaching sessions focusing on mindset, wellness, and personal growth.',
          category: 'coaching',
          delivery_mode: 'hybrid',
          session_length_min: 90,
          is_multi_session: true,
          default_sessions_count: 8,
          instructor: {
            id: 'instructor-sarah',
            name: 'Sarah Kumar',
            title: 'Certified Life Coach & Wellness Expert',
            rating: 4.9,
            sessions_completed: 450,
            image: '/api/placeholder/150/150'
          },
          variants: [
            {
              id: 'evolve-4pack',
              name: '4-Session Starter Pack',
              sessions_count: 4,
              price: 720.00,
              currency: 'CHF',
              description: 'Perfect for exploring life coaching'
            },
            {
              id: 'evolve-8pack',
              name: '8-Session Transformation',
              sessions_count: 8,
              price: 1280.00,
              currency: 'CHF',
              description: 'Complete transformation program',
              most_popular: true
            },
            {
              id: 'evolve-12pack',
              name: '12-Session Deep Dive',
              sessions_count: 12,
              price: 1800.00,
              currency: 'CHF',
              description: 'Comprehensive life transformation'
            }
          ],
          featured: true,
          visibility: 'public',
          rating: 4.9,
          review_count: 67,
          thumbnail_url: '/api/placeholder/300/200',
          tags: ['life coaching', 'wellness', 'mindset', 'transformation']
        },
        {
          id: 'program-split-flexibility',
          title: 'SPLIT Grand Écart Training',
          slug: 'split-grand-ecart-training',
          summary: 'Achieve full splits with this specialized flexibility and mobility program designed for all levels.',
          category: 'mobility',
          delivery_mode: 'in_person',
          session_length_min: 75,
          is_multi_session: true,
          default_sessions_count: 12,
          instructor: {
            id: 'instructor-elena',
            name: 'Elena Varga',
            title: 'Movement & Flexibility Specialist',
            rating: 4.8,
            sessions_completed: 280,
            image: '/api/placeholder/150/150'
          },
          variants: [
            {
              id: 'split-beginner-6',
              name: 'Beginner 6-Week Program',
              sessions_count: 6,
              price: 450.00,
              currency: 'CHF',
              description: 'Foundation flexibility training'
            },
            {
              id: 'split-intermediate-12',
              name: 'Intermediate 12-Week Program',
              sessions_count: 12,
              price: 840.00,
              currency: 'CHF',
              description: 'Progress to full splits',
              most_popular: true
            },
            {
              id: 'split-advanced-18',
              name: 'Advanced 18-Week Mastery',
              sessions_count: 18,
              price: 1200.00,
              currency: 'CHF',
              description: 'Master advanced splits & oversplits'
            }
          ],
          featured: true,
          visibility: 'public',
          rating: 4.8,
          review_count: 43,
          thumbnail_url: '/api/placeholder/300/200',
          tags: ['flexibility', 'splits', 'mobility', 'stretching', 'dance']
        },
        {
          id: 'program-reiki-healing',
          title: 'Reiki Energy Healing Sessions',
          slug: 'reiki-energy-healing',
          summary: 'Experience deep relaxation and energy balancing through traditional Reiki healing techniques.',
          category: 'reiki',
          delivery_mode: 'in_person',
          session_length_min: 60,
          is_multi_session: false,
          default_sessions_count: 1,
          instructor: {
            id: 'instructor-maria',
            name: 'Maria Santos',
            title: 'Reiki Master & Energy Healer',
            rating: 5.0,
            sessions_completed: 650,
            image: '/api/placeholder/150/150'
          },
          variants: [
            {
              id: 'reiki-single',
              name: 'Single Reiki Session',
              sessions_count: 1,
              price: 120.00,
              currency: 'CHF',
              description: 'One healing session'
            },
            {
              id: 'reiki-3pack',
              name: '3-Session Package',
              sessions_count: 3,
              price: 320.00,
              currency: 'CHF',
              description: 'Series for deeper healing'
            }
          ],
          featured: false,
          visibility: 'public',
          rating: 5.0,
          review_count: 89,
          thumbnail_url: '/api/placeholder/300/200',
          tags: ['reiki', 'energy healing', 'relaxation', 'wellness']
        },
        {
          id: 'program-private-yoga',
          title: 'Private Yoga Instruction',
          slug: 'private-yoga-instruction',
          summary: 'Personalized yoga sessions tailored to your specific needs, goals, and level of experience.',
          category: 'private_class',
          delivery_mode: 'hybrid',
          session_length_min: 60,
          is_multi_session: false,
          default_sessions_count: 1,
          instructor: {
            id: 'instructor-david',
            name: 'David Chen',
            title: 'E-RYT 500 Yoga Instructor',
            rating: 4.9,
            sessions_completed: 520,
            image: '/api/placeholder/150/150'
          },
          variants: [
            {
              id: 'private-single',
              name: 'Single Private Session',
              sessions_count: 1,
              price: 150.00,
              currency: 'CHF',
              description: '1-hour personalized session'
            },
            {
              id: 'private-5pack',
              name: '5-Session Package',
              sessions_count: 5,
              price: 700.00,
              currency: 'CHF',
              description: '5 sessions with progression tracking'
            },
            {
              id: 'private-10pack',
              name: '10-Session Program',
              sessions_count: 10,
              price: 1300.00,
              currency: 'CHF',
              description: 'Comprehensive personal practice development'
            }
          ],
          featured: false,
          visibility: 'public',
          rating: 4.9,
          review_count: 156,
          thumbnail_url: '/api/placeholder/300/200',
          tags: ['private yoga', 'personalized', 'one-on-one', 'alignment']
        }
      ];

      setPrograms(demoPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: { [key: string]: { text: string; color: string; icon: any } } = {
      coaching: { text: 'Life Coaching', color: 'text-blue-600 bg-blue-100', icon: Target },
      mobility: { text: 'Mobility', color: 'text-green-600 bg-green-100', icon: Zap },
      reiki: { text: 'Reiki', color: 'text-purple-600 bg-purple-100', icon: Heart },
      private_class: { text: 'Private Class', color: 'text-orange-600 bg-orange-100', icon: User },
      therapy: { text: 'Therapy', color: 'text-indigo-600 bg-indigo-100', icon: Heart },
      assessment: { text: 'Assessment', color: 'text-teal-600 bg-teal-100', icon: CheckCircle }
    };
    
    return categoryConfig[category] || categoryConfig.coaching;
  };

  const getDeliveryModeIcon = (mode: string) => {
    const modeConfig: { [key: string]: { icon: any; text: string; color: string } } = {
      in_person: { icon: Users, text: 'In-Person', color: 'text-blue-600' },
      online: { icon: Globe, text: 'Online', color: 'text-green-600' },
      hybrid: { icon: Zap, text: 'Hybrid', color: 'text-purple-600' }
    };
    
    return modeConfig[mode] || modeConfig.in_person;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || program.category === categoryFilter;
    const matchesDeliveryMode = deliveryModeFilter === 'all' || program.delivery_mode === deliveryModeFilter;
    
    return matchesSearch && matchesCategory && matchesDeliveryMode;
  });

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price));
      case 'price_high':
        return Math.min(...b.variants.map(v => v.price)) - Math.min(...a.variants.map(v => v.price));
      case 'reviews':
        return b.review_count - a.review_count;
      default:
        return 0;
    }
  });

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setShowDetailDialog(true);
  };

  const handleBookProgram = (program: Program, variant: any) => {
    console.log('Book program:', program.id, 'variant:', variant.id);
    // Navigate to booking flow
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Individual Programs & Services</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Personalized 1-to-1 programs designed to help you achieve your wellness goals with expert guidance
        </p>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="coaching">Life Coaching</SelectItem>
                <SelectItem value="mobility">Mobility & Flexibility</SelectItem>
                <SelectItem value="reiki">Energy Healing</SelectItem>
                <SelectItem value="private_class">Private Classes</SelectItem>
                <SelectItem value="therapy">Therapy</SelectItem>
                <SelectItem value="assessment">Assessments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deliveryModeFilter} onValueChange={setDeliveryModeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {sortedPrograms.length} program{sortedPrograms.length !== 1 ? 's' : ''} available
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Expert Instructors
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Award className="h-3 w-3 mr-1" />
            Personalized Approach
          </Badge>
        </div>
      </div>

      {/* Featured Programs */}
      {sortedPrograms.some(p => p.featured) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedPrograms.filter(p => p.featured).map((program) => {
              const categoryBadge = getCategoryBadge(program.category);
              const deliveryMode = getDeliveryModeIcon(program.delivery_mode);
              const CategoryIcon = categoryBadge.icon;
              const DeliveryIcon = deliveryMode.icon;
              const minPrice = Math.min(...program.variants.map(v => v.price));

              return (
                <Card 
                  key={program.id} 
                  className="transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => handleProgramClick(program)}
                >
                  <div className="relative">
                    <img 
                      src={program.thumbnail_url} 
                      alt={program.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-900 border-yellow-400">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold">{program.title}</h3>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(minPrice)}</div>
                            <div className="text-xs text-muted-foreground">from</div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{program.summary}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={categoryBadge.color} variant="outline">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {categoryBadge.text}
                        </Badge>
                        <Badge variant="outline">
                          <DeliveryIcon className={`h-3 w-3 mr-1 ${deliveryMode.color}`} />
                          {deliveryMode.text}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {program.session_length_min}min
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={program.instructor.image} />
                            <AvatarFallback>
                              {program.instructor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{program.instructor.name}</div>
                            <div className="text-xs text-muted-foreground">{program.instructor.title}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{program.rating}</span>
                            <span className="text-xs text-muted-foreground">({program.review_count})</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {program.instructor.sessions_completed} sessions
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">
                        View Program Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Programs Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPrograms.map((program) => {
            const categoryBadge = getCategoryBadge(program.category);
            const deliveryMode = getDeliveryModeIcon(program.delivery_mode);
            const CategoryIcon = categoryBadge.icon;
            const DeliveryIcon = deliveryMode.icon;
            const minPrice = Math.min(...program.variants.map(v => v.price));

            return (
              <Card 
                key={program.id} 
                className="transition-all hover:shadow-md cursor-pointer"
                onClick={() => handleProgramClick(program)}
              >
                <div className="relative">
                  <img 
                    src={program.thumbnail_url} 
                    alt={program.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  {program.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900 border-yellow-400 text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm">{program.title}</h3>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(minPrice)}</div>
                          <div className="text-xs text-muted-foreground">from</div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-2">{program.summary}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={categoryBadge.color} variant="outline" className="text-xs">
                        <CategoryIcon className="h-2 w-2 mr-1" />
                        {categoryBadge.text}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <DeliveryIcon className={`h-2 w-2 mr-1 ${deliveryMode.color}`} />
                        {deliveryMode.text}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={program.instructor.image} />
                          <AvatarFallback className="text-xs">
                            {program.instructor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{program.instructor.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{program.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Program Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProgram && (
            <div className="space-y-6">
              <DialogHeader>
                <img 
                  src={selectedProgram.thumbnail_url} 
                  alt={selectedProgram.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <DialogTitle className="text-2xl">{selectedProgram.title}</DialogTitle>
                <p className="text-muted-foreground">{selectedProgram.summary}</p>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <div className="font-medium">{selectedProgram.session_length_min} min</div>
                      <div className="text-xs text-muted-foreground">Per Session</div>
                    </div>
                    <div className="text-center">
                      {selectedProgram.is_multi_session ? (
                        <Calendar className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      ) : (
                        <PlayCircle className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                      )}
                      <div className="font-medium">
                        {selectedProgram.is_multi_session ? `${selectedProgram.default_sessions_count} Sessions` : 'Single Session'}
                      </div>
                      <div className="text-xs text-muted-foreground">Program Length</div>
                    </div>
                    <div className="text-center">
                      {(() => {
                        const mode = getDeliveryModeIcon(selectedProgram.delivery_mode);
                        const Icon = mode.icon;
                        return <Icon className={`h-6 w-6 mx-auto mb-1 ${mode.color}`} />;
                      })()}
                      <div className="font-medium">{getDeliveryModeIcon(selectedProgram.delivery_mode).text}</div>
                      <div className="text-xs text-muted-foreground">Delivery Mode</div>
                    </div>
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto mb-1 text-yellow-600 fill-yellow-400" />
                      <div className="font-medium">{selectedProgram.rating}/5</div>
                      <div className="text-xs text-muted-foreground">{selectedProgram.review_count} Reviews</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Program Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProgram.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedProgram.instructor.image} />
                      <AvatarFallback>
                        {selectedProgram.instructor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{selectedProgram.instructor.name}</h4>
                      <p className="text-muted-foreground">{selectedProgram.instructor.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedProgram.instructor.rating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedProgram.instructor.sessions_completed} sessions completed
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid gap-4">
                    {selectedProgram.variants.map((variant) => (
                      <Card key={variant.id} className={`relative ${variant.most_popular ? 'border-2 border-blue-500' : ''}`}>
                        {variant.most_popular && (
                          <Badge className="absolute -top-2 left-4 bg-blue-500">
                            Most Popular
                          </Badge>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{variant.name}</h4>
                              <p className="text-sm text-muted-foreground">{variant.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {variant.sessions_count} session{variant.sessions_count > 1 ? 's' : ''}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(variant.price / variant.sessions_count)} per session
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{formatCurrency(variant.price)}</div>
                              <Button 
                                size="sm" 
                                onClick={() => handleBookProgram(selectedProgram, variant)}
                                className="mt-2"
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}