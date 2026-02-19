'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ContentList } from '@/components/content/ContentList'
import { ContentFilters } from '@/components/content/ContentFilters'
import { useGenerateContent } from '@/hooks/useContent'
import { useProfile } from '@/hooks/useProfile'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import type { ContentType, Platform } from '@/types'

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'SHORT_POST', label: 'Short Post' },
  { value: 'LONG_POST', label: 'Long Post' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'THREAD', label: 'Thread' },
  { value: 'IMAGE_CAPTION', label: 'Image Caption' },
]

const platforms: { value: Platform; label: string }[] = [
  { value: 'X', label: 'X (Twitter)' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
]

export default function QueuePage() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ContentType>('SHORT_POST')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('X')
  const generateContent = useGenerateContent()
  const { data: profile } = useProfile()

  const handleGenerate = async () => {
    try {
      await generateContent.mutateAsync({
        contentType: selectedType,
        platform: selectedPlatform,
      })
      toast.success('Content generated successfully')
      setGenerateDialogOpen(false)
    } catch {
      toast.error('Failed to generate content')
    }
  }

  const isProfileEmpty = !profile || !profile.bio || !profile.tagline

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Queue</h1>
          <p className="text-muted-foreground">
            Review, edit, and manage your AI-generated content
          </p>
        </div>
        <Button onClick={() => setGenerateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Now
        </Button>
      </div>

      <div className="mb-6">
        <ContentFilters />
      </div>

      <ContentList />

      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Content</DialogTitle>
          </DialogHeader>

          {isProfileEmpty && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Please complete your profile before generating content for better results.
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ContentType)}
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              >
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setGenerateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateContent.isPending}
              >
                {generateContent.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
