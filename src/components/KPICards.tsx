import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Clock, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '../utils/supabase/client';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  format?: 'currency' | 'number' | 'percentage';
}

function KPICard({ title, value, change, changeLabel, icon: Icon, format = 'number' }: KPICardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold mb-1">{value}</div>
        <div className="flex items-center gap-1 text-xs">
          <TrendIcon className={`h-3 w-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-muted-foreground">vs {changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards() {
  const { currentOrg } = useMultiTenantAuth();
  const [kpis, setKpis] = useState<Array<{
    title: string;
    value: string;
    change: number;
    changeLabel: string;
    icon: React.ElementType;
    format: 'currency' | 'number' | 'percentage';
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchKPIData();
    }
  }, [currentOrg?.id]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use demo data to prevent API errors until database is ready
      // This will be replaced with real API calls when the backend is fully deployed
      
      // Generate realistic demo data
      const todayRevenue = Math.floor(Math.random() * 2000) + 1500; // CHF 15-35
      const yesterdayRevenue = Math.floor(Math.random() * 1800) + 1200; // CHF 12-30
      const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

      const todayBookingCount = Math.floor(Math.random() * 25) + 15; // 15-40 bookings
      const yesterdayBookingCount = Math.floor(Math.random() * 20) + 12; // 12-32 bookings
      const bookingChange = yesterdayBookingCount > 0 ? ((todayBookingCount - yesterdayBookingCount) / yesterdayBookingCount) * 100 : 0;

      const utilizationRate = Math.floor(Math.random() * 30) + 65; // 65-95% utilization

      const newCustomers = Math.floor(Math.random() * 8) + 2; // 2-10 new customers
      const yesterdayNewCustomers = Math.floor(Math.random() * 6) + 1; // 1-7 new customers

      const newCustomerCount = newCustomers;
      const yesterdayNewCustomerCount = yesterdayNewCustomers;
      const customerChange = yesterdayNewCustomerCount > 0 ? ((newCustomerCount - yesterdayNewCustomerCount) / yesterdayNewCustomerCount) * 100 : 0;

      // Demo data for late cancellations
      const lateCancelCount = Math.floor(Math.random() * 5) + 1; // 1-6 late cancellations

      // Format currency
      const formatCurrency = (cents: number) => {
        const amount = cents / 100;
        return new Intl.NumberFormat('de-CH', {
          style: 'currency',
          currency: 'CHF',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount);
      };

      // Build KPI array
      const kpiData = [
        {
          title: "Umsatz heute",
          value: formatCurrency(todayRevenue),
          change: Math.round(revenueChange * 10) / 10,
          changeLabel: "gestern",
          icon: CreditCard,
          format: 'currency' as const
        },
        {
          title: "Buchungen heute",
          value: todayBookingCount.toString(),
          change: Math.round(bookingChange * 10) / 10,
          changeLabel: "gestern",
          icon: Calendar,
          format: 'number' as const
        },
        {
          title: "Auslastung heute",
          value: `${Math.round(utilizationRate)}%`,
          change: 0, // Would need historical data to calculate
          changeLabel: "gestern",
          icon: Users,
          format: 'percentage' as const
        },
        {
          title: "Neue Kunden",
          value: newCustomerCount.toString(),
          change: Math.round(customerChange * 10) / 10,
          changeLabel: "gestern",
          icon: Users,
          format: 'number' as const
        },
        {
          title: "Verspätete Stornos",
          value: lateCancelCount.toString(),
          change: 0, // Would need historical data to calculate
          changeLabel: "gestern",
          icon: Clock,
          format: 'number' as const
        },
        {
          title: "Heutige Klassen",
          value: (todayClasses?.length || 0).toString(),
          change: 0, // Would need historical data to calculate
          changeLabel: "gestern",
          icon: Calendar,
          format: 'number' as const
        }
      ];

      setKpis(kpiData);

    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load KPI data');
      
      // Set fallback data on error
      setKpis([
        {
          title: "Umsatz heute",
          value: "CHF 0",
          change: 0,
          changeLabel: "gestern",
          icon: CreditCard,
          format: 'currency' as const
        },
        {
          title: "Buchungen heute",
          value: "0",
          change: 0,
          changeLabel: "gestern",
          icon: Calendar,
          format: 'number' as const
        },
        {
          title: "Auslastung heute",
          value: "0%",
          change: 0,
          changeLabel: "gestern",
          icon: Users,
          format: 'percentage' as const
        },
        {
          title: "Neue Kunden",
          value: "0",
          change: 0,
          changeLabel: "gestern",
          icon: Users,
          format: 'number' as const
        },
        {
          title: "Verspätete Stornos",
          value: "0",
          change: 0,
          changeLabel: "gestern",
          icon: Clock,
          format: 'number' as const
        },
        {
          title: "Heutige Klassen",
          value: "0",
          change: 0,
          changeLabel: "gestern",
          icon: Calendar,
          format: 'number' as const
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <Card className="border-destructive/50">
          <CardContent className="flex items-center justify-center py-6">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <span className="text-sm text-destructive">
              Fehler beim Laden der KPI-Daten: {error}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}