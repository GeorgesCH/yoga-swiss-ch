// Wrapper entry to expose the server under the expected function name
// and normalize route prefixes for existing handlers.
// This function is deployed as `make-server-f0b2daa4` so requests will be
// served at: https://<project>.supabase.co/functions/v1/make-server-f0b2daa4/*

import { app as serverApp } from "../server/index.ts";

// Allow anonymous requests. We perform route-level auth within the app.
export const verifyJwt = false;

// Normalize incoming requests to support both legacy prefixed paths
// and new clean paths. Internally, our server now uses clean paths.
Deno.serve((req) => {
  try {
    const url = new URL(req.url);
    
    // Strip the function name prefix if present
    if (url.pathname.startsWith("/make-server-f0b2daa4")) {
      const stripped = url.pathname.replace("/make-server-f0b2daa4", "") || "/";
      url.pathname = stripped;
    }
    
    const newRequest = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.body,
      duplex: "half"
    });
    
    return serverApp.fetch(newRequest);
  } catch (err) {
    console.error("Request normalization failed:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
