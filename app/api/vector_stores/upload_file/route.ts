import OpenAI from "openai";

// Configure route to use Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function POST(request: Request) {
  // Access Cloudflare Pages context - in production this will be available via request
  // const context = (request as any).context; // Removed: request.context.env is not reliable here
  
  // Try to get API key from process.env (expected with nodejs_compat on Cloudflare)
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("OPENAI_API_KEY environment variable not found via process.env");
    return new Response("API key configuration error: OPENAI_API_KEY not found in process.env", { status: 500 });
  }
  console.log("OPENAI_API_KEY obtained from process.env:", !!apiKey);

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
        apiKeyFoundViaProcessEnv: !!process.env.OPENAI_API_KEY
      }), 
      { status: 500 }
    );
  }
}
