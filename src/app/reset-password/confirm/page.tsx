import { ResetPasswordConfirmForm } from '@/components/auth/reset-password-confirm-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ResetPasswordConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const { token } = searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Invalid Reset Link</h1>
              <p className="text-gray-600 mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link 
                href="/reset-password"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
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
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-semibold text-gray-900">Beaver Task</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Slogan */}
            <div className="space-y-2">
              <h1 className="text-3xl font-serif text-gray-900 leading-tight">
                Set new password
              </h1>
              <p className="text-lg text-gray-600">
                Enter your new password below to complete the reset process.
              </p>
            </div>

            {/* Authentication Box */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <ResetPasswordConfirmForm token={token} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Demo/Example */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center relative">
        <div className="max-w-md mx-auto px-8">
          {/* Security Illustration */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">🔐</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm leading-relaxed">
                  "Choose a strong password with at least 8 characters, including letters, numbers, and symbols."
                </p>
              </div>
            </div>
          </div>

          {/* Password Tips */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Use at least 8 characters</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Include letters and numbers</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Add special characters for strength</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 