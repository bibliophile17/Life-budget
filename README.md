# LifeBudget

Plan any salary, track spending and save more. Next.js + TypeScript + Tailwind + Recharts + Supabase (optional).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Supabase (optional)
Without env vars the app runs in local mode (browser storage). To enable email sign-in and cloud sync:
1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor (tables + Row Level Security).
2. Copy `.env.example` to `.env.local` and fill in the URL and anon key.
3. On Vercel, add the same two variables under Project Settings > Environment Variables.

Projections are hypothetical assumptions, not financial advice.
