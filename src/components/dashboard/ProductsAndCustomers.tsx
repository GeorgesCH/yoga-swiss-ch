import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Users, Plus, TrendingUp, ArrowRight, Star, 
  CreditCard, Calendar, MapPin, Phone, Mail
} from 'lucide-react';

export function ProductsAndCustomers() {
  const topProducts = [
    {
      id: '1',
      name: 'Premium Monthly Pass',
      sales: 45,
      revenue: 6750,
      growth: '+12%',
      category: 'Membership'
    },
    {
      id: '2', 
      name: 'Hatha Yoga Drop-in',
      sales: 124,
      revenue: 3472,
      growth: '+8%',
      category: 'Class'
    },
    {
      id: '3',
      name: 'Beginner Workshop Series',
      sales: 23,
      revenue: 2760,
      growth: '+15%',
      category: 'Workshop'
    }
  ];

  const recentCustomers = [
    {
      id: '1',
      name: 'Emma Weber',
      email: 'emma.weber@email.ch',
      joinedDays: 2,
      avatar: null,
      status: 'New',
      value: 150
    },
    {
      id: '2',
      name: 'Marc Dubois',
      email: 'marc.dubois@email.ch',
      joinedDays: 5,
      avatar: null,
      status: 'Active',
      value: 320
    },
    {
      id: '3',
      name: 'Sofia Rossi',
      email: 'sofia.rossi@email.ch',
      joinedDays: 12,
      avatar: null,
      status: 'Trial',
      value: 28
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Top Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <span>•</span>
                      <span>{product.sales} sales</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">CHF {product.revenue.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {product.growth}
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full justify-between mt-4">
              <span>View all products</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">New Customers</CardTitle>
            <CardDescription>
              Recently joined members
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={customer.status === 'New' ? 'default' : 
                                customer.status === 'Active' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {customer.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {customer.joinedDays} days ago
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">CHF {customer.value}</div>
                  <div className="text-xs text-muted-foreground">Lifetime value</div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" className="w-full justify-between mt-4">
              <span>View customer management</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}