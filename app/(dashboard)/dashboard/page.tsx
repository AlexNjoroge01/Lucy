'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useContentList, useGenerateContent } from '@/hooks/useContent'
import { useProfile } from '@/hooks/useProfile'
import { useProjects } from '@/hooks/useProjects'
import { ContentCard } from '@/components/content/ContentCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  FileText,
  CheckCircle,
  Share2,
  Clock,
  Plus,
  Loader2,
  AlertTriangle,
  Check,
} from 'lucide-react'
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

export default function DashboardPage() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>(['SHORT_POST'])
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['X'])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const generateContent = useGenerateContent()
  const { data: profile } = useProfile()
  const { data: projects } = useProjects()

  // Fetch stats
  const { data: allContent } = useContentList({ page: 1, limit: 100 })
  const { data: pendingContent } = useContentList({ status: 'PENDING', page: 1, limit: 100 })
  const { data: approvedContent } = useContentList({ status: 'APPROVED', page: 1, limit: 100 })
  const { data: postedContent } = useContentList({ status: 'POSTED', page: 1, limit: 100 })

  // Calculate weekly stats
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const weeklyApproved = approvedContent?.items?.filter(
    (item) => new Date(item.generatedAt) >= weekAgo
  ).length || 0

  const weeklyPosted = postedContent?.items?.filter(
    (item) => item.postedAt && new Date(item.postedAt) >= weekAgo
  ).length || 0

  const stats = [
    {
      title: 'Total Generated',
      value: allContent?.total || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Review',
      value: pendingContent?.total || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Approved This Week',
      value: weeklyApproved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Posted This Week',
      value: weeklyPosted,
      icon: Share2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your AI marketing content
          </p>
        </div>
        <Button onClick={() => setGenerateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Now
        </Button>
      </div>

      {isProfileEmpty && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Complete your profile
                </p>
                <p className="text-sm text-yellow-700">
                  Fill in your profile to get better AI-generated content.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => (window.location.href = '/profile')}
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Needs Review Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Needs Review</h2>
        {pendingContent?.items && pendingContent.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingContent.items.slice(0, 5).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">
                No content pending review
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate New Content</DialogTitle>
          </DialogHeader>

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
