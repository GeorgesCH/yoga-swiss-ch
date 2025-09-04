// YogaSwiss Deployment Diagnostic Tool
// Run this to identify what's causing deployment failures

import React from 'react';

const DiagnosticTest = () => {
  const tests = [
    {
      name: 'React Import',
      test: () => typeof React !== 'undefined',
      description: 'React library is properly imported'
    },
    {
      name: 'CSS Variables',
      test: () => {
        if (typeof window === 'undefined') return true;
        const styles = getComputedStyle(document.documentElement);
        return styles.getPropertyValue('--primary').trim() !== '';
      },
      description: 'CSS custom properties are loaded'
    },
    {
      name: 'Environment Variables',
      test: () => {
        try {
          const hasImportMeta = typeof import.meta !== 'undefined' && import.meta.env !== undefined;
          const hasProcess = typeof process !== 'undefined' && process.env !== undefined;
          return hasImportMeta || hasProcess;
        } catch {
          return false;
        }
      },
      description: 'Environment variables are accessible'
    },
    {
      name: 'Supabase Env',
      test: () => {
        try {
          const { getSupabaseProjectId, getSupabaseAnonKey } = require('./utils/supabase/env');
          return Boolean(getSupabaseProjectId() && getSupabaseAnonKey());
        } catch {
          return false;
        }
      },
      description: 'Supabase env vars are configured'
    },
    {
      name: 'UI Components',
      test: () => {
        try {
          const { Button } = require('./components/ui/button');
          const { Card } = require('./components/ui/card');
          return Boolean(Button && Card);
        } catch {
          return false;
        }
      },
      description: 'UI components can be imported'
    },
    {
      name: 'Lucide React Icons',
      test: () => {
        try {
          const { Database, CheckCircle } = require('lucide-react');
          return Boolean(Database && CheckCircle);
        } catch {
          return false;
        }
      },
      description: 'Lucide React icons are available'
    }
  ];

  const runTests = () => {
    const results = tests.map(test => ({
      ...test,
      passed: test.test()
    }));

    console.log('🔍 YogaSwiss Deployment Diagnostics');
    console.log('=====================================');
    
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.description}`);
    });

    const failedTests = results.filter(r => !r.passed);
    
    if (failedTests.length === 0) {
      console.log('\n🎉 All tests passed! Deployment should work.');
    } else {
      console.log(`\n⚠️ ${failedTests.length} tests failed:`);
      failedTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.description}`);
      });
    }

    return results;
  };

  React.useEffect(() => {
    runTests();
  }, []);

  const results = tests.map(test => ({
    ...test,
    passed: test.test()
  }));

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#fafafa'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>
          🇨🇭 YogaSwiss Deployment Diagnostics
        </h1>
        
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          This tool helps identify what's causing deployment issues in your YogaSwiss platform.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {results.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '1rem',
                border: `2px solid ${result.passed ? '#10b981' : '#ef4444'}`,
                borderRadius: '8px',
                backgroundColor: result.passed ? '#f0fdf4' : '#fef2f2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {result.passed ? '✅' : '❌'}
                </span>
                <h3 style={{ margin: 0, color: result.passed ? '#059669' : '#dc2626' }}>
                  {result.name}
                </h3>
              </div>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                {result.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Quick Fixes</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280' }}>
            <li>If UI Components fail: Check if all dependencies are installed (<code>npm install</code>)</li>
            <li>If Supabase Env fails: Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment</li>
            <li>If Environment Variables fail: Check your <code>.env.local</code> file</li>
            <li>If Lucide Icons fail: Install lucide-react (<code>npm install lucide-react</code>)</li>
            <li>If CSS Variables fail: Ensure your <code>styles/globals.css</code> is properly loaded</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
          YogaSwiss Platform • Swiss Quality Engineering • Deployment Diagnostics v1.0
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
