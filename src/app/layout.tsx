import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { SessionProvider } from '@/components/session-provider'
import { CleanupProvider } from '@/components/cleanup-provider'

// Font options - choose one that looks best for your app
const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
})
const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit'
})
const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta'
})

// Choose your preferred font here
const font = plusJakartaSans // Modern, clean, great for productivity apps

export const metadata: Metadata = {
  title: 'Beaver Task',
  description: 'Organize your tasks, projects, and habits with confidence. Privacy-first task management that helps you stay productive.',
  keywords: 'task management, productivity, habits, projects, privacy-first',
  authors: [{ name: 'Shiodev - Beaver Foundation' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <SessionProvider>
              <CleanupProvider>
                {children}
              </CleanupProvider>
            </SessionProvider>
          </Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 