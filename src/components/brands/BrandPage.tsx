import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Star,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Share2,
  Plus,
  Filter
} from 'lucide-react';
import { ClassCard } from '../ui/class-card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useBrandTheme, useBrandAnalytics } from './BrandThemeProvider';
import { BrandService, Brand, BrandAsset, BrandPolicy } from '../../utils/supabase/brands-service';
import { toast } from 'sonner@2.0.3';

interface BrandPageProps {
  brandSlug: string;
  onNavigate?: (path: string) => void;
}

interface StudioLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: number;
  image?: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  level: string;
  image?: string;
}

interface Retreat {
  id: string;
  name: string;
  location: string;
  dates: string;
  price: number;
  image?: string;
  spots_left: number;
}

export function BrandPage({ brandSlug, onNavigate }: BrandPageProps) {
  const { setBrandBySlug, currentBrand, theme } = useBrandTheme();
  const { track } = useBrandAnalytics();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [policies, setPolicies] = useState<BrandPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  // Mock data - in real app, these would come from the API
  const [studios] = useState<StudioLocation[]>([
    {
      id: '1',
      name: 'Downtown Studio',
      address: 'Bahnhofstrasse 1',
      city: 'Zurich',
      distance: 0.5,
      image: '/studio-1.jpg'
    },
    {
      id: '2', 
      name: 'Lakeside Retreat',
      address: 'Seestrasse 25',
      city: 'Lucerne',
      distance: 45.2,
      image: '/studio-2.jpg'
    }
  ]);

  const [programs] = useState<Program[]>([
    {
      id: '1',
      name: 'Beginner\'s Journey',
      description: '8-week comprehensive introduction to yoga',
      duration: '8 weeks',
      price: 280,
      level: 'Beginner',
      image: '/program-1.jpg'
    },
    {
      id: '2',
      name: 'Advanced Flow Series',
      description: 'Dynamic vinyasa flow for experienced practitioners',
      duration: '4 weeks',
      price: 180,
      level: 'Advanced',
      image: '/program-2.jpg'
    }
  ]);

  const [retreats] = useState<Retreat[]>([
    {
      id: '1',
      name: 'Alpine Mindfulness Retreat',
      location: 'Graubünden, Switzerland',
      dates: 'July 15-22, 2024',
      price: 1250,
      image: '/retreat-1.jpg',
      spots_left: 3
    },
    {
      id: '2',
      name: 'Lake Geneva Wellness Week',
      location: 'Montreux, Switzerland',
      dates: 'September 2-9, 2024',
      price: 980,
      image: '/retreat-2.jpg',
      spots_left: 8
    }
  ]);

  const [upcomingClasses] = useState([
    {
      id: '1',
      name: 'Morning Flow',
      instructor: 'Sarah Chen',
      instructorImage: '/instructor-1.jpg',
      studio: 'Downtown Studio',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '08:00',
      duration: 75,
      level: 'All Levels',
      style: 'Vinyasa',
      price: 32,
      spotsLeft: 5,
      totalSpots: 20,
      rating: 4.8,
      image: '/class-1.jpg',
      passesAccepted: ['Monthly Unlimited', '10 Class Pack'],
      cancellationPolicy: '24h'
    },
    {
      id: '2',
      name: 'Restorative Evening',
      instructor: 'Maria Gonzalez',
      instructorImage: '/instructor-2.jpg',
      studio: 'Lakeside Retreat',
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      time: '19:30',
      duration: 60,
      level: 'Beginner',
      style: 'Restorative',
      price: 28,
      spotsLeft: 2,
      totalSpots: 12,
      rating: 4.9,
      image: '/class-2.jpg',
      passesAccepted: ['Monthly Unlimited'],
      cancellationPolicy: '24h'
    }
  ]);

  useEffect(() => {
    loadBrandData();
  }, [brandSlug]);

  const loadBrandData = async () => {
    try {
      setIsLoading(true);
      
      // Set brand theme first
      await setBrandBySlug(brandSlug);
      
      // Load brand data
      const brandData = await BrandService.getBrandBySlug(brandSlug);
      if (!brandData) {
        throw new Error('Brand not found');
      }
      
      const [brandAssets, brandPolicies] = await Promise.all([
        BrandService.getBrandAssets(brandData.id),
        BrandService.getPublishedPolicies(brandData.id)
      ]);
      
      setBrand(brandData);
      setAssets(brandAssets);
      setPolicies(brandPolicies);
      
      // Track page view
      await track('page_view');
      
    } catch (error) {
      console.error('Failed to load brand:', error);
      toast.error('Brand not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!brand) return;
    
    try {
      setIsFollowing(!isFollowing);
      await track(isFollowing ? 'brand_unfollow' : 'brand_follow');
      toast.success(isFollowing ? 'Unfollowed' : 'Following this brand');
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      setIsFollowing(!isFollowing); // Revert
      toast.error('Failed to update follow status');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: brand?.name,
          text: brand?.tagline,
          url: window.location.href
        });
        await track('brand_share', { method: 'native' });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
      await track('brand_share', { method: 'clipboard' });
    }
  };

  const getAssetUrl = (kind: string) => {
    const asset = assets.find(a => a.kind === kind);
    return asset ? `/api/brand-assets/${asset.storage_path}?v=${brand?.version}` : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Brand not found</h1>
          <p className="text-muted-foreground mb-4">
            The brand you're looking for doesn't exist or has been disabled.
          </p>
          <Button onClick={() => onNavigate?.('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const heroImage = getAssetUrl('hero');
  const logoImage = getAssetUrl('logo_primary');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {heroImage ? (
          <ImageWithFallback
            src={heroImage}
            alt={brand.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ 
              background: `linear-gradient(135deg, ${theme?.color.primary}22, ${theme?.color.secondary}22)`
            }}
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 max-w-2xl px-4">
            {logoImage && (
              <div className="mb-6">
                <img 
                  src={logoImage} 
                  alt={brand.name}
                  className="h-20 mx-auto"
                />
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold">{brand.name}</h1>
            
            {brand.tagline && (
              <p className="text-xl md:text-2xl text-white/90">{brand.tagline}</p>
            )}
            
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button 
                size="lg"
                onClick={handleFollow}
                style={{ backgroundColor: theme?.color.primary }}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleShare}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="retreats">Retreats</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {brand.content.about && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Story</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {brand.content.about.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {brand.content.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg leading-relaxed">{brand.content.mission}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold" style={{ color: theme?.color.primary }}>
                        {studios.length}
                      </div>
                      <p className="text-muted-foreground">Locations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold" style={{ color: theme?.color.primary }}>
                        50+
                      </div>
                      <p className="text-muted-foreground">Classes/Week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold" style={{ color: theme?.color.primary }}>
                        500+
                      </div>
                      <p className="text-muted-foreground">Happy Students</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                {brand.content.contact_info && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {brand.content.contact_info.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${brand.content.contact_info.email}`} className="hover:underline">
                            {brand.content.contact_info.email}
                          </a>
                        </div>
                      )}
                      {brand.content.contact_info.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${brand.content.contact_info.phone}`} className="hover:underline">
                            {brand.content.contact_info.phone}
                          </a>
                        </div>
                      )}
                      {brand.content.contact_info.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={brand.content.contact_info.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Social Links */}
                {brand.content.social_links && Object.keys(brand.content.social_links).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {brand.content.social_links.instagram && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={brand.content.social_links.instagram} target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {brand.content.social_links.facebook && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={brand.content.social_links.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {brand.content.social_links.twitter && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={brand.content.social_links.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upcoming Classes Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Classes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingClasses.slice(0, 3).map(classItem => (
                      <div key={classItem.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{classItem.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {classItem.instructor} • {classItem.time}
                        </div>
                        <div className="text-sm" style={{ color: theme?.color.primary }}>
                          CHF {classItem.price}
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full mt-3"
                      onClick={() => setActiveTab('classes')}
                    >
                      View All Classes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">All Classes</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingClasses.map(classItem => (
                <ClassCard
                  key={classItem.id}
                  classData={{
                    id: classItem.id,
                    name: classItem.name,
                    instructor: {
                      id: '1',
                      name: classItem.instructor,
                      avatar: classItem.instructorImage,
                      rating: classItem.rating
                    },
                    studio: {
                      name: classItem.studio,
                      location: 'Zurich',
                    },
                    schedule: {
                      date: classItem.date,
                      time: classItem.time,
                      duration: classItem.duration
                    },
                    pricing: {
                      price: classItem.price,
                      currency: 'CHF'
                    },
                    capacity: {
                      total: classItem.totalSpots,
                      booked: classItem.totalSpots - classItem.spotsLeft
                    },
                    details: {
                      level: classItem.level,
                      style: classItem.style,
                      cancellationPolicy: classItem.cancellationPolicy,
                      passesAccepted: classItem.passesAccepted
                    },
                    image: classItem.image
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Programs</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Explore All Programs
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map(program => (
                <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={program.image}
                      alt={program.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{program.level}</Badge>
                        <span className="font-semibold">CHF {program.price}</span>
                      </div>
                      <h3 className="text-xl font-semibold">{program.name}</h3>
                      <p className="text-muted-foreground">{program.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {program.duration}
                        </div>
                      </div>
                      <Button className="w-full">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="retreats" className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Retreats</h2>
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Retreats
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {retreats.map(retreat => (
                <Card key={retreat.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={retreat.image}
                      alt={retreat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={retreat.spots_left <= 5 ? "destructive" : "outline"}>
                          {retreat.spots_left} spots left
                        </Badge>
                        <span className="font-semibold">CHF {retreat.price}</span>
                      </div>
                      <h3 className="text-xl font-semibold">{retreat.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {retreat.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {retreat.dates}
                        </div>
                      </div>
                      <Button className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6 mt-8">
            <h2 className="text-2xl font-semibold">Our Locations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studios.map(studio => (
                <Card key={studio.id} className="overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={studio.image}
                      alt={studio.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">{studio.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {studio.address}, {studio.city}
                        </div>
                        {studio.distance !== undefined && (
                          <div className="text-sm">
                            {studio.distance < 1 
                              ? `${Math.round(studio.distance * 1000)}m away`
                              : `${studio.distance.toFixed(1)}km away`
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          View Schedule
                        </Button>
                        <Button className="flex-1">
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6 mt-8">
            <h2 className="text-2xl font-semibold">Policies & Information</h2>

            <div className="space-y-4">
              {policies.map(policy => (
                <Card key={policy.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {policy.title}
                      <Badge variant="outline">
                        {new Date(policy.published_at || '').toLocaleDateString()}
                      </Badge>
                    </CardTitle>
                    {policy.summary && (
                      <p className="text-muted-foreground">{policy.summary}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: policy.content_html || policy.content_md.replace(/\n/g, '<br>') 
                      }}
                    />
                  </CardContent>
                </Card>
              ))}

              {policies.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No policies published</h3>
                    <p className="text-muted-foreground">
                      This brand hasn't published any policies yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}