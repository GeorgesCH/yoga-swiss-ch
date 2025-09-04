#!/usr/bin/env node

/**
 * Verify Production Supabase Configuration
 * 
 * This script ensures that the application is configured to use only
 * the production Supabase instance and not any local development setup.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

function checkEnvironmentFile() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    console.log('🔍 Checking environment configuration...');
    
    // Check for production Supabase URL
    if (!envContent.includes('https://okvreiyhuxjosgauqaqq.supabase.co')) {
      console.error('❌ Environment file does not contain production Supabase URL');
      return false;
    }
    
    // Check for local development URLs
    if (envContent.includes('localhost') || envContent.includes('127.0.0.1')) {
      console.error('❌ Environment file contains local development URLs');
      return false;
    }
    
    console.log('✅ Environment file is properly configured for production');
    return true;
  } catch (error) {
    console.error('❌ Could not read environment file:', error.message);
    return false;
  }
}

function checkSupabaseConfig() {
  try {
    const configPath = join(__dirname, '..', 'supabase', 'config.toml');
    const configContent = readFileSync(configPath, 'utf8');
    
    console.log('🔍 Checking Supabase configuration...');
    
    // Check for local development ports
    if (configContent.includes('port = 54321') || 
        configContent.includes('port = 54322') ||
        configContent.includes('port = 54323')) {
      console.error('❌ Supabase config contains local development ports');
      return false;
    }
    
    // Check for localhost references
    if (configContent.includes('localhost') || configContent.includes('127.0.0.1')) {
      console.error('❌ Supabase config contains localhost references');
      return false;
    }
    
    console.log('✅ Supabase config is properly configured for production');
    return true;
  } catch (error) {
    console.error('❌ Could not read Supabase config:', error.message);
    return false;
  }
}

function checkPackageJson() {
  try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageContent = readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    console.log('🔍 Checking package.json...');
    
    // Check for local Supabase scripts
    const scripts = packageJson.scripts || {};
    const hasLocalSupabaseScripts = Object.values(scripts).some(script => 
      typeof script === 'string' && script.includes('supabase')
    );
    
    if (hasLocalSupabaseScripts) {
      console.error('❌ Package.json contains local Supabase scripts');
      return false;
    }
    
    console.log('✅ Package.json is properly configured for production');
    return true;
  } catch (error) {
    console.error('❌ Could not read package.json:', error.message);
    return false;
  }
}

function main() {
  console.log('🚀 YogaSwiss Production Configuration Verification\n');
  
  const checks = [
    checkEnvironmentFile,
    checkSupabaseConfig,
    checkPackageJson
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
    console.log('');
  }
  
  if (allPassed) {
    console.log('🎉 All checks passed! Application is properly configured for production Supabase only.');
    console.log('✅ No local development setup detected');
    console.log('✅ Production environment variables configured');
    console.log('✅ Production Supabase instance will be used');
  } else {
    console.error('❌ Some checks failed. Please fix the issues above before proceeding.');
    process.exit(1);
  }
}

main();
