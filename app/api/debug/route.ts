/**
 * Debug API Endpoint
 * 
 * This endpoint is designed to diagnose Edge runtime compatibility issues.
 * It tests various Edge runtime features to identify what's working correctly
 * and what might be causing problems in the deployment environment.
 */

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// Note: We'll access the context through the request headers
// This is compatible with both Next.js and Cloudflare Pages

export async function GET(request: Request) {
  // In Cloudflare Pages Functions, the context is available as part of the request
  // We'll use any to avoid type errors while still allowing the code to work in both environments
  const context = (request as any).context;
  try {
    // Basic info about the environment - try both access patterns for maximum compatibility
    const envInfo = {
      environment: process.env.NODE_ENV,
      apiKeyExists: false, // Will be updated below
      processEnvApiKeyExists: !!process.env.OPENAI_API_KEY,
      edgeRuntime: true,
      timestamp: new Date().toISOString(),
      contextAvailable: !!context,
      envObjectAvailable: !!context?.env,
    };
    
    // Try to access Cloudflare environment variables if context is available
    if (context?.env) {
      envInfo.apiKeyExists = !!context.env.OPENAI_API_KEY;
      if (context.env.NODE_ENV) {
        envInfo.environment = context.env.NODE_ENV;
      }
    }

    // Test if fetch is available
    let fetchTest;
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      fetchTest = {
        available: true,
        status: response.status,
        ok: response.ok,
      };
    } catch (error) {
      fetchTest = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Basic headers test
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const headersTest = {
      available: true,
      sample: Object.fromEntries(headers.entries()),
    };

    // Test ReadableStream
    let streamTest;
    try {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ test: 'data' })));
          controller.close();
        },
      });
      
      streamTest = {
        available: true,
        readable: stream instanceof ReadableStream,
      };
    } catch (error) {
      streamTest = {
        available: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        environment: envInfo,
        fetchTest,
        headersTest,
        streamTest,
        environmentAccess: {
          process_env: typeof process !== 'undefined' && !!process.env,
          context_env: !!context?.env
        }
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }, null, 2),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache',
        },
      }
    );
  }
}
