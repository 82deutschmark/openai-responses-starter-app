import OpenAI from "openai";

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

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

  const openai = new OpenAI({
    apiKey: apiKey,
  });
  const { fileObject } = await request.json();

  try {
    const fileBuffer = Buffer.from(fileObject.content, "base64");
    const fileBlob = new Blob([fileBuffer], {
      type: "application/octet-stream",
    });

    const file = await openai.files.create({
      file: new File([fileBlob], fileObject.name),
      purpose: "assistants",
    });

    return new Response(JSON.stringify(file), { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(
      JSON.stringify({
        error: "Error uploading file", 
        detail: error instanceof Error ? error.message : "Unknown error",
        contextAvailable: !!context,
        envAvailable: !!context?.env
      }), 
      { status: 500 }
    );
  }
}
