import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { financeService } from '../../utils/supabase/finance-service';
import { classesService } from '../../utils/supabase/classes-service';
import { isDevelopmentMode } from '../../utils/supabase/enhanced-services-dev';

export function RevenueChart() {
  const { currentOrg } = useMultiTenantAuth();
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [mrrData, setMrrData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrg?.id) {
      loadChartData();
    }
  }, [currentOrg?.id]); // Only depend on org ID, not the entire object

  const loadChartData = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);

      // Always use demo data for now to prevent excessive API calls
      // This will be replaced with a single API call when the backend is ready
      const dailyRevenue = [];
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 15);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dailyRevenue.push({
          date: `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          online: Math.floor(Math.random() * 500) + 800,
          inPerson: Math.floor(Math.random() * 800) + 1200,
          marketplace: Math.floor(Math.random() * 200) + 300,
        });
      }

      setRevenueData(dailyRevenue);

      // Generate bookings data (would come from class analytics)
      const bookings = dailyRevenue.map(day => ({
        date: day.date,
        dropIn: Math.floor(Math.random() * 30) + 40,
        pass: Math.floor(Math.random() * 20) + 25,
        subscription: Math.floor(Math.random() * 15) + 8,
        event: Math.floor(Math.random() * 8) + 3,
      }));

      setBookingsData(bookings);

      // Generate MRR data (would come from subscription analytics)
      const months = ['Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
      const mrr = months.map((month, index) => ({
        month,
        new: 2400 + (index * 200) + Math.floor(Math.random() * 600),
        churned: -(800 + (index * 50) + Math.floor(Math.random() * 300)),
        expansion: 600 + (index * 50) + Math.floor(Math.random() * 200),
        mrr: 12500 + (index * 1500) + Math.floor(Math.random() * 1000),
      }));

      setMrrData(mrr);

    } catch (error) {
      console.warn('RevenueChart: Error loading data, using fallback:', error);
      // Use fallback data
      setRevenueData([]);
      setBookingsData([]);
      setMrrData([]);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          Umsatz & Buchungen Entwicklung
          {loading && <span className="ml-2 text-sm text-muted-foreground">(Loading...)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Umsatz</TabsTrigger>
            <TabsTrigger value="bookings">Buchungen</TabsTrigger>
            <TabsTrigger value="mrr">MRR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `CHF ${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`CHF ${value}`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="inPerson" 
                    stackId="1"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="online" 
                    stackId="1"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="marketplace" 
                    stackId="1"
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                <span>Vor Ort</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                <span>Marktplatz</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="dropIn" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="pass" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="subscription" stackId="a" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="event" stackId="a" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                <span>Einzelstunde</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                <span>Karte</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                <span>Mitgliedschaft</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                <span>Events</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mrr" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mrrData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `CHF ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`CHF ${value}`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Monatlich wiederkehrender Umsatz (MRR)
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
