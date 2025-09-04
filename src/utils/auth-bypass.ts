// Development authentication bypass for YogaSwiss
// This allows testing without email verification

export interface BypassUser {
  id: string;
  email: string;
  profile: {
    id: string;
    display_name: string;
    locale: 'en';
    firstName: string;
    lastName: string;
    role: 'owner' | 'manager' | 'instructor' | 'customer';
    created_at: string;
  };
}

// Test users for development
export const DEV_USERS: Record<string, { password: string; userData: BypassUser }> = {
  'emmastudio@gmail.com': {
    password: 'password123',
    userData: {
      id: 'dev-user-emma',
      email: 'emmastudio@gmail.com',
      profile: {
        id: 'dev-user-emma',
        display_name: 'Emma Studio',
        locale: 'en',
        firstName: 'Emma',
        lastName: 'Studio',
        role: 'owner',
        created_at: new Date().toISOString()
      }
    }
  },
  'admin@yogaswiss.ch': {
    password: 'admin123',
    userData: {
      id: 'dev-user-admin',
      email: 'admin@yogaswiss.ch',
      profile: {
        id: 'dev-user-admin',
        display_name: 'YogaSwiss Admin',
        locale: 'en',
        firstName: 'YogaSwiss',
        lastName: 'Admin',
        role: 'owner',
        created_at: new Date().toISOString()
      }
    }
  },
  'test@example.com': {
    password: 'test123',
    userData: {
      id: 'dev-user-test',
      email: 'test@example.com',
      profile: {
        id: 'dev-user-test',
        display_name: 'Test User',
        locale: 'en',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner',
        created_at: new Date().toISOString()
      }
    }
  }
};

export function isDevelopmentEnvironment(): boolean {
  // Enable development bypasses in development mode
  return process.env.NODE_ENV === 'development';
}

export function canBypassAuth(email: string, password: string): boolean {
  if (!isDevelopmentEnvironment()) {
    return false;
  }
  
  const user = DEV_USERS[email];
  return user && user.password === password;
}

export function getBypassUserData(email: string): BypassUser | null {
  if (!isDevelopmentEnvironment()) {
    return null;
  }
  
  const user = DEV_USERS[email];
  return user ? user.userData : null;
}

export function createBypassUserFromEmail(email: string): BypassUser {
  return {
    id: `bypass-${email}`,
    email: email,
    profile: {
      id: `bypass-${email}`,
      display_name: email.split('@')[0],
      locale: 'en',
      firstName: email.split('@')[0],
      lastName: '',
      role: 'owner', // Default to owner for development
      created_at: new Date().toISOString()
    }
  };
}

// Storage keys for development auth
const DEV_AUTH_STORAGE_KEY = 'yogaswiss-dev-auth';

export function storeDevAuth(userData: BypassUser): void {
  if (isDevelopmentEnvironment()) {
    localStorage.setItem(DEV_AUTH_STORAGE_KEY, JSON.stringify(userData));
  }
}

export function getStoredDevAuth(): BypassUser | null {
  if (!isDevelopmentEnvironment()) {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(DEV_AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearDevAuth(): void {
  if (isDevelopmentEnvironment()) {
    localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
  }
}

// Email confirmation bypass functions
export function isEmailNotConfirmedError(errorMessage: string): boolean {
  return (
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('not confirmed') ||
    errorMessage.includes('email_not_confirmed') ||
    errorMessage.includes('confirm your email')
  );
}

export function shouldBypassEmailConfirmation(): boolean {
  // Allow bypass in development environments or when explicitly enabled
  return (
    isDevelopmentEnvironment() ||
    localStorage.getItem('yogaswiss-bypass-email-confirmation') === 'true'
  );
}

export function enableEmailConfirmationBypass(): void {
  localStorage.setItem('yogaswiss-bypass-email-confirmation', 'true');
  console.log('[YogaSwiss] Email confirmation bypass enabled');
}

export function disableEmailConfirmationBypass(): void {
  localStorage.removeItem('yogaswiss-bypass-email-confirmation');
  console.log('[YogaSwiss] Email confirmation bypass disabled');
}

export function handleEmailConfirmationError(email: string, password: string): BypassUser | null {
  if (!shouldBypassEmailConfirmation()) {
    return null;
  }

  console.log(`[YogaSwiss] Handling email confirmation error for ${email}`);
  
  // Check if this is a predefined dev user
  const devUser = getBypassUserData(email);
  if (devUser) {
    console.log(`[YogaSwiss] Using predefined dev user data for ${email}`);
    return devUser;
  }
  
  // Create a bypass user for any email
  const bypassUser = createBypassUserFromEmail(email);
  console.log(`[YogaSwiss] Created bypass user for ${email}`);
  
  return bypassUser;
}