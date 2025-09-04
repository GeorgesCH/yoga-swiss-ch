// YogaSwiss Supabase Edge Function Entry Point
// This file ensures the server is properly started

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import payments from './payments.tsx';
import seed from './seed.tsx';
import people from './people.tsx';

// This is the exported app that's referenced in the index file
export const app = new Hono();

// Note: All the actual route definitions are in index.tsx
// This file is just to ensure proper server startup

console.log('🚀 YogaSwiss Edge Function server initializing...');
console.log('📊 Available API endpoints:');
console.log('  - GET  /make-server-f0b2daa4/health - Health check');
console.log('  - GET  /make-server-f0b2daa4/deploy/status - Deployment status');
console.log('  - POST /make-server-f0b2daa4/setup/database - Database setup');
console.log('  - All  /make-server-f0b2daa4/payments/* - Swiss payment integration');
console.log('  - All  /make-server-f0b2daa4/seed/* - Demo data seeding');
console.log('  - All  /make-server-f0b2daa4/people/* - People management');
console.log('  - POST /make-server-f0b2daa4/auth/* - Authentication');
console.log('🏥 Server ready to handle requests');

// Export for edge function deployment
export default app;