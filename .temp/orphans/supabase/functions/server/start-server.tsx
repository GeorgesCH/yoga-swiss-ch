// This file should be appended to the end of index.tsx to properly start the server

console.log('🚀 Starting YogaSwiss Edge Function server...');
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