import OpenAI from "openai";

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// Don't initialize OpenAI at the top level to prevent build errors

export async function POST(request: Request) {
  // Access Cloudflare Pages context - in production this will be available via request
  const context = (request as any).context;
  
  // Try to get API key from Cloudflare context, fall back to process.env for local development
  let apiKey = context?.env?.OPENAI_API_KEY;
  if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY;
  }
  
  if (!apiKey) {
    console.error("OPENAI_API_KEY environment variable not set");
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
