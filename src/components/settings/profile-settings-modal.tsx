'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true)
  }).default({
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true
  })
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileSettingsModalProps {
  user: {
    id: string
    name: string | null
    email: string
    image?: string | null
    settings?: any
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSettingsModal({ user, open, onOpenChange }: ProfileSettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(user.image || '')
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      image: user.image || '',
      settings: user.settings || {
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true
      }
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setImagePreview(value)
    form.setValue('image', value)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update profile')
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <div className="flex gap-4 items-center">
              <Input
                id="image"
                onChange={handleImageChange}
                value={form.watch('image')}
                disabled={isLoading}
                placeholder="https://example.com/avatar.jpg"
              />
              {imagePreview && (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>
            {form.formState.errors.image && (
              <p className="text-sm text-red-500">
                {form.formState.errors.image.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Preferences</h3>
            
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                {...form.register('settings.theme')}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                disabled={isLoading}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailNotifications"
                {...form.register('settings.emailNotifications')}
                disabled={isLoading}
              />
              <Label htmlFor="emailNotifications">Enable email notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pushNotifications"
                {...form.register('settings.pushNotifications')}
                disabled={isLoading}
              />
              <Label htmlFor="pushNotifications">Enable push notifications</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 