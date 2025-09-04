import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { isDevelopment, getEnvVar } from './utils/env-safe';

// Initialize YogaSwiss Platform
console.log('🚀 YogaSwiss - Swiss Yoga Studio Management Platform');
console.log('📍 Version: 1.0.0 | Environment:', getEnvVar('MODE') || (isDevelopment() ? 'development' : 'production'));

// Validate environment on startup (async to avoid blocking)
setTimeout(() => {
  try {
    import('./utils/supabase/env').then(({ validateSupabaseEnvironment, logSupabaseConfig }) => {
      const validation = validateSupabaseEnvironment()
      if (!validation.isValid) {
        console.error('❌ [YogaSwiss] Environment validation failed:', validation.errors)
      } else {
        console.log('✅ [YogaSwiss] Environment validation passed')
        // Log config in development only
        if (isDevelopment()) {
          logSupabaseConfig()
        }
      }
      
      // Run initial health check
      import('./utils/supabase/setup-verification').then(({ getSupabaseHealth }) => {
        getSupabaseHealth().then(health => {
          console.log('📊 [YogaSwiss] Initial health check:', health);
        }).catch(error => {
          console.warn('⚠️ [YogaSwiss] Health check failed, app will block until backend is available:', error);
        });
      });
      
    }).catch(error => {
      console.error('❌ [YogaSwiss] Failed to validate environment:', error)
    })
  } catch (error) {
    console.error('❌ [YogaSwiss] Environment validation error:', error)
  }
}, 0)

// Error boundary for the entire application
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 [YogaSwiss] Critical application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-6">
            {/* YogaSwiss Branding */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">YS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">YogaSwiss</h1>
                <p className="text-sm text-muted-foreground">Studio Management Platform</p>
              </div>
            </div>

            <div className="max-w-md">
              <h2 className="mb-4">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                The application encountered an unexpected error. Please refresh the page or contact support if the problem persists.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Application
              </button>
              
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">Technical Details</summary>
                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                  {this.state.error?.message}
                </div>
              </details>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
