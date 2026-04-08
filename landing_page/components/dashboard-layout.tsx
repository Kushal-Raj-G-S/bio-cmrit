"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import DashboardSidebar from "./dashboard-sidebar"
import DashboardTopBar from "./dashboard-topbar"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768)
    if (window.innerWidth >= 768) {
      setIsMobileMenuOpen(false)
    }
  }

  // Redirect if not authenticated — wait until auth check finishes first
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('biobloom_password_user_id')
      localStorage.removeItem('biobloom_password_auth')
      localStorage.removeItem('biobloom_user_cache')
      localStorage.removeItem('community_user')
    }
    router.push('/auth')
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Show spinner while auth is being checked — prevents flash redirect to /auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden md:block">
        <DashboardSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
      </div>

      {/* Mobile Sidebar - Overlay on mobile */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="md:hidden">
            <DashboardSidebar 
              className="z-50"
              isCollapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div 
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '80px' : '256px') }}
      >
        {/* Top Bar */}
        <DashboardTopBar 
          user={user}
          onLogout={handleLogout}
          onMobileMenuToggle={handleMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page Content */}
        <main className={cn("flex-1 px-6 py-6", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
