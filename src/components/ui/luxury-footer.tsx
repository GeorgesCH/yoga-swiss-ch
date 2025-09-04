import React, { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Separator } from './separator';
import { Badge } from './badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { useTranslation } from '../i18n/ComprehensiveI18nProvider';
import { usePortal } from '../portal/PortalProvider';
import {
  Mail,
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowRight,
  Instagram,
  Linkedin,
  Youtube,
  MapPin,
  Heart,
  CheckCircle2,
} from 'lucide-react';

interface LuxuryFooterProps {
  onPageChange: (page: string) => void;
  onStudioRegistration?: () => void;
}

export function LuxuryFooter({ onPageChange, onStudioRegistration }: LuxuryFooterProps) {
  const { t } = useTranslation();
  const { locations, setCurrentLocation } = usePortal();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: integrate with real newsletter API. For now, show success state.
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail('');
  };

  const ExploreLinks = (
    <div className="space-y-2 text-sm">
      <button onClick={() => onPageChange('schedule')} className="block text-muted-foreground hover:text-foreground">
        {t('portal.navigation.schedule', 'Schedule')}
      </button>
      <button onClick={() => onPageChange('studios')} className="block text-muted-foreground hover:text-foreground">
        {t('portal.navigation.studios', 'Studios')}
      </button>
      <button onClick={() => onPageChange('instructors')} className="block text-muted-foreground hover:text-foreground">
        {t('portal.navigation.instructors', 'Instructors')}
      </button>
      <button onClick={() => onPageChange('outdoor')} className="block text-muted-foreground hover:text-foreground">
        {t('portal.navigation.outdoor', 'Outdoor Classes')}
      </button>
      <button onClick={() => onPageChange('retreats')} className="block text-muted-foreground hover:text-foreground">
        {t('portal.navigation.retreats', 'Yoga Retreats')}
      </button>
    </div>
  );

  const CitiesLinks = (
    <div className="space-y-2 text-sm">
      {locations.slice(0, 6).map((location) => (
        <button
          key={location.id}
          onClick={() => {
            setCurrentLocation(location);
            onPageChange('explore');
          }}
          className="block text-muted-foreground hover:text-foreground"
        >
          {location.name}
        </button>
      ))}
    </div>
  );

  const TeachersLinks = (
    <div className="space-y-2 text-sm">
      <button 
        onClick={() => onStudioRegistration?.()}
        className="block text-muted-foreground hover:text-foreground"
      >
        {t('portal.footer.create_profile', 'Create your profile')}
      </button>
      <button 
        onClick={() => onPageChange('teachers-circle')}
        className="block text-muted-foreground hover:text-foreground"
      >
        {t('portal.footer.teachers_circle', 'Teachers Circle')}
      </button>
      <button 
        onClick={() => onPageChange('organise-retreats')}
        className="block text-muted-foreground hover:text-foreground"
      >
        {t('portal.footer.organise_retreats', 'Organise your retreats')}
      </button>
    </div>
  );

  const SupportLinks = (
    <div className="space-y-2 text-sm">
      <button onClick={() => {}} className="block text-muted-foreground hover:text-foreground">
        {t('portal.footer.help_center', 'Help Center')}
      </button>
      <button onClick={() => {}} className="block text-muted-foreground hover:text-foreground">
        {t('portal.footer.contact', 'Contact Us')}
      </button>
      <button onClick={() => {}} className="block text-muted-foreground hover:text-foreground">
        {t('portal.footer.privacy', 'Privacy Policy')}
      </button>
      <button onClick={() => {}} className="block text-muted-foreground hover:text-foreground">
        {t('portal.footer.terms', 'Terms of Service')}
      </button>
    </div>
  );

  return (
    <footer className="relative mt-12">
      {/* Subtle top gradient border */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-4 py-12">
        {/* Premium CTA + Trust */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-xl shadow-black/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_400px_at_100%_0%,theme(colors.primary/10),transparent_50%)]" />
          <div className="relative p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('portal.footer.newsletter.badge', 'Exclusive wellness insights')}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {t('portal.footer.newsletter.title', 'Elevate your practice with curated tips & offers')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('portal.footer.newsletter.subtitle', 'Join our private list for luxury retreats, studio openings, and members-only perks.')}
                </p>
                <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row gap-3 max-w-xl">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('portal.footer.newsletter.placeholder', 'Enter your email')}
                      className="pl-9 h-11 rounded-xl"
                      aria-label={t('portal.footer.newsletter.placeholder', 'Enter your email')}
                    />
                  </div>
                  <Button type="submit" className="h-11 rounded-xl px-5">
                    {subscribed ? t('portal.footer.newsletter.subscribed', 'Subscribed!') : t('portal.footer.newsletter.cta', 'Get updates')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <div className="flex items-center gap-3 pt-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {t('portal.footer.newsletter.terms', 'Zero spam. Unsubscribe anytime.')}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-border/50 bg-card/70 p-4 text-center">
                    <ShieldCheck className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs text-muted-foreground">{t('portal.footer.trust.gdpr', 'GDPR Compliant')}</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-card/70 p-4 text-center">
                    <Lock className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs text-muted-foreground">{t('portal.footer.trust.secure', 'Secure by design')}</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-card/70 p-4 text-center">
                    <CreditCard className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs text-muted-foreground">{t('portal.footer.trust.payments', 'Trusted payments')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links area */}
        <div className="mt-12">
          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>YogaSwiss</span>
                <span className="text-sm text-muted-foreground">{t('portal.hero.subtitle', 'Switzerland #1 Yoga Platform')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('portal.footer.description', 'Leading yoga platform connecting you with the best studios, instructors, and classes.')}
              </p>
              <div className="flex items-center gap-3 pt-1">
                {/* Swiss flag badge removed */}
              </div>
              <div className="flex items-center gap-3 pt-2 text-muted-foreground">
                <Instagram className="h-4 w-4" />
                <Linkedin className="h-4 w-4" />
                <Youtube className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('portal.footer.explore', 'Explore')}</h4>
              {ExploreLinks}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('portal.navigation.cities', 'Cities')}</h4>
              {CitiesLinks}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('portal.footer.yoga_teachers', 'Yoga Teachers')}</h4>
              {TeachersLinks}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('portal.footer.support', 'Support')}</h4>
              {SupportLinks}
            </div>
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden">
            <Accordion type="single" collapsible className="w-full rounded-2xl border">
              <AccordionItem value="explore">
                <AccordionTrigger>{t('portal.footer.explore', 'Explore')}</AccordionTrigger>
                <AccordionContent>{ExploreLinks}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="cities">
                <AccordionTrigger>{t('portal.navigation.cities', 'Cities')}</AccordionTrigger>
                <AccordionContent>{CitiesLinks}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="teachers">
                <AccordionTrigger>{t('portal.footer.yoga_teachers', 'Yoga Teachers')}</AccordionTrigger>
                <AccordionContent>{TeachersLinks}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="support">
                <AccordionTrigger>{t('portal.footer.support', 'Support')}</AccordionTrigger>
                <AccordionContent>{SupportLinks}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Compliance and payments */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            © 2024 YogaSwiss. {t('portal.footer.rights', 'All rights reserved.')}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{t('portal.footer.gdpr_compliant', 'GDPR Compliant')}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" />{t('portal.footer.secure_payments', 'Secure payments')}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" />{t('portal.footer.payments_by', 'Payments by Stripe')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['VISA', 'Mastercard', 'AMEX', 'TWINT', 'Apple Pay', 'Stripe'].map((p) => (
              <span key={p} className="text-xs rounded-full border bg-card/80 px-2.5 py-1 text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
