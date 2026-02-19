'use client'

import { use } from 'react'
import { ContentEditor } from '@/components/content/ContentEditor'

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params)

  return (
    <div className="p-6">
      <ContentEditor id={id} />
    </div>
  )
}
