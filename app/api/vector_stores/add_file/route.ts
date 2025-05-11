import OpenAI from "openai";

// Don't initialize OpenAI at the top level to prevent build errors

export async function POST(request: Request) {
  // Initialize OpenAI inside the handler for runtime only
  const openai = new OpenAI();
  const { vectorStoreId, fileId } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.files.create(
      vectorStoreId,
      {
        file_id: fileId,
      }
    );
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (error) {
    console.error("Error adding file:", error);
    return new Response("Error adding file", { status: 500 });
  }
}
