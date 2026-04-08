"use client";

import { FarmerDashboard } from "@/components/farmer/farmer-dashboard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <FarmerDashboard />
    </main>
  );
}
