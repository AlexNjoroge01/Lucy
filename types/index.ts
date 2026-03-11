export type ContentStatus = 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED'
export type Platform = 'X' | 'LINKEDIN' | 'FACEBOOK' | 'TIKTOK' | 'MEDIUM' | 'INSTAGRAM' | 'YOUTUBE' | 'WHATSAPP' | 'REDDIT'
export type ContentType = 'SHORT_POST' | 'LONG_POST' | 'ARTICLE' | 'THREAD' | 'IMAGE_CAPTION'
export type Tone = 'PROFESSIONAL' | 'CASUAL' | 'WITTY'
export type ScheduleStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'

// Admin & RBAC Types
export type UserRole = 'ADMIN' | 'USER' | 'MODERATOR'

export interface Role {
  id: string
  name: UserRole
  description?: string | null
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface UserWithRoles {
  id: string
  email: string
  name?: string | null
  image?: string | null
  createdAt: string
  updatedAt: string
  roles: Role[]
  _count?: {
    contentItems: number
    projects: number
    schedules: number
  }
}

export interface AuditLog {
  id: string
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  details?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  user?: {
    id: string
    email: string
    name?: string | null
  } | null
}

export interface AdminMetrics {
  // User metrics
  totalUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  activeUsersToday: number

  // Content metrics
  totalContent: number
  contentByStatus: {
    PENDING: number
    APPROVED: number
    POSTED: number
    REJECTED: number
  }
  contentByPlatform: Record<Platform, number>
  contentCreatedToday: number
  contentCreatedThisWeek: number
  contentCreatedThisMonth: number

  // Project metrics
  totalProjects: number
  activeProjects: number
  projectsCreatedThisMonth: number

  // Schedule metrics
  totalSchedules: number
  schedulesByStatus: {
    PENDING: number
    ACTIVE: number
    COMPLETED: number
    FAILED: number
    CANCELLED: number
  }

  // System metrics
  totalAuditLogs: number
  auditLogsToday: number
  lastCronRun?: string | null
}

export interface TimeSeriesData {
  date: string
  users: number
  content: number
  projects: number
}

export interface RecentActivity {
  id: string
  action: string
  entity: string
  description: string
  user: {
    id: string
    email: string
    name?: string | null
  } | null
  timestamp: string
}

export interface ContentItem {
  id: string
  userId: string
  projectId?: string | null
  type: ContentType
  platform: Platform
  body: string
  imageConcept?: string | null
  status: ContentStatus
  imageUrl?: string | null
  imagePublicId?: string | null
  generatedAt: string
  approvedAt?: string | null
  postedAt?: string | null
  project?: Project | null
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
  generationTime: string
  timezone: string
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

export interface Schedule {
  id: string
  userId: string
  projectId: string
  platforms: Platform[]
  contentTypes: ContentType[]
  scheduledDates: string[]
  timeOfDay: string
  status: ScheduleStatus
  recurrence: RecurrenceType
  createdAt: string
  executedDates: string[]
  lastExecutedAt?: string | null
  error?: string | null
  project?: Project
}

export interface ContentFilters {
  status?: ContentStatus | 'ALL'
  platform?: Platform | 'ALL'
  type?: ContentType | 'ALL'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
}
