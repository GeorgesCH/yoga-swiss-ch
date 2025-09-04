// YogaSwiss Supabase Edge Function Main Entry Point
// This file imports the main application and starts the server

import { app } from './index.tsx';

console.log('🚀 YogaSwiss Edge Function server starting...');
console.log('📊 Available endpoints:');
console.log('  - GET  /make-server-f0b2daa4/health');
console.log('  - GET  /make-server-f0b2daa4/deploy/status');
console.log('  - POST /make-server-f0b2daa4/setup/database');
console.log('  - All  /make-server-f0b2daa4/payments/*');
console.log('  - All  /make-server-f0b2daa4/seed/*');
console.log('  - All  /make-server-f0b2daa4/people/*');
console.log('  - POST /make-server-f0b2daa4/auth/*');
console.log('🏥 Server ready!');

// Start the Deno server
Deno.serve(app.fetch);