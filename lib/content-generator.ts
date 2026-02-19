import { generateText } from 'ai'
import { groqModel } from './groq'
import { buildPrompt } from './prompts'
import { prisma } from './prisma'
import type { ContentType, Platform, ContentItem, Profile, Project, ContentStatus, Tone } from '@/types'

interface GenerateContentOptions {
  contentType: ContentType
  platform: Platform
  projectId?: string
}

// Helper function to parse image concept from generated text
function parseImageConcept(text: string): { body: string; imageConcept: string | null } {
  const imageConceptMatch = text.match(/IMAGE CONCEPT:\s*(.+?)(?:\n|$)/i)
  
  if (imageConceptMatch) {
    const imageConcept = imageConceptMatch[1].trim()
    const body = text.replace(imageConceptMatch[0], '').trim()
    return { body, imageConcept }
  }
  
  return { body: text.trim(), imageConcept: null }
}

export async function generateContent(
  userId: string,
  options: GenerateContentOptions
): Promise<ContentItem> {
  // 1. Fetch Profile for userId
  const profile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw new Error('Profile not found. Please complete your profile first.')
  }

  // 2. Fetch Projects for userId
  const projects = await prisma.project.findMany({
    where: { userId },
  })

  // 3. Select project
  let selectedProject: Project | null = null
  if (options.projectId) {
    const found = projects.find((p) => p.id === options.projectId)
    if (found) {
      selectedProject = {
        id: found.id,
        userId: found.userId,
        name: found.name,
        description: found.description,
        url: found.url ?? undefined,
        techStack: found.techStack,
        status: found.status,
      }
    }
  } else if (projects.length > 0) {
    // Pick random active project
    const activeProjects = projects.filter((p) => p.status === 'active')
    const projectPool = activeProjects.length > 0 ? activeProjects : projects
    const randomProject = projectPool[Math.floor(Math.random() * projectPool.length)]
    selectedProject = {
      id: randomProject.id,
      userId: randomProject.userId,
      name: randomProject.name,
      description: randomProject.description,
      url: randomProject.url ?? undefined,
      techStack: randomProject.techStack,
      status: randomProject.status,
    }
  }

  // 4. Build prompt
  const profileData: Profile = {
    id: profile.id,
    userId: profile.userId,
    bio: profile.bio,
    tagline: profile.tagline,
    skills: profile.skills,
    tone: profile.tone as Tone,
    platforms: profile.platforms as Platform[],
    focusTopics: profile.focusTopics,
    avoidTopics: profile.avoidTopics,
    postsPerDay: profile.postsPerDay,
    generationTime: profile.generationTime,
    timezone: profile.timezone,
  }

  const prompt = buildPrompt(
    profileData,
    selectedProject,
    options.contentType,
    options.platform
  )

  // 5. Call Groq API via AI SDK
  const { text } = await generateText({
    model: groqModel,
    maxTokens: 1000,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ],
  })

  // 6. Parse image concept and clean the text
  const { body, imageConcept } = parseImageConcept(text)

  // 7. Create ContentItem in DB
  const contentItem = await prisma.contentItem.create({
    data: {
      userId,
      projectId: selectedProject?.id || null,
      type: options.contentType,
      platform: options.platform,
      body,
      imageConcept,
      status: 'PENDING',
    },
    include: {
      project: true,
    },
  })

  return {
    id: contentItem.id,
    userId: contentItem.userId,
    projectId: contentItem.projectId ?? undefined,
    type: contentItem.type as ContentType,
    platform: contentItem.platform as Platform,
    body: contentItem.body,
    imageConcept: contentItem.imageConcept ?? undefined,
    status: contentItem.status as ContentStatus,
    imageUrl: contentItem.imageUrl ?? undefined,
    imagePublicId: contentItem.imagePublicId ?? undefined,
    generatedAt: contentItem.generatedAt.toISOString(),
    approvedAt: contentItem.approvedAt?.toISOString(),
    postedAt: contentItem.postedAt?.toISOString(),
    project: contentItem.project
      ? {
          id: contentItem.project.id,
          userId: contentItem.project.userId,
          name: contentItem.project.name,
          description: contentItem.project.description,
          url: contentItem.project.url ?? undefined,
          techStack: contentItem.project.techStack,
          status: contentItem.project.status,
        }
      : undefined,
  }
}
