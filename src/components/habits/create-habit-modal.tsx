'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const habitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  target: z.number().min(1).default(1),
  color: z.string().optional(),
})

type HabitFormValues = z.infer<typeof habitSchema>

interface CreateHabitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: HabitFormValues) => Promise<void>
  habit?: {
    id: string
    name: string
    description?: string
    frequency: string
    target: number
    color?: string
  }
}

export function CreateHabitModal({ open, onOpenChange, onSubmit, habit }: CreateHabitModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name || '',
      description: habit?.description || '',
      frequency: (habit?.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY') || 'DAILY',
      target: habit?.target || 1,
      color: habit?.color || '',
    },
  })

  const handleSubmit = async (data: HabitFormValues) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting habit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            {habit ? 'Update your habit details' : 'Add a new habit to track'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter habit name"
              {...form.register('name')}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter habit description"
              {...form.register('description')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              defaultValue={form.getValues('frequency')}
              onValueChange={(value) => form.setValue('frequency', value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target (times per frequency)</Label>
            <Input
              id="target"
              type="number"
              min="1"
              {...form.register('target', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {form.formState.errors.target && (
              <p className="text-sm text-red-500">
                {form.formState.errors.target.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color (optional)</Label>
            <Input
              id="color"
              type="color"
              {...form.register('color')}
              disabled={isLoading}
              className="h-10 px-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {habit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 