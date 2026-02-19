'use client'

import { useProfile } from '@/hooks/useProfile'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function ProfilePage() {
  const { data: profile } = useProfile()

  const isProfileEmpty = !profile || !profile.bio || !profile.tagline

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Configure your profile to personalize AI-generated content
        </p>
      </div>

      {isProfileEmpty && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            Fill in your profile before generating content. The quality of AI-generated
            content depends on the information you provide.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg border p-6">
        <ProfileForm />
      </div>
    </div>
  )
}
