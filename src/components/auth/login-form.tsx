'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Mail, Lock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSecurityWarning, setShowSecurityWarning] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Security check: Detect and handle credentials in URL parameters
  useEffect(() => {
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    
    if (email || password) {
      // Clear the URL immediately to prevent exposure
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('email')
      newUrl.searchParams.delete('password')
      window.history.replaceState({}, '', newUrl.toString())
      
      // Show security warning
      setShowSecurityWarning(true)
      
      // Show toast warning
      toast({
        title: 'Security Warning',
        description: 'Credentials should never be passed in URLs. Please enter them securely in the form below.',
        variant: 'destructive',
      })
      
      // Log security event
      fetch('/api/security/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'CREDENTIALS_IN_URL',
          details: {
            hasEmail: !!email,
            hasPassword: !!password,
            path: window.location.pathname,
            referrer: document.referrer,
          },
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(error => {
        console.error('Failed to log security event:', error)
      })
      
      console.warn('SECURITY WARNING: Credentials detected in URL parameters. URL has been cleared.')
    }
  }, [searchParams])

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      // Handle case where result is undefined (connection failure)
      if (!result) {
        console.error('Login failed: No response from authentication service')
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to authentication service. Please try again.',
          variant: 'destructive',
        })
        return
      }

      if (result.error) {
        console.error('Login error:', result.error)
        let errorMessage = 'Invalid email or password'
        
        // Check for specific error messages
        if (result.error.includes('Convex connection failed')) {
          errorMessage = 'Unable to connect to database. Please try again later.'
        } else if (result.error.includes('Convex URL not configured')) {
          errorMessage = 'Authentication service misconfigured. Please contact support.'
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }

      if (result.ok) {
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        })
        try {
          // Wait for navigation to complete
          await router.push('/')
          await router.refresh()
        } catch (error) {
          console.error('Navigation error:', error)
          // Still logged in, but navigation failed
          toast({
            title: 'Warning',
            description: 'Logged in but navigation failed. Please try refreshing the page.',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      console.error('Login exception:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Security Warning */}
      {showSecurityWarning && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Security Warning</h3>
              <p className="text-sm text-red-700 mt-1">
                Credentials were detected in the URL, which is a security risk. The URL has been cleared. 
                Please enter your credentials securely in the form below.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              disabled={isLoading}
              className="pl-10 h-11"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              disabled={isLoading}
              className="pl-10 h-11"
              {...form.register('password')}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link 
            href="/reset-password" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 font-medium" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with email
        </Button>
      </form>
    </div>
  )
} 