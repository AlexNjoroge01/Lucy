'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Mobile Navigation */}
          <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header onMenuClick={() => setMobileNavOpen(true)} />
            <main className="flex-1 overflow-auto bg-muted/30">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </SessionProvider>
  )
}
