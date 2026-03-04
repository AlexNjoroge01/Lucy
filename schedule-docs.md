#.Schedule Module

The scheduling module allows users to create automated content generation schedules. Users can select multiple platforms, multiple content types, multiple dates, and set recurrence patterns.

## Features

- **Multi-Platform Selection**: Choose multiple platforms (X, LinkedIn, Facebook, TikTok, Instagram, YouTube, Medium)
- **Multi-Content Types**: Select multiple content types (Short Post, Long Post, Article, Thread, Image Caption)
- **Multi-Date Selection**: Pick multiple dates from an interactive calendar
- **Recurrence Options**: One-time, Daily, Weekly, Monthly
- **Calendar View**: Visual calendar showing all scheduled dates
- **Manual Execution**: "Run Now" button to execute due schedules immediately

## Database Schema

```prisma
model Schedule {
  id             String         @id @default(cuid())
  userId         String
  projectId      String
  platforms      Platform[]     // Multiple platforms
  contentTypes   ContentType[]  // Multiple content types
  scheduledDates DateTime[]     // Multiple dates
  timeOfDay      String         @default("09:00") // HH:MM format
  status         ScheduleStatus @default(PENDING)
  recurrence     RecurrenceType @default(NONE)
  createdAt      DateTime       @default(now())
  executedDates  DateTime[]     // Track executed dates
  lastExecutedAt DateTime?
  error          String?
}
```

## API Routes

- `GET /api/schedules` - List all schedules for authenticated user
- `POST /api/schedules` - Create a new schedule
- `DELETE /api/schedules/[id]` - Cancel/delete a schedule
- `POST /api/schedules/execute` - Execute due schedules (manual or cron)

## Automatic Execution Setup

Since Vercel Cron Jobs have been removed, use an external cron service like **cron-job.org**:

1. **Sign up** at https://cron-job.org (free)
2. **Create a new cron job**:
   - **URL**: `https://your-app.com/api/schedules/execute`
   - **Method**: POST
   - **Headers**: 
     - `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule**: Every 5 minutes (or your preferred interval)
3. **Set CRON_SECRET** in your environment variables (same value used in the cron job header)

Alternatively, you can use the **"Run Now"** button on the Schedules page to manually execute due schedules.

## Environment Variables

Add to your `.env`:
```env
CRON_SECRET=your-secret-key-here