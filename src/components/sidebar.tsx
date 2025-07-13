'use client'

import { useState } from 'react'
import { Building, FolderKanban, CheckSquare, FileText, Target, Timer, BarChart3, Settings, User, LogOut } from 'lucide-react'
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
  const router = useRouter()
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'organizations', label: 'Organizations', icon: Building },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  ]

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: 'Success',
        description: 'Logged out successfully!',
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <div className="w-64 bg-card border-r border-border h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">🦫 Beaver</h2>
            <ThemeToggle />
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => setShowProfileSettings(true)}
          >
            <User className="mr-3 h-4 w-4" />
            Profile Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => onTabChange('settings')}
          >
            <Settings className="mr-3 h-4 w-4" />
            App Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-left text-red-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
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