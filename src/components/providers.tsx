'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider } from 'convex/react'
import { useState } from 'react'
import { convex } from '@/lib/convex-client'
import { LoadingManagerProvider } from '@/components/ui/loading-manager'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <LoadingManagerProvider>
          {children}
        </LoadingManagerProvider>
      </QueryClientProvider>
    </ConvexProvider>
  )
} 