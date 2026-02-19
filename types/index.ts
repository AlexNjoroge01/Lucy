export type ContentStatus = 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED'
export type Platform = 'X' | 'LINKEDIN' | 'TIKTOK' | 'MEDIUM' | 'INSTAGRAM' | 'YOUTUBE' | 'WHATSAPP' | 'REDDIT'
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

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
}
