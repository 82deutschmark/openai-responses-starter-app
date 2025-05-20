# User Tracking and Rate Limiting System Plan

**Date:** 2025-05-19 23:42
**Author:** Claude 3.7 Sonnet

## Overview

This plan outlines how to implement user tracking, rate limiting, and a credits system for the OpenAI Responses Starter App. Since you already have Google OAuth working, we'll leverage this foundation to identify users and track their usage.

## Technical Approach

Since we're deploying on Vercel, we'll use Vercel's integrated services and compatible databases for storing user data and managing rate limits.

### System Components

1. **User Tracking**: Store user profiles and usage statistics
2. **Rate Limiting**: Restrict API usage based on limits or available credits
3. **Credits System**: Allow users to have/earn/spend credits for API calls

## Implementation Plan

### Files to Create:

1. `lib/database/index.ts` - Database connection setup
2. `lib/database/schema.ts` - Data models for users and credits
3. `lib/auth/session.ts` - Enhanced session management with user profile
4. `lib/rate-limit/index.ts` - Rate limiting logic
5. `lib/credits/index.ts` - Credits management system
6. `app/api/credits/[...route].ts` - API endpoints for credits
7. `app/api/profile/route.ts` - User profile management
8. `components/credits/CreditDisplay.tsx` - UI for showing current credits
9. `components/admin/CreditManagement.tsx` - Admin UI for managing credits

### Files to Modify:

1. `app/api/auth/[...nextauth]/route.ts` - Update to store additional user data
2. `app/api/generate-image/route.ts` - Add rate limiting and credit checks
3. `app/api/generate/route.ts` - Add rate limiting and credit checks
4. `app/page.tsx` - Add credit display component
5. `middleware.ts` - Enhance middleware for rate limiting
6. `.env` - Add new environment variables

## Database Options

### Option 1: Vercel Postgres
- Built-in Vercel integration
- SQL database with robust query capabilities
- Good for complex relationships and transactions

### Option 2: Vercel KV (Redis)
- Simple key-value storage
- Fast for rate limiting counters
- Good for caching and simple data structures

### Option 3: MongoDB Atlas
- Document database with flexible schema
- Good for unstructured data
- Has a free tier and Vercel integration

**Recommended Choice**: Vercel Postgres for structured data with KV for rate limiting

## Detailed Implementation Steps

### 1. Database Setup

1. Set up Vercel Postgres or chosen database service
2. Create schema for:
   - Users table (linked to OAuth IDs)
   - Credits table
   - Usage history table

### 2. Enhanced Authentication

1. Update NextAuth callbacks to:
   - Store user profile data in database
   - Track login history
   - Link credits to user accounts

### 3. Rate Limiting System

1. Create middleware that:
   - Identifies the user from the session
   - Checks usage against limits
   - Verifies available credits
   - Rejects or allows requests accordingly

### 4. Credits System

1. Create APIs for:
   - Checking credit balance
   - Using credits
   - Adding credits (admin function)
   - Viewing credit history

### 5. UI Components

1. Add credit balance display on main app pages
2. Create simple admin interface for managing credits
3. Add usage statistics to user profile

## Implementation Checklist

- [ ] Set up database and create schema
- [ ] Enhance NextAuth to store user data
- [ ] Implement rate limiting middleware
- [ ] Create credits management system
- [ ] Add API endpoints for credits and usage
- [ ] Update existing API endpoints with rate limiting
- [ ] Add UI components for displaying credits
- [ ] Create admin interface for managing credits
- [ ] Add usage statistics dashboard
- [ ] Test system with multiple users
- [ ] Document the system for future reference

## Considerations and Risks

1. **Data Privacy**: Ensure compliance with privacy regulations for stored user data
2. **Database Costs**: Monitor usage to stay within free tiers where possible
3. **Security**: Protect admin routes for credit management
4. **User Experience**: Make rate limits and credit usage transparent to users

## Next Steps

1. Choose the database system to use
2. Set up the database and create schema
3. Enhance authentication to store additional user data

This plan provides a roadmap for implementing a complete user tracking, rate limiting, and credits system. The implementation will be done incrementally to ensure stability throughout the process.
