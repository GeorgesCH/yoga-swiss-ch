import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  User, Mail, Phone, MapPin, Calendar, Wallet, CreditCard,
  Activity, MessageSquare, Settings, Edit2, X
} from 'lucide-react';

interface CustomerDetailDialogProps {
  customer: any;
  onClose: () => void;
}

export function CustomerDetailDialog({ customer, onClose }: CustomerDetailDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={customer.avatar} />
                <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {customer.firstName} {customer.lastName}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Customer since {formatDate(customer.joinedDate)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <Badge className={
                  customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }>
                  {customer.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Joined {formatDate(customer.joinedDate)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet & Passes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Wallet & Passes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
                <span className="font-semibold">{formatCurrency(customer.walletBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Passes</span>
                <span className="font-semibold">{customer.activePasses}</span>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Wallet
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Language</span>
                <Badge variant="outline">{customer.language}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Marketing Consent</span>
                <Badge variant={customer.marketingConsent ? "default" : "secondary"}>
                  {customer.marketingConsent ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Recent activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}