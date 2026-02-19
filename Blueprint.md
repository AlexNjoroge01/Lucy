# AI Marketing Agent — Technical Blueprint

## Stack
- **Framework:** Next.js 16.1.6 (App Router, Full Stack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms & Validation:** React Hook Form + Zod
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** NextAuth.js v5
- **State Management:** Zustand (client state)
- **Server State / Fetching:** TanStack React Query
- **Notifications (UI):** Sonner
- **Email:** Resend + React Email
- **File Storage:** Cloudinary
- **LLM:** Groq via Vercel AI SDK
- **Cron:** Vercel Cron Jobs

---

## Project File Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── queue/
│   │   │   └── page.tsx
│   │   ├── editor/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── content/
│       │   ├── generate/
│       │   │   └── route.ts          # POST — manual trigger generation
│       │   ├── [id]/
│       │   │   └── route.ts          # GET, PATCH, DELETE a content item
│       │   └── route.ts              # GET all content items (with filters)
│       ├── profile/
│       │   └── route.ts              # GET, PUT user profile + context
│       ├── projects/
│       │   ├── route.ts              # GET all, POST new project
│       │   └── [id]/
│       │       └── route.ts          # PATCH, DELETE project
│       ├── upload/
│       │   └── route.ts              # POST — Cloudinary image upload
│       └── cron/
│           ├── generate/
│           │   └── route.ts          # GET — daily content generation cron
│           └── weekly-summary/
│               └── route.ts          # GET — weekly summary email cron
├── components/
│   ├── ui/                           # shadcn/ui auto-generated components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── content/
│   │   ├── ContentCard.tsx
│   │   ├── ContentList.tsx
│   │   ├── ContentFilters.tsx
│   │   ├── ContentEditor.tsx
│   │   └── RegenerateButton.tsx
│   ├── profile/
│   │   ├── ProfileForm.tsx
│   │   └── ToneSelector.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── ProjectForm.tsx
│   ├── analytics/
│   │   └── StatsOverview.tsx
│   └── shared/
│       ├── CopyButton.tsx
│       ├── StatusBadge.tsx
│       ├── PlatformBadge.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── prisma.ts                     # Prisma client singleton
│   ├── groq.ts                       # Groq + AI SDK client setup
│   ├── cloudinary.ts                 # Cloudinary config + upload helper
│   ├── resend.ts                     # Resend client setup
│   ├── prompts.ts                    # All AI prompt templates
│   ├── content-generator.ts          # Core generation logic
│   └── utils.ts                      # General utility functions
├── stores/
│   └── useContentStore.ts            # Zustand store for UI filter state
├── hooks/
│   ├── useContent.ts                 # React Query hooks for content CRUD
│   ├── useProfile.ts                 # React Query hooks for profile
│   └── useProjects.ts                # React Query hooks for projects
├── emails/
│   ├── NewContentReady.tsx           # React Email template
│   └── WeeklySummary.tsx             # React Email template
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts                      # Shared TypeScript types
├── middleware.ts                      # Auth route protection
├── vercel.json                        # Cron schedule config
└── .env
```

---

## Database Schema — `prisma/schema.prisma`
Read the schema.prisam file. the schema has already been added
## Environment Variables — `.env`

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=you@yourdomain.com
NOTIFICATION_EMAIL=you@yourdomain.com
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Shared TypeScript Types — `types/index.ts`

```typescript
export type ContentStatus = 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED'
export type Platform = 'X' | 'LINKEDIN'
export type ContentType = 'SHORT_POST' | 'LONG_POST' | 'ARTICLE' | 'THREAD' | 'IMAGE_CAPTION'
export type Tone = 'PROFESSIONAL' | 'CASUAL' | 'WITTY'

export interface ContentItem {
  id: string
  userId: string
  projectId?: string
  type: ContentType
  platform: Platform
  body: string
  status: ContentStatus
  imageUrl?: string
  imagePublicId?: string
  generatedAt: string
  approvedAt?: string
  postedAt?: string
  project?: Project
}

export interface Profile {
  id: string
  userId: string
  bio: string
  tagline: string
  skills: string[]
  tone: Tone
  platforms: Platform[]
  focusTopics: string[]
  avoidTopics: string[]
  postsPerDay: number
  generationHour: number
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string
  url?: string
  techStack: string[]
  status: string
}

export interface GenerationLog {
  id: string
  triggeredBy: string
  itemsCount: number
  success: boolean
  error?: string
  createdAt: string
}

export interface ContentFilters {
  status?: ContentStatus | 'ALL'
  platform?: Platform | 'ALL'
  type?: ContentType | 'ALL'
  page?: number
  limit?: number
}
```

---

## Auth — `lib/auth.ts`

- NextAuth.js v5 with Credentials provider
- Hash passwords with bcryptjs on register, compare on login
- Session strategy: `jwt`
- Callbacks: include `user.id` in JWT token and session

## Middleware — `proxy.ts`

- Use NextAuth `auth()` to protect routes
- Redirect unauthenticated users to `/login`
- Matcher: `['/dashboard/:path*', '/queue/:path*', '/editor/:path*', '/profile/:path*', '/projects/:path*', '/analytics/:path*']`

---

## API Routes — Full Contracts

### `GET /api/profile`
Returns the profile for the authenticated user. If no profile exists, return `null`.

### `PUT /api/profile`
Upsert profile for authenticated user.
Request body: `Partial<Profile>` (all fields optional, merged with existing)

---

### `GET /api/projects`
Returns all projects for authenticated user ordered by `createdAt desc`.

### `POST /api/projects`
Request body: `{ name, description, url?, techStack[], status? }`
Returns created project.

### `PATCH /api/projects/[id]`
Request body: any subset of project fields.
Returns updated project.

### `DELETE /api/projects/[id]`
Deletes project. Returns `{ success: true }`.

---

### `GET /api/content`
Query params: `status`, `platform`, `type`, `page` (default 1), `limit` (default 10)
Returns: `{ items: ContentItem[], total: number, page: number }`

### `POST /api/content/generate`
Request body:
```json
{
  "contentType": "SHORT_POST | LONG_POST | ARTICLE | THREAD | IMAGE_CAPTION",
  "platform": "X | LINKEDIN",
  "projectId": "optional"
}
```
Calls `generateContent()` from `lib/content-generator.ts`.
Returns created `ContentItem`.

### `GET /api/content/[id]`
Returns single `ContentItem` by id.

### `PATCH /api/content/[id]`
Request body (any subset):
```json
{
  "body": "string",
  "status": "APPROVED | POSTED | REJECTED",
  "imageUrl": "string",
  "imagePublicId": "string"
}
```
When `status` changes to `APPROVED`, set `approvedAt = now()`.
When `status` changes to `POSTED`, set `postedAt = now()`.
Returns updated `ContentItem`.

### `DELETE /api/content/[id]`
If item has `imagePublicId`, delete from Cloudinary first.
Then delete DB record. Returns `{ success: true }`.

---

### `POST /api/upload`
Accepts `multipart/form-data` with field `file`.
Uploads to Cloudinary folder `marketing-agent/`.
Returns: `{ url: string, publicId: string }`

---

### `GET /api/cron/generate`
Header required: `Authorization: Bearer ${CRON_SECRET}`
Logic:
1. Get user from DB (single user app)
2. Count items with status `PENDING`
3. If count < 3, calculate how many to generate: `Math.min(3 - count, profile.postsPerDay)`
4. Loop and call `generateContent()` for each, alternating platforms and content types
5. Write `GenerationLog` record
6. If items were generated, call Resend to send `NewContentReady` email
7. Return `{ generated: N }`

### `GET /api/cron/weekly-summary`
Header required: `Authorization: Bearer ${CRON_SECRET}`
Logic:
1. Query last 7 days of ContentItems grouped by status
2. Send `WeeklySummary` email via Resend
3. Return `{ sent: true }`

---

## Core Logic — `lib/content-generator.ts`

```
export async function generateContent(
  userId: string,
  options: {
    contentType: ContentType
    platform: Platform
    projectId?: string
  }
): Promise<ContentItem>

Steps:
1. Fetch Profile for userId — throw if not found
2. Fetch Projects for userId
3. Select project: use options.projectId if provided, else pick random active project
4. Call buildPrompt(profile, project, options.contentType, options.platform)
5. Call Groq API via AI SDK:
   - model: "llama3-70b-8192"
   - max_tokens: 1000
   - messages: [{ role: "system", content: prompt.system }, { role: "user", content: prompt.user }]
6. Extract text from response
7. Clean the text (trim whitespace, remove surrounding quotes)
8. Create ContentItem in DB via Prisma
9. Return ContentItem
```

---

## Prompt Architecture — `lib/prompts.ts`

```
export function buildPrompt(
  profile: Profile,
  project: Project | null,
  contentType: ContentType,
  platform: Platform
): { system: string; user: string }
```

**System message must include:**
- Role: "You are a professional content writer creating marketing content for a software engineer."
- Author context: name, bio, tagline, tone instruction
- Platform context: character limits, style norms for X vs LinkedIn
- Output rule: "Return only the content itself. No preamble, no explanation, no quotes around the output."

**User message must include:**
- Instruction for the content type (see below)
- Skills list: join with commas
- Project context if available: name, description, tech stack
- Focus topics as guidance
- Avoid topics as negative constraint

**Content type instructions:**

| Type | Instruction |
|---|---|
| SHORT_POST | Write a single post under 280 characters. One clear idea. Optional 1-2 hashtags. |
| LONG_POST | Write a LinkedIn post 150–300 words. Hook in first line. 3–5 short paragraphs. End with a question or soft CTA. |
| ARTICLE | Write an article 500–800 words. Include a title on the first line. 4–6 sections with clear points. |
| THREAD | Write an X thread of 3–6 posts. First post is the hook. Each post is standalone. Number each post (1/, 2/, etc.). |
| IMAGE_CAPTION | Write an image caption 1–3 sentences. Describe what the image represents. End with a CTA or question. |

**Tone mapping:**
- `PROFESSIONAL` → "Use a clear, authoritative, and professional tone."
- `CASUAL` → "Use a conversational, friendly, and approachable tone."
- `WITTY` → "Use a witty, sharp, and slightly humorous tone while staying professional."

---

## Zustand Store — `stores/useContentStore.ts`

```typescript
interface ContentStore {
  selectedStatus: ContentStatus | 'ALL'
  selectedPlatform: Platform | 'ALL'
  selectedType: ContentType | 'ALL'
  setFilter: (key: 'selectedStatus' | 'selectedPlatform' | 'selectedType', value: string) => void
  resetFilters: () => void
}
```

Initial state: all filters set to `'ALL'`.

---

## React Query Hooks

### `hooks/useContent.ts`
- `useContentList(filters: ContentFilters)` — GET `/api/content` with filter params as query string
- `useContentItem(id: string)` — GET `/api/content/[id]`
- `useUpdateContent()` — PATCH mutation → on success invalidate `['content']` query key
- `useDeleteContent()` — DELETE mutation → on success invalidate `['content']` query key
- `useGenerateContent()` — POST mutation → on success invalidate `['content']` query key

### `hooks/useProfile.ts`
- `useProfile()` — GET `/api/profile`, query key `['profile']`
- `useUpdateProfile()` — PUT mutation → on success invalidate `['profile']`

### `hooks/useProjects.ts`
- `useProjects()` — GET `/api/projects`, query key `['projects']`
- `useCreateProject()` — POST mutation → invalidate `['projects']`
- `useUpdateProject()` — PATCH mutation → invalidate `['projects']`
- `useDeleteProject()` — DELETE mutation → invalidate `['projects']`

---

## Component Specs

### `ContentCard.tsx`
Props: `item: ContentItem`
Renders:
- `PlatformBadge` (X or LinkedIn)
- `StatusBadge` (color coded: yellow=PENDING, green=APPROVED, blue=POSTED, red=REJECTED)
- Content type label
- Body text truncated to 3 lines with "expand" toggle
- Generated date (relative: "2 hours ago")
- Action buttons: Edit (→ `/editor/[id]`), Copy (`CopyButton`), Approve, Reject, Mark Posted
- On Approve: call `useUpdateContent` with `status: 'APPROVED'`
- On Reject: call `useUpdateContent` with `status: 'REJECTED'`
- On Mark Posted: call `useUpdateContent` with `status: 'POSTED'`
- Animate in with Framer Motion `fadeInUp` on mount

### `ContentFilters.tsx`
Reads from Zustand store. Renders 3 `Select` dropdowns (shadcn): Status, Platform, Type.
On change: call `setFilter` in store, which triggers React Query refetch via filter params changing.

### `ContentEditor.tsx`
Props: `id: string`
- Fetches item via `useContentItem(id)`
- Full `Textarea` for body (shadcn)
- Character count display — red when over platform limit (280 for X)
- Image upload zone: drag-and-drop or click → POST `/api/upload` → attach URL to item
- `RegenerateButton` — calls `useGenerateContent` with same type/platform, replaces body in form
- React Hook Form + Zod for validation
- Save button → `useUpdateContent`

### `ProfileForm.tsx`
- React Hook Form + Zod
- Fields: bio (textarea), tagline (input), skills (tag input), tone (`ToneSelector`), platforms (checkbox group), focusTopics (tag input), avoidTopics (tag input), postsPerDay (number 1-3), generationHour (select 0-23)
- Submit → `useUpdateProfile`
- Show Sonner toast on success/error

### `ProjectForm.tsx`
- Used in modal (shadcn Dialog)
- Fields: name, description, url, techStack (tag input), status (select)
- Submit → `useCreateProject` or `useUpdateProject`

---

## Page Specs

### `/dashboard`
- Stats row: 4 stat cards (total generated, pending review, approved this week, posted this week) — query from `/api/content` with different filters
- Section: "Needs Review" — show up to 5 PENDING items using `ContentCard`
- Button: "Generate Now" — opens modal with ContentType + Platform selectors → calls `/api/content/generate`
- Animate stats cards in with Framer Motion stagger

### `/queue`
- `ContentFilters` at top
- `ContentList` — paginated list of `ContentCard` components (10 per page)
- Pagination controls (shadcn Pagination)
- Empty state if no results

### `/editor/[id]`
- Full `ContentEditor` component
- Breadcrumb: Queue > Edit
- Back button

### `/profile`
- `ProfileForm` full page
- Warning banner if profile is empty: "Fill in your profile before generating content"

### `/projects`
- "Add Project" button top right → Dialog with `ProjectForm`
- `ProjectList` grid (2–3 cols)
- Each `ProjectCard`: name, description truncated, tech stack chips, edit/delete buttons

### `/analytics`
- Stats summary row (total generated, total posted, approval rate %)
- Line chart (recharts): items generated per day, last 30 days
- Two donut charts side by side: status breakdown, platform breakdown
- Table: last 10 `GenerationLog` records (time, trigger, count, success/fail)

---

## Email Templates

### `emails/NewContentReady.tsx`
- Subject: `"🎯 {N} new posts ready for review"`
- Body: brief message, number of new items, CTA button → `${APP_URL}/queue`

### `emails/WeeklySummary.tsx`
- Subject: `"📊 Your weekly content summary"`
- Body: generated count, approved count, posted count, link to dashboard

---

## Vercel Cron — `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/generate",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 8 * * 0"
    }
  ]
}
```

Both cron routes must validate `Authorization: Bearer ${CRON_SECRET}` header and return 401 if missing or invalid.

---

## Build Sequence (Execute in Order)

1. Scaffold Next.js 14 with TypeScript, Tailwind, shadcn/ui init
2. Install all dependencies (see stack above + bcryptjs, @ai-sdk/groq, cloudinary, resend, @react-email/components, recharts, framer-motion, zustand, @tanstack/react-query, next-auth@beta, prisma, zod, react-hook-form, sonner)
3. Configure `.env`
4. Write `prisma/schema.prisma` → run `npx prisma migrate dev --name init`
5. Write `lib/prisma.ts` (singleton pattern)
6. Write `types/index.ts`
7. Write `lib/auth.ts` + `middleware.ts`
8. Build `/login` page + auth layout
9. Write `lib/groq.ts`
10. Write `lib/prompts.ts`
11. Write `lib/content-generator.ts`
12. Write `lib/cloudinary.ts`
13. Write `lib/resend.ts`
14. Write all API routes in this order: `profile` → `projects` → `projects/[id]` → `content` → `content/generate` → `content/[id]` → `upload` → `cron/generate` → `cron/weekly-summary`
15. Write `stores/useContentStore.ts`
16. Write all React Query hooks
17. Build shared components: `StatusBadge`, `PlatformBadge`, `CopyButton`, `EmptyState`
18. Build layout: `Sidebar`, `Header`, `MobileNav`, dashboard layout wrapper
19. Build profile components → `/profile` page
20. Build project components → `/projects` page
21. Build content components: `ContentCard`, `ContentList`, `ContentFilters`, `RegenerateButton`, `ContentEditor`
22. Build `/queue` page
23. Build `/editor/[id]` page
24. Build `/dashboard` page
25. Build analytics components → `/analytics` page
26. Write email templates
27. Write `vercel.json`
28. Test full flow: login → fill profile → add project → generate content → edit → approve → mark posted