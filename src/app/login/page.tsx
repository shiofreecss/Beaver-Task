import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { LoginSlides } from '@/components/auth/login-slides'
import { LoginThemeToggle } from '@/components/auth/login-theme-toggle'
import { LoginPageClient } from '@/components/auth/login-page-client'

export default function LoginPage() {
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
            
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginPageClient />
            </Suspense>
            
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