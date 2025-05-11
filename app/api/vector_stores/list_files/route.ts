import OpenAI from "openai";

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// Don't initialize OpenAI at the top level to prevent build errors

export async function GET(request: Request) {
  // Initialize OpenAI inside the handler for runtime only
  const openai = new OpenAI();
  
  const { searchParams } = new URL(request.url);
  const vectorStoreId = searchParams.get("vector_store_id");

  try {
    const vectorStore = await openai.vectorStores.files.list(
      vectorStoreId || ""
    );
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response("Error fetching files", { status: 500 });
  }
}
