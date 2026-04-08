"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Bell,
  User,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Thermometer,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardTopBarProps {
  user?: any
  onLogout?: () => void
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
  className?: string
}

export default function DashboardTopBar({ 
  user, 
  onLogout,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  className 
}: DashboardTopBarProps) {
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(2)

  // Mock notifications - in real app, these would come from props or API
  const notifications = [
    {
      id: 1,
      title: "High Temperature Alert",
      description: "Temperatures above 35°C expected tomorrow",
      type: "warning",
      icon: Thermometer,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: 2,
      title: "Irrigation Reminder",
      description: "North field needs watering",
      type: "info",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    }
  ]

  const handleMarkAllRead = () => {
    setNotificationCount(0)
  }

  return (
    <header 
      className={cn(
        "border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30",
        className
      )}
    >
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:bg-gray-100 transition-all duration-200"
          onClick={onMobileMenuToggle}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Left side - Empty on desktop, allows for breadcrumbs or page title if needed */}
        <div className="flex-1 hidden md:block">
          {/* Intentionally left empty for future page titles/breadcrumbs */}
        </div>

        {/* Right side - Utilities */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-gray-100 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {notificationCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-auto p-1 text-blue-600 hover:text-blue-700"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const Icon = notification.icon
                      return (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                            notification.bgColor
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                              notification.bgColor
                            )}>
                              <Icon className={cn("w-5 h-5", notification.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 mb-0.5">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-gray-100 transition-all duration-200 gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium hidden sm:inline">
                  {user?.name?.split(' ')[0] || user?.profile?.full_name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings')} 
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onLogout} 
                className="cursor-pointer text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
