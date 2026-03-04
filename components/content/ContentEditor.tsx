'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useContentItem, useUpdateContent, useGenerateContent } from '@/hooks/useContent'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { toast } from 'sonner'
import { Loader2, RefreshCw, Save, ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import type { ContentType, Platform } from '@/types'

interface ContentEditorProps {
  id: string
}

interface ContentEditorFormData {
  body: string
}

const contentTypeLabels: Record<string, string> = {
  SHORT_POST: 'Short Post',
  LONG_POST: 'Long Post',
  ARTICLE: 'Article',
  THREAD: 'Thread',
  IMAGE_CAPTION: 'Image Caption',
}

export function ContentEditor({ id }: ContentEditorProps) {
  const { data: item, isLoading } = useContentItem(id)
  const { data: projects } = useProjects()
  const updateContent = useUpdateContent()
  const generateContent = useGenerateContent()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<ContentEditorFormData>({
    defaultValues: {
      body: '',
    },
  })

  // Update form when item loads
  React.useEffect(() => {
    if (item) {
      setValue('body', item.body)
    }
  }, [item, setValue])

  const body = watch('body')

  const onSubmit = async (data: ContentEditorFormData) => {
    try {
      await updateContent.mutateAsync({ id, data: { body: data.body } })
      toast.success('Content saved successfully')
    } catch {
      toast.error('Failed to save content')
    }
  }

  const handleRegenerate = async () => {
    if (!item) return

    try {
      const result = await generateContent.mutateAsync({
        contentType: item.type as ContentType,
        platform: item.platform as Platform,
        projectId: item.projectId || undefined,
      })
      setValue('body', result.body)
      toast.success('Content regenerated')
    } catch {
      toast.error('Failed to regenerate content')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url, publicId } = await response.json()

      // Update content with image
      await updateContent.mutateAsync({
        id,
        data: {
          imageUrl: url,
          imagePublicId: publicId,
        },
      })

      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!item?.imagePublicId) return

    try {
      // Call API to remove image
      await updateContent.mutateAsync({
        id,
        data: {
          imageUrl: null,
          imagePublicId: null,
        },
      })
      toast.success('Image removed')
    } catch {
      toast.error('Failed to remove image')
    }
  }

  const getCharacterCount = () => {
    return body?.length || 0
  }

  const getCharacterLimit = () => {
    if (!item) return 280
    return item.platform === 'X' && item.type === 'SHORT_POST' ? 280 : 1000
  }

  const isOverLimit = getCharacterCount() > getCharacterLimit()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Content not found</p>
        <Link href="/queue">
          <Button variant="link">Back to Queue</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/queue"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Queue
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlatformBadge platform={item.platform} />
            <StatusBadge status={item.status} />
            <span className="text-sm text-muted-foreground">
              {contentTypeLabels[item.type]}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">Content</Label>
            <span
              className={`text-sm ${
                isOverLimit ? 'text-red-500 font-medium' : 'text-muted-foreground'
              }`}
            >
              {getCharacterCount()} / {getCharacterLimit()}
            </span>
          </div>
          <Textarea
            id="body"
            rows={12}
            className="resize-none"
            {...register('body')}
          />
        </div>

        {/* Image Concept Suggestion */}
        {item.imageConcept && (
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-start gap-3">
              <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Suggested Image Concept</p>
                <p className="text-sm text-muted-foreground">{item.imageConcept}</p>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Section */}
        <div className="space-y-3">
          <Label>Image</Label>
          
          {item.imageUrl ? (
            <div className="relative inline-block">
              <img
                src={item.imageUrl}
                alt="Content image"
                className="max-w-full h-auto rounded-lg border max-h-64 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Image
              </Button>
              <span className="text-sm text-muted-foreground">
                Upload your own image based on the concept suggestion above
              </span>
            </div>
          )}
        </div>

        {item.project && (
          <div className="text-sm text-muted-foreground">
            Project: {item.project.name}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isDirty || updateContent.isPending}>
            {updateContent.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRegenerate}
            disabled={generateContent.isPending}
          >
            {generateContent.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerate
          </Button>
        </div>
      </form>
    </div>
  )
}
