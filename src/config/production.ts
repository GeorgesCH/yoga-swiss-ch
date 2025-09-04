/**
 * Production Configuration
 * Optimized settings for production deployment
 */

export const PRODUCTION_CONFIG = {
  // API Configuration
  api: {
    timeout: 15000,           // 15 second timeout
    retries: 2,               // Max 2 retries
    healthCheckInterval: 120000, // 2 minutes between health checks
    batchDelay: 100,          // 100ms delay for batching requests
  },

  // Cache Configuration
  cache: {
    defaultDuration: 5 * 60 * 1000,      // 5 minutes default
    authDuration: 30 * 1000,             // 30 seconds for auth data
    orgsDuration: 10 * 60 * 1000,        // 10 minutes for org data
    profileDuration: 30 * 60 * 1000,     // 30 minutes for profile data
    staticDuration: 60 * 60 * 1000,      // 1 hour for static data
  },

  // Performance Configuration
  performance: {
    enableRequestDeduplication: true,
    enableCaching: true,
    enableBatching: true,
    enableCompression: true,
    maxConcurrentRequests: 6,
  },

  // Monitoring Configuration
  monitoring: {
    enablePerformanceLogging: false,     // Disable in production
    enableNetworkLogging: false,         // Disable in production
    enableErrorTracking: true,
    errorSampleRate: 0.1,                // Sample 10% of errors
  },

  // Features
  features: {
    enableRealTimeUpdates: true,
    enableOfflineMode: false,            // Disable until fully implemented
    enableAnalytics: true,
    enableA11y: true,
  }
};

export const DEVELOPMENT_CONFIG = {
  ...PRODUCTION_CONFIG,
  
  // Override for development
  api: {
    ...PRODUCTION_CONFIG.api,
    timeout: 30000,           // Longer timeout for debugging
    healthCheckInterval: 60000, // More frequent health checks
  },

  monitoring: {
    ...PRODUCTION_CONFIG.monitoring,
    enablePerformanceLogging: true,      // Enable in development
    enableNetworkLogging: true,          // Enable in development
    errorSampleRate: 1.0,                // Log all errors
  },
};

// Export the appropriate config based on environment
export const CONFIG = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_CONFIG 
  : DEVELOPMENT_CONFIG;

// Performance monitoring utilities
export const PERFORMANCE_THRESHOLDS = {
  apiCallWarning: 3000,     // Warn if API call takes > 3s
  apiCallError: 10000,      // Error if API call takes > 10s
  renderWarning: 100,       // Warn if render takes > 100ms
  renderError: 500,         // Error if render takes > 500ms
};

// Error handling configuration
export const ERROR_CONFIG = {
  retryableErrors: [
    'NetworkError',
    'TimeoutError',
    'AbortError',
    'TypeError'
  ],
  nonRetryableErrors: [
    'AuthenticationError',
    'AuthorizationError',
    'ValidationError',
    'NotFoundError'
  ],
  silentErrors: [
    'AbortError' // Don't log abort errors
  ]
};
