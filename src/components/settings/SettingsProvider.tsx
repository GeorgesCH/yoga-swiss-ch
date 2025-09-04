import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';

interface SettingsData {
  general: {
    companyName: string;
    vatId: string;
    address: string;
    email: string;
    phone: string;
    currency: string;
    timezone: string;
    primaryLanguage: string;
    enabledLanguages: string[];
  };
  payments: {
    stripeConnected: boolean;
    twintConnected: boolean;
    cashEnabled: boolean;
    bankTransferEnabled: boolean;
    captureStrategy: string;
    currencyRounding: string;
    tipSuggestions: number[];
  };
  taxes: {
    vatMode: string;
    defaultVatRate: string;
    qrBillEnabled: boolean;
    creditorIban: string;
    referenceType: string;
    invoiceNumbering: string;
  };
  policies: {
    advanceBooking: string;
    salesCutoff: string;
    cancellationWindow: string;
    lateCancelFee: string;
    noShowFee: string;
    refundMethod: string;
    waitlistSize: string;
    promotionWindow: string;
    autoPromote: boolean;
    chargeOnPromotion: boolean;
  };
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (category: keyof SettingsData, data: Partial<SettingsData[keyof SettingsData]>) => void;
  saveSettings: (category: keyof SettingsData) => Promise<void>;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
}

const defaultSettings: SettingsData = {
  general: {
    companyName: 'Yoga Zen Zürich GmbH',
    vatId: 'CHE-123.456.789',
    address: 'Bahnhofstrasse 15\n8001 Zürich\nSwitzerland',
    email: 'info@yogazen.ch',
    phone: '+41 44 123 45 67',
    currency: 'CHF',
    timezone: 'europe-zurich',
    primaryLanguage: 'de',
    enabledLanguages: ['de', 'fr', 'it']
  },
  payments: {
    stripeConnected: true,
    twintConnected: false,
    cashEnabled: true,
    bankTransferEnabled: true,
    captureStrategy: 'auto',
    currencyRounding: '0.05',
    tipSuggestions: [5, 10, 15, 20]
  },
  taxes: {
    vatMode: 'inclusive',
    defaultVatRate: '8.1',
    qrBillEnabled: true,
    creditorIban: 'CH93 0076 2011 6238 5295 7',
    referenceType: 'qrr',
    invoiceNumbering: '2024-YZZ-{000001}'
  },
  policies: {
    advanceBooking: '30',
    salesCutoff: '60',
    cancellationWindow: '720',
    lateCancelFee: '15.00',
    noShowFee: '25.00',
    refundMethod: 'wallet',
    waitlistSize: '10',
    promotionWindow: '120',
    autoPromote: true,
    chargeOnPromotion: false
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('yogaswiss-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
        toast.error('Failed to load saved settings');
      }
    }
  }, []);

  const updateSettings = (category: keyof SettingsData, data: Partial<SettingsData[keyof SettingsData]>) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...data
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async (category: keyof SettingsData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage
      localStorage.setItem('yogaswiss-settings', JSON.stringify(settings));
      
      setHasUnsavedChanges(false);
      toast.success(`${category} settings saved successfully`);
      
      // Log specific settings updates
      console.log(`Settings updated for ${category}:`, settings[category]);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      saveSettings,
      hasUnsavedChanges,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Utility functions for settings validation
export const validateSettings = {
  general: (data: SettingsData['general']) => {
    const errors: string[] = [];
    
    if (!data.companyName.trim()) errors.push('Company name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.email.includes('@')) errors.push('Valid email is required');
    if (!data.vatId.match(/^CHE-\d{3}\.\d{3}\.\d{3}$/)) {
      errors.push('VAT ID must be in Swiss format (CHE-XXX.XXX.XXX)');
    }
    
    return errors;
  },
  
  payments: (data: SettingsData['payments']) => {
    const errors: string[] = [];
    
    if (!data.stripeConnected && !data.twintConnected && !data.cashEnabled && !data.bankTransferEnabled) {
      errors.push('At least one payment method must be enabled');
    }
    
    return errors;
  },
  
  policies: (data: SettingsData['policies']) => {
    const errors: string[] = [];
    
    const lateFee = parseFloat(data.lateCancelFee);
    const noShowFee = parseFloat(data.noShowFee);
    
    if (isNaN(lateFee) || lateFee < 0) errors.push('Late cancellation fee must be a valid amount');
    if (isNaN(noShowFee) || noShowFee < 0) errors.push('No-show fee must be a valid amount');
    
    const waitlistSize = parseInt(data.waitlistSize);
    if (isNaN(waitlistSize) || waitlistSize < 0) errors.push('Waitlist size must be a valid number');
    
    return errors;
  }
};