// YogaSwiss Edge Function Deployment Script
// This file starts the Supabase Edge Function server

import app from './index.tsx';

console.log('🚀 YogaSwiss Edge Function server starting...');
console.log('📊 Available endpoints:');
console.log('  - GET  /health');
console.log('  - GET  /deploy/status');
console.log('  - POST /setup/database');
console.log('  - All  /payments/*');
console.log('  - All  /seed/*');
console.log('  - All  /people/*');
console.log('  - POST /auth/*');

Deno.serve(app.fetch);
