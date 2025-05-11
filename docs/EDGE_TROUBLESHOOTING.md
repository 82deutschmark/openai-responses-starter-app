#DEPRECATED Cloudflare Pages 500 Error Troubleshooting Guide  OUT OF SYNC

## Problem Statement

Our application deployed on gptpluspro.com is experiencing a persistent 500 error on the `/api/turn_response` endpoint. The error appears to be specific to the Cloudflare Pages Functions environment, as the application works correctly in local development.

Console error logs consistently show:
```
Failed to load resource: the server responded with a status of 500 ()
Error: 500 -
```

## Root Causes of 500 Errors in Cloudflare Pages

Cloudflare Pages Functions are Workers under the hood. 500 errors typically happen due to:
1. Function never returns a valid `Response`
2. An exception bubbles up (error 1101)
3. Cloudflare cannot route the request and falls back to a static asset (often preceded by a silent 405)

## Systematic Diagnosis Steps

### 1. Confirm the Request Reaches Your Function

**Issue**: Route & verb matching failures are a common cause of 500 errors

**Solution**:
- Ensure POST requests map to `functions/api/turn_response.ts` and export `onRequestPost`
- If using Next.js route handlers, verify correct file placement and export pattern
- Run `npx wrangler tail --project <name>` to check if requests reach your function
- Test locally with `npx wrangler pages dev` to identify routing issues

**Quick Test**:
- Create a simple test endpoint (e.g., `functions/api/ping.ts`) that returns a response
- If that also fails, the issue is with routing, not your OpenAI implementation

### 2. Proper Error Handling & Logging

**Issue**: Most "500" errors are actually upstream OpenAI 400/429 errors being re-labeled

**Solution**:
- Wrap OpenAI calls in try/catch blocks
- Log detailed error information: `console.error('OpenAI fail', e, await e.response?.text?.())`
- Return an explicit Response with meaningful status code for errors

### 3. Environment Variable Access Pattern

**Issue**: Incorrect environment variable access in Cloudflare Pages Functions

**Solution**:
- Add API keys under **Pages → Settings → Environment Variables**
- In Next.js route handlers: Access via `const context = (request as any).context` and then `context?.env?.OPENAI_API_KEY`
- In Cloudflare Workers: Access via `env.OPENAI_API_KEY` as in `export const onRequestPost: PagesFunction = async ({ env }) => {}`
- Do not use `process.env.OPENAI_API_KEY` as it won't work in Cloudflare deployment
- Implement a fallback for local development: `apiKey = context?.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY`

### 4. Next.js Type Compatibility

**Issue**: Next.js route handler types conflict with Cloudflare Pages context parameter

**Solution**:
- Don't add custom interface parameters to route handlers (causes build errors)
- Access Cloudflare context through `(request as any).context` without modifying function signature
- Use standard Next.js route handler pattern: `export async function POST(request: Request)`
- Avoid custom interface types in route handler parameters

### 5. Bundle Size & SDK Compatibility

**Issue**: Large bundles or SDK incompatibilities can cause silent 500 errors

**Solution**:
- Use OpenAI SDK v5-alpha or v4.98+ with `import 'openai/shims/web'`
- Ensure final bundle size is under 10MB (Pages Functions limit)
- Check for Node.js-specific dependencies in the bundle

### 5. Streaming & SSE Implementation

**Issue**: Improper stream handling can cause "The script will never generate a response" errors

**Solution**:
- Always return the stream: `return new Response(stream, { headers: {...} })`
- Ensure proper Content-Type headers for streaming: `"Content-Type": "text/event-stream"`
- Add proper Cache-Control headers: `"Cache-Control": "no-store, no-cache"`

## Methodical Debugging Approach

1. **Create a Simple Test Function**
   ```ts
   // functions/api/ping.ts or app/api/ping/route.ts
   export const onRequestPost = () => new Response('pong');
   // Or with Next.js: export async function POST() { return new Response('pong'); }
   ```

2. **Check Logs with Wrangler**
   ```bash
   npx wrangler tail --project <your-project-name>
   ```

3. **Fix Environment Variable Access**
   ```ts
   export const onRequestPost = async ({ env }) => {
     if (!env.OPENAI_API_KEY) return new Response('API key missing', { status: 500 });
     // Use env.OPENAI_API_KEY for API calls
   };
   ```

4. **Implement Proper Error Handling**
   ```ts
   try {
     const response = await fetch('https://api.openai.com/v1/responses', {
       headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
       // Other parameters
     });
     if (!response.ok) {
       const errorText = await response.text();
       console.error(`OpenAI error: ${response.status}`, errorText);
       return new Response(`OpenAI API error: ${response.status}`, { status: 502 });
     }
   } catch (error) {
     console.error('Request failed:', error);
     return new Response('Request failed', { status: 500 });
   }
   ```

5. **Correct Stream Handling**
   ```ts
   const stream = new ReadableStream({
     async start(controller) {
       // Stream implementation
     }
   });
   return new Response(stream, {
     headers: {
       "Content-Type": "text/event-stream",
       "Cache-Control": "no-store, no-cache",
     }
   });
   ```

## If Problems Persist

1. Deploy the same code to `workers.dev` via `wrangler publish --env staging` to see if it's Pages-specific
2. Try a Vercel Edge Function deployment to compare behavior
3. Use a minimal reproduction case with no external dependencies

## Resource Links

- [Cloudflare Pages Functions API Reference](https://developers.cloudflare.com/pages/functions/api-reference/)
- [Cloudflare Workers Error Documentation](https://developers.cloudflare.com/workers/observability/errors/)
- [Cloudflare Platform Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)

---

*This document was created on 2025-05-11 and updated with insights from Cloudflare's documentation and community solutions to help resolve 500 errors in Cloudflare Pages Functions.*
