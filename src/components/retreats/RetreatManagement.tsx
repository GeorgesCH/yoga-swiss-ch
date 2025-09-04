import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  BarChart3,
  Download,
  Upload,
  Settings,
  Copy,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Mock data for retreats
const mockRetreats = [
  {
    id: '1',
    title: 'Alpine Serenity Yoga Retreat',
    location: 'Interlaken, Switzerland',
    startDate: '2024-07-15',
    endDate: '2024-07-21',
    status: 'published',
    totalSpots: 16,
    bookedSpots: 8,
    price: 1850,
    revenue: 14800,
    lastUpdated: '2024-01-15T10:30:00Z',
    category: 'mountain'
  },
  {
    id: '2', 
    title: 'Ocean Bliss Meditation Retreat',
    location: 'Ibiza, Spain',
    startDate: '2024-08-10',
    endDate: '2024-08-16',
    status: 'published',
    totalSpots: 20,
    bookedSpots: 12,
    price: 1650,
    revenue: 19800,
    lastUpdated: '2024-01-14T15:45:00Z',
    category: 'beach'
  },
  {
    id: '3',
    title: 'Forest Awakening Retreat',
    location: 'Black Forest, Germany',
    startDate: '2024-09-05',
    endDate: '2024-09-10',
    status: 'draft',
    totalSpots: 14,
    bookedSpots: 6,
    price: 1450,
    revenue: 8700,
    lastUpdated: '2024-01-13T09:15:00Z',
    category: 'forest'
  },
  {
    id: '4',
    title: 'Sunrise Intensive Retreat',
    location: 'Ticino, Switzerland',
    startDate: '2024-10-01',
    endDate: '2024-10-05',
    status: 'published',
    totalSpots: 12,
    bookedSpots: 4,
    price: 980,
    revenue: 3920,
    lastUpdated: '2024-01-12T14:20:00Z',
    category: 'intensive'
  }
];

interface RetreatManagementProps {
  onCreateRetreat?: () => void;
  onEditRetreat?: (retreatId: string) => void;
}

export function RetreatManagement({ onCreateRetreat, onEditRetreat }: RetreatManagementProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRetreats, setSelectedRetreats] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [retreatToDelete, setRetreatToDelete] = useState<string | null>(null);

  const filteredRetreats = mockRetreats.filter(retreat => {
    const matchesSearch = retreat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         retreat.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || retreat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'sold_out':
        return <Badge className="bg-orange-100 text-orange-800">Sold Out</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOccupancyBadge = (booked: number, total: number) => {
    const percentage = (booked / total) * 100;
    if (percentage >= 90) {
      return <Badge className="bg-red-100 text-red-800">Almost Full</Badge>;
    } else if (percentage >= 70) {
      return <Badge className="bg-orange-100 text-orange-800">Filling Up</Badge>;
    } else if (percentage >= 30) {
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Low Bookings</Badge>;
  };

  const handleDeleteRetreat = (retreatId: string) => {
    setRetreatToDelete(retreatId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (retreatToDelete) {
      // Handle deletion logic here
      toast.success('Retreat deleted successfully');
      setShowDeleteDialog(false);
      setRetreatToDelete(null);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRetreats.length === 0) {
      toast.error('Please select retreats first');
      return;
    }

    switch (action) {
      case 'publish':
        toast.success(`${selectedRetreats.length} retreat(s) published`);
        break;
      case 'archive':
        toast.success(`${selectedRetreats.length} retreat(s) archived`);
        break;
      case 'duplicate':
        toast.success(`${selectedRetreats.length} retreat(s) duplicated`);
        break;
      default:
        break;
    }
    setSelectedRetreats([]);
  };

  const totalRevenue = mockRetreats.reduce((sum, retreat) => sum + retreat.revenue, 0);
  const totalBookings = mockRetreats.reduce((sum, retreat) => sum + retreat.bookedSpots, 0);
  const averageOccupancy = mockRetreats.reduce((sum, retreat) => sum + (retreat.bookedSpots / retreat.totalSpots), 0) / mockRetreats.length * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Retreat Management</h1>
          <p className="text-muted-foreground">
            Manage your yoga retreats, bookings, and revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onCreateRetreat}>
            <Plus className="h-4 w-4 mr-2" />
            Create Retreat
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="retreats">All Retreats</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold">CHF {totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+12.3% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-semibold">{totalBookings}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">+8.1% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Occupancy</p>
                    <p className="text-2xl font-semibold">{averageOccupancy.toFixed(1)}%</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-orange-600 mr-1" />
                  <span className="text-xs text-orange-600">+5.2% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Retreats</p>
                    <p className="text-2xl font-semibold">{mockRetreats.filter(r => r.status === 'published').length}</p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-purple-600">{mockRetreats.filter(r => r.status === 'draft').length} in draft</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Retreats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRetreats.slice(0, 3).map((retreat) => (
                  <div key={retreat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{retreat.title}</p>
                        <p className="text-sm text-muted-foreground">{retreat.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(retreat.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium">{retreat.bookedSpots}/{retreat.totalSpots} spots</p>
                        <p className="text-xs text-muted-foreground">CHF {retreat.revenue.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onEditRetreat?.(retreat.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Retreats Tab */}
        <TabsContent value="retreats" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search retreats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedRetreats.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedRetreats.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('duplicate')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Retreats Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedRetreats.length === filteredRetreats.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRetreats(filteredRetreats.map(r => r.id));
                        } else {
                          setSelectedRetreats([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Retreat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRetreats.map((retreat) => (
                  <TableRow key={retreat.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRetreats.includes(retreat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRetreats([...selectedRetreats, retreat.id]);
                          } else {
                            setSelectedRetreats(selectedRetreats.filter(id => id !== retreat.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{retreat.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {retreat.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(retreat.status)}
                        {getOccupancyBadge(retreat.bookedSpots, retreat.totalSpots)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(retreat.startDate).toLocaleDateString('de-CH')}</p>
                        <p className="text-muted-foreground">to {new Date(retreat.endDate).toLocaleDateString('de-CH')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{retreat.bookedSpots}/{retreat.totalSpots}</p>
                        <p className="text-muted-foreground">
                          {Math.round((retreat.bookedSpots / retreat.totalSpots) * 100)}% full
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">CHF {retreat.revenue.toLocaleString()}</p>
                        <p className="text-muted-foreground">CHF {retreat.price} per person</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEditRetreat?.(retreat.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteRetreat(retreat.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          {/* Booking Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings by name or email..."
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by retreat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Retreats</SelectItem>
                    {mockRetreats.map((retreat) => (
                      <SelectItem key={retreat.id} value={retreat.id}>
                        {retreat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Retreat</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: '1',
                      guestName: 'Sarah Johnson',
                      guestEmail: 'sarah.j@email.com',
                      retreat: 'Alpine Serenity Yoga Retreat',
                      roomType: 'Private Double Room',
                      checkIn: '2024-07-15',
                      status: 'confirmed',
                      total: 2850,
                      paymentStatus: 'paid'
                    },
                    {
                      id: '2',
                      guestName: 'Marco Weber',
                      guestEmail: 'marco.w@email.com',
                      retreat: 'Ocean Bliss Meditation Retreat',
                      roomType: 'Shared Dormitory',
                      checkIn: '2024-08-10',
                      status: 'pending',
                      total: 1650,
                      paymentStatus: 'deposit'
                    },
                    {
                      id: '3',
                      guestName: 'Elena Schmidt',
                      guestEmail: 'elena.s@email.com',
                      retreat: 'Forest Awakening Retreat',
                      roomType: 'Private Twin Room',
                      checkIn: '2024-09-05',
                      status: 'confirmed',
                      total: 1750,
                      paymentStatus: 'paid'
                    }
                  ].map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{booking.retreat}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{booking.roomType}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(booking.checkIn).toLocaleDateString('de-CH')}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {booking.status === 'confirmed' && (
                            <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                          )}
                          {booking.status === 'pending' && (
                            <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
                          )}
                          {booking.status === 'cancelled' && (
                            <Badge variant="secondary">Cancelled</Badge>
                          )}
                          <div>
                            {booking.paymentStatus === 'paid' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                Paid
                              </Badge>
                            )}
                            {booking.paymentStatus === 'deposit' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                Deposit Only
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">CHF {booking.total.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                Send Confirmation
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Generate QR Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Booking Rate</p>
                    <p className="text-2xl font-semibold">73.2%</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+5.1% from last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Revenue per Guest</p>
                    <p className="text-2xl font-semibold">CHF 2,140</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+8.3% from last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Repeat Guests</p>
                    <p className="text-2xl font-semibold">34%</p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+2.1% from last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                    <p className="text-2xl font-semibold">8.7%</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600">-1.2% from last quarter</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p>Booking trends chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Retreat Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2" />
                    <p>Revenue breakdown chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guest Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Demographics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Top Countries</h4>
                  <div className="space-y-2">
                    {[
                      { country: 'Switzerland', percentage: 45 },
                      { country: 'Germany', percentage: 28 },
                      { country: 'Austria', percentage: 15 },
                      { country: 'France', percentage: 8 },
                      { country: 'Italy', percentage: 4 }
                    ].map((item) => (
                      <div key={item.country} className="flex items-center justify-between">
                        <span className="text-sm">{item.country}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Age Groups</h4>
                  <div className="space-y-2">
                    {[
                      { age: '25-34', percentage: 35 },
                      { age: '35-44', percentage: 28 },
                      { age: '45-54', percentage: 20 },
                      { age: '55+', percentage: 12 },
                      { age: '18-24', percentage: 5 }
                    ].map((item) => (
                      <div key={item.age} className="flex items-center justify-between">
                        <span className="text-sm">{item.age}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Booking Lead Time</h4>
                  <div className="space-y-2">
                    {[
                      { period: '1-2 months', percentage: 40 },
                      { period: '2-3 months', percentage: 25 },
                      { period: '3-6 months', percentage: 20 },
                      { period: '< 1 month', percentage: 10 },
                      { period: '> 6 months', percentage: 5 }
                    ].map((item) => (
                      <div key={item.period} className="flex items-center justify-between">
                        <span className="text-sm">{item.period}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Retreat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this retreat? This action cannot be undone.
              All bookings and associated data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Retreat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}