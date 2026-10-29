# GuardTrack AI System

GuardTrack AI System is a web-based attendance, payroll, and workforce management platform built for security agencies and field staff operations.

The project started after noticing a local security agency struggling to manage guard attendance, salary calculations, shift tracking, and advance payments manually through registers and spreadsheets. Instead of treating it like a demo project, the system was designed around their real operational workflow and is currently being used to manage around 30 security guards.

## Features

- Employee & guard management
- Attendance tracking
- Salary and payroll management
- Advance salary handling
- Real-time dashboard
- Shift and operational tracking
- Admin management panel
- Scalable architecture for multi-branch operations

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Firebase
- Node.js

## Why I Built This

Most small and mid-sized security agencies still rely on manual processes for attendance and payroll management, which creates operational confusion and payroll errors. I wanted to build a system that solves an actual business problem instead of just building another tutorial project.

This project also helped me understand:
- Designing software around real-world workflows
- Managing operational edge cases
- Building scalable admin systems
- Thinking beyond frontend-only applications

## Getting Started

1. Install Node.js 20+ and pnpm.
2. Install dependencies:

```bash
pnpm install
```

3. Create a Supabase project. In **Project Settings → API**, copy the project URL
   and anon/public key into a new `.env.local` file in the project root. You can
   use `.env.example` as a template. The app requires:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

For admin and email notification features, also configure
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `NOTIFY_FROM_EMAIL` as
described in [disintegrate.md](./disintegrate.md). Never expose the service-role
key in client-side code or commit `.env.local`.

4. Run the database setup described in [disintegrate.md](./disintegrate.md),
   then start the development server:

```bash
pnpm dev
```