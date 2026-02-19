'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useContentList } from '@/hooks/useContent'
import { prisma } from '@/lib/prisma'
import {
  FileText,
  CheckCircle,
  XCircle,
  Share2,
  TrendingUp,
} from 'lucide-react'

export default function AnalyticsPage() {
  // Fetch all content for analytics
  const { data: allContent } = useContentList({ page: 1, limit: 1000 })
  const { data: pendingContent } = useContentList({ status: 'PENDING', page: 1, limit: 1000 })
  const { data: approvedContent } = useContentList({ status: 'APPROVED', page: 1, limit: 1000 })
  const { data: postedContent } = useContentList({ status: 'POSTED', page: 1, limit: 1000 })
  const { data: rejectedContent } = useContentList({ status: 'REJECTED', page: 1, limit: 1000 })

  const items = allContent?.items || []

  // Calculate stats
  const totalGenerated = allContent?.total || 0
  const totalPosted = postedContent?.total || 0
  const totalApproved = approvedContent?.total || 0
  const totalRejected = rejectedContent?.total || 0
  const approvalRate = totalGenerated > 0 
    ? Math.round(((totalApproved + totalPosted) / totalGenerated) * 100) 
    : 0

  // Status breakdown
  const statusBreakdown = [
    { name: 'Pending', value: pendingContent?.total || 0, color: '#EAB308' },
    { name: 'Approved', value: totalApproved, color: '#22C55E' },
    { name: 'Posted', value: totalPosted, color: '#3B82F6' },
    { name: 'Rejected', value: totalRejected, color: '#EF4444' },
  ]

  // Platform breakdown
  const xPosts = items.filter((item) => item.platform === 'X').length
  const linkedinPosts = items.filter((item) => item.platform === 'LINKEDIN').length

  const platformBreakdown = [
    { name: 'X (Twitter)', value: xPosts, color: '#1DA1F2' },
    { name: 'LinkedIn', value: linkedinPosts, color: '#0A66C2' },
  ]

  // Content type breakdown
  const contentTypeBreakdown = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Daily generation for last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  const dailyGeneration = last30Days.map((date) => {
    const count = items.filter(
      (item) => item.generatedAt.split('T')[0] === date
    ).length
    return { date, count }
  })

  const maxDailyCount = Math.max(...dailyGeneration.map((d) => d.count), 1)

  const stats = [
    {
      title: 'Total Generated',
      value: totalGenerated,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Posted',
      value: totalPosted,
      icon: Share2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Approval Rate',
      value: `${approvalRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rejected',
      value: totalRejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your content performance and generation stats
        </p>
      </div>

      {/* Stats Summary */}
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

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Generation Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Generation (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {dailyGeneration.map((day, index) => (
              <div
                key={day.date}
                className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors"
                style={{
                  height: `${(day.count / maxDailyCount) * 100}%`,
                  minHeight: day.count > 0 ? '4px' : '0',
                }}
                title={`${day.date}: ${day.count} items`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Content Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(contentTypeBreakdown).map(([type, count]) => (
              <div key={type} className="text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">
                  {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
