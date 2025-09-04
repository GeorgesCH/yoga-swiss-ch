// Events Generation Edge Function (Cron Job)
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
    
    // Generate events for all active series
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 120); // 120 days from now
    
    const { data: result, error } = await supabase.rpc('generate_events_for_all', {
      p_until_date: targetDate.toISOString().split('T')[0]
    });
    
    if (error) {
      console.error('Generation error:', error);
      return createErrorResponse(error.message || "Generation failed", 500);
    }

    // Maintain partitions for future months
    const { error: partitionError } = await supabase.rpc('maintain_partitions');
    
    if (partitionError) {
      console.error('Partition maintenance error:', partitionError);
    }

    return createResponse({
      generation: result,
      partitionMaintenance: partitionError ? 'failed' : 'success',
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Events generation function error:', error);
    return createErrorResponse("Internal server error", 500);
  }
}
