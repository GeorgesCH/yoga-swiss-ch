import React, { useState } from 'react';
import { usePortal } from '../PortalProvider';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { 
  Check,
  Star,
  Zap,
  Crown,
  Gift,
  Calendar,
  Clock,
  Users,
  Smartphone,
  MapPin,
  CreditCard,
  Heart,
  Infinity
} from 'lucide-react';

export function PricingPage({ onPageChange }: { onPageChange: (page: string) => void }) {
  const { addToCart, currentLocation } = usePortal();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTab, setSelectedTab] = useState('memberships');

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  // Membership Plans
  const membershipPlans = [
    {
      id: 'basic',
      name: 'YogaSwiss Basic',
      description: 'Perfect for beginners and occasional practice',
      icon: Heart,
      color: 'bg-gray-100 text-gray-700',
      prices: {
        monthly: 39,
        yearly: 390
      },
      features: [
        '4 classes per month',
        'Access to 500+ studios',
        'Mobile app access',
        'Basic class booking',
        'Community access',
        'Progress tracking'
      ],
      limitations: [
        'Limited to off-peak hours',
        'No premium classes',
        'Standard cancellation (4h notice)'
      ],
      popular: false
    },
    {
      id: 'unlimited',
      name: 'YogaSwiss Unlimited',
      description: 'For dedicated practitioners who want it all',
      icon: Infinity,
      color: 'bg-blue-100 text-blue-700',
      prices: {
        monthly: 89,
        yearly: 890
      },
      features: [
        'Unlimited studio classes',
        'Access to all 800+ studios',
        'Premium class access',
        'Priority booking',
        'Guest passes (2/month)',
        'Workshop discounts',
        'Advanced app features',
        'Personal practice insights',
        'Flexible cancellation (2h notice)'
      ],
      limitations: [],
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'premium',
      name: 'YogaSwiss Premium',
      description: 'Ultimate yoga experience with exclusive benefits',
      icon: Crown,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black',
      prices: {
        monthly: 149,
        yearly: 1490
      },
      features: [
        'Everything in Unlimited',
        'Unlimited online classes',
        'Private session credits (2/month)',
        'Exclusive retreat access',
        'Personal yoga concierge',
        'Equipment rental included',
        'VIP studio access',
        'Nutrition consultations',
        'Wellness partner discounts'
      ],
      limitations: [],
      popular: false,
      badge: 'Premium'
    }
  ];

  // Class Packages
  const classPacks = [
    {
      id: 'single',
      name: 'Single Class',
      description: 'Pay per class - no commitment',
      classes: 1,
      price: 32,
      pricePerClass: 32,
      validity: '1 day',
      features: ['Valid at any studio', 'Full studio access', '24h cancellation']
    },
    {
      id: 'pack-5',
      name: '5 Class Pack',
      description: 'Great for trying different studios',
      classes: 5,
      price: 145,
      originalPrice: 160,
      pricePerClass: 29,
      validity: '3 months',
      features: ['Valid at any studio', 'Transferable to friends', 'Flexible scheduling']
    },
    {
      id: 'pack-10',
      name: '10 Class Pack',
      description: 'Best value for regular practice',
      classes: 10,
      price: 270,
      originalPrice: 320,
      pricePerClass: 27,
      validity: '6 months',
      features: ['Valid at any studio', 'Priority booking', 'Transferable to friends', 'Workshop discounts'],
      popular: true
    },
    {
      id: 'pack-20',
      name: '20 Class Pack',
      description: 'For dedicated yogis',
      classes: 20,
      price: 500,
      originalPrice: 640,
      pricePerClass: 25,
      validity: '12 months',
      features: ['Valid at any studio', 'Priority booking', 'Guest passes', 'Personal insights']
    }
  ];

  // Online Packages
  const onlinePackages = [
    {
      id: 'online-basic',
      name: 'Online Studio Access',
      description: 'Access to all live and on-demand classes',
      price: { monthly: 29, yearly: 290 },
      features: [
        'Unlimited live classes',
        'Full on-demand library',
        'Download for offline',
        'Multi-device streaming',
        'HD video quality'
      ]
    },
    {
      id: 'online-premium',
      name: 'Online Studio Premium',
      description: 'Online access plus exclusive content',
      price: { monthly: 49, yearly: 490 },
      features: [
        'Everything in basic',
        'Exclusive workshops',
        'Personal programs',
        '1-on-1 virtual sessions (1/month)',
        'Advanced progress tracking'
      ],
      popular: true
    }
  ];

  // Corporate packages
  const corporatePackages = [
    {
      id: 'team-small',
      name: 'Small Team',
      description: 'For teams of 5-20 employees',
      employees: '5-20',
      price: 'From CHF 35',
      priceDetail: 'per employee/month',
      features: [
        'Flexible class credits',
        'Team dashboard',
        'Wellness reporting',
        'Corporate booking portal'
      ]
    },
    {
      id: 'team-medium',
      name: 'Medium Business',
      description: 'For companies of 20-100 employees',
      employees: '20-100',
      price: 'From CHF 30',
      priceDetail: 'per employee/month',
      features: [
        'Everything in Small Team',
        'On-site class options',
        'Custom wellness programs',
        'Dedicated account manager'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations 100+ employees',
      employees: '100+',
      price: 'Custom pricing',
      priceDetail: 'Contact for quote',
      features: [
        'Fully customized program',
        'On-site and virtual offerings',
        'Health & wellness integration',
        'Advanced analytics & reporting'
      ]
    }
  ];

  const handlePurchase = (item: any, type: string) => {
    const cartItem = {
      id: item.id,
      type: type as any,
      name: item.name,
      price: billingPeriod === 'yearly' && item.prices ? 
        item.prices.yearly : 
        (item.price || item.prices?.monthly || 0),
      quantity: 1,
      metadata: { 
        type, 
        billingPeriod: item.prices ? billingPeriod : 'one-time',
        classes: item.classes,
        validity: item.validity
      }
    };
    addToCart(cartItem);
  };

  const getSavingsPercentage = (monthly: number, yearly: number) => {
    return Math.round((1 - (yearly / (monthly * 12))) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Choose Your Perfect Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Flexible pricing options for every yoga journey. Practice at 800+ studios across Switzerland
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-green-600" />
            800+ studios
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4 text-blue-600" />
            50,000+ members
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            4.8 rating
          </span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
          <TabsTrigger value="packages">Class Packs</TabsTrigger>
          <TabsTrigger value="online">Online Only</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
        </TabsList>

        <TabsContent value="memberships" className="space-y-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingPeriod === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
              Monthly
            </span>
            <Switch
              checked={billingPeriod === 'yearly'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
            />
            <span className={billingPeriod === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <Badge className="bg-green-100 text-green-700 ml-2">
                Save up to 17%
              </Badge>
            )}
          </div>

          {/* Membership Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipPlans.map((plan) => {
              const IconComponent = plan.icon;
              const currentPrice = plan.prices[billingPeriod];
              const savings = billingPeriod === 'yearly' ? 
                getSavingsPercentage(plan.prices.monthly, plan.prices.yearly) : 0;

              return (
                <Card key={plan.id} className={`relative overflow-hidden ${
                  plan.popular ? 'border-2 border-primary shadow-lg scale-105' : ''
                }`}>
                  {plan.badge && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <Badge className={plan.popular ? 'bg-primary' : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${plan.color}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-semibold">
                        {formatPrice(currentPrice)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingPeriod === 'yearly' && savings > 0 && (
                        <p className="text-sm text-green-600">
                          Save {savings}% with yearly billing
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <h5 className="text-sm font-medium text-muted-foreground">Limitations:</h5>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="text-xs text-muted-foreground">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      size="lg"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(plan, 'membership')}
                    >
                      {plan.popular ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Membership Features */}
          <Card className="bg-muted/30">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-semibold">All memberships include</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Smartphone className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="font-medium">Mobile App</h3>
                    <p className="text-sm text-muted-foreground">Book and manage classes on the go</p>
                  </div>
                  <div className="space-y-2">
                    <MapPin className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="font-medium">Studio Network</h3>
                    <p className="text-sm text-muted-foreground">Access to 800+ partner studios</p>
                  </div>
                  <div className="space-y-2">
                    <Calendar className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="font-medium">Flexible Booking</h3>
                    <p className="text-sm text-muted-foreground">Easy scheduling and cancellation</p>
                  </div>
                  <div className="space-y-2">
                    <Users className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="font-medium">Community</h3>
                    <p className="text-sm text-muted-foreground">Connect with fellow yogis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Class Packages</h2>
            <p className="text-muted-foreground">
              Perfect for flexible practice without monthly commitment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classPacks.map((pack) => (
              <Card key={pack.id} className={`relative ${
                pack.popular ? 'border-2 border-primary shadow-lg' : ''
              }`}>
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary px-4 py-1">
                      Best Value
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{pack.name}</h3>
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-semibold">
                      {formatPrice(pack.price)}
                      {pack.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(pack.originalPrice)}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(pack.pricePerClass)} per class
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-primary">{pack.classes}</div>
                    <div className="text-sm text-muted-foreground">classes included</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Validity:</span>
                      <span className="font-medium">{pack.validity}</span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {pack.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={pack.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pack, 'pass')}
                  >
                    Buy Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 mx-auto text-blue-600 mb-4" />
              <h3 className="font-medium mb-2">Perfect for Gifts!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Class packages make wonderful gifts for yoga lovers. Send digitally or print beautiful gift cards.
              </p>
              <Button variant="outline">
                Buy as Gift
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="online" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Online Studio Packages</h2>
            <p className="text-muted-foreground">
              Practice from anywhere with our comprehensive online offering
            </p>
          </div>

          {/* Billing Toggle for Online */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingPeriod === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
              Monthly
            </span>
            <Switch
              checked={billingPeriod === 'yearly'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
            />
            <span className={billingPeriod === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <Badge className="bg-green-100 text-green-700 ml-2">
                Save up to 20%
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {onlinePackages.map((pack) => (
              <Card key={pack.id} className={`${
                pack.popular ? 'border-2 border-primary shadow-lg' : ''
              }`}>
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{pack.name}</h3>
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-semibold">
                      {formatPrice(pack.price[billingPeriod])}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {pack.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={pack.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(pack, 'membership')}
                  >
                    Start Free Trial
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    7-day free trial, cancel anytime
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="corporate" className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Corporate Wellness Programs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Boost employee wellbeing and productivity with flexible yoga benefits. 
              Trusted by 500+ companies across Switzerland.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {corporatePackages.map((pack) => (
              <Card key={pack.id}>
                <CardHeader className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{pack.name}</h3>
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-semibold text-primary">{pack.employees}</div>
                    <div className="text-sm text-muted-foreground">employees</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-semibold">{pack.price}</div>
                    <div className="text-sm text-muted-foreground">{pack.priceDetail}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {pack.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" variant="outline">
                    {pack.id === 'enterprise' ? 'Contact Sales' : 'Get Quote'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-semibold">Why Companies Choose YogaSwiss</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Users className="h-8 w-8 mx-auto text-primary" />
                    <h4 className="font-medium">Improved Wellbeing</h4>
                    <p className="text-sm text-muted-foreground">
                      Reduce stress and increase employee satisfaction
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Zap className="h-8 w-8 mx-auto text-primary" />
                    <h4 className="font-medium">Increased Productivity</h4>
                    <p className="text-sm text-muted-foreground">
                      Boost focus and energy with regular practice
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Heart className="h-8 w-8 mx-auto text-primary" />
                    <h4 className="font-medium">Team Building</h4>
                    <p className="text-sm text-muted-foreground">
                      Create stronger connections through shared practice
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button size="lg">
                    Schedule a Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Can I cancel my membership anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your membership at any time. Monthly memberships have no cancellation fee, 
                  while yearly memberships can be cancelled with a 30-day notice.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, TWINT, PostFinance, and bank transfers. 
                  Corporate accounts can also pay by invoice.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Can I use my membership at any studio?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Your membership gives you access to all 800+ partner studios across Switzerland. 
                  Some premium classes may require additional credits.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">What if I can't use all my classes?</h4>
                <p className="text-sm text-muted-foreground">
                  Class packages have generous validity periods. Unused classes can often be extended 
                  or transferred to friends (terms apply).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground text-center">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Ready to Start Your Yoga Journey?</h2>
          <p className="mb-6 opacity-90">
            Join over 50,000 yogis who trust YogaSwiss for their practice. Start with a free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" onClick={() => onPageChange('explore')}>
              Browse Classes
            </Button>
            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-gray-100">
              Start Free Trial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}