"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to GyanaAshram as the default dashboard
    router.replace('/dashboard/gyana-ashram')
  }, [router])

  return null
}
