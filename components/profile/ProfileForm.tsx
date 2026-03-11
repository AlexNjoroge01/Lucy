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
  generationTime: string
  timezone: string
}

// Common timezones
const commonTimezones = [
  { value: 'Africa/Nairobi', label: 'East Africa (Nairobi) UTC+3' },
  { value: 'Africa/Lagos', label: 'West Africa (Lagos) UTC+1' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (Paris) UTC+1' },
  { value: 'America/New_York', label: 'Eastern Time (New York) UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (Chicago) UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (Denver) UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles) UTC-8' },
  { value: 'Asia/Dubai', label: 'Dubai UTC+4' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata) UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney UTC+10/11' },
]

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
      generationTime: '07:00',
      timezone: 'Africa/Nairobi',
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
        generationTime: profile.generationTime || '07:00',
        timezone: profile.timezone || 'Africa/Nairobi',
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
        generationTime: data.generationTime,
        timezone: data.timezone,
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
        <p className="text-sm text-muted-foreground mb-2">
          Select the platforms you want to create content for
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { value: 'X', label: 'X (Twitter)' },
            { value: 'LINKEDIN', label: 'LinkedIn' },
            { value: 'FACEBOOK', label: 'Facebook' },
            { value: 'TIKTOK', label: 'TikTok' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'INSTAGRAM', label: 'Instagram' },
            { value: 'YOUTUBE', label: 'YouTube' },
            { value: 'WHATSAPP', label: 'WhatsApp' },
            { value: 'REDDIT', label: 'Reddit' },
          ] as { value: Platform; label: string }[]).map((platform) => (
            <label
              key={platform.value}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                watchedPlatforms?.includes(platform.value)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="checkbox"
                checked={watchedPlatforms?.includes(platform.value)}
                onChange={(e) => {
                  const current = watchedPlatforms || []
                  if (e.target.checked) {
                    setValue('platforms', [...current, platform.value])
                  } else {
                    setValue(
                      'platforms',
                      current.filter((p) => p !== platform.value)
                    )
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm">{platform.label}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Label htmlFor="generationTime">Generation Time</Label>
          <Input
            id="generationTime"
            type="time"
            {...register('generationTime')}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            e.g., 13:00 for 1:00 PM, 15:00 for 3:00 PM
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            {...register('timezone')}
          >
            {commonTimezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
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
