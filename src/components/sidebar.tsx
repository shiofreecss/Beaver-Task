'use client'

import { useState, useEffect } from 'react'
import { Building, FolderKanban, CheckSquare, FileText, Target, Timer, BarChart3, Settings, User, LogOut, Calendar, Menu, ChevronLeft, X, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSession, signOut } from 'next-auth/react'
import { ProfileSettingsModal } from '@/components/settings/profile-settings-modal'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isMobileOpen?: boolean
  onMobileToggle?: () => void
}

export function Sidebar({ activeTab, onTabChange, isMobileOpen = false, onMobileToggle }: SidebarProps) {
  const { data: session } = useSession()
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'organizations', label: 'Organizations', icon: Building },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ]

  const specialItems = [
    { id: 'presentation', label: 'App Presentation', icon: Presentation, href: '/presentation' },
  ]

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  const handleLogout = async () => {
    try {
      // Clear any local state or cached data
      localStorage.clear()
      sessionStorage.clear()
      
      // Sign out with proper error handling
      const result = await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      })
      
      console.log('Logout result:', result)
      
      toast({
        title: 'Success',
        description: 'Logged out successfully!',
      })
      
      // Force navigation to login page
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      })
      
      // Even if signOut fails, try to redirect to login
      router.push('/login')
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    // Auto-close mobile menu when tab is selected
    if (isMobile && onMobileToggle) {
      onMobileToggle()
    }
  }

  const sidebarContent = (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border h-full flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <h2 className="text-xl font-bold text-foreground">🦫 Beaver Task</h2>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="p-2"
              >
                {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            )}
            {isMobile && onMobileToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileToggle}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-left transition-all duration-200`}
                  onClick={() => handleTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && item.label}
                </Button>
              </li>
            )
          })}
        </ul>
        
        {/* Special Items */}
        <div className="mt-6 pt-6 border-t border-border">
          <ul className="space-y-2">
            {specialItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-left transition-all duration-200`}
                    onClick={() => router.push(item.href)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.label}
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-left transition-all duration-200`}
          onClick={() => setShowProfileSettings(true)}
          title={isCollapsed ? 'Profile Settings' : undefined}
        >
          <User className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Profile Settings'}
        </Button>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-left transition-all duration-200`}
          onClick={() => handleTabChange('settings')}
          title={isCollapsed ? 'App Settings' : undefined}
        >
          <Settings className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'App Settings'}
        </Button>
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-left text-red-500 hover:text-red-600 transition-all duration-200`}
          onClick={handleLogout}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  )

  // Mobile overlay and sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileToggle}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {sidebarContent}
        </div>

        {session?.user && (
          <ProfileSettingsModal
            user={session.user}
            open={showProfileSettings}
            onOpenChange={setShowProfileSettings}
          />
        )}
      </>
    )
  }

  // Desktop sidebar
  return (
    <>
      {sidebarContent}
      {session?.user && (
        <ProfileSettingsModal
          user={session.user}
          open={showProfileSettings}
          onOpenChange={setShowProfileSettings}
        />
      )}
    </>
  )
} 