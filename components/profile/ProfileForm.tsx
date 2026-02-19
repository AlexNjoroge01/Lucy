'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Profile, Tone, Platform } from '@/types'

interface ProfileFormData {
  bio: string
  tagline: string
  skills: string
  tone: Tone
  platforms: Platform[]
  focusTopics: string
  avoidTopics: string
  postsPerDay: number
  generationHour: number
}

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      bio: '',
      tagline: '',
      skills: '',
      tone: 'PROFESSIONAL',
      platforms: [],
      focusTopics: '',
      avoidTopics: '',
      postsPerDay: 1,
      generationHour: 7,
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || '',
        tagline: profile.tagline || '',
        skills: profile.skills?.join(', ') || '',
        tone: profile.tone || 'PROFESSIONAL',
        platforms: profile.platforms || [],
        focusTopics: profile.focusTopics?.join(', ') || '',
        avoidTopics: profile.avoidTopics?.join(', ') || '',
        postsPerDay: profile.postsPerDay || 1,
        generationHour: profile.generationHour || 7,
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        bio: data.bio,
        tagline: data.tagline,
        skills: data.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        tone: data.tone,
        platforms: data.platforms,
        focusTopics: data.focusTopics
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        avoidTopics: data.avoidTopics
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        postsPerDay: data.postsPerDay,
        generationHour: data.generationHour,
      })
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const watchedPlatforms = watch('platforms')
  const watchedTone = watch('tone')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          placeholder="e.g., Full-stack developer passionate about building great products"
          {...register('tagline')}
        />
        <p className="text-sm text-muted-foreground">
          A short phrase that describes who you are
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself, your experience, and what you do..."
          rows={4}
          {...register('bio')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          placeholder="e.g., React, Node.js, TypeScript, Python"
          {...register('skills')}
        />
        <p className="text-sm text-muted-foreground">
          Comma-separated list of your skills
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tone</Label>
        <div className="flex gap-4">
          {(['PROFESSIONAL', 'CASUAL', 'WITTY'] as Tone[]).map((tone) => (
            <label
              key={tone}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                value={tone}
                checked={watchedTone === tone}
                onChange={() => setValue('tone', tone)}
                className="h-4 w-4"
              />
              <span className="capitalize">{tone.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Platforms</Label>
        <div className="flex gap-4">
          {(['X', 'LINKEDIN'] as Platform[]).map((platform) => (
            <label
              key={platform}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={watchedPlatforms?.includes(platform)}
                onChange={(e) => {
                  const current = watchedPlatforms || []
                  if (e.target.checked) {
                    setValue('platforms', [...current, platform])
                  } else {
                    setValue(
                      'platforms',
                      current.filter((p) => p !== platform)
                    )
                  }
                }}
                className="h-4 w-4"
              />
              <span>{platform === 'X' ? 'X (Twitter)' : 'LinkedIn'}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="focusTopics">Focus Topics</Label>
        <Input
          id="focusTopics"
          placeholder="e.g., web development, AI, startups"
          {...register('focusTopics')}
        />
        <p className="text-sm text-muted-foreground">
          Topics you want to focus on in your content
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avoidTopics">Topics to Avoid</Label>
        <Input
          id="avoidTopics"
          placeholder="e.g., politics, controversial topics"
          {...register('avoidTopics')}
        />
        <p className="text-sm text-muted-foreground">
          Topics you want to avoid in your content
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postsPerDay">Posts Per Day</Label>
          <Input
            id="postsPerDay"
            type="number"
            min={1}
            max={5}
            {...register('postsPerDay', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="generationHour">Generation Hour (0-23)</Label>
          <Input
            id="generationHour"
            type="number"
            min={0}
            max={23}
            {...register('generationHour', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={!isDirty}
        >
          Reset
        </Button>
        <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
          {updateProfile.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
