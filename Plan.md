# AI Marketing Agent — MVP Blueprint

## What This App Does
An autonomous AI agent that generates daily marketing content (posts, articles, captions) about you and your work, queues it for review, and lets you copy-paste to publish manually — with a path to full automation later.

---

## Human Input Required (One-Time Setup)

Before any code runs, you must provide:

1. **Your Profile Context** — who you are, what you build, your skills, your tone of voice, target audience
2. **Your Projects** — list of things you've built with descriptions
3. **Content Preferences** — post styles you like, topics to avoid, preferred platforms (X, LinkedIn)
4. **Vercel Project Setup** — create project, connect PostgreSQL (Neon or Supabase), set env vars
5. **Cloudinary Account** — for storing generated/uploaded images
6. **Groq API Key** — for LLM inference
7. **Resend API Key** — for email notifications

---

## App Modules

---

### Module 1: Authentication
**Tech:** NextAuth.js v5

- Single-user auth (just you). Email + password or magic link via Resend.
- Protected routes — entire app behind auth.
- Session management.

**Human input:** Your email address for the admin account.

---

### Module 2: Profile & Context Manager
**Tech:** Prisma + PostgreSQL, React Hook Form + Zod, shadcn/ui

This is the "brain" of the agent. Everything the AI generates is based on this.

**What it stores:**
- Your name, bio, tagline
- Skills list
- Projects (name, description, URL, tech stack)
- Content tone (professional / casual / witty)
- Platforms you post on
- Topics to focus on
- Topics to avoid

**UI:** A settings-style form page where you fill in and update your context anytime.

**Human input:** Fill this out completely before generating any content. Quality of output depends entirely on this.

---

### Module 3: Content Generation Engine
**Tech:** Vercel AI SDK, Groq, Prisma

The core AI module. Takes your profile context and generates content.

**Content types it can generate:**
- Short post (X-style, under 280 chars)
- Long post (LinkedIn-style, 150–300 words)
- Article outline + full article
- Image caption + suggested image concept
- Thread (X multi-post)

**How it works:**
1. Pulls your full profile context from the database
2. Selects a content type (rotated or random)
3. Selects a topic angle (your projects, your skills, lessons learned, behind-the-scenes)
4. Calls Groq via AI SDK with a structured prompt
5. Returns generated content
6. Saves it to the database as a draft with status `PENDING`

**Human input:** None at generation time — this runs automatically. But you set the rotation logic in settings.

---

### Module 4: Content Queue & Dashboard
**Tech:** TanStack React Query, shadcn/ui, Framer Motion, Zustand

The main UI you interact with daily.

**What it shows:**
- List of all pending/approved/posted content
- Each card shows: content preview, platform target, content type, generated date, status
- Actions per card: Approve, Edit, Reject, Copy to Clipboard, Mark as Posted

**Statuses:**
- `PENDING` — just generated, awaiting your review
- `APPROVED` — you've reviewed and approved
- `POSTED` — you've manually posted it
- `REJECTED` — discarded

**Human input:** Daily — open dashboard, review pending content, approve or reject, copy and post manually.

---

### Module 5: Content Editor
**Tech:** React Hook Form + Zod, shadcn/ui

When you want to tweak AI-generated content before posting.

- Inline edit of any draft
- Regenerate button — re-calls the AI with same context
- Platform toggle (X vs LinkedIn — adjusts character limits and tone guidance)
- Save changes back to DB

---

### Module 6: Image Module
**Tech:** Cloudinary, Groq (for caption generation)

Handles images for posts that need them.

**Two flows:**
1. **AI suggests image concept** — generates a text description of what image would work well. You source/create the image yourself and upload it.
2. **Upload your own** — upload screenshots of your work, profile photos, project images. These get stored in Cloudinary and attached to content cards.

**Human input:** Upload your own images periodically. Source images based on AI concept suggestions.

> Note: Automatic AI image generation (DALL-E/Replicate) can be added in v2.

---

### Module 7: Scheduler (Cron Job)
**Tech:** Vercel Cron Jobs

Runs the content generation engine automatically.

**Schedule:** Once per day (e.g., 7AM your timezone)

**What it does:**
1. Checks how many `PENDING` items are in the queue
2. If below a threshold (e.g., less than 3), triggers content generation
3. Generates 1–3 new pieces of content
4. Sends you an email notification (via Resend) that new content is ready to review

**Human input:** Set your preferred threshold and schedule in settings. Confirm Vercel cron is enabled in project settings.

---

### Module 8: Notification System
**Tech:** Resend + React Email, Sonner (in-app toasts)

**Email notifications for:**
- New content generated and ready for review
- Weekly summary (how many posts approved/posted that week)

**In-app toasts for:**
- Content saved
- Generation complete
- Copy to clipboard confirmed

**Human input:** Confirm your notification email address. Adjust frequency in settings if needed.

---

### Module 9: Analytics (Lightweight)
**Tech:** Prisma + PostgreSQL, Recharts or shadcn charts

Simple internal tracking — no third-party analytics needed.

**Tracks:**
- Total posts generated
- Total posts approved vs rejected
- Total marked as posted
- Content type breakdown
- Weekly activity

**UI:** A simple stats page / dashboard widget.

---

## Database Schema (Overview)

| Table | Purpose |
|---|---|
| `User` | Auth — single user |
| `Profile` | Your context, bio, skills, tone |
| `Project` | Your projects/products |
| `ContentItem` | Every generated piece of content |
| `ContentImage` | Images attached to content |
| `GenerationLog` | Log of each cron run |

---

## Environment Variables Required

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
GROQ_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
CRON_SECRET  (to secure the cron endpoint)
```

---

## Build Order (Recommended Sequence for Your AI Agent)

1. **Project scaffold** — Next.js 14, TypeScript, Tailwind, shadcn/ui, Prisma setup
2. **Database schema** — define all models, run migration
3. **Auth** — NextAuth.js with email login
4. **Profile & Context module** — form + DB read/write
5. **Content generation engine** — AI SDK + Groq integration, prompt logic
6. **Content queue dashboard** — list, status, copy, approve/reject
7. **Content editor** — inline edit + regenerate
8. **Cron job** — Vercel cron endpoint + generation trigger
9. **Email notifications** — Resend + React Email templates
10. **Image module** — Cloudinary upload + attachment to content
11. **Analytics page** — charts + stats
12. **Polish** — Framer Motion animations, loading states, empty states, error boundaries

---

## What You Do Daily (Once Built)

1. Receive email: "You have 2 new posts ready to review"
2. Open app dashboard
3. Read each post, edit if needed, approve
4. Copy approved content
5. Paste to X / LinkedIn
6. Mark as posted in the app
7. Done — under 5 minutes

---

## V2 Ideas (After MVP)

- Buffer API integration for direct posting
- DALL-E / Replicate for auto image generation
- Multi-user support
- Post performance tracking (manual input of likes/views)
- Content calendar view
- Generate content based on trending topics (web search tool)