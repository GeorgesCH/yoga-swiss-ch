import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/client';
import { getSupabaseProjectId, getSupabaseAnonKey } from '../../utils/supabase/env';

interface Location {
  id: string;
  name: string;
  slug: string;
  canton: string;
  lat: number;
  lng: number;
  timezone: string;
}

interface PortalContextType {
  // Location & Geography
  currentLocation: Location | null;
  locations: Location[];
  setCurrentLocation: (location: Location) => void;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  
  // User preferences (anonymous/guest)
  guestPreferences: GuestPreferences;
  setGuestPreferences: (prefs: GuestPreferences) => void;
  
  // Cart & Checkout
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // User state
  isAuthenticated: boolean;
  customerProfile: CustomerProfile | null;
  login: (email?: string, password?: string) => Promise<{ success: boolean; profile?: CustomerProfile; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<{ success: boolean; profile?: CustomerProfile; error?: string }>;
  
  // Data fetching
  searchClasses: (params?: SearchClassesParams) => Promise<any[]>;
  getStudios: (location?: string) => Promise<any[]>;
  getInstructors: (location?: string, specialty?: string) => Promise<any[]>;
  bookClass: (classId: string, paymentMethod?: string) => Promise<{ success: boolean; booking?: any; error?: string }>;
  getWeatherData: (lat: number, lng: number) => Promise<any>;
  getLocalEvents: (cityName: string) => Promise<any[]>;
  bookPrivateLesson: (instructorId: string, sessionData: any) => Promise<any>;
  getInstructorAvailability: (instructorId: string, dateRange: { start: string; end: string }) => Promise<any[]>;
  getStudioReviews: (studioId: string) => Promise<any[]>;
  getInstructorReviews: (instructorId: string) => Promise<any[]>;
}

interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  timeOfDay?: string[];
  styles?: string[];
  levels?: string[];
  languages?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  indoor?: boolean;
  outdoor?: boolean;
  instructors?: string[];
  studios?: string[];
}

interface GuestPreferences {
  favoriteStyles: string[];
  preferredLanguages: string[];
  availabilityWindows: string[];
  levelExperience: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface CartItem {
  id: string;
  type: 'class' | 'workshop' | 'membership' | 'pass' | 'private';
  name: string;
  date?: Date;
  time?: string;
  price: number;
  quantity: number;
  instructorName?: string;
  studioName?: string;
  location?: string;
  metadata?: Record<string, any>;
}

interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  preferences: GuestPreferences;
  membershipStatus?: string;
  creditsBalance: number;
  upcomingBookings: number;
  totalClasses?: number;
  favoriteStudios?: string[];
  favoriteInstructors?: string[];
}

interface SearchClassesParams {
  query?: string;
  location?: string;
  style?: string;
  level?: string;
  date?: string;
  instructor?: string;
  studio?: string;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

// Swiss cities data
const SWISS_LOCATIONS: Location[] = [
  {
    id: 'zurich',
    name: 'Zürich',
    slug: 'zurich',
    canton: 'ZH',
    lat: 47.3769,
    lng: 8.5417,
    timezone: 'Europe/Zurich'
  },
  {
    id: 'geneva',
    name: 'Genève',
    slug: 'geneva',
    canton: 'GE',
    lat: 46.2044,
    lng: 6.1432,
    timezone: 'Europe/Zurich'
  },
  {
    id: 'basel',
    name: 'Basel',
    slug: 'basel',
    canton: 'BS',
    lat: 47.5596,
    lng: 7.5886,
    timezone: 'Europe/Zurich'
  },
  {
    id: 'lausanne',
    name: 'Lausanne',
    slug: 'lausanne',
    canton: 'VD',
    lat: 46.5197,
    lng: 6.6323,
    timezone: 'Europe/Zurich'
  },
  {
    id: 'bern',
    name: 'Bern',
    slug: 'bern',
    canton: 'BE',
    lat: 46.9481,
    lng: 7.4474,
    timezone: 'Europe/Zurich'
  }
];

export function PortalProvider({ children }: { children: React.ReactNode }) {
  // Location state
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations] = useState<Location[]>(SWISS_LOCATIONS);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  
  // Guest preferences
  const [guestPreferences, setGuestPreferences] = useState<GuestPreferences>({
    favoriteStyles: [],
    preferredLanguages: ['en'],
    availabilityWindows: [],
    levelExperience: 'beginner',
    notifications: {
      email: false,
      sms: false,
      push: false
    }
  });
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // User state (mock authentication)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  
  // Mock user data
  const mockCustomerProfile: CustomerProfile = {
    id: 'customer-123',
    firstName: 'Emma',
    lastName: 'Müller',
    email: 'emma.mueller@example.com',
    phone: '+41 79 123 45 67',
    profileImage: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1Njc3MTAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    preferences: {
      favoriteStyles: ['Hatha', 'Vinyasa', 'Yin'],
      preferredLanguages: ['de', 'en'],
      availabilityWindows: ['morning', 'evening'],
      levelExperience: 'intermediate',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    membershipStatus: 'Premium',
    creditsBalance: 12,
    upcomingBookings: 3
  };
  
  // Initialize location from localStorage or geolocation
  useEffect(() => {
    const savedLocation = localStorage.getItem('yogaswiss-location');
    if (savedLocation) {
      const location = SWISS_LOCATIONS.find(l => l.id === savedLocation);
      if (location) {
        setCurrentLocation(location);
        return;
      }
    }
    
    // Default to Zürich if no saved location
    setCurrentLocation(SWISS_LOCATIONS[0]);
  }, []);
  
  // Cart management
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };
  
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Update location handler
  const handleSetCurrentLocation = (location: Location) => {
    setCurrentLocation(location);
    localStorage.setItem('yogaswiss-location', location.id);
  };
  
  // Using the imported supabase client directly
  
  // Load customer profile from backend
  const loadCustomerProfile = async (accessToken: string) => {
    try {
      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/customer/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.profile;
      }
    } catch (error) {
      console.log('Error loading customer profile:', error);
    }
    return null;
  };

  // Authentication handlers
  const login = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session?.access_token) {
          // Load profile from backend
          const profile = await loadCustomerProfile(data.session.access_token);
          if (profile) {
            setIsAuthenticated(true);
            setCustomerProfile(profile);
            return { success: true, profile };
          }
        }
      } else {
        // Mock login for development
        setIsAuthenticated(true);
        setCustomerProfile(mockCustomerProfile);
        localStorage.setItem('yogaswiss-mock-auth', 'true');
        return { success: true, profile: mockCustomerProfile };
      }
    } catch (error) {
      console.log('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: Partial<CustomerProfile>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Update profile via backend
        const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/customer/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });

        if (response.ok) {
          const data = await response.json();
          setCustomerProfile(data.profile);
          return { success: true, profile: data.profile };
        }
      } else if (customerProfile) {
        // Mock update for development
        const updatedProfile = { ...customerProfile, ...updates };
        setCustomerProfile(updatedProfile);
        localStorage.setItem('yogaswiss-mock-profile', JSON.stringify(updatedProfile));
        return { success: true, profile: updatedProfile };
      }
    } catch (error) {
      console.log('Profile update failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCustomerProfile(null);
      localStorage.removeItem('yogaswiss-mock-auth');
      localStorage.removeItem('yogaswiss-mock-profile');
    } catch (error) {
      console.log('Logout failed:', error);
      // Force logout even if there's an error
      setIsAuthenticated(false);
      setCustomerProfile(null);
      localStorage.removeItem('yogaswiss-mock-auth');
      localStorage.removeItem('yogaswiss-mock-profile');
    }
  };
  
  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for real Supabase session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          const profile = await loadCustomerProfile(session.access_token);
          if (profile) {
            setIsAuthenticated(true);
            setCustomerProfile(profile);
            return;
          }
        }

        // Fall back to mock auth for development
        const savedAuth = localStorage.getItem('yogaswiss-mock-auth');
        const savedProfile = localStorage.getItem('yogaswiss-mock-profile');
        
        if (savedAuth === 'true') {
          if (savedProfile) {
            try {
              const profile = JSON.parse(savedProfile);
              setIsAuthenticated(true);
              setCustomerProfile(profile);
            } catch (error) {
              localStorage.removeItem('yogaswiss-mock-auth');
              localStorage.removeItem('yogaswiss-mock-profile');
            }
          } else {
            setIsAuthenticated(true);
            setCustomerProfile(mockCustomerProfile);
          }
        }
      } catch (error) {
        console.log('Auth initialization failed:', error);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuthenticated(false);
        setCustomerProfile(null);
      } else if (session?.access_token) {
        const profile = await loadCustomerProfile(session.access_token);
        if (profile) {
          setIsAuthenticated(true);
          setCustomerProfile(profile);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced data fetching with caching
  const [dataCache, setDataCache] = useState<Record<string, { data: any; timestamp: number }>>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedData = (key: string) => {
    const cached = dataCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    setDataCache(prev => ({
      ...prev,
      [key]: { data, timestamp: Date.now() }
    }));
  };

  const searchClasses = async (params: SearchClassesParams = {}) => {
    const cacheKey = `classes-${JSON.stringify(params)}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.append('q', params.query);
      if (params.location) searchParams.append('location', params.location);
      if (params.style) searchParams.append('style', params.style);
      if (params.level) searchParams.append('level', params.level);
      if (params.date) searchParams.append('date', params.date);
      if (params.instructor) searchParams.append('instructor', params.instructor);
      if (params.studio) searchParams.append('studio', params.studio);

      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/classes/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const classes = data.classes || [];
        setCachedData(cacheKey, classes);
        return classes;
      }
    } catch (error) {
      console.log('Error searching classes:', error);
    }
    return [];
  };

  const getStudios = async (location = 'all') => {
    const cacheKey = `studios-${location}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = new URLSearchParams();
      if (location && location !== 'all') searchParams.append('location', location);

      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/studios?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const studios = data.studios || [];
        setCachedData(cacheKey, studios);
        return studios;
      }
    } catch (error) {
      console.log('Error fetching studios:', error);
    }
    return [];
  };

  const getInstructors = async (location = 'all', specialty = '') => {
    const cacheKey = `instructors-${location}-${specialty}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = new URLSearchParams();
      if (location && location !== 'all') searchParams.append('location', location);
      if (specialty) searchParams.append('specialty', specialty);

      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/instructors?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const instructors = data.instructors || [];
        setCachedData(cacheKey, instructors);
        return instructors;
      }
    } catch (error) {
      console.log('Error fetching instructors:', error);
    }
    return [];
  };

  // Get weather data for outdoor classes
  const getWeatherData = async (lat: number, lng: number) => {
    const cacheKey = `weather-${lat}-${lng}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock Swiss weather service integration
      const mockWeatherData = {
        temperature: Math.round(Math.random() * 15 + 10),
        condition: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 30 + 50),
        windSpeed: Math.round(Math.random() * 10 + 5),
        uvIndex: Math.round(Math.random() * 5 + 1),
        visibility: Math.round(Math.random() * 10 + 10),
        pressure: Math.round(Math.random() * 50 + 1000)
      };
      setCachedData(cacheKey, mockWeatherData);
      return mockWeatherData;
    } catch (error) {
      console.log('Error fetching weather data:', error);
    }
    return null;
  };

  // Get local events and activities
  const getLocalEvents = async (cityName: string) => {
    const cacheKey = `events-${cityName}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/events?city=${cityName}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        setCachedData(cacheKey, events);
        return events;
      }
    } catch (error) {
      console.log('Error fetching local events:', error);
    }
    return [];
  };

  // Book a private lesson with an instructor
  const bookPrivateLesson = async (instructorId: string, sessionData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/instructors/${instructorId}/private-sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, booking: data.booking };
      }
    } catch (error) {
      console.log('Error booking private lesson:', error);
    }
    return { success: false, error: 'Booking failed' };
  };

  // Get instructor availability
  const getInstructorAvailability = async (instructorId: string, dateRange: { start: string; end: string }) => {
    const cacheKey = `availability-${instructorId}-${dateRange.start}-${dateRange.end}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/instructors/${instructorId}/availability?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const availability = data.availability || [];
        setCachedData(cacheKey, availability);
        return availability;
      }
    } catch (error) {
      console.log('Error fetching instructor availability:', error);
    }
    return [];
  };

  // Get studio reviews
  const getStudioReviews = async (studioId: string) => {
    const cacheKey = `studio-reviews-${studioId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/studios/${studioId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const reviews = data.reviews || [];
        setCachedData(cacheKey, reviews);
        return reviews;
      }
    } catch (error) {
      console.log('Error fetching studio reviews:', error);
    }
    return [];
  };

  // Get instructor reviews
  const getInstructorReviews = async (instructorId: string) => {
    const cacheKey = `instructor-reviews-${instructorId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/instructors/${instructorId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const reviews = data.reviews || [];
        setCachedData(cacheKey, reviews);
        return reviews;
      }
    } catch (error) {
      console.log('Error fetching instructor reviews:', error);
    }
    return [];
  };

  const bookClass = async (classId: string, paymentMethod = 'credits') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`https://${getSupabaseProjectId()}.supabase.co/functions/v1/make-server-f0b2daa4/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classId, paymentMethod })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh customer profile to update credits/bookings
        const updatedProfile = await loadCustomerProfile(session.access_token);
        if (updatedProfile) {
          setCustomerProfile(updatedProfile);
        }
        
        return { success: true, booking: data.booking };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Booking failed' };
      }
    } catch (error) {
      console.log('Booking failed:', error);
      return { success: false, error: error.message || 'Booking failed' };
    }
  };
  
  const value: PortalContextType = {
    currentLocation,
    locations,
    setCurrentLocation: handleSetCurrentLocation,
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    guestPreferences,
    setGuestPreferences,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartTotal,
    isAuthenticated,
    customerProfile,
    login,
    logout,
    updateProfile,
    searchClasses,
    getStudios,
    getInstructors,
    bookClass,
    getWeatherData,
    getLocalEvents,
    bookPrivateLesson,
    getInstructorAvailability,
    getStudioReviews,
    getInstructorReviews
  };
  
  return (
    <PortalContext.Provider value={value}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
