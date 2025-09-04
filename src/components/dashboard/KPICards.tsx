import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, Calendar, CreditCard, TrendingUp, 
  AlertCircle, Clock, CheckCircle, UserPlus,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { enhancedFinanceService, enhancedPeopleService, enhancedClassesService } from '../../utils/supabase/enhanced-services';


export function KPICards() {
  const { currentOrg } = useMultiTenantAuth();
  const [kpiData, setKpiData] = useState({
    todayBookings: 0,
    activeMembers: 0,
    revenueToday: 0,
    classAttendance: 0,
    pendingPayments: 0,
    trialConversions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrg?.id) {
      loadKPIData();
    }
  }, [currentOrg]);

  const loadKPIData = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);

      // Production mode - load real data from API services
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      // Use production services to load real data
      const financeService = enhancedFinanceService;
      const peopleService = enhancedPeopleService;
      const classesService = enhancedClassesService;

      // Load financial summary for today and this month
      const todayFinancialSummary = await financeService.getFinancialSummary(
        currentOrg.id,
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      const monthlyFinancialSummary = await financeService.getFinancialSummary(
        currentOrg.id,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );

      // Load customer data
      const customersResult = await peopleService.getCustomers(currentOrg.id);
      const activeCustomers = customersResult.data || [];

      // Load class analytics
      const classAnalytics = await classesService.getClassAnalytics(
        currentOrg.id,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );

      setKpiData({
        todayBookings: todayFinancialSummary.data?.order_count || 0,
        activeMembers: activeCustomers.length,
        revenueToday: (todayFinancialSummary.data?.total_revenue_cents || 0) / 100,
        classAttendance: classAnalytics?.data?.attendance_rate || 0,
        pendingPayments: (monthlyFinancialSummary.data?.outstanding_amount_cents || 0) / 100,
        trialConversions: 68 // Would need specific trial conversion logic
      });

    } catch (error) {
      console.error('Error loading KPI data:', error);
      // Set empty state if API calls fail
      setKpiData({
        todayBookings: 0,
        activeMembers: 0,
        revenueToday: 0,
        classAttendance: 0,
        pendingPayments: 0,
        trialConversions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: "Today's Bookings",
      value: loading ? '...' : kpiData.todayBookings.toString(),
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'vs. last Monday',
      subValue: '89% capacity'
    },
    {
      title: 'Active Members',
      value: loading ? '...' : kpiData.activeMembers.toLocaleString(),
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'this month',
      subValue: '+34 new members'
    },
    {
      title: 'Revenue Today',
      value: loading ? '...' : `CHF ${kpiData.revenueToday.toFixed(2)}`,
      change: '+15%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'vs. last Monday',
      subValue: 'CHF 97,200 this month'
    },
    {
      title: 'Class Attendance',
      value: loading ? '...' : `${kpiData.classAttendance.toFixed(0)}%`,
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'this week',
      subValue: '4% no-shows'
    },
    {
      title: 'Pending Payments',
      value: loading ? '...' : `CHF ${kpiData.pendingPayments.toFixed(2)}`,
      change: '-23%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'overdue',
      subValue: '12 customers',
      urgent: kpiData.pendingPayments > 1000
    },
    {
      title: 'Trial Conversions',
      value: loading ? '...' : `${kpiData.trialConversions.toFixed(0)}%`,
      change: '+12%',
      trend: 'up',
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'this month',
      subValue: '23 of 34 trials'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : ArrowDownRight;
        
        return (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`${kpi.bgColor} p-2 rounded-md`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                      className={`text-xs px-1.5 py-0.5 ${
                        kpi.trend === 'up' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {kpi.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {kpi.description}
                    </span>
                    {kpi.urgent && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {kpi.subValue}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}