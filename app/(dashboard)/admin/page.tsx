'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminMetrics, useAdminUsers, useAdminAuditLogs } from '@/hooks/useAdmin'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Users,
  FileText,
  FolderKanban,
  Calendar,
  Activity,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock3,
  BarChart3,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [auditPage, setAuditPage] = useState(1)

  // Check if user is admin
  if (status === 'loading') {
    return <AdminDashboardSkeleton />
  }

  if (!session?.user?.roles?.includes('ADMIN')) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            System overview, user management, and audit logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Activity className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersTab search={userSearch} onSearchChange={setUserSearch} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentTab />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditLogsTab page={auditPage} onPageChange={setAuditPage} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  const { data: metricsData, isLoading, refetch } = useAdminMetrics()
  const metrics = metricsData?.metrics

  if (isLoading) {
    return <OverviewTabSkeleton />
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Failed to load metrics</p>
          <Button onClick={() => refetch()} className="mx-auto mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers,
      change: `+${metrics.newUsersToday} today`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Content',
      value: metrics.totalContent,
      change: `+${metrics.contentCreatedToday} today`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Projects',
      value: metrics.activeProjects,
      change: `${metrics.totalProjects} total`,
      icon: FolderKanban,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Schedules',
      value: metrics.schedulesByStatus.PENDING,
      change: `${metrics.totalSchedules} total`,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  // Content by status for pie chart
  const contentStatusData = [
    { name: 'Pending', value: metrics.contentByStatus.PENDING, color: '#F59E0B' },
    { name: 'Approved', value: metrics.contentByStatus.APPROVED, color: '#10B981' },
    { name: 'Posted', value: metrics.contentByStatus.POSTED, color: '#3B82F6' },
    { name: 'Rejected', value: metrics.contentByStatus.REJECTED, color: '#EF4444' },
  ].filter((item) => item.value > 0)

  // Content by platform for bar chart
  const contentPlatformData = Object.entries(metrics.contentByPlatform)
    .filter(([_, count]) => count > 0)
    .map(([platform, count]) => ({
      name: platform,
      count,
    }))

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Content Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Status Distribution</CardTitle>
            <CardDescription>Breakdown of content by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {contentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content by Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content by Platform</CardTitle>
            <CardDescription>Distribution across social platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentPlatformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-2xl font-bold">{metrics.activeUsersToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Audit Logs Today</p>
                <p className="text-2xl font-bold">{metrics.auditLogsToday}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Audit Logs</p>
                <p className="text-2xl font-bold">{metrics.totalAuditLogs}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Users Tab Component
function UsersTab({ search, onSearchChange }: { search: string; onSearchChange: (s: string) => void }) {
  const { data: usersData, isLoading } = useAdminUsers({ search, limit: 10 })

  if (isLoading) {
    return <UsersTabSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and their roles</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant={role.name === 'ADMIN' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{user._count?.contentItems || 0}</TableCell>
                <TableCell>{user._count?.projects || 0}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Content Tab Component
function ContentTab() {
  const { data: metricsData, isLoading } = useAdminMetrics()
  const metrics = metricsData?.metrics

  if (isLoading) {
    return <ContentTabSkeleton />
  }

  const scheduleStatusData = [
    { name: 'Pending', value: metrics?.schedulesByStatus.PENDING || 0, icon: Clock3, color: 'text-yellow-600' },
    { name: 'Active', value: metrics?.schedulesByStatus.ACTIVE || 0, icon: Activity, color: 'text-blue-600' },
    { name: 'Completed', value: metrics?.schedulesByStatus.COMPLETED || 0, icon: CheckCircle, color: 'text-green-600' },
    { name: 'Failed', value: metrics?.schedulesByStatus.FAILED || 0, icon: XCircle, color: 'text-red-600' },
    { name: 'Cancelled', value: metrics?.schedulesByStatus.CANCELLED || 0, icon: AlertTriangle, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Overview</CardTitle>
          <CardDescription>Content and schedule statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{metrics?.contentCreatedThisWeek || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{metrics?.contentCreatedThisMonth || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Posted</p>
              <p className="text-2xl font-bold">{metrics?.contentByStatus.POSTED || 0}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">{metrics?.contentByStatus.PENDING || 0}</p>
            </div>
          </div>

          {/* Schedule Status */}
          <div>
            <h4 className="text-sm font-medium mb-4">Schedule Status</h4>
            <div className="grid gap-4 md:grid-cols-5">
              {scheduleStatusData.map((status) => (
                <div key={status.name} className="flex items-center gap-3 p-3 border rounded-lg">
                  <status.icon className={`h-5 w-5 ${status.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{status.name}</p>
                    <p className="text-xl font-bold">{status.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Audit Logs Tab Component
function AuditLogsTab({ page, onPageChange }: { page: number; onPageChange: (p: number) => void }) {
  const { data: logsData, isLoading } = useAdminAuditLogs({ page, limit: 20 })

  if (isLoading) {
    return <AuditLogsTabSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Track all system activities</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsData?.logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {log.user ? (
                    <div>
                      <p className="font-medium">{log.user.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{log.user.email}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">System</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell>
                  {log.entity}
                  {log.entityId && (
                    <span className="text-xs text-muted-foreground block">{log.entityId.slice(0, 8)}...</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {log.details ? (
                    <span className="text-xs text-muted-foreground">
                      {JSON.parse(log.details).message || log.details.slice(0, 50)}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {logsData && logsData.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {logsData.page} of {logsData.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(logsData.totalPages, page + 1))}
                disabled={page === logsData.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Skeleton Components
function AdminDashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96" />
    </div>
  )
}

function OverviewTabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

function UsersTabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96" />
      </CardContent>
    </Card>
  )
}

function ContentTabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64" />
      </CardContent>
    </Card>
  )
}

function AuditLogsTabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96" />
      </CardContent>
    </Card>
  )
}
