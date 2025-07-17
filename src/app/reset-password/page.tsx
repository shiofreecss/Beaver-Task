import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { LoginThemeToggle } from '@/components/auth/login-theme-toggle'
import { BeaverLogo } from '@/components/ui/beaver-logo'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <LoginThemeToggle />
      {/* Left Section - Authentication */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Back to Login */}
          <div className="mb-8">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="mr-3">
              <BeaverLogo size={40} className="drop-shadow-lg" />
            </div>
            <span className="text-2xl font-semibold text-foreground">Beaver Task</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Slogan */}
            <div className="space-y-2">
              <h1 className="text-3xl font-serif text-foreground leading-tight">
                Reset your password
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Authentication Box */}
            <Card>
              <div className="p-6">
                <ResetPasswordForm />
              </div>
            </Card>

            {/* Legal Text */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Need help? Contact our{' '}
              <Link href="/support" className="text-primary hover:underline">
                support team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Demo/Example */}
      <div className="hidden lg:flex flex-1 bg-muted/50 items-center justify-center relative">
        <div className="max-w-md mx-auto px-8">
          {/* Security Illustration */}
          <Card className="p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">🔒</span>
              </div>
              <div className="flex-1">
                <p className="text-card-foreground text-sm leading-relaxed">
                  "Your security is our priority. We use industry-standard encryption to protect your account."
                </p>
              </div>
            </div>
          </Card>

          {/* Security Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Secure password reset via email</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Time-limited reset links</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-muted-foreground">Immediate account protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 