import { NextRequest, NextResponse } from 'next/server'

const BHUVAN_BASE = 'https://bhuvan-app1.nrsc.gov.in/json_api'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') // 'geojson', 'csv', or 'nominatim'

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint param' }, { status: 400 })
  }

  // Handle Nominatim reverse geocoding
  if (endpoint === 'nominatim') {
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing lat or lon' }, { status: 400 })
    }
    try {
      const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`
      const response = await fetch(url, {
        headers: { 'User-Agent': 'BioBloom-AgriApp/1.0' },
        signal: AbortSignal.timeout(8000)
      })
      if (!response.ok) {
        return NextResponse.json({ error: `Nominatim returned ${response.status}` }, { status: response.status })
      }
      const data = await response.json()
      return NextResponse.json(data)
    } catch (error: any) {
      console.error('Nominatim proxy error:', error.message)
      return NextResponse.json({ error: error.message || 'Nominatim fetch failed' }, { status: 502 })
    }
  }

  // Handle Bhuvan LULC endpoints
  const dist = searchParams.get('dist')
  if (!dist) {
    return NextResponse.json({ error: 'Missing dist param' }, { status: 400 })
  }

  const file = endpoint === 'csv' ? 'csv.php' : 'geojson.php'
  const url = `${BHUVAN_BASE}/${file}?dist=${dist}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      // Return 200 with null so browser shows no red error — fallback handles missing data
      return NextResponse.json({ data: null, noData: true })
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json') || contentType.includes('text/json')) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const text = await response.text()
      try {
        const data = JSON.parse(text)
        return NextResponse.json(data)
      } catch {
        return new NextResponse(text, {
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    }
  } catch (error: any) {
    console.error('Bhuvan proxy error:', error.message)
    return NextResponse.json({ error: error.message || 'Proxy fetch failed' }, { status: 502 })
  }
}
