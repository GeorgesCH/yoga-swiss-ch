import { useState } from 'react';
import { useMultiTenantAuth } from '../auth/MultiTenantAuthProvider';
import { PeopleService } from '../../utils/supabase/people-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { AlertCircle, User, Mail, Phone, Globe } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreateCustomerDialogProps {
  onClose: () => void;
  onCustomerCreated?: (customer: any) => void;
}

export function CreateCustomerDialog({ onClose, onCustomerCreated }: CreateCustomerDialogProps) {
  const { session } = useMultiTenantAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    language: 'en-CH',
    marketingConsent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.phone && !/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Initialize service with access token
      const service = session?.access_token 
        ? new PeopleService(session.access_token)
        : new PeopleService();

      const { customer, error } = await service.createCustomer({
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        language: formData.language,
        marketingConsent: formData.marketingConsent
      });

      if (error) {
        console.error('Error creating customer:', error);
        toast.error('Failed to create customer', {
          description: error
        });
        return;
      }

      console.log('Customer created successfully:', customer);
      toast.success('Customer created successfully', {
        description: `${formData.firstName} ${formData.lastName} has been added to your customer database.`
      });

      // Notify parent component
      if (onCustomerCreated && customer) {
        onCustomerCreated(customer);
      }

      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to create customer', {
        description: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address*
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="customer@example.com"
              className={errors.email ? 'border-red-500' : ''}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name*</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
              className={errors.firstName ? 'border-red-500' : ''}
              required
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name*</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Smith"
              className={errors.lastName ? 'border-red-500' : ''}
              required
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+41 79 123 45 67"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Preferred Language
            </Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-CH">English (Switzerland)</SelectItem>
                <SelectItem value="de-CH">Deutsch (Schweiz)</SelectItem>
                <SelectItem value="fr-CH">Français (Suisse)</SelectItem>
                <SelectItem value="it-CH">Italiano (Svizzera)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Marketing Consent */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketingConsent"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
            />
            <Label htmlFor="marketingConsent" className="text-sm">
              Customer consents to receiving marketing communications
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Create Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}