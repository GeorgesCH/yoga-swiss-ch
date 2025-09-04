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

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

      // Fetch today's revenue
      const { data: todayPayments, error: paymentError } = await supabase
        .from('payments')
        .select('amount_cents')
        .eq('organization_id', currentOrg.id)
        .eq('status', 'paid')
        .gte('confirmed_at', startOfToday)
        .lte('confirmed_at', endOfToday);

      if (paymentError) throw paymentError;

      // Fetch yesterday's revenue
      const { data: yesterdayPayments } = await supabase
        .from('payments')
        .select('amount_cents')
        .eq('organization_id', currentOrg.id)
        .eq('status', 'paid')
        .gte('confirmed_at', startOfYesterday)
        .lte('confirmed_at', endOfYesterday);

      // Calculate revenue
      const todayRevenue = (todayPayments || []).reduce((sum, p) => sum + (p.amount_cents || 0), 0);
      const yesterdayRevenue = (yesterdayPayments || []).reduce((sum, p) => sum + (p.amount_cents || 0), 0);
      const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

      // Fetch today's bookings
      const { data: todayBookings, error: bookingError } = await supabase
        .from('class_registrations')
        .select('id')
        .eq('organization_id', currentOrg.id)
        .eq('status', 'confirmed')
        .gte('registered_at', startOfToday)
        .lte('registered_at', endOfToday);

      if (bookingError) throw bookingError;

      // Fetch yesterday's bookings
      const { data: yesterdayBookings } = await supabase
        .from('class_registrations')
        .select('id')
        .eq('organization_id', currentOrg.id)
        .eq('status', 'confirmed')
        .gte('registered_at', startOfYesterday)
        .lte('registered_at', endOfYesterday);

      const todayBookingCount = todayBookings?.length || 0;
      const yesterdayBookingCount = yesterdayBookings?.length || 0;
      const bookingChange = yesterdayBookingCount > 0 ? ((todayBookingCount - yesterdayBookingCount) / yesterdayBookingCount) * 100 : 0;

      // Fetch today's class capacity and attendance
      const { data: todayClasses, error: classError } = await supabase
        .from('class_instances')
        .select(`
          id,
          capacity,
          class_registrations!inner(status)
        `)
        .eq('organization_id', currentOrg.id)
        .gte('start_time', startOfToday)
        .lte('start_time', endOfToday);

      if (classError) throw classError;

      // Calculate utilization
      let totalCapacity = 0;
      let totalBooked = 0;
      
      (todayClasses || []).forEach(classItem => {
        totalCapacity += classItem.capacity || 0;
        totalBooked += classItem.class_registrations?.filter(r => r.status === 'confirmed').length || 0;
      });

      const utilizationRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

      // Fetch new customers (profiles created today)
      const { data: newCustomers, error: customerError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', currentOrg.id)
        .eq('role', 'customer')
        .gte('joined_at', startOfToday)
        .lte('joined_at', endOfToday);

      if (customerError) throw customerError;

      // Fetch yesterday's new customers
      const { data: yesterdayNewCustomers } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', currentOrg.id)
        .eq('role', 'customer')
        .gte('joined_at', startOfYesterday)
        .lte('joined_at', endOfYesterday);

      const newCustomerCount = newCustomers?.length || 0;
      const yesterdayNewCustomerCount = yesterdayNewCustomers?.length || 0;
      const customerChange = yesterdayNewCustomerCount > 0 ? ((newCustomerCount - yesterdayNewCustomerCount) / yesterdayNewCustomerCount) * 100 : 0;

      // Fetch late cancellations (cancelled within 24h of class start)
      const { data: lateCancellations, error: cancelError } = await supabase
        .from('class_registrations')
        .select(`
          id,
          cancelled_at,
          class_instances!inner(start_time)
        `)
        .eq('organization_id', currentOrg.id)
        .eq('status', 'cancelled')
        .gte('cancelled_at', startOfToday)
        .lte('cancelled_at', endOfToday);

      if (cancelError) throw cancelError;

      const lateCancelCount = (lateCancellations || []).filter(cancel => {
        if (!cancel.cancelled_at || !cancel.class_instances?.start_time) return false;
        const cancelTime = new Date(cancel.cancelled_at);
        const classTime = new Date(cancel.class_instances.start_time);
        const hoursDiff = (classTime.getTime() - cancelTime.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24; // Less than 24 hours notice
      }).length;

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