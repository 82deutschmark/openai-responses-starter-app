# Plan: Credits System and Stripe Integration

**Author:** gpt-4.1-nano-2025-04-14
**Date:** 2025-05-25

## 1. Overview

This plan outlines the steps to integrate a user credit system and Stripe payments into the OpenAI Responses Starter App. Users will be able to purchase credits via Stripe and spend these credits on application features (e.g., image generation).

## 2. Prerequisites

*   Existing Google OAuth setup with NextAuth.
*   A Stripe account.
*   Stripe Products (e.g., "100 Credits", "500 Credits") created in the Stripe Dashboard.
*   Stripe API Keys (Publishable Key, Secret Key) and Webhook Secret.
*   Decision on a database solution.

## 3. Phases and Tasks

### Phase 1: User and Credit Management (Database & Auth)

*   **Task 1.1: Database Setup**
    *   [ ] Choose and configure a database (e.g., PostgreSQL with Prisma, Supabase).
    *   [ ] Define `User` schema: `id`, `googleId` (unique), `email`, `name`, `credits` (integer, default: 0).
    *   [ ] (Optional) Define `CreditPurchase` schema: `id`, `userId`, `stripePaymentIntentId`, `creditsPurchased`, `amountPaid`, `timestamp`.
    *   [ ] Set up database connection and ORM/client (e.g., Prisma).
*   **Task 1.2: NextAuth Modification**
    *   [ ] Install NextAuth adapter for the chosen database (e.g., `@next-auth/prisma-adapter`) or implement custom callbacks.
    *   [ ] Update `app/api/auth/[...nextauth]/route.ts`:
        *   Configure the adapter.
        *   Modify `callbacks` (e.g., `session`, `jwt`) to:
            *   On sign-in/session creation, find or create the user in the database.
            *   Include `userId` (from your DB) and `credits` in the session object.
*   **Task 1.3: API Endpoint for Credits**
    *   [ ] Create `app/api/user/credits/route.ts`:
        *   `GET` method to return the current logged-in user's credit balance from the session or database.

### Phase 2: Stripe Integration for Purchasing Credits

*   **Task 2.1: Stripe Setup & Configuration**
    *   [ ] Install Stripe Node.js library: `npm install stripe`.
    *   [ ] Add Stripe keys to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
*   **Task 2.2: API Endpoint - Create Checkout Session**
    *   [ ] Create `app/api/stripe/create-checkout-session/route.ts`:
        *   `POST` method that accepts a `productId` or credit amount.
        *   Authenticates the user (ensure they are logged in).
        *   Uses the Stripe SDK to create a Checkout Session.
            *   Include `client_reference_id` (your internal `userId`) in session metadata to link the Stripe payment to your user.
            *   Set `success_url` and `cancel_url`.
        *   Returns the Stripe `sessionId` to the client.
*   **Task 2.3: API Endpoint - Stripe Webhook**
    *   [ ] Create `app/api/stripe/webhook/route.ts`:
        *   `POST` method to receive webhooks from Stripe.
        *   Verify the Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`.
        *   Handle `checkout.session.completed` event:
            *   Retrieve `userId` from `event.data.object.client_reference_id`.
            *   Retrieve purchased credits amount (from line items or metadata).
            *   Update the user's `credits` in the database.
            *   (Optional) Record in `CreditPurchase` table.
        *   Return a 200 OK response to Stripe.
*   **Task 2.4: Frontend for Purchasing Credits**
    *   [ ] Create `components/BuyCreditsButton.tsx` (or similar).
    *   [ ] Create `app/buy-credits/page.tsx` to display credit packages and purchase options.
        *   Fetch product information (prices, amounts) if not hardcoded.
        *   On button click, call `/api/stripe/create-checkout-session`.
        *   Use Stripe.js (client-side) to redirect to Stripe Checkout using the `sessionId`.
    *   [ ] Create `app/checkout/success/page.tsx` (redirect target for successful payments).
    *   [ ] Create `app/checkout/cancel/page.tsx` (redirect target for cancelled payments).

### Phase 3: Consuming Credits

*   **Task 3.1: Modify Feature Endpoints**
    *   [ ] Identify API endpoints that will consume credits (e.g., `app/api/image-generator/route.ts`).
    *   [ ] In each endpoint:
        *   Get the current user's `userId` and `credits` from the session.
        *   Before processing, check if `user.credits >= cost_of_action`.
        *   If insufficient credits, return an appropriate error (e.g., 402 Payment Required).
        *   After successful action, deduct credits: `UPDATE User SET credits = credits - cost_of_action WHERE id = userId`.
*   **Task 3.2: Frontend Updates**
    *   [ ] Display user's current credit balance in the UI (e.g., in a header or user profile section).
    *   [ ] Show the credit cost for actions.
    *   [ ] Provide feedback on insufficient credits.
    *   [ ] Ensure credit balance updates in the UI after purchase or consumption (may require re-fetching or session update).

## 4. File Manifest

**Files to Create:**

*   `lib/db.ts` (or `lib/prisma.ts` if using Prisma)
*   `prisma/schema.prisma` (if using Prisma)
*   `app/api/user/credits/route.ts`
*   `app/api/stripe/create-checkout-session/route.ts`
*   `app/api/stripe/webhook/route.ts`
*   `components/BuyCreditsButton.tsx`
*   `components/CreditBalanceDisplay.tsx`
*   `app/buy-credits/page.tsx`
*   `app/checkout/success/page.tsx`
*   `app/checkout/cancel/page.tsx`
*   `docs/plan_credits_stripe_integration.md` (this file)

**Files to Modify:**

*   `app/api/auth/[...nextauth]/route.ts` (add DB adapter/callbacks)
*   `.env.example` (add placeholders for DB connection string, Stripe keys)
*   `.env` / `.env.local` (add actual DB connection string, Stripe keys)
*   `package.json` (add `stripe`, DB client/ORM e.g., `prisma`, `@prisma/client`, `@next-auth/prisma-adapter`)
*   Existing API endpoints that will consume credits (e.g., `app/api/image-generator/route.ts`)
*   Relevant frontend components that trigger credit-consuming actions or display user info.
*   `README.md` (document new features, setup, env vars)
*   `docs/CHANGELOG.md`

## 5. Dependencies to Add

*   `stripe`
*   Database client (e.g., `pg` for PostgreSQL)
*   ORM (e.g., `prisma`, `@prisma/client`)
*   NextAuth Adapter for the ORM (e.g., `@next-auth/prisma-adapter`)

## 6. Next Steps

1.  User to confirm database preference.
2.  User to set up Stripe account, products, and obtain API keys.
3.  Proceed with Phase 1 implementation upon approval.
