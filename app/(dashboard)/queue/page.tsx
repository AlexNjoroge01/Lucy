'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ContentList } from '@/components/content/ContentList'
import { ContentFilters } from '@/components/content/ContentFilters'
import { useGenerateContent } from '@/hooks/useContent'
import { useProfile } from '@/hooks/useProfile'
import { useProjects } from '@/hooks/useProjects'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Loader2, Check } from 'lucide-react'
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
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'REDDIT', label: 'Reddit' },
]

export default function QueuePage() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>(['SHORT_POST'])
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['X'])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const generateContent = useGenerateContent()
  const { data: profile } = useProfile()
  const { data: projects } = useProjects()

  const toggleType = (type: ContentType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one content type')
      return
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    try {
      // Generate content for each combination of type and platform
      const promises: Promise<void>[] = []

      for (const type of selectedTypes) {
        for (const platform of selectedPlatforms) {
          promises.push(
            generateContent.mutateAsync({
              contentType: type,
              platform: platform,
              projectId: selectedProjectId || undefined,
            }).then(() => {})
          )
        }
      }

      await Promise.all(promises)
      
      const totalItems = selectedTypes.length * selectedPlatforms.length
      toast.success(`Generated ${totalItems} content item${totalItems > 1 ? 's' : ''} successfully`)
      setGenerateDialogOpen(false)
      // Reset selections
      setSelectedTypes(['SHORT_POST'])
      setSelectedPlatforms(['X'])
      setSelectedProjectId('')
    } catch {
      toast.error('Failed to generate some content')
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate New Content</DialogTitle>
          </DialogHeader>

          {isProfileEmpty && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Please complete your profile before generating content for better results.
            </div>
          )}

          <div className="space-y-6">
            {/* Project Selector */}
            {projects && projects.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Project (Optional)</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Auto-select from active projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select a specific project or let Lucy choose automatically
                </p>
              </div>
            )}

            {/* Content Types - Multi-select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Types</label>
              <p className="text-xs text-muted-foreground mb-2">
                Select one or more content types to generate
              </p>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleType(type.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors ${
                      selectedTypes.includes(type.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selectedTypes.includes(type.value)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedTypes.includes(type.value) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms - Multi-select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Platforms</label>
              <p className="text-xs text-muted-foreground mb-2">
                Select one or more platforms for your content
              </p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => togglePlatform(platform.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                      selectedPlatforms.includes(platform.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selectedPlatforms.includes(platform.value)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedPlatforms.includes(platform.value) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedTypes.length > 0 && selectedPlatforms.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <span className="font-medium">Summary:</span> Will generate{' '}
                <span className="text-primary font-semibold">
                  {selectedTypes.length * selectedPlatforms.length} content item{selectedTypes.length * selectedPlatforms.length > 1 ? 's' : ''}
                </span>{' '}
                ({selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''} × {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''})
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setGenerateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateContent.isPending || selectedTypes.length === 0 || selectedPlatforms.length === 0}
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
