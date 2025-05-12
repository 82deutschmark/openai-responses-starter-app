import { NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log("Received messages:", requestBody.messages);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not found via process.env");
      return NextResponse.json({ error: "API key configuration error: OPENAI_API_KEY not found in process.env" }, { status: 500 });
    }
    console.log("OPENAI_API_KEY obtained from process.env:", !!apiKey);

    // Construct tools to be sent to OpenAI - This part remains largely the same
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
            },
            required: ["query"],
          },
        },
      },
    ];

    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    if (vectorStoreId && vectorStoreId.trim() !== "" && vectorStoreId.toLowerCase() !== 'null' && vectorStoreId.toLowerCase() !== 'undefined') {
      console.log('OPENAI_VECTOR_STORE_ID is set to:', vectorStoreId, '(Note: file_search function call does not currently take this as a direct parameter from model, backend implementation would use it if defined)');
      // If you were using Assistants API v2 file_search, you would add vector_store_ids to the tool here.
      // For function calling with Chat Completions, if the model needed to specify a vector store, it would be a parameter.
    } else {
      console.log('OPENAI_VECTOR_STORE_ID is not set or is invalid.');
    }

    const requestBodyForOpenAI = {
      model: requestBody.model || 'gpt-4o',
      messages: requestBody.messages,
      stream: true,
      tools: constructedToolsForOpenAI,
    };

    console.log('Request body to OpenAI (excluding stream true):', JSON.stringify({ ...requestBodyForOpenAI, stream: undefined }, null, 2));

    // Direct fetch to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBodyForOpenAI),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`, errorBody);
      // Return a structured error response to the client
      return NextResponse.json(
        { 
          error: `OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`, 
          details: errorBody 
        },
        { status: openaiResponse.status }
      );
    }

    // Use OpenAIStream to process the response
    const stream = OpenAIStream(openaiResponse);

    // Return a StreamingTextResponse, which handles the SSE formatting and headers.
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error in POST handler:", error);
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
