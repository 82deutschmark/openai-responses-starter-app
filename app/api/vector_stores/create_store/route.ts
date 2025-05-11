import OpenAI from "openai";

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// Don't initialize OpenAI at the top level to prevent build errors

export async function POST(request: Request) {
  // Initialize OpenAI inside the handler for runtime only
  const openai = new OpenAI();
  const { name } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.create({
      name,
    });
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (error) {
    console.error("Error creating vector store:", error);
    return new Response("Error creating vector store", { status: 500 });
  }
}
