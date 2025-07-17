'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Check } from 'lucide-react'
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
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).default('DAILY'),
  target: z.number().min(1).default(1),
  color: z.string().optional(),
  customDays: z.array(z.number()).optional(),
  customPeriod: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ANNUALLY']).optional(),
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
    customDays?: number[]
    customPeriod?: string
  }
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

const PERIOD_OPTIONS = [
  { value: 'WEEKLY', label: 'Every week' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'ANNUALLY', label: 'Annually' },
]

export function CreateHabitModal({ open, onOpenChange, onSubmit, habit }: CreateHabitModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name || '',
      description: habit?.description || '',
      frequency: (habit?.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM') || 'DAILY',
      target: habit?.target || 1,
      color: habit?.color || '',
      customDays: habit?.customDays || [],
      customPeriod: (habit?.customPeriod as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ANNUALLY') || 'WEEKLY',
    },
  })

  // Reset form when habit prop changes (for editing)
  useEffect(() => {
    if (habit) {
      form.reset({
        name: habit.name,
        description: habit.description || '',
        frequency: (habit.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM') || 'DAILY',
        target: habit.target,
        color: habit.color || '',
        customDays: habit.customDays || [],
        customPeriod: (habit.customPeriod as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ANNUALLY') || 'WEEKLY',
      })
    }
  }, [habit, form])

  const selectedFrequency = form.watch('frequency')
  const selectedCustomDays = form.watch('customDays') || []

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

  const toggleCustomDay = (dayValue: number) => {
    const currentDays = form.getValues('customDays') || []
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(day => day !== dayValue)
      : [...currentDays, dayValue]
    form.setValue('customDays', newDays)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
              onValueChange={(value) => form.setValue('frequency', value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedFrequency === 'CUSTOM' && (
            <>
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedCustomDays.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCustomDay(day.value)}
                      disabled={isLoading}
                      className="justify-center"
                    >
                      {selectedCustomDays.includes(day.value) && (
                        <Check className="mr-1 h-3 w-3" />
                      )}
                      {day.label}
                    </Button>
                  ))}
                </div>
                {selectedCustomDays.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Please select at least one day
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPeriod">Period</Label>
                <Select
                  defaultValue={form.getValues('customPeriod')}
                  onValueChange={(value) => form.setValue('customPeriod', value as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ANNUALLY')}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

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
            <Button 
              type="submit" 
              disabled={isLoading || (selectedFrequency === 'CUSTOM' && selectedCustomDays.length === 0)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {habit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 