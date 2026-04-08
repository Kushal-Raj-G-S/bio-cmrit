"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { RealCommunityDiscussion } from "./frontend/components/RealCommunityDiscussion"

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
          <p className="text-gray-600 mt-2">
            Connect with fellow farmers, ask questions, and share knowledge
          </p>
        </div>
        <RealCommunityDiscussion />
      </div>
    </DashboardLayout>
  )
}