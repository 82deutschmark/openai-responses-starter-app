# Plan: Refactor API Stream Handling with Vercel AI SDK

**CRITICAL WARNING (2025-05-11 Evening): THIS ENTIRE REFACTORING PLAN IS LIKELY INVALID.**

**This plan was formulated by the AI assistant (Cascade) based on a MAJOR MISUNDERSTANDING of the project's core requirements. Cascade INCORRECTLY assumed the project was targeting the standard OpenAI Chat Completions API (`/v1/chat/completions`).**

**The project's `README.md` clearly indicates it uses the "[Responses API](https://platform.openai.com/docs/api-reference/responses)" (described by the USER as new/different for May 2025).**

**Therefore, the proposed integration of Vercel's AI SDK (`OpenAIStream`, `StreamingTextResponse`) as detailed below is almost certainly INAPPROPRIATE for the actual "Responses API" and should NOT be followed without a thorough re-evaluation based on the correct API target.**

**Cascade, the AI assistant, sincerely apologizes for this significant error and the misdirection it caused. This note is to prevent further wasted effort based on this flawed plan.**

---

**Date:** 2025-05-11
**Status:** Pending

## 1. Goal
Implement robust OpenAI stream processing in `app/api/turn_response/route.ts` using Vercel's AI SDK. This aims to fix the "Unterminated string in JSON" errors currently preventing chat responses from appearing in the UI, and ensure reliable functionality on the Cloudflare Pages deployment.

## 2. Background
The application currently uses a manual method to create a `ReadableStream` and process server-sent events (SSE) from the OpenAI API. This manual parsing (specifically `JSON.parse()` on potentially incomplete chunks of data) is causing "Unterminated string in JSON" errors. As a result, chat messages are not streamed back to the client correctly.

The Vercel AI SDK (`ai` package) provides utilities like `OpenAIStream` and `StreamingTextResponse` that are designed to handle these streams correctly and are commonly used in Next.js AI applications, including those deployed on edge runtimes like Cloudflare Pages.

## 3. Proposed Solution
1.  Add the `ai` package (Vercel AI SDK) as a project dependency.
2.  Refactor `app/api/turn_response/route.ts` to:
    *   Utilize `OpenAIStream` to process the response from the OpenAI API.
    *   Use `StreamingTextResponse` to send the processed stream back to the client.
    *   Remove the current hand-rolled `ReadableStream` creation and its associated parsing logic.

## 4. Task Checklist

### Phase 1: Setup and Refactoring
- [ ] **Dependency Management:**
    - [ ] Add `"ai": "^3.0.0"` (or latest compatible version) to `dependencies` in `package.json`.
    - [ ] Run `npm install` to install the new dependency.
- [ ] **Code Refactoring (`app/api/turn_response/route.ts`):**
    - [ ] Remove the existing manual `ReadableStream` (the `new ReadableStream({...})` block) and its internal `while(true)` loop for processing `reader.read()`.
    - [ ] Import `OpenAIStream` and `StreamingTextResponse` from `ai`.
    - [ ] After the `fetch` call to the OpenAI API:
        - [ ] Ensure `response.ok` and `response.body` are valid.
        - [ ] Create a stream using `const stream = OpenAIStream(response);` (Callbacks for experimental features like tool use can be added later if needed).
        - [ ] Return `new StreamingTextResponse(stream);`.
    - [ ] Ensure existing error handling for the initial OpenAI API call (e.g., `!response.ok`) is maintained or adapted.
    - [ ] Confirm `export const runtime = 'edge';` is still present at the top of the file.
- [ ] **Documentation:**
    - [ ] Create this plan file (`docs/refactor_stream_handling_plan.md`).

### Phase 2: Testing and Validation
- [ ] **Local Development Testing:**
    - [ ] Run the application locally (e.g., using `wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat`).
    - [ ] Send various messages through the chat UI.
    - [ ] Verify that chat responses are streamed correctly and displayed in the UI.
    - [ ] Check the browser console for any errors.
    - [ ] Check the local server/Wrangler logs for any backend errors.
- [ ] **Cloudflare Deployment and Testing:**
    - [ ] Commit and push all changes to the Git repository.
    - [ ] Monitor the Cloudflare Pages build and deployment process for success.
    - [ ] Once deployed, thoroughly test the chat functionality on `https://gptpluspro.com/`.
    - [ ] Monitor Cloudflare Function logs for `/api/turn_response` to ensure no new errors appear and old parsing errors are gone.

### Phase 3: Finalization
- [ ] **Review and Cleanup:**
    - [ ] Review the changes for any dead code or unnecessary logging.
    - [ ] Ensure all console logs added for debugging the previous issue are removed or commented out if no longer needed.
- [ ] **Documentation Update:**
    - [ ] Update this plan document (`docs/refactor_stream_handling_plan.md`) with the completion status of each task.
    - [ ] Add an entry to `docs/CHANGELOG.md` summarizing the fix and refactoring.
    - [ ] Update `README.md` or other architectural documents if the changes are significant to the project's setup.

## 5. Follow-up Considerations
-   **Tool Calling:** The current implementation of `OpenAIStream` will primarily stream text content. If the OpenAI model responds with `tool_calls`, `OpenAIStream` has experimental callbacks (`experimental_onToolCall`) to handle this. This would be a subsequent enhancement if tool execution is required.
-   **Vector Store ID:** The "OPENAI_VECTOR_STORE_ID is not set" warning. If the `file_search` tool genuinely requires this and is intended for use, ensure the environment variable is correctly configured in Cloudflare Pages. Otherwise, consider conditionally excluding the `file_search` tool from the request if the ID is not available. This is separate from fixing the stream parsing but relevant for full tool functionality.
