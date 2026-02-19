'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Project } from '@/types'

interface ProjectFormData {
  name: string
  description: string
  url: string
  techStack: string
  status: string
}

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  project?: Project | null
}

export function ProjectForm({ open, onClose, project }: ProjectFormProps) {
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      url: '',
      techStack: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        url: project.url || '',
        techStack: project.techStack?.join(', ') || '',
        status: project.status || 'active',
      })
    } else {
      reset({
        name: '',
        description: '',
        url: '',
        techStack: '',
        status: 'active',
      })
    }
  }, [project, reset])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectData = {
        name: data.name,
        description: data.description,
        url: data.url || undefined,
        techStack: data.techStack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        status: data.status,
      }

      if (project) {
        await updateProject.mutateAsync({ id: project.id, data: projectData })
        toast.success('Project updated successfully')
      } else {
        await createProject.mutateAsync(projectData)
        toast.success('Project created successfully')
      }
      onClose()
    } catch {
      toast.error('Failed to save project')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Project name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              rows={3}
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              {...register('url')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack</Label>
            <Input
              id="techStack"
              placeholder="e.g., React, Node.js, PostgreSQL"
              {...register('techStack')}
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated list of technologies
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('status')}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProject.isPending || updateProject.isPending}
            >
              {(createProject.isPending || updateProject.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {project ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
