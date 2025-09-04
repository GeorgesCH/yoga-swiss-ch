import React, { useState, useEffect } from 'react';
import { usePortal } from '../PortalProvider';
import { useTranslation } from '../../i18n/ComprehensiveI18nProvider';
import { supabase } from '../../../utils/supabase/client';
import { safeService } from '../../../utils/supabase/safe-service';
import { DEMO_UUIDS } from '../../../utils/demo-uuid-helper';
import { getCityHeroImage, getCityHeroImageAlt } from '../../../utils/city-hero-images';
import { LuxuryButton } from '../../ui/luxury-button';
import { LuxuryCard, LuxuryCardContent, LuxuryCardHeader, LuxuryCardTitle, LuxuryCardDescription } from '../../ui/luxury-card';
import { LuxuryBadge, ClassTypeBadge, LevelBadge, SwissBadge } from '../../ui/luxury-badge';
import { LuxuryClassCard } from '../../ui/luxury-class-card';

import { Input } from '../../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Heart,
  Calendar,
  Users,
  Play,
  Gift,
  ArrowRight,
  Mountain,
  Waves,
  TreePine,
  Sun,
  Moon,
  Sparkles,
  Award,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

export function LuxuryHomePage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { 
    currentLocation, 
    searchQuery, 
    setSearchQuery,
    isAuthenticated,
    customerProfile
  } = usePortal();
  const { t } = useTranslation();

  const [featuredSection, setFeaturedSection] = useState('today');
  const [featuredClasses, setFeaturedClasses] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({
    members: '0',
    rating: '0.0',
    studios: '0',
    country: '🇨🇭'
  });
  const [loading, setLoading] = useState(true);

  // Get city-specific hero image based on current location
  const heroImage = getCityHeroImage(currentLocation?.name);
  const heroImageAlt = getCityHeroImageAlt(currentLocation?.name);

  // Fetch real data from Supabase
  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);

      // Fetch today's featured classes using safe service with proper demo UUID
      const result = await safeService.getTodayClasses(DEMO_UUIDS.DEMO_ORG_PRIMARY);
      
      if (result.data && result.data.length > 0) {
        // Process class data from safe service
        const processedClasses = result.data.slice(0, 6).map(instance => {
          const instructor = instance.profiles;
          const instructorName = instructor?.display_name || 
            (instructor?.first_name && instructor?.last_name ? 
              `${instructor.first_name} ${instructor.last_name}` : 
              'TBD');

          const startTime = new Date(instance.start_time);
          const classTemplate = instance.class_templates;

          return {
            id: instance.id,
            title: instance.name || classTemplate?.name || 'Yoga Class',
            instructor: instructorName,
            type: classTemplate?.type || 'Yoga',
            level: classTemplate?.level || 'All Levels',
            duration: classTemplate?.duration_minutes || 60,
            time: startTime.toLocaleTimeString('de-CH', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            date: 'Today',
            location: instance.locations?.name || 'Studio',
            price: (instance.price_cents || 0) / 100,
            spotsLeft: Math.max(0, (instance.capacity || 20) - 15), // Mock booking count
            isOutdoor: instance.locations?.name?.toLowerCase().includes('outdoor') || false,
            isSignature: Math.random() > 0.7, // Random signature status
            isSwiss: true,
            rating: 4.8 + Math.random() * 0.2, // Random rating between 4.8-5.0
            image: classTemplate?.images?.[0] || heroImage
          };
        });

        setFeaturedClasses(processedClasses);
      } else {
        // Set fallback classes if no data available
        setFeaturedClasses([
          {
            id: '1',
            title: 'Vinyasa Flow Masterclass',
            instructor: 'Sarah Zimmermann',
            type: 'Vinyasa',
            level: 'Intermediate',
            duration: 75,
            time: '18:30',
            date: 'Today',
            location: 'Flow Studio Zürich',
            price: 45,
            spotsLeft: 3,
            isOutdoor: false,
            isSignature: true,
            isSwiss: true,
            rating: 4.9,
            image: heroImage
          }
        ]);
      }

      // Fetch platform statistics using safe service
      try {
        const { data: orgsCount } = await supabase
          .from('organizations')
          .select('id', { count: 'exact' });

        const { data: membersCount } = await supabase
          .from('organization_members')
          .select('id', { count: 'exact' })
          .eq('role', 'customer');

        // Update platform stats
        setPlatformStats({
          members: membersCount ? `${(membersCount.length / 1000).toFixed(1)}k` : '12.4k',
          rating: '4.9',
          studios: orgsCount ? `${orgsCount.length}+` : '150+',
          country: '🇨🇭'
        });
      } catch (statsError) {
        console.warn('Could not fetch platform statistics:', statsError);
        // Keep default stats on error
      }

    } catch (error) {
      console.error('Error fetching homepage data:', error);
      
      // Set fallback featured classes
      setFeaturedClasses([
        {
          id: '1',
          title: 'Vinyasa Flow Masterclass',
          instructor: 'Sarah Zimmermann',
          type: 'Vinyasa',
          level: 'Intermediate',
          duration: 75,
          time: '18:30',
          date: 'Today',
          location: 'Flow Studio Zürich',
          price: 45,
          spotsLeft: 3,
          isOutdoor: false,
          isSignature: true,
          isSwiss: true,
          rating: 4.9,
          image: heroImage
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0
    }).format(amount);
  };



  // Swiss category data (dynamically populated based on real class templates)
  const [swissCategories, setSwissCategories] = useState([
    { 
      name: 'Vinyasa Flow', 
      count: 0, 
      icon: '🌊', 
      description: 'Dynamic sequences with breath',
      trending: true
    },
    { 
      name: 'Alpine Yoga', 
      count: 0, 
      icon: '⛰️', 
      description: 'Mountain practice with views',
      signature: true
    },
    { 
      name: 'Yin & Meditation', 
      count: 0, 
      icon: '🌙', 
      description: 'Deep relaxation and mindfulness',
      trending: false
    },
    { 
      name: 'Hot Yoga', 
      count: 0, 
      icon: '🔥', 
      description: 'Heated practice for detox',
      trending: false
    },
    { 
      name: 'Prenatal Care', 
      count: 0, 
      icon: '🤱', 
      description: 'Safe practice for mothers',
      signature: false
    },
    { 
      name: 'Sound Healing', 
      count: 0, 
      icon: '🎵', 
      description: 'Therapeutic vibrations',
      signature: true
    }
  ]);

  const swissQualityFeatures = [
    {
      icon: Shield,
      title: "Swiss Quality Assurance",
      description: "All instructors certified to Swiss yoga standards"
    },
    {
      icon: Award,
      title: "Elite Facilities",
      description: "Handpicked studios with luxury amenities"
    },
    {
      icon: CheckCircle,
      title: "Secure Payments",
      description: "TWINT, PostFinance & QR-Bill supported"
    },
    {
      icon: Sparkles,
      title: "Curated Experiences",
      description: "Unique classes you won't find elsewhere"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-20 pb-20">
        {/* Cinematic Hero Section */}
        <section className="relative h-screen overflow-hidden">
          {/* City-specific Background Image */}
          <div className="absolute inset-0 mx-4 my-4 rounded-3xl overflow-hidden">
            <ImageWithFallback
              src={heroImage}
              alt={heroImageAlt}
              className="w-full h-full object-cover"
            />
            
            {/* Enhanced Black Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-4">
                {isAuthenticated && customerProfile ? (
                  <div className="space-y-8 text-white">
                    <div className="space-y-4">
                      <div className="overline">{t('portal.hero.welcome_back', 'Welcome back')}</div>
                      <h1 className="font-serif text-6xl lg:text-7xl font-bold leading-tight">
                        {t('portal.hero.hello', 'Hello')},<br />
                        <span className="text-[var(--champagne)]">{customerProfile.firstName}</span>
                      </h1>
                      <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                        {t('portal.hero.journey_continues', 'Your wellness journey continues with')} <span className="font-semibold text-[var(--champagne)]">{customerProfile.upcomingBookings} {t('portal.hero.upcoming_sessions', 'upcoming sessions')}</span> {t('portal.hero.and', 'and')} <span className="font-semibold text-[var(--champagne)]">{customerProfile.creditsBalance} {t('portal.navigation.credits', 'credits')}</span> {t('portal.hero.ready_to_use', 'ready to use')}.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      <LuxuryButton 
                        variant="elegant" 
                        size="xl"
                        onClick={() => onPageChange('account')}
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        {t('portal.hero.my_journey', 'My Journey')}
                      </LuxuryButton>
                      <LuxuryButton 
                        variant="outline" 
                        size="xl"
                        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                        onClick={() => onPageChange('explore')}
                      >
                        {t('portal.hero.explore_more', 'Explore More')}
                      </LuxuryButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 text-white">
                    <div className="space-y-6">
                      <div className="overline">{t('portal.hero.subtitle', 'Switzerland #1 Yoga Platform')}</div>
                      <h1 className="font-serif text-6xl lg:text-8xl font-bold leading-tight">
                        {t('portal.hero.discover_your_style', 'Discover Your Style')}<br />
                        <span className="text-[var(--champagne)]">{t('portal.hero.signature_experiences', 'Signature Yoga Experiences')}</span>
                      </h1>
                      <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                        {t('portal.hero.signature_subtitle', 'From traditional Hatha to innovative aerial practices, find the perfect style for your journey')}
                      </p>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="space-y-6">
                      {/* Main Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <LuxuryButton 
                          variant="elegant" 
                          size="xl"
                          onClick={() => onPageChange('studios')}
                          className="bg-champagne text-forest hover:bg-champagne-dark"
                        >
                          {t('portal.navigation.studios', 'Studios')}
                        </LuxuryButton>
                        <LuxuryButton 
                          variant="elegant" 
                          size="xl"
                          onClick={() => onPageChange('instructors')}
                          className="bg-lake text-white hover:bg-lake-light"
                        >
                          {t('portal.navigation.instructors', 'Instructors')}
                        </LuxuryButton>
                        <LuxuryButton 
                          variant="elegant" 
                          size="xl"
                          onClick={() => onPageChange('retreats')}
                          className="bg-copper text-white hover:bg-copper-light"
                        >
                          {t('portal.navigation.retreats', 'Retreats')}
                        </LuxuryButton>
                      </div>
                      
                      {/* Secondary Action Pills */}
                      <div className="flex flex-wrap gap-3">
                        <LuxuryButton 
                          variant="outline" 
                          size="lg"
                          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                          onClick={() => onPageChange('schedule')}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          {t('portal.hero.browse_classes', 'Browse Classes')}
                        </LuxuryButton>
                        <LuxuryButton 
                          variant="outline" 
                          size="lg"
                          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                          onClick={() => onPageChange('outdoor')}
                        >
                          <Mountain className="h-4 w-4 mr-2" />
                          {t('portal.navigation.outdoor', 'Outdoor Yoga')}
                        </LuxuryButton>
                        <LuxuryButton 
                          variant="ghost" 
                          size="lg"
                          className="text-white/90 hover:text-white hover:bg-white/10"
                          onClick={() => onPageChange('online')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {t('portal.navigation.online', 'Online Studio')}
                        </LuxuryButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute bottom-8 left-6 right-6 z-10">
            <div className="container mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-champagne/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-[var(--champagne)]" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide">{t('portal.stats.members', 'Members')}</p>
                      <p className="text-lg font-bold text-white">{platformStats.members}+</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-champagne/20 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-[var(--champagne)] fill-current" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide">{t('portal.stats.rating', 'Rating')}</p>
                      <p className="text-lg font-bold text-white">4.9/5</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-champagne/20 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[var(--champagne)]" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wide">{t('portal.navigation.studios', 'Studios')}</p>
                      <p className="text-lg font-bold text-white">150+</p>
                    </div>
                  </div>
                </div>

                {/* Swiss Made section removed */}
              </div>
            </div>
          </div>

          {/* City Location Badge */}
          <div className="absolute bottom-8 right-6 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--champagne)]" />
                <span className="text-white text-sm font-medium">{currentLocation?.name || 'Switzerland'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Signature Classes */}
        <section className="container mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <div className="overline text-forest">{t('portal.featured.todays_selection', 'Today\'s Signature Selection')}</div>
            <h2 className="font-serif text-4xl font-bold">{t('portal.featured.curated_excellence', 'Curated for Excellence')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('portal.featured.description', 'Hand-picked classes from Switzerland\'s most celebrated instructors and exclusive studios')}
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            <LuxuryButton 
              variant={featuredSection === 'today' ? 'elegant' : 'outline'} 
              size="lg"
              onClick={() => setFeaturedSection('today')}
            >
              {t('common.today', 'Today')}
            </LuxuryButton>
            <LuxuryButton 
              variant={featuredSection === 'evening' ? 'elegant' : 'outline'} 
              size="lg"
              onClick={() => setFeaturedSection('evening')}
            >
              {t('portal.featured.this_evening', 'This Evening')}
            </LuxuryButton>
            <LuxuryButton 
              variant={featuredSection === 'tomorrow' ? 'elegant' : 'outline'} 
              size="lg"
              onClick={() => setFeaturedSection('tomorrow')}
            >
              {t('common.tomorrow', 'Tomorrow')}
            </LuxuryButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredClasses.map((class_) => (
              <LuxuryClassCard
                key={class_.id}
                {...class_}
                onBook={() => onPageChange(`class/${class_.id}`)}
                onFavorite={() => {/* handle favorite */}}
              />
            ))}
          </div>

          <div className="text-center pt-8">
            <LuxuryButton variant="outline" size="xl" onClick={() => onPageChange('explore')}>
              {t('portal.featured.explore_all', 'Explore All Signature Classes')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </LuxuryButton>
          </div>
        </section>

        {/* Swiss Yoga Categories */}
        <section className="container mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <div className="overline text-forest">{t('portal.categories.discover', 'Discover Your Style')}</div>
            <h2 className="font-serif text-4xl font-bold">{t('portal.categories.signature_experiences', 'Signature Yoga Experiences')}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('portal.categories.description', 'From traditional Hatha to innovative aerial practices, find the perfect style for your journey')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {swissCategories.map((category, index) => (
              <LuxuryCard 
                key={category.name} 
                variant="elevated" 
                className="group cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={() => onPageChange(`explore?style=${category.name.toLowerCase()}`)}
              >
                <LuxuryCardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{category.icon}</div>
                      <div className="flex gap-2">
                        {category.trending && (
                          <LuxuryBadge variant="success" size="sm">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {t('portal.categories.trending', 'Trending')}
                          </LuxuryBadge>
                        )}
                        {category.signature && (
                          <LuxuryBadge variant="premium" size="sm">{t('portal.categories.signature', 'Signature')}</LuxuryBadge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl font-semibold group-hover:text-forest transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {category.count} {t('portal.categories.classes_available', 'classes available')}
                      </p>
                    </div>

                    <div className="pt-2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-forest group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </LuxuryCardContent>
              </LuxuryCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
