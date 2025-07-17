'use client'

import { useState } from 'react'
import { Building, FolderKanban, CheckSquare, FileText, Target, Timer, BarChart3, Settings, User, LogOut, Calendar, Menu, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSession, signOut } from 'next-auth/react'
import { ProfileSettingsModal } from '@/components/settings/profile-settings-modal'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { data: session } = useSession()
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
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

  return (
    <>
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border h-full flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <h2 className="text-xl font-bold text-foreground">🦫 Beaver Task</h2>
            ) : (
              <div></div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="p-2"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
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
                    onClick={() => onTabChange(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.label}
                  </Button>
                </li>
              )
            })}
          </ul>
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
            onClick={() => onTabChange('settings')}
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