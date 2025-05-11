/**
 * Debug API Endpoint
 * 
 * This endpoint is designed to diagnose Edge runtime compatibility issues.
 * It tests various Edge runtime features to identify what's working correctly
 * and what might be causing problems in the deployment environment.
 */

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function GET() {
  try {
    // Basic info about the environment
    const envInfo = {
      environment: process.env.NODE_ENV,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      edgeRuntime: true,
      timestamp: new Date().toISOString(),
    };

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
