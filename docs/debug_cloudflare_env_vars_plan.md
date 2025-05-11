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
- [ ] **CASCADE ACTION (pending user confirmation):** Modify API routes to prioritize `process.env`. (-> **CASCADE ACTION: Implementing now**)
- [ ] **USER ACTION (after code changes by CASCADE):** Commit, push, and redeploy on Cloudflare Pages.
- [ ] **CASCADE ACTION (after deployment):** Test `https://gptpluspro.com/` with Playwright.
- [ ] **USER ACTION (concurrent with Playwright):** Monitor Cloudflare Function logs.
- [ ] Consult Cloudflare Pages & Next.js documentation on environment variables (as needed).
- [ ] Identify root cause of the API failure.
- [ ] Verify fix on Cloudflare Pages deployment.
- [ ] Update `docs/CHANGELOG.md`.
- [ ] Update `docs/EDGE_TROUBLESHOOTING.md`.
- [ ] Update `README.md` with Cloudflare env var instructions.
