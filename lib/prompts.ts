import type { Profile, Project, ContentType, Platform, Tone } from '@/types'

interface PromptResult {
  system: string
  user: string
}

const toneInstructions: Record<Tone, string> = {
  PROFESSIONAL: 'Use a clear, authoritative, and professional tone.',
  CASUAL: 'Use a conversational, friendly, and approachable tone.',
  WITTY: 'Use a witty, sharp, and slightly humorous tone while staying professional.',
}

const contentTypeInstructions: Record<ContentType, string> = {
  SHORT_POST:
    'Write a single post under 280 characters. One clear idea. Optional 1-2 hashtags.',
  LONG_POST:
    'Write a LinkedIn post 150–300 words. Hook in first line. 3–5 short paragraphs. End with a question or soft CTA.',
  ARTICLE:
    'Write an article 500–800 words. Include a title on the first line. 4–6 sections with clear points.',
  THREAD:
    'Write an X thread of 3–6 posts. First post is the hook. Each post is standalone. Number each post (1/, 2/, etc.).',
  IMAGE_CAPTION:
    'Write an image caption 1–3 sentences. Describe what the image represents. End with a CTA or question.',
}

const platformContexts: Record<Platform, string> = {
  X: 'This is for X (Twitter). Keep it concise, punchy, and engaging. Character limit: 280 for single posts.',
  LINKEDIN:
    'This is for LinkedIn. Professional but personable. Longer form content works well. Engage with professional insights.',
  TIKTOK: 'This is for TikTok. Short, engaging, and trend-aware content.',
  MEDIUM: 'This is for Medium. Long-form, in-depth content with clear structure.',
  INSTAGRAM: 'This is for Instagram. Visual-first with engaging captions.',
  YOUTUBE: 'This is for YouTube. Video-focused with compelling titles and descriptions.',
  WHATSAPP: 'This is for WhatsApp status. Short, personal, and direct.',
  REDDIT: 'This is for Reddit. Authentic, community-focused content.',
}

export function buildPrompt(
  profile: Profile,
  project: Project | null,
  contentType: ContentType,
  platform: Platform
): PromptResult {
  const toneInstruction = toneInstructions[profile.tone]
  const contentInstruction = contentTypeInstructions[contentType]
  const platformContext = platformContexts[platform] || 'Create engaging content for this platform.'

  const systemMessage = `You are a professional content writer creating marketing content for a software engineer.

AUTHOR CONTEXT:
- Name: ${profile.bio.split('\n')[0] || 'A software engineer'}
- Bio: ${profile.bio}
- Tagline: ${profile.tagline}
- Tone: ${toneInstruction}

PLATFORM CONTEXT:
${platformContext}

OUTPUT RULE:
Return only the content itself. No preamble, no explanation, no quotes around the output. Just the raw content ready to post.

IMPORTANT: After the main content, include an image concept suggestion on a new line starting with "IMAGE CONCEPT:". This should be a brief description of what kind of image would work well with this content. For example: "IMAGE CONCEPT: A screenshot of a code editor showing a React component with syntax highlighting"`

  let userMessage = `${contentInstruction}

SKILLS: ${profile.skills.join(', ')}

FOCUS TOPICS: ${profile.focusTopics.join(', ') || 'General software engineering topics'}

AVOID THESE TOPICS: ${profile.avoidTopics.join(', ') || 'None specified'}`

  if (project) {
    userMessage += `

PROJECT CONTEXT:
- Name: ${project.name}
- Description: ${project.description}
- Tech Stack: ${project.techStack.join(', ')}
- URL: ${project.url || 'Not specified'}

Consider mentioning or relating to this project in your content.`
  }

  return {
    system: systemMessage,
    user: userMessage,
  }
}
