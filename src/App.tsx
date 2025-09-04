import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProductionAuthProvider } from './components/auth/ProductionAuthProvider';
import { MultiTenantAuthProvider } from './components/auth/MultiTenantAuthProvider';
import { BrandThemeProvider, BrandPreviewOverlay } from './components/brands/BrandThemeProvider';
import { ComprehensiveI18nProvider } from './components/i18n/ComprehensiveI18nProvider';
import { AppLayout } from './components/AppLayout';
import IntegrationTestPage from './components/IntegrationTestPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
// EmailBypassIndicator removed for production

import './utils/auth-cleanup'; // Clean up any duplicate auth storage
import './utils/dev-helpers'; // Initialize development helpers
import './utils/console-cleaner'; // Initialize console cleaner for development

export default function App() {


  useEffect(() => {
    console.log('🚀 YogaSwiss - Application ready');
  }, []);



  // Main application with all providers
  return (
    <ErrorBoundary>
      <ComprehensiveI18nProvider>
        <ProductionAuthProvider>
          <MultiTenantAuthProvider>
            <BrandThemeProvider>
              <BrandPreviewOverlay>
                <Router>
                  <Routes>
                    {/* Root redirect to default locale */}
                    <Route path="/" element={<Navigate to="/de" replace />} />
                    
                    {/* Admin routes (no locale prefix) */}
                    <Route path="/admin" element={<AppLayout />} />
                    <Route path="/admin/*" element={<AppLayout />} />
                    <Route path="/integration-test" element={<IntegrationTestPage />} />
                    
                    {/* Locale-specific routes */}
                    <Route path="/:locale" element={<AppLayout />}>
                      {/* Portal routes with locale */}
                      <Route path="studios" element={<AppLayout />} />
                      <Route path="instructors" element={<AppLayout />} />
                      <Route path="retreats" element={<AppLayout />} />
                      <Route path="outdoor" element={<AppLayout />} />
                      <Route path="schedule" element={<AppLayout />} />
                      <Route path="online" element={<AppLayout />} />
                      <Route path="pricing" element={<AppLayout />} />
                      <Route path="checkout" element={<AppLayout />} />
                      <Route path="cart" element={<AppLayout />} />
                      <Route path="login" element={<AppLayout />} />
                      <Route path="signup" element={<AppLayout />} />
                      <Route path="onboarding" element={<AppLayout />} />
                      <Route path="account" element={<AppLayout />} />
                      <Route path="bookings" element={<AppLayout />} />
                      <Route path="wallet" element={<AppLayout />} />
                      <Route path="favorites" element={<AppLayout />} />
                      <Route path="profile-settings" element={<AppLayout />} />
                      <Route path="teachers-circle" element={<AppLayout />} />
                      <Route path="organise-retreats" element={<AppLayout />} />
                      <Route path="order-success" element={<AppLayout />} />
                      {/* Dynamic routes */}
                      <Route path="city/:citySlug" element={<AppLayout />} />
                      <Route path="studio/:studioSlug" element={<AppLayout />} />
                      <Route path="instructor/:instructorSlug" element={<AppLayout />} />
                      <Route path="retreat/:retreatSlug" element={<AppLayout />} />
                      <Route path="class/:classId" element={<AppLayout />} />
                      <Route path="brand/:brandSlug" element={<AppLayout />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/de" replace />} />
                  </Routes>
                </Router>
                <Toaster />
              </BrandPreviewOverlay>
            </BrandThemeProvider>
          </MultiTenantAuthProvider>
        </ProductionAuthProvider>
      </ComprehensiveI18nProvider>
    </ErrorBoundary>
  );
}
