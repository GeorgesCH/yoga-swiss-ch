import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/ComprehensiveI18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Separator } from '../../ui/separator';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { getCityHeroImage } from '../../../utils/city-hero-images';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  ArrowRight,
  UserCheck,
  Globe,
  MessageSquare,
  HelpCircle,
  Shield
} from 'lucide-react';

interface TeachersCirclePageProps {
  onPageChange: (page: string) => void;
}

interface CircleEvent {
  id: string;
  city: 'Lausanne' | 'Zürich';
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  venue: {
    name: string;
    address: string;
    accessInstructions: string;
    latitude?: number;
    longitude?: number;
  };
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  price: number;
  isFree: boolean;
  status: 'open' | 'full' | 'cancelled' | 'completed';
}

interface RegistrationForm {
  email: string;
  name: string;
  phone: string;
  consentPolicy: boolean;
  consentPhoto: boolean;
}

export function TeachersCirclePage({ onPageChange }: TeachersCirclePageProps) {
  const { t, locale, formatCurrency, formatDate, formatTime } = useTranslation();
  
  const [selectedCity, setSelectedCity] = useState<'Lausanne' | 'Zürich'>('Lausanne');
  const [events, setEvents] = useState<CircleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CircleEvent | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    email: '',
    name: '',
    phone: '',
    consentPolicy: false,
    consentPhoto: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Mock data for upcoming events
  useEffect(() => {
    const mockEvents: CircleEvent[] = [
      {
        id: '1',
        city: 'Lausanne',
        title: t('teachers_circle.event.monthly_gathering', 'Monthly Teachers Gathering'),
        description: t('teachers_circle.event.description', 'Connect with fellow yoga teachers, share experiences, and learn together in a supportive community setting.'),
        startDate: new Date('2025-01-15T19:00:00'),
        endDate: new Date('2025-01-15T21:00:00'),
        venue: {
          name: 'Yoga Studio Lausanne',
          address: 'Rue du Lac 15, 1003 Lausanne',
          accessInstructions: t('teachers_circle.venue.access', 'Enter through main entrance. Circle room on 2nd floor.')
        },
        capacity: 25,
        registeredCount: 18,
        waitlistCount: 3,
        price: 0,
        isFree: true,
        status: 'open'
      },
      {
        id: '2',
        city: 'Zürich',
        title: t('teachers_circle.event.monthly_gathering', 'Monthly Teachers Gathering'),
        description: t('teachers_circle.event.description', 'Connect with fellow yoga teachers, share experiences, and learn together in a supportive community setting.'),
        startDate: new Date('2025-01-20T19:00:00'),
        endDate: new Date('2025-01-20T21:00:00'),
        venue: {
          name: 'Yoga Loft Zürich',
          address: 'Bahnhofstrasse 45, 8001 Zürich',
          accessInstructions: t('teachers_circle.venue.access', 'Enter through main entrance. Circle room on 2nd floor.')
        },
        capacity: 30,
        registeredCount: 22,
        waitlistCount: 5,
        price: 0,
        isFree: true,
        status: 'open'
      },
      {
        id: '3',
        city: 'Lausanne',
        title: t('teachers_circle.event.february_gathering', 'February Teachers Gathering'),
        description: t('teachers_circle.event.description', 'Connect with fellow yoga teachers, share experiences, and learn together in a supportive community setting.'),
        startDate: new Date('2025-02-19T19:00:00'),
        endDate: new Date('2025-02-19T21:00:00'),
        venue: {
          name: 'Yoga Studio Lausanne',
          address: 'Rue du Lac 15, 1003 Lausanne',
          accessInstructions: t('teachers_circle.venue.access', 'Enter through main entrance. Circle room on 2nd floor.')
        },
        capacity: 25,
        registeredCount: 5,
        waitlistCount: 0,
        price: 0,
        isFree: true,
        status: 'open'
      }
    ];
    setEvents(mockEvents);
  }, [t]);

  const filteredEvents = events.filter(event => event.city === selectedCity);

  const handleRegistration = async (event: CircleEvent) => {
    setSelectedEvent(event);
    setShowRegistration(true);
  };

  const submitRegistration = async () => {
    if (!selectedEvent || !registrationForm.consentPolicy) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here would be the actual API integration:
      // const response = await fetch('/api/teachers-circle/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ eventId: selectedEvent.id, ...registrationForm })
      // });
      
      setRegistrationSuccess(true);
      setShowRegistration(false);
      
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const heroImage = getCityHeroImage(selectedCity.toLowerCase());

  const faqItems = [
    {
      question: t('teachers_circle.faq.what_to_expect.question', 'What should I expect at the Teachers Circle?'),
      answer: t('teachers_circle.faq.what_to_expect.answer', 'Each gathering includes community sharing, skill-building workshops, networking opportunities, and group discussions on teaching challenges and successes.')
    },
    {
      question: t('teachers_circle.faq.who_can_join.question', 'Who can join the Teachers Circle?'),
      answer: t('teachers_circle.faq.who_can_join.answer', 'All certified yoga, pilates, dance, and wellness instructors are welcome, regardless of experience level or teaching style.')
    },
    {
      question: t('teachers_circle.faq.cost.question', 'Is there a cost to attend?'),
      answer: t('teachers_circle.faq.cost.answer', 'Most gatherings are free for YogaSwiss community members. Occasionally, special workshops may have a small fee to cover materials or guest teachers.')
    },
    {
      question: t('teachers_circle.faq.frequency.question', 'How often do you meet?'),
      answer: t('teachers_circle.faq.frequency.answer', 'We meet once per month in each city, typically on the third Wednesday evening from 7:00-9:00 PM.')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden">
        <ImageWithFallback
          src={heroImage}
          alt={t('teachers_circle.hero.alt', 'Teachers Circle Community')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 max-w-3xl px-6">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('teachers_circle.hero.title', 'Teachers Circle')}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {t('teachers_circle.hero.subtitle', 'Connect, learn, and grow with fellow yoga teachers across Switzerland')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge className="bg-primary/90 text-primary-foreground px-4 py-2">
                {t('teachers_circle.hero.badge.monthly', 'Monthly Gatherings')}
              </Badge>
              <Badge className="bg-accent/90 text-accent-foreground px-4 py-2">
                {t('teachers_circle.hero.badge.free', 'Free Events')}
              </Badge>
              <Badge className="bg-secondary/90 text-secondary-foreground px-4 py-2">
                {t('teachers_circle.hero.badge.community', 'Community Focused')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <Card>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('teachers_circle.about.title', 'About the Circle')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('teachers_circle.about.description', 'Our Teachers Circle brings together yoga, pilates, dance, and wellness instructors from across Switzerland. We meet monthly in Lausanne and Zürich to share knowledge, support each other, and build a stronger teaching community.')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">150+</div>
                  <div className="text-sm text-muted-foreground">{t('teachers_circle.stats.members', 'Active Members')}</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="font-semibold">24</div>
                  <div className="text-sm text-muted-foreground">{t('teachers_circle.stats.events', 'Events This Year')}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{t('teachers_circle.about.what_to_expect', 'What to Expect')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('teachers_circle.about.expect.sharing', 'Community sharing and peer support')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('teachers_circle.about.expect.workshops', 'Skill-building workshops and masterclasses')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('teachers_circle.about.expect.networking', 'Networking and collaboration opportunities')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('teachers_circle.about.expect.resources', 'Access to exclusive teaching resources')}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('teachers_circle.events.title', 'Upcoming Gatherings')}
          </CardTitle>
          <p className="text-muted-foreground">
            {t('teachers_circle.events.subtitle', 'Join us for monthly community gatherings in Lausanne and Zürich')}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCity} onValueChange={(value) => setSelectedCity(value as 'Lausanne' | 'Zürich')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Lausanne" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lausanne
              </TabsTrigger>
              <TabsTrigger value="Zürich" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Zürich
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedCity} className="space-y-4 mt-6">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('teachers_circle.events.no_events', 'No upcoming events in this city.')}
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            {event.isFree && (
                              <Badge variant="secondary">{t('teachers_circle.event.free', 'Free')}</Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground">{event.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{event.venue.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span>
                                {event.registeredCount}/{event.capacity} {t('teachers_circle.event.registered', 'registered')}
                              </span>
                            </div>
                            {event.waitlistCount > 0 && (
                              <Badge variant="outline">
                                {event.waitlistCount} {t('teachers_circle.event.waitlisted', 'on waitlist')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {event.status === 'open' ? (
                            event.registeredCount < event.capacity ? (
                              <Button onClick={() => handleRegistration(event)} className="w-full md:w-auto">
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t('teachers_circle.event.register', 'Register')}
                              </Button>
                            ) : (
                              <Button variant="outline" onClick={() => handleRegistration(event)} className="w-full md:w-auto">
                                <Users className="h-4 w-4 mr-2" />
                                {t('teachers_circle.event.join_waitlist', 'Join Waitlist')}
                              </Button>
                            )
                          ) : (
                            <Badge variant="secondary">{t(`teachers_circle.event.status.${event.status}`, event.status)}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Registration Modal */}
      {showRegistration && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedEvent.registeredCount >= selectedEvent.capacity
                  ? t('teachers_circle.registration.waitlist_title', 'Join Waitlist')
                  : t('teachers_circle.registration.title', 'Event Registration')
                }
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.title} - {formatDate(selectedEvent.startDate)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">{t('teachers_circle.registration.name', 'Full Name')}</Label>
                  <Input
                    id="name"
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('teachers_circle.registration.name_placeholder', 'Enter your full name')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">{t('teachers_circle.registration.email', 'Email Address')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('teachers_circle.registration.email_placeholder', 'Enter your email')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">{t('teachers_circle.registration.phone', 'Phone Number (Optional)')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('teachers_circle.registration.phone_placeholder', '+41 XX XXX XX XX')}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="policy"
                    checked={registrationForm.consentPolicy}
                    onCheckedChange={(checked) => 
                      setRegistrationForm(prev => ({ ...prev, consentPolicy: !!checked }))
                    }
                  />
                  <Label htmlFor="policy" className="text-sm leading-5">
                    {t('teachers_circle.registration.consent_policy', 'I accept the community guidelines and code of conduct')}
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="photo"
                    checked={registrationForm.consentPhoto}
                    onCheckedChange={(checked) => 
                      setRegistrationForm(prev => ({ ...prev, consentPhoto: !!checked }))
                    }
                  />
                  <Label htmlFor="photo" className="text-sm leading-5">
                    {t('teachers_circle.registration.consent_photo', 'I consent to photos being taken at this event (optional)')}
                  </Label>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRegistration(false)}
                  className="flex-1"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={submitRegistration}
                  disabled={!registrationForm.name || !registrationForm.email || !registrationForm.consentPolicy || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    t('teachers_circle.registration.submitting', 'Registering...')
                  ) : selectedEvent.registeredCount >= selectedEvent.capacity ? (
                    t('teachers_circle.registration.join_waitlist', 'Join Waitlist')
                  ) : (
                    t('teachers_circle.registration.register', 'Register')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Message */}
      {registrationSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6 space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <h3 className="text-lg font-semibold">
                {t('teachers_circle.success.title', 'Registration Successful!')}
              </h3>
              <p className="text-muted-foreground">
                {t('teachers_circle.success.message', 'You will receive a confirmation email with event details and calendar invite shortly.')}
              </p>
              <Button onClick={() => setRegistrationSuccess(false)}>
                {t('common.close', 'Close')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('teachers_circle.guidelines.title', 'Community Guidelines')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">{t('teachers_circle.guidelines.respect.title', 'Respect & Inclusion')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('teachers_circle.guidelines.respect.inclusive', 'Create an inclusive environment for all')}</li>
                <li>• {t('teachers_circle.guidelines.respect.listen', 'Practice active listening and empathy')}</li>
                <li>• {t('teachers_circle.guidelines.respect.diversity', 'Celebrate diversity in teaching styles and backgrounds')}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">{t('teachers_circle.guidelines.sharing.title', 'Knowledge Sharing')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('teachers_circle.guidelines.sharing.open', 'Share knowledge and experiences openly')}</li>
                <li>• {t('teachers_circle.guidelines.sharing.confidential', 'Respect confidential information')}</li>
                <li>• {t('teachers_circle.guidelines.sharing.supportive', 'Provide constructive and supportive feedback')}</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {t('teachers_circle.guidelines.full_policy', 'For complete community guidelines and code of conduct, please visit our')}{' '}
              <Button variant="link" className="p-0 h-auto text-sm" onClick={() => onPageChange('community-policy')}>
                {t('teachers_circle.guidelines.policy_link', 'Community Policy page')}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t('teachers_circle.faq.title', 'Frequently Asked Questions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
              <h4 className="font-semibold mb-2">{item.question}</h4>
              <p className="text-muted-foreground text-sm">{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">{t('teachers_circle.newsletter.title', 'Stay Connected')}</h3>
            <p className="text-muted-foreground">
              {t('teachers_circle.newsletter.description', 'Get updates about upcoming events, workshops, and community news.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input placeholder={t('teachers_circle.newsletter.email_placeholder', 'Enter your email')} className="flex-1" />
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                {t('teachers_circle.newsletter.subscribe', 'Subscribe')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">{t('teachers_circle.contact.title', 'Questions or Support?')}</h3>
            <p className="text-muted-foreground">
              {t('teachers_circle.contact.description', 'Our community team is here to help with any questions about the Teachers Circle.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                {t('teachers_circle.contact.email', 'teachers@yogaswiss.com')}
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('teachers_circle.contact.chat', 'Live Chat Support')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}