'use client'

import { Loader2 } from 'lucide-react'
import { BeaverLogo } from './beaver-logo'

interface LoadingScreenProps {
  message?: string
  showLogo?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingScreen({ 
  message = 'Loading...', 
  showLogo = true, 
  size = 'md' 
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-4">
        {showLogo && (
          <div className="animate-pulse">
            <BeaverLogo size={32} className="text-primary" />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
    </div>
  )
}

export function FullScreenLoading({ message = 'Loading your workspace...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        <div className="animate-pulse">
          <BeaverLogo size={48} className="text-primary" />
        </div>
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">{message}</span>
        </div>
      </div>
    </div>
  )
} 