import { Users, Globe, Zap } from 'lucide-react';

// Helper functions for Programs Management

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-CH', { 
    style: 'currency', 
    currency: 'CHF' 
  }).format(amount);
};

export const getCategoryBadge = (category: string) => {
  const categoryConfig = {
    coaching: { variant: 'default' as const, text: 'Coaching', color: 'text-blue-600 bg-blue-100' },
    mobility: { variant: 'secondary' as const, text: 'Mobility', color: 'text-green-600 bg-green-100' },
    reiki: { variant: 'outline' as const, text: 'Reiki', color: 'text-purple-600 bg-purple-100' },
    private_class: { variant: 'secondary' as const, text: 'Private Class', color: 'text-orange-600 bg-orange-100' },
    therapy: { variant: 'outline' as const, text: 'Therapy', color: 'text-indigo-600 bg-indigo-100' },
    assessment: { variant: 'secondary' as const, text: 'Assessment', color: 'text-teal-600 bg-teal-100' },
    consultation: { variant: 'outline' as const, text: 'Consultation', color: 'text-gray-600 bg-gray-100' }
  };
  
  return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.coaching;
};

export const getStatusBadge = (status: string) => {
  const statusConfig = {
    reserved: { variant: 'secondary' as const, text: 'Reserved', color: 'text-yellow-600 bg-yellow-100' },
    confirmed: { variant: 'default' as const, text: 'Confirmed', color: 'text-blue-600 bg-blue-100' },
    in_progress: { variant: 'default' as const, text: 'In Progress', color: 'text-green-600 bg-green-100' },
    completed: { variant: 'default' as const, text: 'Completed', color: 'text-gray-600 bg-gray-100' },
    cancelled: { variant: 'destructive' as const, text: 'Cancelled', color: 'text-red-600 bg-red-100' },
    no_show: { variant: 'destructive' as const, text: 'No Show', color: 'text-red-600 bg-red-100' }
  };
  
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
};

export const getDeliveryModeBadge = (mode: string) => {
  const modeConfig = {
    in_person: { icon: Users, text: 'In-Person', color: 'text-blue-600' },
    online: { icon: Globe, text: 'Online', color: 'text-green-600' },
    hybrid: { icon: Zap, text: 'Hybrid', color: 'text-purple-600' }
  };
  
  return modeConfig[mode as keyof typeof modeConfig] || modeConfig.in_person;
};