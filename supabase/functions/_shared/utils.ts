// Shared utilities for Edge Functions
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function createResponse<T>(
  data: T, 
  status: number = 200, 
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
      ...headers
    }
  });
}

export function createErrorResponse(
  error: string, 
  status: number = 400, 
  code?: string
): Response {
  return new Response(JSON.stringify({ success: false, error, code }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key"
    }
  });
}

export function validateRequired(obj: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    if (!obj[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function getIdempotencyKey(req: Request): string {
  return req.headers.get("Idempotency-Key") || crypto.randomUUID();
}

export async function rateLimitCheck(
  supabase: any, 
  key: string, 
  cost: number = 1, 
  refillRate: number = 5
): Promise<boolean> {
  const { data, error } = await supabase.rpc('try_consume', {
    p_key: key,
    p_cost: cost,
    p_refill: refillRate
  });
  
  if (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error to avoid blocking legitimate requests
  }
  
  return data === true;
}

export function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || 
         req.headers.get("x-real-ip") || 
         "unknown";
}
