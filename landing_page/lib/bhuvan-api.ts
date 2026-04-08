/**
 * ISRO Bhuvan API Integration
 * 
 * ============================================================
 * BHUVAN API - ISRO Geo-Platform (bhuvan-app1.nrsc.gov.in)
 * ============================================================
 * NOTE: Bhuvan APIs do NOT use an API key/token for authentication.
 * These are open REST endpoints provided by ISRO/NRSC.
 * No Authorization header or API key param is needed.
 *
 * Authentication: NONE (open public endpoints)
 *
 * How to call:
 * - Request Type: GET
 * - Required Header: Content-Type: application/x-www-form-urlencoded
 *
 * Available Endpoints:
 *
 * 1. District Wise LULC GeoJSON (Land Use Land Cover stats)
 *    URL: https://bhuvan-app1.nrsc.gov.in/json_api/geojson.php?dist={district_code}
 *
 * 2. District Wise LULC CSV
 *    URL: https://bhuvan-app1.nrsc.gov.in/json_api/csv.php?dist={district_code}
 *
 * 3. WMS Tile/Map Layers (all India, open)
 *    URL: https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms
 *
 * District Code Format: 4-digit code
 *   - First 2 digits = State code  (Karnataka = 29)
 *   - Last 2 digits  = District code
 *   - Example: Bengaluru Urban = 2918
 * ============================================================
 */

// Bhuvan API endpoints (NO API KEY REQUIRED - Public endpoints)
const BHUVAN_LULC_GEOJSON = 'https://bhuvan-app1.nrsc.gov.in/json_api/geojson.php'
const BHUVAN_LULC_CSV = 'https://bhuvan-app1.nrsc.gov.in/json_api/csv.php'
const BHUVAN_WMS = 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms'

// Karnataka district codes (29XX format)
const KARNATAKA_DISTRICTS: { [key: string]: string } = {
  'Bagalkot': '2903',
  'Bangalore Rural': '2904',
  'Bangalore Urban': '2918',
  'Belgaum': '2905',
  'Bellary': '2906',
  'Bidar': '2907',
  'Bijapur': '2908',
  'Chamarajanagar': '2909',
  'Chikkaballapur': '2910',
  'Chikkamagaluru': '2911',
  'Chitradurga': '2912',
  'Dakshina Kannada': '2913',
  'Davanagere': '2914',
  'Dharwad': '2915',
  'Gadag': '2916',
  'Gulbarga': '2917',
  'Hassan': '2919',
  'Haveri': '2920',
  'Kodagu': '2921',
  'Kolar': '2922',
  'Koppal': '2923',
  'Mandya': '2924',
  'Mysore': '2925',
  'Raichur': '2926',
  'Ramanagara': '2927',
  'Shimoga': '2928',
  'Tumkur': '2929',
  'Udupi': '2930',
  'Uttara Kannada': '2931',
  'Yadgir': '2932',
  'Devanahalli': '2904', // Part of Bangalore Rural
}

interface BhuvanSoilData {
  soilType: string
  soilTexture: string
  soilPH: number
  organicCarbon: number
  nitrogenContent: string
  phosphorusContent: string
  potassiumContent: string
}

interface BhuvanLocationData {
  latitude: number
  longitude: number
  // Structured admin hierarchy — each level is separate
  village: string      // hamlet / village / suburb
  taluk: string        // taluk / tehsil / city_district
  district: string     // revenue district (county in Nominatim for India)
  state: string
  pincode?: string
  climateZone: string
}

interface BhuvanLandUseData {
  landUseType: string
  cropType?: string
  irrigationType?: string
  waterAvailability: 'Low' | 'Medium' | 'High'
}

/**
 * Get Land Use Land Cover data from Bhuvan for a specific district
 */
export async function getLULCDataByDistrict(district: string): Promise<any> {
  try {
    // Normalize Bengaluru → Bangalore before lookup so LULC codes always match
    const normalizedDistrict = district.replace(/Bengaluru/gi, 'Bangalore')
    const districtCode = KARNATAKA_DISTRICTS[normalizedDistrict]
    
    if (!districtCode) {
      return null
    }

    // Route through Next.js API proxy to avoid CORS issues
    const proxyUrl = `/api/bhuvan-proxy?endpoint=geojson&dist=${districtCode}`
    const response = await fetch(proxyUrl, { method: 'GET' })
    if (!response.ok) {
      // Proxy itself failed (502 etc) — fallback handles this
      return null
    }
    const data = await response.json()
    // noData:true means ISRO had no data for this district — return null for fallback
    if (!data || data.noData) return null
    return data
  } catch (error) {
    return null
  }
}

/**
 * Get soil information based on coordinates and district
 */
export async function getSoilDataFromCoordinates(
  latitude: number,
  longitude: number,
  district?: string
): Promise<BhuvanSoilData | null> {
  try {
    // If district provided, use district-based LULC data
    if (district) {
      const lulcData = await getLULCDataByDistrict(district)
      if (lulcData) {
        const soilInfo = extractSoilInfoFromLULC(lulcData, latitude, longitude)
        if (soilInfo) return soilInfo
      }
    }

    // Fallback to general soil data
    return getFallbackSoilData(latitude, longitude)
  } catch (error) {
    return getFallbackSoilData(latitude, longitude)
  }
}

/**
 * Extract soil information from LULC GeoJSON data
 */
function extractSoilInfoFromLULC(
  lulcData: any, 
  latitude: number, 
  longitude: number
): BhuvanSoilData | null {
  if (!lulcData || !lulcData.features) return null

  try {
    // Find the feature containing this point
    const pointFeature = lulcData.features.find((f: any) => {
      if (!f.geometry || !f.geometry.coordinates) return false
      // Simple point-in-polygon check (basic implementation)
      return true // For now, use first feature
    })

    if (pointFeature?.properties) {
      const props = pointFeature.properties
      
      return {
        soilType: mapSoilType(props.soil_type || props.soil),
        soilTexture: props.texture || 'Medium',
        soilPH: props.ph || 6.5,
        organicCarbon: props.organic_carbon || 0.5,
        nitrogenContent: props.nitrogen || 'Medium',
        phosphorusContent: props.phosphorus || 'Medium',
        potassiumContent: props.potassium || 'Medium'
      }
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * Get location details from coordinates using reverse geocoding
 */
export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number
): Promise<BhuvanLocationData | null> {
  try {
    // Use server-side proxy to avoid CORS for Nominatim
    const response = await fetch(
      `/api/bhuvan-proxy?endpoint=nominatim&lat=${latitude}&lon=${longitude}`,
      {
        method: 'GET'
      }
    )

    if (!response.ok) {
      return getFallbackLocationData(latitude, longitude)
    }

    const data = await response.json()
    const address = data.address || {}

    // ── India-specific district parsing ──────────────────────────────────────
    // In India: county = actual revenue district (e.g. "Bangalore Rural")
    //           state_district = metro/administrative grouping (e.g. "Bengaluru Urban")
    // For all other countries, state_district is usually the correct field.
    const isIndia = address.country_code === 'in'
    let district: string
    if (isIndia) {
      district = address.county || address.state_district || address.city || 'Unknown'
    } else {
      district = address.state_district || address.county || address.city || 'Unknown'
    }

    // ── Normalize Bengaluru/Bangalore spelling inconsistency ─────────────────
    // Nominatim mixes "Bengaluru Rural", "Bangalore Rural", "Bengaluru Urban" etc.
    // Normalize to "Bangalore *" for consistent downstream use (models, DB lookups, LULC codes)
    if (district.toLowerCase().includes('bengaluru')) {
      district = district.replace(/Bengaluru/gi, 'Bangalore')
    }

    return {
      district,
      taluk: address.suburb || address.town || address.village || 'Unknown',
      village: address.village || address.hamlet || address.suburb || 'Unknown',
      pincode: address.postcode || 'Unknown',
      state: address.state || 'Karnataka',
      latitude,
      longitude,
      climateZone: determineClimateZone(latitude, longitude, address.state || 'Karnataka')
    }
  } catch (error) {
    return getFallbackLocationData(latitude, longitude)
  }
}

/**
 * Get land use and crop data from district
 */
export async function getLandUseData(
  latitude: number,
  longitude: number,
  district?: string
): Promise<BhuvanLandUseData | null> {
  try {
    // If district provided, use district-based LULC data
    if (district) {
      const lulcData = await getLULCDataByDistrict(district)
      if (lulcData) {
        const insights = extractAgricultureInsights(lulcData)
        if (insights) return insights
      }
    }

    // Fallback to default land use data
    return getFallbackLandUseData()
  } catch (error) {
    return getFallbackLandUseData()
  }
}

/**
 * Extract agricultural insights from LULC data
 */
function extractAgricultureInsights(lulcData: any): BhuvanLandUseData | null {
  if (!lulcData || !lulcData.features) return null

  try {
    // Parse LULC features to find agricultural land info
    const features = lulcData.features
    
    // Look for crop/agricultural land features
    const agricultureFeatures = features.filter((f: any) => 
      f.properties?.landuse?.toLowerCase().includes('crop') ||
      f.properties?.landuse?.toLowerCase().includes('agriculture') ||
      f.properties?.landuse?.toLowerCase().includes('kharif') ||
      f.properties?.landuse?.toLowerCase().includes('rabi')
    )

    if (agricultureFeatures.length > 0) {
      const firstFeature = agricultureFeatures[0].properties
      
      return {
        landUseType: 'Agricultural',
        cropType: firstFeature.crop_type || firstFeature.landuse,
        irrigationType: firstFeature.irrigation || undefined,
        waterAvailability: determineWaterAvailability(firstFeature)
      }
    }

    return {
      landUseType: 'Agricultural',
      waterAvailability: 'Medium'
    }
  } catch (error) {
    return null
  }
}

/**
 * Get current location using browser geolocation
 */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        resolve(null)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

/**
 * Map Bhuvan soil types to our standard types
 */
function mapSoilType(bhuvanSoilType: string): string {
  const soilMapping: { [key: string]: string } = {
    'red': 'Red Soil',
    'black': 'Black Soil',
    'alluvial': 'Alluvial',
    'laterite': 'Red Soil',
    'clayey': 'Clay',
    'loamy': 'Clay Loam',
    'sandy': 'Sandy',
    'sandy loam': 'Sandy Loam',
    'silty': 'Silt',
    'silt loam': 'Silt Loam'
  }

  const lowerType = bhuvanSoilType?.toLowerCase() || ''
  
  for (const [key, value] of Object.entries(soilMapping)) {
    if (lowerType.includes(key)) {
      return value
    }
  }

  return 'Alluvial' // Default
}

/**
 * Determine climate zone based on coordinates and state
 */
function determineClimateZone(latitude: number, longitude: number, state: string): string {
  const stateClimate: { [key: string]: string } = {
    'Karnataka': 'Tropical',
    'Tamil Nadu': 'Tropical',
    'Kerala': 'Tropical',
    'Maharashtra': 'Semi-Arid',
    'Rajasthan': 'Arid',
    'Punjab': 'Sub-tropical',
    'Haryana': 'Sub-tropical',
    'Uttar Pradesh': 'Sub-tropical',
    'West Bengal': 'Tropical',
    'Gujarat': 'Semi-Arid'
  }

  return stateClimate[state] || 'Tropical'
}

/**
 * Fallback soil data based on general India regions
 */
function getFallbackSoilData(latitude: number, longitude: number): BhuvanSoilData {
  // Karnataka region typically has red soil
  if (latitude >= 11.5 && latitude <= 18.5 && longitude >= 74 && longitude <= 78.5) {
    return {
      soilType: 'Red Soil',
      soilTexture: 'Medium',
      soilPH: 6.5,
      organicCarbon: 0.5,
      nitrogenContent: 'Medium',
      phosphorusContent: 'Medium',
      potassiumContent: 'Medium'
    }
  }

  // Default to Alluvial for other regions
  return {
    soilType: 'Alluvial',
    soilTexture: 'Medium',
    soilPH: 7.0,
    organicCarbon: 0.6,
    nitrogenContent: 'Medium',
    phosphorusContent: 'Medium',
    potassiumContent: 'Medium'
  }
}

/**
 * Fallback location data
 */
function getFallbackLocationData(latitude: number, longitude: number): BhuvanLocationData {
  return {
    latitude,
    longitude,
    village: '',
    taluk: '',
    district: 'Unknown',
    state: 'Karnataka',
    pincode: '',
    climateZone: 'Tropical'
  }
}

/**
 * Fallback land use data
 */
function getFallbackLandUseData(): BhuvanLandUseData {
  return {
    landUseType: 'Agricultural',
    waterAvailability: 'Medium'
  }
}

/**
 * Determine water availability from land use properties
 */
function determineWaterAvailability(properties: any): 'Low' | 'Medium' | 'High' {
  if (properties.irrigation === 'canal' || properties.irrigation === 'perennial') {
    return 'High'
  }
  if (properties.irrigation === 'rainfed') {
    return 'Low'
  }
  return 'Medium'
}

/**
 * Main function to detect complete field profile using Bhuvan
 */
export async function detectFieldProfileFromLocation(
  latitude?: number,
  longitude?: number,
  userDistrict?: string
) {
  try {
    // Get current location if not provided
    let coords = { latitude, longitude }
    
    if (!latitude || !longitude) {
      const currentLocation = await getCurrentLocation()
      if (!currentLocation) {
        throw new Error('Could not get location')
      }
      coords = currentLocation
    }

    // First get location data to determine district
    const locationData = await getLocationFromCoordinates(coords.latitude!, coords.longitude!)
    const district = userDistrict || locationData?.district || ''

    // Fetch remaining data with district context
    const [soilData, landUseData] = await Promise.all([
      getSoilDataFromCoordinates(coords.latitude!, coords.longitude!, district),
      getLandUseData(coords.latitude!, coords.longitude!, district)
    ])

    return {
      soil: soilData,
      location: locationData,
      landUse: landUseData,
      coordinates: coords
    }
  } catch (error) {
    return null
  }
}
