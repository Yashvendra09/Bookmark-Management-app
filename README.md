# 🔖 Smart Bookmark Manager

> A modern, real-time, and secure bookmark management application built for the future Ib.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)

## 📖 Overview

Use **Smart Bookmark Manager** to organize your favorite links with zero friction. Unlike traditional bookmark tools, this application focuses on **speed** and **real-time collaboration**.

When you add a bookmark on your phone, it appears *instantly* on your desktop—no refresh required. The interface is designed with a "glassmorphism" aesthetic, providing a premium dark-mode experience that feels native and responsive.

## 🏗️ Architecture & Tech Stack

This project uses a standardized, scalable architecture suitable for modern full-stack applications.

### **Frontend**
-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) - Utilizing Server Components for performance and Client Components for interactivity.
-   **Language**: TypeScript - For type-safe robust code.
-   **Styling**: Tailwind CSS v4 - Utilizing the latest engine for zero-runtime overhead styles.
-   **Icons**: Lucide React.

### **Backend (BaaS)**
-   **Infrastructure**: [Supabase](https://supabase.com/)
-   **Database**: PostgreSQL - Relational database for structured data.
-   **Authentication**: Supabase Auth (Google OAuth provider).
-   **Realtime**: Supabase Realtime (Postgres Changes) for live updates via IbSockets.
-   **Security**: Row Level Security (RLS) policies directly on the database tables.

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### 1. Prerequisites
-   Node.js 18.17 or later.
-   A free [Supabase](https://supabase.com/) project.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup
Run the following SQL in your Supabase SQL Editor to set up the schema and security policies:

```sql
-- Create table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Enable Security
alter table bookmarks enable row level security;

-- Create Policy (Allow users to see ONLY their own data)
create policy "Individuals can view their own bookmarks"
on bookmarks for select
using ( auth.uid() = user_id );

-- (Repeat similar policies for Insert, Update, Delete)
```
*Note: A full schema file is available in `supabase/schema.sql`.*

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

---

##  Challenges & Solutions (Development Journey)

Building a real-time app with optimistic updates comes with unique challenges. Here is how I solved the three biggest hurdles during development.

###  Problem 1: The "Ghost" Duplicate (Optimistic UI vs. Realtime)
**The Issue:**
I wanted the app to feel "instant". When a user clicks "Add", I immediately push the new bookmark to the UI list (Optimistic Update). HoIver, milliseconds later, the Supabase Realtime subscription would fire an event saying "A new row was inserted!", adding the *same* bookmark again. This resulted in duplicate entries appearing and then disappearing on refresh.

**The Solution:**
I moved the `ID` generation to the **client-side**.
1.  Instead of letting Postgres generate the UUID, I generate it in React using the `uuid` library.
2.  I attach this ID to the optimistic item.
3.  I send this same ID to the database insert.
4.  When the Realtime event comes back, it carries that exact same ID.
5.  Our `BookmarkList` component checks: *"Do I already have a bookmark with this ID?"* If yes, it ignores the event.
```typescript
// Optimized Logic ->
if (prev.some(b => b.id === payload.new.id)) return prev;
return [payload.new, ...prev];
```

###  Problem 2: Realtime Data Leaks & RLS Filtering
**The Issue:**
Row Level Security (RLS) protects the data API perfectly—users can't `fetch` other users' data. HoIver, Realtime subscriptions broadcast *all* table changes by default if not carefully scoped. I noticed that monitoring the IbSocket frames shoId events regardless of the user, which is a security risk and performance waste.

**The Solution:**
I enforced filtering at the **Subscription Level**, not just the Database Level.
1.  I updated the subscription to listen only for events where `user_id` matches the current session.
```typescript
channel.on(
  'postgres_changes',
  { 
    event: '*', 
    schema: 'public', 
    table: 'bookmarks', 
    filter: `user_id=eq.${currentUser.id}` // Crucial Filter
  }, 
  callback
)
```
This ensures the client only receives relevant events, reducing bandwidth and enforcing privacy.

###  Problem 3: Next.js Middleware & Auth Loops
**The Issue:**
Protecting routes in Next.js 15 with Supabase can be tricky. I encountered an "infinite redirect loop" where the Middleware would try to refresh a session, fail, redirect to login, which would check the session again, and repeat.

**The Solution:**
I implemented a robust `updateSession` utility in `lib/supabase/middleware.ts`.
1.  It explicitly handles the `cookie` request/response cycle required by Next.js Server Components.
2.  I added logic to **only** allow access to the dashboard (`/`) if a valid user session exists.
3.  I separated the public routes (like `/login` and `/auth/callback`) to ensure they are never blocked by the auth check.


