// Waitlist Promotion Edge Function (Cron Job)
import { createServiceClient } from "../_shared/supabase.ts";
import { createResponse, createErrorResponse } from "../_shared/utils.ts";

export default async function handler(req: Request): Promise<Response> {
  // This function should only be called by cron or admin
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  
  if (!authHeader?.includes(cronSecret) && !authHeader?.includes("service_role")) {
    return createErrorResponse("Unauthorized", 401);
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const supabase = createServiceClient();
    
    // Clean up expired holds first
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc('cleanup_expired_holds');
    
    if (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Promote waitlists
    const { data: promotionResult, error: promotionError } = await supabase.rpc('promote_waitlists_tick');
    
    if (promotionError) {
      console.error('Promotion error:', promotionError);
      return createErrorResponse(promotionError.message || "Promotion failed", 500);
    }

    return createResponse({
      cleanedHolds: cleanupResult || 0,
      promotions: promotionResult,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Waitlist promotion function error:', error);
    return createErrorResponse("Internal server error", 500);
  }
}
