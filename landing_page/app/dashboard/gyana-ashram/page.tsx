"use client"

import dynamic from 'next/dynamic'
import DashboardLayout from "@/components/dashboard-layout"

// Lazy load the heavy education center component
const ModernEducationCenter = dynamic(() => import('./modern-education-center'), {
  loading: () => (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false // Disable server-side rendering for faster initial load
})

export default function GyanaAshramPage() {
  return (
    <DashboardLayout>
      <ModernEducationCenter />
    </DashboardLayout>
  )
}
