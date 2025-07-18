'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { toast } from '@/components/ui/use-toast'

export function LoginPageClient() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    
    // Handle authentication errors from URL parameters
    const error = searchParams.get('error')
    if (error) {
      let errorMessage = 'An authentication error occurred.'
      
      switch (error) {
        case 'Configuration':
          errorMessage = 'There is a problem with the server configuration. Please contact support.'
          break
        case 'AccessDenied':
          errorMessage = 'You do not have permission to sign in.'
          break
        case 'Verification':
          errorMessage = 'The verification token has expired or has already been used.'
          break
        case 'Default':
          errorMessage = 'An error occurred during authentication. Please try again.'
          break
        default:
          errorMessage = `Authentication error: ${error}`
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive',
      })
      
      // Clear the error from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  if (!mounted) {
    return <LoginFormSkeleton />
  }

  return <LoginForm />
}

// Loading skeleton for the login form
function LoginFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  )
} 