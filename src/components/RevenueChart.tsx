import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function RevenueChart() {
  const revenueData = [
    { date: '01.12', online: 850, inPerson: 1200, marketplace: 400 },
    { date: '02.12', online: 920, inPerson: 1450, marketplace: 380 },
    { date: '03.12', online: 780, inPerson: 1300, marketplace: 420 },
    { date: '04.12', online: 1100, inPerson: 1600, marketplace: 450 },
    { date: '05.12', online: 950, inPerson: 1400, marketplace: 380 },
    { date: '06.12', online: 1200, inPerson: 1800, marketplace: 520 },
    { date: '07.12', online: 1050, inPerson: 1650, marketplace: 480 },
    { date: '08.12', online: 1300, inPerson: 1900, marketplace: 550 },
    { date: '09.12', online: 1150, inPerson: 1750, marketplace: 490 },
    { date: '10.12', online: 1400, inPerson: 2000, marketplace: 600 },
    { date: '11.12', online: 1250, inPerson: 1850, marketplace: 520 },
    { date: '12.12', online: 1500, inPerson: 2200, marketplace: 650 },
    { date: '13.12', online: 1350, inPerson: 2050, marketplace: 580 },
    { date: '14.12', online: 1600, inPerson: 2300, marketplace: 700 },
    { date: '15.12', online: 1450, inPerson: 2150, marketplace: 620 }
  ];

  const bookingsData = [
    { date: '01.12', dropIn: 45, pass: 28, subscription: 12, event: 5 },
    { date: '02.12', dropIn: 52, pass: 31, subscription: 15, event: 7 },
    { date: '03.12', dropIn: 38, pass: 25, subscription: 10, event: 3 },
    { date: '04.12', dropIn: 58, pass: 35, subscription: 18, event: 8 },
    { date: '05.12', dropIn: 48, pass: 29, subscription: 14, event: 6 },
    { date: '06.12', dropIn: 65, pass: 42, subscription: 22, event: 10 },
    { date: '07.12', dropIn: 55, pass: 38, subscription: 19, event: 9 },
    { date: '08.12', dropIn: 72, pass: 45, subscription: 25, event: 12 },
    { date: '09.12', dropIn: 62, pass: 41, subscription: 21, event: 11 },
    { date: '10.12', dropIn: 78, pass: 52, subscription: 28, event: 15 },
    { date: '11.12', dropIn: 68, pass: 46, subscription: 24, event: 13 },
    { date: '12.12', dropIn: 85, pass: 58, subscription: 32, event: 18 },
    { date: '13.12', dropIn: 75, pass: 51, subscription: 27, event: 16 },
    { date: '14.12', dropIn: 92, pass: 63, subscription: 35, event: 20 },
    { date: '15.12', dropIn: 82, pass: 56, subscription: 30, event: 17 }
  ];

  const mrrData = [
    { month: 'Aug', new: 2400, churned: -800, expansion: 600, mrr: 12500 },
    { month: 'Sep', new: 2800, churned: -950, expansion: 750, mrr: 13300 },
    { month: 'Okt', new: 3200, churned: -1100, expansion: 850, mrr: 14250 },
    { month: 'Nov', new: 2900, churned: -980, expansion: 720, mrr: 14990 },
    { month: 'Dez', new: 3400, churned: -1200, expansion: 900, mrr: 16090 }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Umsatz & Buchungen Entwicklung</CardTitle>
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