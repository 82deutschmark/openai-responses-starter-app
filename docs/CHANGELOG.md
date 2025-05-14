<!--
This changelog follows the conventions of Keep a Changelog (https://keepachangelog.com/en/1.0.0/).
It tracks all significant changes made to the OpenAI Responses Starter App project.
To add new entries, append them under a new date heading (YYYY-MM-DD) in reverse chronological order (newest first).
Use the following sections as needed: Added, Changed, Fixed, Removed, Deprecated, Security.
-->
# Changelog

## [Unreleased] - YYYY-MM-DD

## 2025-05-14

### Changed
- **UX Improvement:** Temporarily hid the "File Search", "Web Search", and "Functions" sections in the `ToolsPanel` component to simplify the user interface. These sections were commented out in `components/tools-panel.tsx` and can be re-enabled later if needed.

## 2025-05-13

### Added
- Configured project for AdMob/AdSense integration by placing `ads.txt` in the `public` directory.
- Created a plan document (`admob_changelog_plan.md`) for AdMob integration and changelog refactoring.
- Integrated the main Google AdSense script into `app/layout.tsx` using `next/script` for global ad readiness.

### Changed
- **Major Deployment Shift:** Switched primary deployment target from Cloudflare Workers to Vercel due to practical challenges with Cloudflare. Vercel deployment was successful on the first attempt.
  *Note: Previous Cloudflare-specific configurations in `wrangler.toml`, `open-next.config.ts`, and `package.json` scripts related to Cloudflare deployment might be deprecated or subject to removal in future updates if Vercel remains the primary deployment platform.*
- Reformatted `CHANGELOG.md` to follow Keep a Changelog conventions, improve readability, and ensure reverse chronological order.
- Updated site metadata (title and description) in `app/layout.tsx` by user. (Approx. 19:21 2025-05-13)
- Modified `public/openai_logo.svg`: Changed fill to pink (#E75480) and added a dashed purple (#8A2BE2) stroke.
- Modified `public/openai_logo.svg` again (Approx. 19:25 2025-05-13): Changed main logo fill to yellow (#FFD700), removed previous dashed stroke, and added a black border to the white background circle.
- Modified `public/openai_logo.svg` a third time (Approx. 19:30 2025-05-13): Added a black dotted outline (stroke-width: 1, stroke-dasharray: "2 2") to the main yellow logo shape.

### Technical Notes
- Preferred OpenAI model: `gpt-4.1-nano-2025-04-14`.

## 2025-05-10

### Added
- **Initial Project Setup & Assessment**
  - Created `CHANGELOG.md` to track project modifications.
  - Conducted initial project assessment, identifying key features:
    - Next.js-based chat interface.
    - Integration with OpenAI Responses API.
    - Support for tools (web search, file search, function calling).
    - Streaming response handling.
    - State management via Zustand.
  - Set up the development environment:
    - Configured OpenAI API key in `.env` file.
    - Successfully launched the local development server.

### Removed
- Removed previous "Planned Changes" section as it was a placeholder (TBD).

<!--
Previous entry regarding Cloudflare setup before the switch to Vercel on 2025-05-13:

### Cloudflare Workers Deployment Setup - (Pre-Vercel Switch)
- Configured project for Cloudflare Workers deployment
  - Added OpenNext Cloudflare adapter (@opennextjs/cloudflare)
  - Created wrangler.toml with Workers configuration
    - Set main entry point to `.open-next/worker.js`
    - Added nodejs_compat flag for Node.js compatibility
    - Configured assets directory and binding
  - Added open-next.config.ts for adapter defaults
  - Updated package.json with preview/deploy scripts
  - Optimized Next.js config for Cloudflare compatibility
  - Set up environment variables in Cloudflare Workers dashboard
    - Added OPENAI_API_KEY for API authentication
  - Configured GitHub integration with Cloudflare Workers
    - Build command: `npm install && npx opennextjs-cloudflare build`
    - Deploy command: `npx wrangler deploy`
-->
