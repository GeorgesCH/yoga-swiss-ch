import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Globe,
  Target,
  TrendingUp,
  BarChart3,
  Download,
  Mail,
  Users,
  MapPin,
  Eye,
  Edit,
  Sparkles,
  Plus,
  Calendar,
  Star,
  CheckCircle,
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';



export function DynamicRetreatsAdmin() {
  const [leadMagnets, setLeadMagnets] = useState<any[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<any>({});
  const [leadSources, setLeadSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Demo lead magnets
      setLeadMagnets([
        {
          id: 'magnet-1',
          title: 'Baltic Retreat Preparation Guide',
          type: 'PDF Guide',
          downloads: 156,
          conversions: 23,
          conversion_rate: 14.7
        },
        {
          id: 'magnet-2',
          title: 'Balinese Healing Practices Ebook',
          type: 'Ebook',
          downloads: 89,
          conversions: 15,
          conversion_rate: 16.9
        }
      ]);

      // Demo conversion funnel
      setConversionFunnel({
        page_views: 2081,
        leads_captured: 279,
        applications: 46,
        confirmed_bookings: 35
      });

      // Demo lead sources
      setLeadSources([
        { source: 'Organic Search', leads: 89, conversion: 18.2 },
        { source: 'Lead Magnet', leads: 67, conversion: 24.1 },
        { source: 'Facebook Ads', leads: 45, conversion: 13.7 },
        { source: 'Referrals', leads: 34, conversion: 29.4 },
        { source: 'Newsletter', leads: 23, conversion: 21.7 }
      ]);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading retreats admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" />
            Global Retreats - Lead Generation
          </h2>
          <p className="text-muted-foreground mt-1">
            Advanced lead generation, analytics and conversion optimization for retreat destinations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Lead Gen Active
          </Badge>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Landing Pages
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Quick Note */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          This is the advanced lead generation system for Global Retreats. For basic retreat management, 
          use the <button className="text-primary underline" onClick={() => window.location.href = '#'}>"Retreat Management"</button> in the Classes section.
        </AlertDescription>
      </Alert>

      {/* Lead Generation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionFunnel.page_views?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all retreat landing pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionFunnel.leads_captured}</div>
            <p className="text-xs text-muted-foreground">
              {((conversionFunnel.leads_captured / conversionFunnel.page_views) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionFunnel.applications}</div>
            <p className="text-xs text-muted-foreground">
              {((conversionFunnel.applications / conversionFunnel.leads_captured) * 100).toFixed(1)}% lead to application
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionFunnel.confirmed_bookings}</div>
            <p className="text-xs text-muted-foreground">
              {((conversionFunnel.confirmed_bookings / conversionFunnel.applications) * 100).toFixed(1)}% application approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Magnets Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Lead Magnets Performance
            </CardTitle>
            <CardDescription>Free guides and downloads driving retreat bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadMagnets.map((magnet) => (
                <div key={magnet.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{magnet.title}</h4>
                    <p className="text-sm text-muted-foreground">{magnet.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{magnet.downloads} downloads</div>
                    <div className="text-sm text-muted-foreground">
                      {magnet.conversions} conversions ({magnet.conversion_rate}%)
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create New Lead Magnet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>Lead to booking conversion analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Landing Page Views</span>
                <span className="font-medium">{conversionFunnel.page_views?.toLocaleString()}</span>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Leads Captured</span>
                <span className="font-medium">{conversionFunnel.leads_captured} (13.4%)</span>
              </div>
              <Progress value={13.4} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Applications Submitted</span>
                <span className="font-medium">{conversionFunnel.applications} (16.5%)</span>
              </div>
              <Progress value={16.5} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Bookings Confirmed</span>
                <span className="font-medium">{conversionFunnel.confirmed_bookings} (76.1%)</span>
              </div>
              <Progress value={76.1} className="h-2" />
              
              <div className="bg-green-50 p-3 rounded-lg mt-4">
                <div className="text-sm text-green-800 font-medium">
                  Overall Conversion: {((conversionFunnel.confirmed_bookings / conversionFunnel.page_views) * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-green-600">
                  Industry average: 1.2% (You're performing {(((conversionFunnel.confirmed_bookings / conversionFunnel.page_views) / 0.012)).toFixed(1)}x better)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Lead Sources
            </CardTitle>
            <CardDescription>Where your best retreat leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {source.leads} leads • {source.conversion}% conversion
                    </div>
                  </div>
                  <Progress value={source.conversion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Retreat Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your global retreat marketing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button className="justify-start">
                <Globe className="h-4 w-4 mr-2" />
                View All Landing Pages
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Lead Database
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email Campaign
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                A/B Test Landing Pages
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Target className="h-4 w-4 mr-2" />
                Create Lead Scoring Rules
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Retreat Destinations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Active Retreat Destinations
          </CardTitle>
          <CardDescription>Your live retreat landing pages with lead generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Lithuania Forest Retreat</h4>
                <Badge className="bg-green-100 text-green-800">Live</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                156 leads captured • 23 applications • 18 bookings
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Landing Page
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Bali Sacred Waters</h4>
                <Badge className="bg-green-100 text-green-800">Live</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                89 leads captured • 15 applications • 12 bookings
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Landing Page
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-dashed border-muted-foreground/30">
              <div className="text-center space-y-3">
                <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <div className="font-medium text-muted-foreground">Add New Destination</div>
                  <div className="text-sm text-muted-foreground">Create landing page + lead gen</div>
                </div>
                <Button size="sm">
                  Create Campaign
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}