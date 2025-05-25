# PRD & Implementation Plan: User Credits & Stripe Integration

**Date:** 2025-05-25
**Author:** gpt-4.1-nano-2025-04-14

---

## 1. Product Requirements Document (PRD)

### Goal
Enable users to purchase and spend credits in the OpenAI Responses Starter App using Stripe payments. Credits are required to access premium features (e.g., image generation). The system must be secure, auditable, and robust against race conditions and abuse.

### Functional Requirements
- Google OAuth-based authentication (NextAuth).
- Credits system: users have a credit balance, can purchase credits, and spend them on premium features.
- Stripe integration: users can buy credit packages via Stripe Checkout.
- Secure, idempotent Stripe webhook handling to top-up credits after payment.
- Ledger tables for all credit purchases and spends.
- Admin/manual credit adjustment support.
- Display current credit balance in the UI.
- All credit checks and deductions must be transactionally safe and read from the database (not the session).

### Non-Functional Requirements
- Must run on Vercel (serverless Postgres, Prisma ORM).
- Must use connection pooling best practices.
- Must handle Stripe webhooks securely (signature verification, idempotency).
- Must be extensible for future features (e.g., Stripe refunds, VAT, multi-currency).
- Must be thoroughly documented for easy handoff.

---

## 2. Implementation Summary (as of 2025-05-25)

### Completed
- Vercel Postgres database provisioned and connected.
- Prisma ORM installed and configured.
- Prisma schema defined for: User, Account, Session, VerificationToken, CreditPurchase, CreditSpend, CreditAdjustment.
- Prisma migrations applied to database.
- Prisma client singleton implemented (`lib/prisma.ts`).
- NextAuth configured to use Prisma adapter, Google OAuth, and session callback exposes `userId` and `credits`.
- TypeScript types extended for NextAuth (`types/next-auth.d.ts`).
- Stripe library installed.
- API route scaffolding for `/api/stripe/create-checkout-session` and `/api/stripe/webhook`.
- `.env` updated for Vercel Postgres and Stripe keys.
- Plan file and changelog kept up to date.

### In Progress / Next Steps
- Implement `/api/stripe/create-checkout-session` (Stripe Checkout session creation, user auth, priceId input).
- Implement `/api/stripe/webhook` (webhook signature verification, idempotent credit top-up, handle refunds/adjustments).
- Build frontend components for buying credits and displaying balance.
- Integrate credit checks/deductions into premium feature endpoints (e.g., image generation).
- Update README and documentation for setup and usage.

---

## 3. Key Design Decisions & Pitfalls Addressed
- All credit operations are transactional and use the latest DB value (not session or client-supplied).
- Stripe webhook is idempotent and secure (signature verification, payment intent uniqueness).
- All credit events (purchases, spends, adjustments) are logged in ledger tables for auditability.
- Session value for credits is for display only and may be stale; critical checks always hit DB.
- Serverless connection pooling best practices followed.
- Stripe priceId used for product lookup (not hardcoded amounts).
- Legal/tax concerns (e.g., VAT) noted for future work.
- Stripe SDK used only in Node.js runtime API routes.

---

## 4. Next Steps for Implementation
1. Implement and test `/api/stripe/create-checkout-session` endpoint.
2. Implement and test `/api/stripe/webhook` endpoint with full idempotency and security.
3. Build frontend UI for buying credits and showing balance.
4. Integrate credit consumption logic into premium features.
5. Update documentation and changelog.
6. Review and test the entire flow on Vercel (including Stripe webhooks).

---

## 5. Handoff Notes
- All major design decisions, pitfalls, and implementation progress are documented here and in `plan_credits_stripe_integration.md`.
- See the changelog for a timestamped record of all changes.
- All credentials and sensitive values must be set in `.env` (never committed).
- To continue, pick up with Stripe endpoint implementation and frontend UI integration.

---

