// YogaSwiss Edge Function Deployment Script
// This file starts the Supabase Edge Function server

import app from './index.tsx';

console.log('🚀 YogaSwiss Edge Function server starting...');
console.log('📊 Available endpoints:');
console.log('  - GET  /make-server-f0b2daa4/health');
console.log('  - GET  /make-server-f0b2daa4/deploy/status');
console.log('  - POST /make-server-f0b2daa4/setup/database');
console.log('  - All  /make-server-f0b2daa4/payments/*');
console.log('  - All  /make-server-f0b2daa4/seed/*');
console.log('  - All  /make-server-f0b2daa4/people/*');
console.log('  - POST /make-server-f0b2daa4/auth/*');

Deno.serve(app.fetch);