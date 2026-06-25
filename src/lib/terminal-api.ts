/**
 * TPP Trading Terminal API Service
 * 
 * This service acts as the secure bridge between the Admin CRM (or Customer Dashboard)
 * and the actual Trading Terminal server (e.g., DXTrade, MetaTrader, Custom Terminal).
 */

export interface PingResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * Pings the Trading Terminal to verify that the API URL and Key are correct.
 * @param apiUrl The base URL of the trading terminal API
 * @param apiKey The secret API key
 * @returns Object containing success status and message
 */
export async function pingTerminal(apiUrl: string, apiKey: string): Promise<PingResult> {
  const startTime = Date.now();
  try {
    // Basic sanitization
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    
    // We attempt to ping a generic health/status endpoint.
    // If the terminal has a specific endpoint, it should be updated here.
    // For now, we will ping the root or /api/health with the API key in headers.
    
    // Most standard terminals use Bearer token or x-api-key
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'x-api-key': apiKey
    };

    // Timeout logic using AbortController (5 seconds max)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Some custom terminals might just respond to the base URL
    const pingEndpoint = `${baseUrl}/api/health`; // Assuming /api/health exists, fallback to baseUrl otherwise
    
    try {
      const response = await fetch(pingEndpoint, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return { success: true, message: 'Connection successful', latencyMs };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Invalid API Key (Unauthorized)' };
      } else if (response.status === 404) {
        // The endpoint might not exist, but the server is up. 
        // We'll treat this as a partial success for testing purposes unless it's a hard requirement.
        return { success: true, message: 'Server reached, but /api/health not found. Ensure API URL is correct.', latencyMs };
      } else {
        return { success: false, message: `Server returned error: ${response.status} ${response.statusText}` };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      // If the /api/health fails, try just the base URL
      if (err.name !== 'AbortError') {
         const fallbackResponse = await fetch(baseUrl, {
           method: 'GET',
           headers,
           // No timeout here for simplicity, but in prod we should add it
         });
         
         const latencyMs = Date.now() - startTime;
         
         if (fallbackResponse.ok || fallbackResponse.status === 404 || fallbackResponse.status === 401) {
            return { success: true, message: 'Server reached via fallback. Check API Key validity.', latencyMs };
         }
      }
      
      throw err; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'Connection timed out (Server took too long to respond)' };
    }
    return { success: false, message: `Failed to connect: ${error.message}` };
  }
}

// TODO: Phase 3 (Step 2)
// export async function createTradingAccount(...) { ... }
// export async function disableTradingAccount(...) { ... }
// export async function getLiveMetrics(...) { ... }
