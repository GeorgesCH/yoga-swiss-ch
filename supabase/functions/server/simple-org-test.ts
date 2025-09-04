import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";

const app = new Hono();

// Enable CORS
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "OPTIONS"]
}));

// Root endpoint
app.get("/", (c) => {
  return c.json({
    service: "Organization Test Function",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Test organization creation without dependencies
app.post("/make-server-f0b2daa4/orgs", (c) => {
  return c.json({
    id: "test-org-" + Date.now(),
    name: "Test Organization",
    message: "Organization creation test successful - no 500 error!"
  });
});

// Health check
app.get("/health", (c) => {
  return c.json({ status: "healthy" });
});

console.log("Simple org test function starting...");
Deno.serve(app.fetch);
