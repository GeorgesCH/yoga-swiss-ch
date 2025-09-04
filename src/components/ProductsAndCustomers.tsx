import { Package, Users, TrendingUp, ExternalLink, Mail, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';

export function ProductsAndCustomers() {
  const topProducts = [
    { name: '10er Karte Vinyasa', revenue: 4800, units: 24, growth: 15.2 },
    { name: 'Monatsmitgliedschaft', revenue: 3600, units: 18, growth: 8.7 },
    { name: 'Einzelstunde Drop-in', revenue: 2400, units: 80, growth: -2.3 },
    { name: 'Yin Yoga Workshop', revenue: 1800, units: 12, growth: 25.4 },
    { name: 'Geschenkgutschein CHF 100', revenue: 1200, units: 12, growth: 45.6 }
  ];

  const customerSegments = [
    { 
      name: 'Neue Kunden (30 Tage)', 
      count: 47, 
      description: 'Erste Buchung in den letzten 30 Tagen',
      color: 'bg-green-100 text-green-700'
    },
    { 
      name: 'Risiko-Kunden', 
      count: 23, 
      description: 'Kein Besuch seit 60+ Tagen',
      color: 'bg-orange-100 text-orange-700'
    },
    { 
      name: 'VIP Kunden', 
      count: 12, 
      description: 'Lebenszeitwert > CHF 500',
      color: 'bg-purple-100 text-purple-700'
    },
    { 
      name: 'Aktive Mitglieder', 
      count: 156, 
      description: 'Gültige Mitgliedschaft',
      color: 'bg-blue-100 text-blue-700'
    }
  ];

  const coupons = [
    { name: 'WINTER2024', redemptions: 23, lift: '+12%', status: 'active' },
    { name: 'NEUKUNDE20', redemptions: 15, lift: '+8%', status: 'active' },
    { name: 'BLACKFRIDAY', redemptions: 67, lift: '+25%', status: 'expired' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top Produkte (30 Tage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <Badge variant={product.growth > 0 ? 'default' : 'secondary'} className="text-xs">
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.units} Verkäufe
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">CHF {product.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kundensegmente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerSegments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{segment.name}</h4>
                    <Badge className={segment.color}>
                      {segment.count}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {segment.description}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-1" />
                    Kampagne
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coupon Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Gutschein Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {coupon.name}
                    </code>
                    <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                      {coupon.status === 'active' ? 'Aktiv' : 'Abgelaufen'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {coupon.redemptions} Einlösungen • Uplift {coupon.lift}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gift Card Liability */}
      <Card>
        <CardHeader>
          <CardTitle>Geschenkgutschein Verbindlichkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ausstehender Wert</span>
              <span className="font-medium">CHF 3'450</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Läuft ab in 30 Tagen</span>
                <span className="text-orange-600">CHF 800</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Läuft ab in 60 Tagen</span>
                <span className="text-yellow-600">CHF 1'200</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Läuft ab in 90+ Tagen</span>
                <span className="text-green-600">CHF 1'450</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}