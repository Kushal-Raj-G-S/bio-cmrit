"use client"

import { useState, useRef, useEffect } from "react"
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
  X,
  Globe,
  Loader2,
  Check,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { SARVAM_LANGUAGES } from "@/lib/sarvam-languages"

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
  const { t, currentLanguage, changeLanguage, isTranslating } = useTranslation()
  const [notificationCount, setNotificationCount] = useState(2)
  const [langSearchQuery, setLangSearchQuery] = useState("")
  const [isLangPopoverOpen, setIsLangPopoverOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when popover opens
  useEffect(() => {
    if (isLangPopoverOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
    if (!isLangPopoverOpen) {
      setLangSearchQuery("")
    }
  }, [isLangPopoverOpen])

  // Filter languages based on search
  const filteredLanguages = SARVAM_LANGUAGES.filter((lang) => {
    const q = langSearchQuery.toLowerCase()
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.native.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    )
  })

  // Current language info
  const currentLang = SARVAM_LANGUAGES.find((l) => l.code === currentLanguage) || SARVAM_LANGUAGES[0]

  // Mock notifications
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

        {/* Left side - Empty on desktop */}
        <div className="flex-1 hidden md:block">
          {/* Intentionally left empty for future page titles/breadcrumbs */}
        </div>

        {/* Right side - Utilities */}
        <div className="flex items-center gap-2 ml-auto">

          {/* ──────────────────────────────────────────────────────── */}
          {/* Language Selector — left of notifications bell          */}
          {/* ──────────────────────────────────────────────────────── */}
          <Popover open={isLangPopoverOpen} onOpenChange={setIsLangPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative hover:bg-green-50 transition-all duration-200 gap-1.5",
                  isTranslating && "animate-pulse"
                )}
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                ) : (
                  <Globe className="w-5 h-5 text-green-600" />
                )}
                <span className="hidden sm:inline text-sm font-medium max-w-[80px] truncate">
                  {currentLang.native}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 p-0 shadow-xl border-green-100"
              sideOffset={8}
            >
              {/* Header */}
              <div className="p-3 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-600" />
                  {t("dashboard.topbar.language")}
                  {isTranslating && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t("dashboard.topbar.translating")}
                    </span>
                  )}
                </h3>
              </div>

              {/* Search */}
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search language..."
                    value={langSearchQuery}
                    onChange={(e) => setLangSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                               placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Language list */}
              <div className="max-h-72 overflow-y-auto py-1">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => {
                    const isActive = currentLanguage === lang.code
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code)
                          setIsLangPopoverOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-150",
                          "hover:bg-green-50",
                          isActive && "bg-green-50"
                        )}
                      >
                        <span className="text-base font-medium w-16 text-gray-900">
                          {lang.native}
                        </span>
                        <span className="text-sm text-gray-500 flex-1">
                          {lang.name}
                        </span>
                        {isActive && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-400">
                    No languages found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t bg-gray-50">
                <p className="text-[10px] text-gray-400 text-center">
                  Powered by Sarvam AI · 22 Indic languages
                </p>
              </div>
            </PopoverContent>
          </Popover>

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
                  <h3 className="font-semibold">{t("dashboard.topbar.notifications")}</h3>
                  {notificationCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-auto p-1 text-blue-600 hover:text-blue-700"
                      onClick={handleMarkAllRead}
                    >
                      {t("dashboard.topbar.markAllRead")}
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
                    <p className="text-sm">{t("dashboard.topbar.noNotifications")}</p>
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
              <DropdownMenuLabel>{t("dashboard.topbar.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/settings')} 
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                {t("dashboard.topbar.profileSettings")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onLogout} 
                className="cursor-pointer text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("dashboard.topbar.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
