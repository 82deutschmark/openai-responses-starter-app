## Summary

OpenAI Responses Starter App is a Next.js 14/15 application that you can deploy to Cloudflare Workers by using the official OpenNext Cloudflare adapter (@opennextjs/cloudflare) in its 1.0.0-beta release, which transforms your Next.js build output into a Workers-compatible bundle via the Node.js compatibility layer. Deployment consists of installing the adapter and Wrangler CLI, creating a `wrangler.toml` with the adapter’s entrypoint and flags, adding an `open-next.config.ts` for OpenNext defaults, updating your `package.json` with preview/deploy scripts, and then running `npm run build`/`preview`/`deploy` to push to a `*.workers.dev` subdomain or custom domain.

## 1. Install Dependencies

1. Install the Cloudflare adapter for Next.js and Wrangler CLI as dev dependencies:

   ```bash
   npm install --save-dev @opennextjs/cloudflare@latest wrangler@latest
   ```

   ([Cloudflare Docs][1]) ([npm][2])

## 2. Configure Wrangler

Create a `wrangler.toml` at the project root with these settings:

```toml
name               = "openai-responses-starter-app"        # your Worker name
main               = ".open-next/worker.js"               # adapter entrypoint
compatibility_date = "2025-05-12"                         # today’s date or later
compatibility_flags = ["nodejs_compat"]                   # enable Node.js APIs
[assets]
  directory        = ".open-next/assets"                  # static files dir
  binding          = "ASSETS"                             # asset binding name
```

([Cloudflare Docs][1])

## 3. Add OpenNext Config

Create an `open-next.config.ts` file exporting the default Cloudflare config:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

This tells OpenNext to apply its default transformation for Workers. ([Cloudflare Docs][1])

## 4. Update Package Scripts

Add these scripts to your `package.json`:

```jsonc
{
  "scripts": {
    "dev":   "next dev",                                      // local Next.js dev server
    "preview": "opennextjs-cloudflare build && wrangler dev", // preview in Workers runtime
    "deploy":  "opennextjs-cloudflare build && wrangler deploy", // publish to Cloudflare
    "cf-typegen": "wrangler types --env-interface Env cloudflare-env.d.ts"
  }
}
```

([Cloudflare Docs][1])

## 5. Develop, Preview & Deploy

1. **Local Development**

   ```bash
   npm run dev
   ```

   Starts the standard Next.js server for rapid iteration. ([Cloudflare Docs][1])
2. **Preview in Workers Runtime**

   ```bash
   npm run preview
   ```

   Runs your app in the `workerd` runtime locally via `wrangler dev`, matching production behavior. ([Cloudflare Docs][1])
3. **Deploy to Cloudflare**

   ```bash
   npm run deploy
   ```

   Builds the Next.js output, adapts it for Workers, then publishes to your `*.workers.dev` subdomain (or a custom domain if configured). ([Cloudflare Docs][1])

## 6. How It Works

* The adapter packages your Next.js build (including SSR, ISR, API routes, and middleware) for the Workers Node.js compatibility layer ([OpenNext][3]).
* It leverages Cloudflare’s polyfills and the `nodejs_compat` flag to support built-in Node modules (crypto, dns, timers, etc.) ([The Cloudflare Blog][4]).
* Bundle size limits have increased to 3 MiB on free plans and 15 MiB on paid plans, so most apps will fit without extra splitting ([The Cloudflare Blog][4]).

## Additional Resources

* Adapter docs: [https://opennext.js.org/cloudflare](https://opennext.js.org/cloudflare) ([OpenNext][3])
* Starter app GitHub: [https://github.com/openai/openai-responses-starter-app](https://github.com/openai/openai-responses-starter-app) ([GitHub][5])

[1]: https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/ "Next.js · Cloudflare Workers docs"
[2]: https://www.npmjs.com/package/%40opennextjs/cloudflare?utm_source=chatgpt.com "opennextjs/cloudflare - NPM"
[3]: https://opennext.js.org/cloudflare?utm_source=chatgpt.com "Cloudflare - OpenNext"
[4]: https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/ "Deploy your Next.js app to Cloudflare Workers with the Cloudflare adapter for OpenNext"
[5]: https://github.com/openai/openai-responses-starter-app "GitHub - openai/openai-responses-starter-app: Starter app to build with the OpenAI Responses API"
