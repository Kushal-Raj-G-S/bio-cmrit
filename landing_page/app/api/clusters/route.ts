import { NextRequest, NextResponse } from 'next/server'

// Temporary redirect for clusters route
export async function GET(request: NextRequest) {
  // Return empty clusters data for now
  return NextResponse.json({ 
    clusters: [],
    message: 'Clusters feature coming soon' 
  })
}
