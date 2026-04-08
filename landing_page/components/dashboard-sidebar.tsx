"use client"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Leaf,
  TrendingUp,
  Pill,
  Stethoscope,
  Shield,
  Wind,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const navigationItems = [
  {
    name: "GyanaAshram",
    icon: GraduationCap,
    href: "/dashboard/gyana-ashram",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  {
    name: "KrishiChakra",
    icon: Leaf,
    href: "/dashboard/krishi-chakra",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    name: "KrishiUddhar",
    icon: TrendingUp,
    href: "/dashboard/krishi-uddhar",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    name: "KrishiAusadh",
    icon: Pill,
    href: "/dashboard/krishi-ausadh",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    name: "PashudhanSakhi",
    icon: Stethoscope,
    href: "/dashboard/pashudhansakhi",
    color: "text-amber-700",
    bgColor: "bg-amber-100"
  },
  {
    name: "KrishiBarosa",
    icon: Shield,
    href: "/dashboard/krishi-barosa",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100"
  },
  {
    name: "KrishiMeghMitra",
    icon: Wind,
    href: "/dashboard/krishi-megh-mitra",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
//{
//  name: "KrishiPraroop",
//  icon: Cpu,
//  href: "/dashboard",
//  color: "text-red-600",
//  bgColor: "bg-red-100"
//}
]

export default function DashboardSidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center gap-3 group transition-all duration-200 w-full"
        >
          <div className="relative w-10 h-10 overflow-hidden rounded-xl flex-shrink-0">
            <Image
              src="/main.png"
              alt="BioBloom Logo"
              fill
              className="object-cover"
            />
          </div>
          {!isCollapsed && (
            <span className="font-heading font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors duration-200">
              BioBloom
            </span>
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group relative",
                  "hover:bg-gray-50 hover:translate-x-1",
                  isActive && "bg-gray-50",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active indicator - left border */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-600 rounded-r-full transition-all duration-300" />
                )}
                
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                  item.bgColor,
                  "group-hover:scale-110 group-hover:rotate-3"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    item.color,
                    isActive && "scale-110"
                  )} />
                </div>
                {!isCollapsed && (
                  <span className={cn(
                    "font-medium text-sm transition-all duration-300",
                    isActive ? "text-gray-900 font-semibold" : "text-gray-600"
                  )}>
                    {item.name}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full hover:bg-gray-100 transition-all duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
