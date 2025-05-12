# Troubleshooting Plan: Environment Variables on Cloudflare Pages

**Goal:** Resolve API failures on `gptpluspro.com` by ensuring correct access to `OPENAI_API_KEY` in Cloudflare Pages Functions, informed by insights regarding `nodejs_compat` and `process.env`.

1.  **Critical User Verification: `nodejs_compat` Flag**
    *   **Action (USER):** Navigate to Cloudflare Dashboard -> Your Pages Project -> Settings -> Functions -> Compatibility Flags.
    *   **Verify:** 
        *   `nodejs_compat` flag is **enabled**.
        *   Note the **Compatibility date** (e.g., should be `2024-02-08` or later).
    *   **Inform CASCADE of the status.** This is crucial before proceeding.

2.  **Code Modification (Prioritizing `process.env`)**
    *   **Action (CASCADE, *after user confirms `nodejs_compat` is active*):** Modify `app/api/turn_response/route.ts` and `app/api/vector_stores/upload_file/route.ts`.
    *   **Logic:**
        *   Use `process.env.OPENAI_API_KEY` as the **sole method** to retrieve the API key when deployed on Cloudflare.
        *   Remove all lookups via `(request as any).context?.env` for the API key.
        *   Update logging and error details to reflect reliance on `process.env` and remove misleading `context.env` checks.

3.  **Playwright Testing & Log Analysis (After Code Deployment)**
    *   **Action (CASCADE):** Use Playwright on `https://gptpluspro.com/` to trigger:
        *   `/api/turn_response` (e.g., by sending a chat message).
        *   `/api/vector_stores/upload_file` (e.g., by uploading a file).
    *   **Action (USER, concurrently):** Monitor real-time Cloudflare Pages Function logs for `console.log` outputs from the API routes.

4.  **Final Diagnosis and Refinement**
    *   Analyze Playwright results and Cloudflare logs.
    *   If issues persist, investigate variable definition/propagation in Cloudflare further.

5.  **Update Project Documentation**
    *   `docs/CHANGELOG.md`: Summary of fix.
    *   `docs/EDGE_TROUBLESHOOTING.md`: Detailed findings and solution.
    *   `README.md`: Add instructions for Cloudflare env var setup (emphasizing `nodejs_compat` and `process.env`).

**Tasks Checklist (Revised):**

- [x] Review `app/api/turn_response/route.ts` (initial review)
- [x] Review `app/api/vector_stores/upload_file/route.ts` (initial review)
- [x] Review `README.md` (initial review)
- [x] **USER ACTION:** Verify `nodejs_compat` flag and compatibility date in Cloudflare settings. Report status to CASCADE. (**DONE** - Enabled, date is current)
- [x] **CASCADE ACTION (pending user confirmation):** Modify API routes to prioritize `process.env`. (-> **CASCADE ACTION: Implemented**)
- [x] **USER ACTION (after code changes by CASCADE):** Commit, push, and redeploy on Cloudflare Pages.
- [x] **CASCADE ACTION (after deployment):** Test `https://gptpluspro.com/` with Playwright.
- [x] **USER ACTION (concurrent with Playwright):** Monitor Cloudflare Function logs.
- [ ] Consult Cloudflare Pages & Next.js documentation on environment variables (as needed). (**Largely resolved by debug endpoint**) 
- [x] Identify root cause of the API failure. (**Initial root cause of API key access seems resolved. New root cause: TypeError: This ReadableStream did not return bytes.**)
- [ ] **CASCADE ACTION:** Add detailed logging within the stream processing loop in `app/api/turn_response/route.ts` to inspect chunk type and content. (**Partially done, but user's diagnosis points to a different part of the stream handling - the *outgoing* stream to client.**)
- [x] **DIAGNOSIS CONFIRMED by USER:** The `ReadableStream` created by the API route must `enqueue` `Uint8Array`s, not strings. The current code enqueues strings.
- [x] **CASCADE ACTION:** Modify `app/api/turn_response/route.ts` to use `new TextEncoder().encode()` for data passed to `controller.enqueue()`. --> **FIXED 'ReadableStream did not return bytes' error.**
- [ ] **USER ACTION (after code changes):** Redeploy and re-test by sending a message.
- [x] **USER ACTION (concurrently):** Monitor Cloudflare logs. The `TypeError` should be resolved. --> **TypeError resolved. New OpenAI 400 Error: `Invalid type for 'tools[1].vector_store_ids[0]': expected a string, but got null instead.`**
- [ ] **DIAGNOSIS:** OpenAI 400 error likely due to `process.env.OPENAI_VECTOR_STORE_ID` being `undefined`, leading to `vector_store_ids: [null]` in JSON. Also, OpenAI endpoint `v1/responses` might be incorrect; should be `v1/chat/completions`.
- [ ] **CASCADE ACTION:** Modify `app/api/turn_response/route.ts`:
    - Change OpenAI API endpoint to `https://api.openai.com/v1/chat/completions`.
    - Adjust logic for `vector_store_ids` to prevent `[null]` if `OPENAI_VECTOR_STORE_ID` is not a valid string.
    - Add console logging for the request body sent to OpenAI.
    - Improve error logging for `!response.ok` from OpenAI.
- [ ] **USER ACTION (after code changes):** Redeploy and re-test by sending a message. Monitor Cloudflare logs. Hope for success!
- [ ] Implement final code fixes (if any, e.g., removing fallback).
