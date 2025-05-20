<!--
This README file provides an overview of the OpenAI Responses Starter App, its features, setup, and customization notes.
It is intended to help users and contributors understand the project's purpose and how to work with it.
Keep this file updated with any major changes to the project structure, features, or deployment strategy.
-->

# Responses starter app
I, the user, cloned this from https://github.com/openai/openai-responses-starter-app.

![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

This repository contains a NextJS starter app built on top of the [Responses API](https://platform.openai.com/docs/api-reference/responses).
It leverages built-in tools ([web search](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses) and [file search](https://platform.openai.com/docs/guides/tools-file-search)) and implements a chat interface with multi-turn conversation handling.

Features:

- Multi-turn conversation handling
- Streaming responses & tool calls
- Display annotations
- (Currently Hidden in UI) Web search tool configuration
- (Currently Hidden in UI) Vector store creation & file upload for use with the file search tool
- (Currently Hidden in UI) Function calling

This app was meant to be used as a starting point to build a conversational assistant. I am customizing it for my needs.
My prefered model is `gpt-4.1-nano-2025-04-14`. For image generation, I use `gpt-image-1` 
I use GitHub for version control.
I use Cloudflare Workers for deployment normally, but Vercel was much easier so I switched.

**Important Security Note for `next-auth`:**
When using `next-auth` for authentication, it is **CRITICAL** to set a `NEXTAUTH_SECRET` environment variable in your production environment (e.g., Vercel environment variables) and also in your `.env` file for local development (especially if testing with HTTPS). This secret is used to sign cookies and tokens, ensuring the security of your user sessions.

You can generate a strong secret using the following command in your terminal:
```bash
openssl rand -hex 32
```
Add this generated secret to your `.env` file like so:
```
NEXTAUTH_SECRET=your_generated_secret_here
```
And ensure it is also set in your Vercel deployment environment variables.

### Monetization with Google AdSense/AdMob

This project can be monetized using Google AdSense (which is how AdMob typically integrates with web applications).

**1. `ads.txt` File:**
   - An `ads.txt` file is crucial for advertisers to verify that your site has authorized them to serve ads. It helps prevent ad fraud.
   - This file must be accessible at the root of your domain (e.g., `yourdomain.com/ads.txt`).
   - In this Next.js project, the `ads.txt` file has been placed in the `public` directory (`public/ads.txt`). Files in this directory are automatically served from the root.
   - Ensure your Google AdSense publisher ID (and any other authorized ad network IDs) are correctly listed in this file. The format is typically `google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`.

**2. Google AdSense Account Setup:**
   - Sign up for a Google AdSense account if you don't have one.
   - Add your website to AdSense and complete their site verification and approval process.

**3. Integrating AdSense Code into Next.js:**
   - **Main AdSense Script:** AdSense will provide a primary script tag for site initialization (often for "Auto ads"). This script needs to be included in the `<head>` of all your pages.
     - The recommended way to add this in Next.js is by using the `next/script` component. You can add it to your `pages/_app.tsx` (or `_app.js`) for global inclusion, or to `pages/_document.tsx` (or `_document.js`).
     - Example for `pages/_app.tsx`:
       ```typescript
       import Script from 'next/script';
       import type { AppProps } from 'next/app';
       import '@/app/globals.css'; // Adjust path as needed

       function MyApp({ Component, pageProps }: AppProps) {
         return (
           <>
             <Script
               async
               src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
               crossOrigin="anonymous"
               strategy="afterInteractive" // Or "lazyOnload"
             />
             <Component {...pageProps} />
           </>
         );
       }

       export default MyApp;
       ```
     - Replace `ca-pub-YOUR_PUBLISHER_ID` with your actual AdSense publisher ID.

   - **Ad Units:**
     - Within your AdSense account, you can create specific "Ad units" for different ad placements (e.g., banners, in-article ads).
     - AdSense will provide a JavaScript code snippet for each ad unit.
     - To display these ads, you can create a reusable React component (e.g., `components/AdDisplay.tsx`) that takes an `adSlotId` and other relevant props, and then renders the ad unit's script.
     - You would then use this `<AdDisplay />` component in your pages where you want the specific ad to appear.

**4. AdSense Program Policies:**
   - Always adhere to Google's AdSense Program Policies to ensure your account remains in good standing.
