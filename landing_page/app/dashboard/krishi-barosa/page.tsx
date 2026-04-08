"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { LanguageProvider } from "./src/context/language-context"
import { FarmerDashboard } from "./farmer-dashboard"

export default function KrishiBarosaPage() {
  return (
    <DashboardLayout>
      <LanguageProvider>
        <div className="space-y-4">
          <FarmerDashboard />
        </div>
      </LanguageProvider>
    </DashboardLayout>
  )
}
