// Console cleaner utility for development
// Reduces noise from non-critical API failures and fallback mechanisms

export function initializeConsoleCleaner() {
  // Only run in development environments
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) return;

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // List of error patterns to suppress or quiet
  const suppressPatterns = [
    /Finance API request failed/,
    /Finance API fallback/,
    /Failed to fetch orders data/,
    /Finance API unavailable/,
    /Internal Server Error/,
    /500 \(Internal Server Error\)/,
    /Network connection failed/,
    /API service unavailable/,
    /Could not find a relationship between/,
    /Could not find the function/,
    /invalid claim: missing sub claim/,
    /Get customers error/,
    /Get class analytics error/,
    /PGRST200/,
    /PGRST202/,
    /Translation missing for key/,
    /404 \(Not Found\)/
  ];

  const quietPatterns = [
    /using fallback data/,
    /returning empty.*data/,
    /API not available/
  ];

  // Override console.error to filter noise
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress completely
    for (const pattern of suppressPatterns) {
      if (pattern.test(message)) {
        return; // Don't log
      }
    }
    
    // Call original error for everything else
    originalError.apply(console, args);
  };

  // Override console.warn to quiet some messages
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Quiet some messages (still log but less prominently)
    for (const pattern of quietPatterns) {
      if (pattern.test(message)) {
        console.log(`🔕 ${message}`); // Use log instead of warn
        return;
      }
    }
    
    // Call original warn for everything else
    originalWarn.apply(console, args);
  };

  console.log('🧹 Console cleaner initialized for development');
}

// Auto-initialize if in development
if (typeof window !== 'undefined') {
  initializeConsoleCleaner();
}