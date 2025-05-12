import { NextResponse } from "next/server";
// Simplified approach without direct OpenAI SDK dependency
// We'll use fetch directly for maximum compatibility with Edge runtime

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    // messages and tools from the incoming request are available here if needed, e.g., requestBody.messages, requestBody.tools
    console.log("Received messages:", requestBody.messages);

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
          // Construct tools to be sent to OpenAI
          const constructedToolsForOpenAI = [
            {
              type: "function" as const,
              function: {
                name: "web_search",
                description: "Search the web for relevant and up-to-date information.",
                parameters: {
                  type: "object" as const,
                  properties: {
                    query: {
                      type: "string" as const,
                      description: "The search query to use.",
                    },
                  },
                  required: ["query"],
                },
              },
            },
            {
              type: "function" as const,
              function: {
                name: "file_search",
                description: "Search through provided files or vector stores for relevant information.",
                parameters: {
                  type: "object" as const,
                  properties: {
                    query: {
                      type: "string" as const,
                      description: "The search query to use against the files.",
                    },
                    // vector_store_id is handled by backend logic if OPENAI_VECTOR_STORE_ID is set for Assistants.
                    // For function calling, if a specific vector store ID needs to be targetable by the model's call,
                    // it should be a parameter here. For simplicity now, we'll omit it from function params
                    // and assume the backend implementation of 'file_search' would use the env var if set.
                  },
                  required: ["query"],
                },
              },
            },
          ];

          // The OPENAI_VECTOR_STORE_ID logic previously here was for a different tool structure.
          // If file_search function needs to target a specific vector store ID chosen by the model,
          // that ID should be a parameter in its schema, and the model would fill it.
          // If the vector_store_id is fixed by the environment, the *implementation* of the file_search function
          // on the backend would use process.env.OPENAI_VECTOR_STORE_ID.
          // The console log for OPENAI_VECTOR_STORE_ID is still useful for general info.
          const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
          if (vectorStoreId && vectorStoreId.trim() !== "" && vectorStoreId.toLowerCase() !== 'null' && vectorStoreId.toLowerCase() !== 'undefined') {
            console.log('OPENAI_VECTOR_STORE_ID is set to:', vectorStoreId, '(Note: file_search function call does not currently take this as a direct parameter from model, backend implementation would use it)');
          } else {
            console.log('OPENAI_VECTOR_STORE_ID is not set or is invalid.');
          }

          const requestBodyForOpenAI = {
            model: requestBody.model || 'gpt-4o',
            messages: requestBody.messages,
            stream: true,
            tools: constructedToolsForOpenAI, // Use the correctly named variable
          };

          console.log('Request body to OpenAI (excluding stream true):', JSON.stringify({ ...requestBodyForOpenAI, stream: undefined }, null, 2));

          // Direct fetch to OpenAI API (most compatible with Edge runtime)
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBodyForOpenAI),
          });
          
          if (!response.ok) {
            const errorBody = await response.text(); // Get the full error response body as text
            console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorBody);
            // Throw an error that includes the status and the detailed error body
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorBody}`);
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
