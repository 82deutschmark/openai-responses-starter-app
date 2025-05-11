import OpenAI from "openai";

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// Define the context interface for Cloudflare Pages Functions
interface PagesFunctionContext {
  env: {
    OPENAI_API_KEY: string;
    [key: string]: string;
  };
}

// Don't initialize OpenAI at the top level to prevent build errors

export async function POST(request: Request, context: PagesFunctionContext) {
  // Access API key from Cloudflare Pages context instead of process.env
  const apiKey = context?.env?.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY environment variable not set in Cloudflare Pages context");
    return new Response("API key configuration error", { status: 500 });
  }
  
  // Initialize OpenAI inside the handler for runtime only with explicit API key
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  const { name } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.create({
      name,
    });
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (error) {
    console.error("Error creating vector store:", error);
    return new Response(
      JSON.stringify({
        error: "Error creating vector store", 
        detail: error instanceof Error ? error.message : "Unknown error",
        contextAvailable: !!context,
        envAvailable: !!context?.env
      }),
      { status: 500 }
    );
  }
}
