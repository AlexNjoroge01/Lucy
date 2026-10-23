# 🤖 Lucy — AI Marketing Agent

**Lucy** is an AI-powered social media content generator that turns your developer profile into a personal marketing team. Fill in your bio, skills and projects once — Lucy then writes ready-to-publish posts, threads and articles for **X, LinkedIn, Facebook, TikTok, Medium, Instagram, YouTube, WhatsApp and Reddit**, using LLMs running on [Groq](https://groq.com).

You review everything before it goes out: approve, edit, reject or mark as posted — from a clean dashboard with analytics and scheduled automation.

---

## ✨ Features

- **AI Content Generation** — generates 5 content types (short posts, long posts, articles, threads, image captions) tuned to your tone (`Professional` / `Casual` / `Witty`) and the character limits & style norms of each platform.
- **Profile Engine** — your bio, tagline, skills, focus topics, avoid-topics and posting preferences are baked into every prompt. Lucy writes *like you*.
- **Projects** — attach your apps/repos (name, description, tech stack) as context so generated content can promote your actual work.
- **Review Queue** — filter by status / platform / type, then approve, reject, edit, copy or mark items as posted. Track where every piece of content stands.
- **Inline Editor** — edit generated text with live character counts (over-limit warnings), regenerate on demand, and attach images via drag-and-drop (hosted on Cloudinary).
- **Schedules & Recurrence** — automate generation: pick platforms, content types, dates and a daily time, with daily / weekly / monthly recurrence. Run on a cron or manually with the **Run Now** button.
- **Analytics** — generation trends over the last 30 days, status & platform breakdowns, approval rate, and a run log of every generation.
- **Admin Dashboard** — role-based access control (ADMIN / MODERATOR / USER), user management with role assignment, system metrics and audit logs of every action.
- **Auth** — email + password registration and login with sessions handled by NextAuth.js v5.

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, full-stack) · TypeScript |
| UI | [Tailwind CSS v4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) · [Framer Motion](https://www.framer.com/motion/) · [Lucide](https://lucide.dev) |
| State / Data | [TanStack React Query](https://tanstack.com/query) · [Zustand](https://zustand-demo.pmnd.rs) · [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Database | [PostgreSQL](https://www.postgresql.org) via [Prisma 7](https://www.prisma.io) |
| Auth | [NextAuth.js v5](https://authjs.dev) (credentials provider, JWT sessions, bcrypt) |
| AI | [Groq](https://groq.com) (`llama-3.3-70b-versatile`) via the [Vercel AI SDK](https://sdk.vercel.ai) |
| Storage | [Cloudinary](https://cloudinary.com) |
| Email (configured, not yet wired) | [Resend](https://resend.com) |
| Charts | [Recharts](https://recharts.org) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.9+** — [download](https://nodejs.org)
- **pnpm** (recommended package manager — this repo ships a `pnpm-lock.yaml`):
  ```bash
  npm install -g pnpm
  ```
- A **PostgreSQL database** — the easiest free options are [Neon](https://neon.tech), [Supabase](https://supabase.com) or [Prisma Postgres](https://www.prisma.io/postgres). A local PostgreSQL instance works too.

### API Keys You'll Need

| Service | Where to get it | Required? |
|---|---|---|
| Groq | [console.groq.com/keys](https://console.groq.com/keys) (free) | ✅ Yes — powers content generation |
| Cloudinary | [console.cloudinary.com](https://console.cloudinary.com) (free tier) | Only for image uploads |
| Resend | [resend.com/api-keys](https://resend.com/api-keys) (free tier) | Only for email notifications (configured in `lib/resend.ts`, not yet wired to flows) |

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/lucy.git
cd lucy
pnpm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET="same value as NEXTAUTH_SECRET"
AUTH_URL=http://localhost:3000
GROQ_API_KEY="gsk_..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="you@yourdomain.com"
NOTIFICATION_EMAIL="you@yourdomain.com"
CRON_SECRET="any long random string"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Generate an auth secret with `openssl rand -base64 32` (or any random string).

### 3. Set Up the Database

Run the included Prisma migrations to create all tables:

```bash
pnpm exec prisma migrate dev
```

### 4. (Optional) Seed the Database

The seed script creates the three built-in roles (`ADMIN`, `USER`, `MODERATOR`) and an admin user:

```bash
npx tsx prisma/seed.ts
```

Set your admin credentials in `.env` **before** seeding (passwords are hashed with bcrypt on seed):

```env
ADMIN_EMAIL="you@yourdomain.com"
ADMIN_PASSWORD="a-strong-password-of-your-choice"
```

If you don't set them, the script falls back to `admin@example.com` / `ChangeMe123!` for local testing only. You can also promote an existing user to admin later through the admin dashboard.

> See [`admin.md`](./admin.md) for full documentation of the admin system, roles and permissions.

### 5. Run It

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the marketing page. **Register an account**, then:

1. **`/profile`** — fill in your bio, skills, tone and platforms. *(Do this first: generation quality depends on it.)*
2. **`/projects`** — add the projects you want to promote.
3. **`/dashboard`** — hit **Generate Now** and watch content appear.
4. **`/queue`** — review, edit and approve what Lucy wrote.

---

## 📜 Available Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server on `http://localhost:3000` |
| `pnpm build` | Generate the Prisma client and build for production |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm exec prisma studio` | Browse your database in a GUI |

---

## ⏰ Automating Scheduled Generation

The `POST /api/schedules/execute` endpoint runs all schedules that are due. It accepts either an **authenticated session** (that's the "Run Now" button) or a **cron secret header** for automated calls:

```bash
curl -X POST https://your-app.com/api/schedules/execute \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Point any external cron service (e.g. [cron-job.org](https://cron-job.org), GitHub Actions scheduled workflows, or Vercel Cron) at this endpoint — e.g. every hour — and your schedules will fire automatically.

---

## 🗂 Project Structure

```
app/
├── (auth)/login/           # Login page
├── (dashboard)/            # Dashboard shell: dashboard, queue, editor, profile,
│                           #   projects, schedules, analytics, admin
└── api/
    ├── auth/[...nextauth]/ # NextAuth handlers
    ├── register/           # Account creation
    ├── profile/            # GET / PUT profile
    ├── projects/           # Project CRUD (+ [id])
    ├── content/            # Content list, generate, and item CRUD (+ [id])
    ├── schedules/          # Schedule CRUD (+ [id], execute)
    ├── upload/             # Cloudinary image upload
    └── admin/              # Users, roles, metrics, audit logs
components/
├── landing/                # Marketing page sections
├── layout/                 # Sidebar, header, mobile nav
├── content/                # Cards, list, filters, editor
├── projects/ profile/ schedules/ shared/
└── ui/                     # shadcn/ui primitives
lib/                        # auth, prisma, groq, prompts, content-generator,
                            #   cloudinary, resend, utils
hooks/                      # React Query hooks per domain
stores/                     # Zustand UI state
prisma/                     # schema, migrations, seed
```

---

## 🔒 Protected Routes

`middleware.ts` gates `/dashboard`, `/queue`, `/editor`, `/profile`, `/projects`, `/schedules`, `/analytics` and `/admin` behind login (unauthenticated visitors are redirected to `/login`; logged-in users visiting `/login` are sent to the dashboard). Admin authorization is enforced in the API routes and admin pages.

---

## ☁️ Deploying

The project is ready to deploy on **Vercel** (`vercel.json` is already configured):

1. Push the repo to GitHub and import it into [Vercel](https://vercel.com/new).
2. Add every variable from `.env.example` in **Settings → Environment Variables**, using your production URLs for `NEXTAUTH_URL` / `AUTH_URL` / `NEXT_PUBLIC_APP_URL`.
3. Apply migrations against your production database:
   ```bash
   pnpm exec prisma migrate deploy
   ```
4. Deploy — `pnpm build` automatically runs `prisma generate` first.

You can also use any Node host (`pnpm build && pnpm start`) — plain Next.js, nothing Vercel-specific.

---

## 🗺 Roadmap

- [ ] Email notifications via Resend (client configured, needs wiring)
- [ ] Direct auto-publishing to platform APIs (X, LinkedIn, etc.)
- [ ] OAuth social login providers
- [ ] Multi-image and video support
- [ ] Real platform engagement analytics

---

## 📝 Notes

- Content generation runs on Groq's `llama-3.3-70b-versatile` model; swap it in `lib/groq.ts` if you prefer another model or provider.
- Never commit your real `.env` — it's excluded via `.gitignore`, and the checked-in `.env.example` is only a placeholder template.

---

<div align="center">
Built with Next.js · Prisma · Groq · shadcn/ui
</div>
