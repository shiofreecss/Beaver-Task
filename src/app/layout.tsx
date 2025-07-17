import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { SessionProvider } from '@/components/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Beaver Task - Privacy-first task management',
  description: 'Organize your tasks, projects, and habits with confidence. Privacy-first task management that helps you stay productive.',
  keywords: 'task management, productivity, habits, projects, privacy-first',
  authors: [{ name: 'Beaver Task Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Preload critical CSS */}
        <link rel="preload" href="/api/tasks-convex" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/projects-convex" as="fetch" crossOrigin="anonymous" />
        
        {/* Performance hints */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <SessionProvider>
              {children}
            </SessionProvider>
          </Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 