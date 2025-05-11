import { MODEL } from "@/config/constants";
import { NextResponse } from "next/server";
// Simplified approach without direct OpenAI SDK dependency
// We'll use fetch directly for maximum compatibility with Edge runtime

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// Define the context interface for Cloudflare Pages Functions
interface PagesFunctionContext {
  env: {
    OPENAI_API_KEY: string;
    [key: string]: string;
  };
  // Other context properties might be available
}

export async function POST(request: Request, context: PagesFunctionContext) {
  try {
    const { messages, tools } = await request.json();
    console.log("Received messages:", messages);

    // Check if API key is available from the Cloudflare Pages Functions context
    // CRITICAL: Access env vars via context.env, not process.env in Cloudflare Pages Functions
    const apiKey = context?.env?.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set in Cloudflare Pages context");
      return NextResponse.json({ error: "API key configuration error" }, { status: 500 });
    }
    console.log("API Key available from Cloudflare Pages context:", !!apiKey);
    
    // Create a ReadableStream that will handle our fetch + streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Log the complete context for debugging (excluding the actual API key value)
          console.log('Context available:', !!context, 'env available:', !!context?.env);
          // Direct fetch to OpenAI API (most compatible with Edge runtime)
          const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'OpenAI-Beta': 'responses=v1'
            },
            body: JSON.stringify({
              model: MODEL,
              input: messages,
              tools,
              stream: true,
              parallel_tool_calls: false,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
          }
          
          if (!response.body) {
            throw new Error('Response body is null');
          }
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          // Process the stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split('\n')
              .filter(line => line.startsWith('data: ') && line !== 'data: [DONE]');
              
            for (const line of lines) {
              const eventData = line.substring(6); // Remove 'data: ' prefix
              try {
                const parsedData = JSON.parse(eventData);
                const formattedData = JSON.stringify({
                  event: parsedData.type,
                  data: parsedData,
                });
                controller.enqueue(`data: ${formattedData}\n\n`);
              } catch (e) {
                console.error('Error parsing event data:', e);
              }
            }
          }
          
          // End of stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store, no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    // Enhanced error information with context debugging
    const errorDetail = error instanceof Error ? 
      { 
        message: error.message, 
        name: error.name, 
        stack: error.stack,
        contextAvailable: !!context,
        envAvailable: !!context?.env,
        apiKeyAvailable: !!context?.env?.OPENAI_API_KEY 
      } : 
      "Unknown error";
      
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        detail: errorDetail
      },
      { status: 500 }
    );
  }
}
