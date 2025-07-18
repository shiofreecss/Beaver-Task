import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { LoginThemeToggle } from '@/components/auth/login-theme-toggle'
import { LoginSlides } from '@/components/auth/login-slides'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowDown, ChevronRight } from 'lucide-react'

// Loading component for Suspense
function LoginFormLoading() {
  return (
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
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <LoginThemeToggle />
      {/* Left Section - Authentication */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start mb-8 mt-8 lg:mt-0">
            <div className="mr-3 text-4xl">
              🦫
            </div>
            <span className="text-2xl font-semibold text-foreground">Beaver Task</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Slogan */}
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-serif text-foreground leading-tight">
                Your productivity, amplified.
              </h1>
              <p className="text-lg text-muted-foreground">
                Privacy-first task management that helps you organize with confidence.
              </p>
            </div>

            {/* Authentication Box */}
            <Card>
              <div className="p-6">
                <Suspense fallback={<LoginFormLoading />}>
                  <LoginForm />
                </Suspense>
                
                <div className="mt-6 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">OR</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary border border-border rounded-lg hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                    >
                      Create new account
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* Legal Text */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Interactive Slides */}
      <div className="hidden lg:flex flex-1 bg-muted/50 items-center justify-center relative">
        <LoginSlides />
      </div>
    </div>
  )
}