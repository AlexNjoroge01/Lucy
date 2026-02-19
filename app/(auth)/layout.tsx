'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
      <Toaster position="top-right" />
    </SessionProvider>
  )
}
