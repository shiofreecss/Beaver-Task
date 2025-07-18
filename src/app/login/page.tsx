'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { LoginSlides } from '@/components/auth/login-slides'
import { LoginThemeToggle } from '@/components/auth/login-theme-toggle'
import { toast } from '@/components/ui/use-toast'

export default function LoginPage() {
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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>
            
            <LoginForm />
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Slides */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <LoginSlides />
        </div>

        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <LoginThemeToggle />
        </div>
      </div>
    </div>
  )
}