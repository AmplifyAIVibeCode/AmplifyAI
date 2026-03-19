# Amplify AI (MVP)

 Amplify AI helps real estate agents convert more leads into viewings and deals by automating follow-ups and re-engaging lost prospects so no opportunity is missed.

## Tech stack

- **Frontend**: Next.js (App Router) + React + Tailwind
- **Backend/DB/Auth**: Supabase (Postgres + Auth + RLS)
- **AI**: OpenAI API (server-side route)
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill in values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (server-only)

3. Create your Supabase schema

Open the Supabase SQL editor and run:

- `supabase/migrations/001_init.sql`

4. Run the app

```bash
npm run dev
```

Visit:

- `/signup` to create an account
- `/app` for the dashboard

## MVP flows implemented

- **Auth**: `/signup`, `/login`, sign out from app header
- **Leads**: list, create, detail view with conversation history
- **Messages**: save inbound/outbound messages
 - **AI follow-ups for lost leads**: for cold / inactive leads, you can call `/api/ai/reply` to generate + store a follow-up message
