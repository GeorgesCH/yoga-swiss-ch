// Development helper utilities for YogaSwiss
// These functions can be called from the browser console during development

import { 
  enableEmailConfirmationBypass, 
  disableEmailConfirmationBypass,
  clearDevAuth,
  DEV_USERS 
} from './auth-bypass';

// Global development helpers
declare global {
  interface Window {
    YogaSwissDev: {
      enableEmailBypass: () => void;
      disableEmailBypass: () => void;
      clearAuth: () => void;
      showDevUsers: () => void;
      showDevOrgs: () => void;
      info: () => void;
    };
  }
}

// Initialize development helpers
if (typeof window !== 'undefined') {
  window.YogaSwissDev = {
    enableEmailBypass: () => {
      enableEmailConfirmationBypass();
      console.log('✅ Email confirmation bypass enabled');
      console.log('You can now sign in with any email without confirmation');
    },
    
    disableEmailBypass: () => {
      disableEmailConfirmationBypass();
      console.log('❌ Email confirmation bypass disabled');
    },
    
    clearAuth: () => {
      clearDevAuth();
      localStorage.removeItem('yogaswiss-bypass-email-confirmation');
      localStorage.removeItem('yogaswiss-dev-orgs');
      localStorage.removeItem('yogaswiss_current_org');
      console.log('🗑️ Development auth and organizations cleared');
      console.log('Refresh the page to sign out');
    },
    
    showDevUsers: () => {
      console.log('👥 Available development users:');
      Object.entries(DEV_USERS).forEach(([email, user]) => {
        console.log(`📧 ${email} | 🔑 ${user.password} | 👤 ${user.userData.profile.role}`);
      });
    },
    
    showDevOrgs: () => {
      const devOrgs = JSON.parse(localStorage.getItem('yogaswiss-dev-orgs') || '[]');
      console.log('🏢 Development organizations:');
      if (devOrgs.length === 0) {
        console.log('  No organizations created yet');
        console.log('  Create one through the app to see it here');
      } else {
        devOrgs.forEach((org: any) => {
          console.log(`  🏪 ${org.name} (${org.slug}) - ${org.type} - ${org.status}`);
        });
      }
    },
    
    info: () => {
      console.log('🧪 YogaSwiss Development Helpers');
      console.log('Available commands:');
      console.log('  YogaSwissDev.enableEmailBypass() - Enable email confirmation bypass');
      console.log('  YogaSwissDev.disableEmailBypass() - Disable email confirmation bypass');
      console.log('  YogaSwissDev.clearAuth() - Clear development authentication');
      console.log('  YogaSwissDev.showDevUsers() - Show predefined development users');
      console.log('  YogaSwissDev.showDevOrgs() - Show created development organizations');
      console.log('  YogaSwissDev.info() - Show this help');
      console.log('');
      console.log('💡 Tips:');
      console.log('  - Email bypass is automatically enabled in development environments');
      console.log('  - Any email can be used for sign-in when bypass is enabled');
      console.log('  - Predefined users have specific roles and data');
    }
  };

  // Auto-enable email bypass in development
  if (process.env.NODE_ENV === 'development') {
    enableEmailConfirmationBypass();
    console.log('🚀 YogaSwiss Development Mode');
    console.log('Email confirmation bypass automatically enabled');
    console.log('Type YogaSwissDev.info() for development commands');
  }
}

export {};