import { MODEL } from "@/config/constants";
import { NextResponse } from "next/server";
// Simplified approach without direct OpenAI SDK dependency
// We'll use fetch directly for maximum compatibility with Edge runtime

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { messages, tools } = await request.json();
    console.log("Received messages:", messages);

    // Get API key - with nodejs_compat, process.env is the way in Cloudflare Pages Functions
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not found via process.env");
      return NextResponse.json({ error: "API key configuration error: OPENAI_API_KEY not found in process.env" }, { status: 500 });
    }
    
    console.log("OPENAI_API_KEY obtained from process.env:", !!apiKey);
    
    // Create a ReadableStream that will handle our fetch + streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('Attempting to use API Key (obtained from process.env)');
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
          const encoder = new TextEncoder();
          
          // Process the stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Stream reader finished (done is true).");
              break;
            }

            // --- BEGIN DETAILED LOGGING FOR STREAM CHUNK ---
            console.log(`Stream chunk received. Type: ${typeof value}, Is Uint8Array: ${value instanceof Uint8Array}`);
            if (!(value instanceof Uint8Array)) {
              console.error('CRITICAL: Stream chunk is NOT a Uint8Array. Value:', value);
              // Optionally, try to see what it is if not too large or sensitive, converting to string if possible
              try {
                console.log('Non-Uint8Array chunk as string (attempt):', String.fromCharCode.apply(null, value as any)); // This might fail or be meaningless
              } catch (e) {
                console.error('Could not convert non-Uint8Array chunk to string:', e);
              }
            }
            // --- END DETAILED LOGGING FOR STREAM CHUNK ---
            
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
                controller.enqueue(encoder.encode(`data: ${formattedData}\n\n`));
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
        apiKeyFoundViaProcessEnv: !!process.env.OPENAI_API_KEY
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
