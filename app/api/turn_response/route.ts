import { NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse } from 'ai'; 

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log("[API HANDLER] Received messages:", JSON.stringify(requestBody.messages));

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[API HANDLER] OPENAI_API_KEY environment variable not found via process.env");
      return NextResponse.json({ error: "API key configuration error: OPENAI_API_KEY not found in process.env" }, { status: 500 });
    }
    console.log("[API HANDLER] OPENAI_API_KEY obtained from process.env:", !!apiKey);

        // Define proper types for Responses API tools
    type ResponsesApiTool = 
      | { type: "web_search" } 
      | { type: "file_search", vector_store_ids?: string[] };
      
    // Use the properly formatted tools for the Responses API
    // Note: file_search ALWAYS needs vector_store_ids, even if empty
    const toolsForResponses: ResponsesApiTool[] = [
      { type: "web_search" },
      { type: "file_search", vector_store_ids: [] }, // Always include empty array by default
    ];

    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    if (vectorStoreId && vectorStoreId.trim() !== "" && vectorStoreId.toLowerCase() !== 'null' && vectorStoreId.toLowerCase() !== 'undefined') {
      console.log('[API HANDLER] OPENAI_VECTOR_STORE_ID is set to:', vectorStoreId);
      // If we have a vector store ID, update the file_search tool with it
      toolsForResponses[1] = { 
        type: "file_search" as const,
        vector_store_ids: [vectorStoreId]
      };
    } else {
      console.log('[API HANDLER] OPENAI_VECTOR_STORE_ID is not set or is invalid. Using empty vector_store_ids array.');
      // Vector store ID remains an empty array, which is already set by default
    }

    // Format request body for the Responses API
    const requestBodyForOpenAI = {
      model: requestBody.model || 'gpt-4o',
      input: requestBody.messages, // Note: 'input' instead of 'messages' for Responses API
      stream: true,
      tools: toolsForResponses,
    };

    console.log('[API HANDLER] Request body to OpenAI (excluding stream true):', JSON.stringify({ ...requestBodyForOpenAI, stream: undefined }, null, 2));

    console.log('[API HANDLER] Attempting to fetch from OpenAI Responses API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBodyForOpenAI),
    });

    console.log(`[API HANDLER] OpenAI response received. Status: ${openaiResponse.status} ${openaiResponse.statusText}`);

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error(`[API HANDLER] OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`, errorBody);
      return NextResponse.json(
        { 
          error: `OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`, 
          details: errorBody 
        },
        { status: openaiResponse.status }
      );
    }

    console.log('[API HANDLER] OpenAI response is OK. Proceeding to Vercel AI SDK streaming.');

    try {
      // Use OpenAIStream to process the response with detailed logging callbacks
      // Note: We're using OpenAIStream with the Responses API - this is what was missing before
      const stream = OpenAIStream(openaiResponse.clone(), { // Clone the response if it's used elsewhere or if OpenAIStream might consume it fully before another part needs it
        async onStart() {
          console.log("[AI SDK STREAM] Stream started with Responses API.");
        },
        async onToken(token) {
          // Log only a small part of the token to avoid excessive logging
          console.log("[AI SDK STREAM] Token received (first 50 chars):", token.substring(0, 50));
        },
        async onCompletion(completion) {
          console.log("[AI SDK STREAM] Completion received (full):", completion);
        },
        async onFinal(completion) {
          console.log("[AI SDK STREAM] Final callback triggered. Completion:", completion);
          // If you use StreamData, you can append to it here
        },
      });

      console.log('[API HANDLER] OpenAIStream instance created with Responses API. Preparing StreamingTextResponse.');
      return new StreamingTextResponse(stream);

    } catch (sdkError) {
      console.error("[API HANDLER] Error during Vercel AI SDK stream processing:", sdkError);
      const errorDetail = sdkError instanceof Error ? 
        { message: sdkError.message, name: sdkError.name, stack: sdkError.stack } : 
        "Unknown SDK error";
      return NextResponse.json(
        {
          error: "Error processing stream with Vercel AI SDK",
          detail: errorDetail
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[API HANDLER] Error in POST handler:", error);
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
