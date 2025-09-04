// YogaSwiss Supabase Edge Function Main Entry Point
// This file imports the main application and starts the server

import { app } from './index.tsx';

console.log('🚀 YogaSwiss Edge Function server starting...');
console.log('📊 Available endpoints:');
console.log('  - GET  /health');
console.log('  - GET  /deploy/status');
console.log('  - POST /setup/database');
console.log('  - All  /payments/*');
console.log('  - All  /seed/*');
console.log('  - All  /people/*');
console.log('  - POST /auth/*');
console.log('🏥 Server ready!');

// Start the Deno server
Deno.serve(app.fetch);
