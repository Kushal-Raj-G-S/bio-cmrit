"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, Sprout, MapPin, Calendar, Zap, Plus, Edit2, Trash2, AlertCircle, BookOpen, DollarSign, ShieldAlert, Leaf, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { detectFieldProfileFromLocation, getCurrentLocation } from "@/lib/bhuvan-api"

// Dynamic Leaflet map — loaded client-side only to avoid SSR issues
const FieldMap = dynamic(
  () => import('leaflet').then(async (L) => {
    // Ensure leaflet CSS is loaded
    if (typeof window !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
    // Fix default marker icon broken by webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    function Map({ lat, lng, label }: { lat: number; lng: number; label: string }) {
      return (
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: '220px', width: '100%', borderRadius: '8px' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <Marker position={[lat, lng]}>
            <Popup>{label}</Popup>
          </Marker>
        </MapContainer>
      )
    }
    return Map
  }),
  { ssr: false, loading: () => <div className="h-[220px] w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400">Loading satellite map…</div> }
)

interface FieldBatch {
  id: string
  user_id: string
  name: string
  location: string
  soil_type: string
  season: string
  climate_zone: string
  current_crop: string
  size: number
  size_unit?: 'hectares' | 'acres'
  irrigation_type?: string
  water_reliability?: 'Low' | 'Medium' | 'High'
  pest_history?: boolean
  disease_history?: string
  flood_drought_risk?: string
  ai_soil_detected?: string
  ai_climate_detected?: string
  ai_season_detected?: string
  status: 'active' | 'planning' | 'fallow' | 'harvested'
  notes: string
  created_at: string
  updated_at: string
}

interface RotationEntry {
  season: string
  recommended_crop: string
  variety_suggestion: string
  rationale: string
  expected_yield: string
  input_requirements: string
  risk_notes: string
}

interface AIPlan {
  field_id: string
  field_name: string
  location: string
  generated_at: string
  rotation_plan: RotationEntry[]
  soil_health_advisory: string
  water_management_tip: string
  pest_disease_management: string
  economic_outlook: string
  retrieved_sources: string[]
  model_used: string
  confidence: 'High' | 'Medium' | 'Low'
}

type PlanLanguage = 'en' | 'hi' | 'kn'

interface PlanTranslationResponse {
  success: boolean
  language: 'hi' | 'kn'
  plan?: AIPlan
  translated_by?: string
  error?: string
}

const MAIN_BACKEND_URL = process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? 'http://localhost:8000'
const KRISHICHAKRA_API_URL =
  process.env.NEXT_PUBLIC_KRISHICHAKRA_API_URL ??
  process.env.NEXT_PUBLIC_RAG_URL ??
  `${MAIN_BACKEND_URL}/api/gateway/krishichakra`

export default function FieldsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fieldBatches, setFieldBatches] = useState<FieldBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false)
  const [editingField, setEditingField] = useState<FieldBatch | null>(null)
  const [newField, setNewField] = useState<{
    name: string
    location: string
    soil_type: string
    season: string
    climate_zone: string
    current_crop: string
    size: number
    size_unit: 'hectares' | 'acres'
    irrigation_type: string
    water_reliability: 'Low' | 'Medium' | 'High' | ''
    pest_history: boolean
    disease_history: string
    flood_drought_risk: string
    ai_soil_detected: string
    ai_climate_detected: string
    ai_season_detected: string
    status: 'active' | 'planning' | 'fallow' | 'harvested'
    notes: string
  }>({
    name: '',
    location: '',
    soil_type: '',
    season: '',
    climate_zone: '',
    current_crop: '',
    size: 0,
    size_unit: 'hectares',
    irrigation_type: '',
    water_reliability: '',
    pest_history: false,
    disease_history: '',
    flood_drought_risk: '',
    ai_soil_detected: '',
    ai_climate_detected: '',
    ai_season_detected: '',
    status: 'planning',
    notes: ''
  })
  const [detectingProfile, setDetectingProfile] = useState(false)
  const [editingAIProfile, setEditingAIProfile] = useState(false)
  const detectedDistrictRef = useRef<string>('')  // stores Bhuvan-detected district for live notes regen
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [aiPlanField, setAiPlanField] = useState<FieldBatch | null>(null)
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null)
  const [aiPlanLoading, setAiPlanLoading] = useState(false)
  const [aiPlanError, setAiPlanError] = useState<string | null>(null)
  const [selectedPlanLanguage, setSelectedPlanLanguage] = useState<PlanLanguage>('en')
  const [translationCache, setTranslationCache] = useState<Partial<Record<PlanLanguage, AIPlan>>>({})
  const [translationBusy, setTranslationBusy] = useState(false)
  const [translationError, setTranslationError] = useState<string | null>(null)
  const translationInFlightRef = useRef<Partial<Record<'hi' | 'kn', Promise<void>>>>({})

  // Get current user and load data
  useEffect(() => {
    // Safety timeout — never stay stuck loading more than 5 seconds
    const safetyTimer = setTimeout(() => {
      console.warn('⚠️ Safety timeout triggered — forcing loading to false')
      setLoading(false)
    }, 5000)

    const initializeData = async () => {
      try {
        setLoading(true)
        
        console.log('🔄 Initializing fields page...')
        
        let resolvedUserId: string | null = null

        // Check localStorage FIRST — password-auth users have no Supabase session
        // This avoids a slow network call that causes the 8s safety timeout
        if (typeof window !== 'undefined') {
          const passwordUserId = localStorage.getItem('biobloom_password_user_id')
          const passwordAuth = localStorage.getItem('biobloom_password_auth')
          if (passwordUserId && passwordAuth === 'true') {
            console.log('🔑 Using password-auth user id:', passwordUserId)
            resolvedUserId = passwordUserId
            setUser({ id: passwordUserId })
          }
        }

        // Only hit the network if not already resolved via password auth
        if (!resolvedUserId) {
          const { data: { session } } = await supabase.auth.getSession()
          const currentUser = session?.user || null
          console.log('👤 Session user:', currentUser?.id)
          if (currentUser) {
            resolvedUserId = currentUser.id
            setUser(currentUser)
          }
        }

        if (!resolvedUserId) {
          console.log('❌ No user found, redirecting to auth')
          setLoading(false)
          window.location.href = '/auth'
          return
        }

        const userId = resolvedUserId

        // Use server-side API route — bypasses RLS, works for password-auth users
        console.log('📋 Fetching profile for user:', userId)
        const [profileRes, fieldsRes] = await Promise.all([
          fetch(`/api/user-data?userId=${userId}&table=profiles`).then(r => r.json()),
          fetch(`/api/user-data?userId=${userId}&table=field_batches`).then(r => r.json())
        ])

        if (profileRes.data) {
          console.log('✅ Profile loaded:', profileRes.data.full_name || profileRes.data.phone)
          setProfile(profileRes.data)
        } else {
          console.log('⚠️ No profile found')
        }

        const fieldsData = Array.isArray(fieldsRes.data) ? fieldsRes.data : []
        console.log('✅ Loaded fields:', fieldsData.length, 'fields')
        setFieldBatches(fieldsData)

        console.log('✅ Initialization complete')
      } catch (error) {
        console.error('❌ Error initializing data:', error)
        setFieldBatches([])
      } finally {
        clearTimeout(safetyTimer)
        console.log('✅ Setting loading to false')
        setLoading(false)
      }
    }

    initializeData()

    return () => clearTimeout(safetyTimer)
  }, [])

  // ── AI helper: derive flood/drought risk from location data ───────────────
  const generateFloodDroughtRisk = (
    waterAvailability: string,
    irrigationType: string,
    climateZone: string,
    district?: string
  ): string => {
    const water = (waterAvailability || '').toLowerCase()
    const irrigation = (irrigationType || '').toLowerCase()
    const climate = (climateZone || '').toLowerCase()
    const floodProneDistricts = ['Raichur', 'Bidar', 'Kalaburagi', 'Yadgir', 'Vijayapura']
    if (district && floodProneDistricts.some(d => district.includes(d))) {
      return 'High Flood Risk — known flood-prone district; avoid low-lying cultivation in Jul–Aug'
    }
    if (water === 'low' || irrigation === 'rainfed') {
      if (climate.includes('semi-arid') || climate.includes('arid')) {
        return 'High Drought Risk — rainfed semi-arid zone; consider drought-tolerant crops'
      }
      return 'Moderate Drought Risk — rainfed; ensure water conservation practices'
    }
    if (water === 'high' && (irrigation === 'canal' || irrigation === 'river')) {
      return 'Moderate Flood Risk — canal-fed area; ensure drainage before monsoon'
    }
    if (water === 'medium' && irrigation === 'drip') {
      return 'Low Risk — drip-irrigated field with stable water supply'
    }
    if (irrigation === 'borewell') {
      return 'Low Drought Risk — borewell-fed; monitor groundwater levels seasonally'
    }
    return 'Low Risk — stable water conditions detected for this region'
  }

  // ── AI helper: generate notes from field data ────────────────────────────
  const generateNotes = (
    soilType: string,
    climateZone: string,
    season: string,
    irrigationType: string,
    currentCrop: string,
    _district?: string   // kept for call-site compat, intentionally not used in notes
  ): string => {
    const parts: string[] = []
    if (soilType) parts.push(`${soilType} field`)
    if (climateZone) parts.push(`${climateZone} zone`)
    if (irrigationType) parts.push(`${irrigationType.toLowerCase()} irrigated`)
    if (season) parts.push(`suitable for ${season} season`)
    if (currentCrop && currentCrop !== 'Fallow') parts.push(`currently growing ${currentCrop}`)
    // district intentionally excluded — shown on map instead
    return parts.length > 0 ? parts.join(', ') + '.' : ''
  }

  // AI Detection for soil, climate, and season using ISRO Bhuvan
  const detectFieldProfile = async () => {
    setDetectingProfile(true)
    
    try {
      console.log('🛰️ Detecting field profile using ISRO Bhuvan...')
      
      // Get Bhuvan data based on user's location or profile location
      // Pass user's district from profile for district-based LULC queries
      const bhuvanData = await detectFieldProfileFromLocation(
        undefined,
        undefined,
        profile?.district
      )
      
      if (bhuvanData) {
        console.log('✅ Bhuvan data received:', bhuvanData)
        
        // Determine season based on current month
        const currentMonth = new Date().getMonth()
        const detectedSeason = currentMonth >= 6 && currentMonth <= 9 ? 'Kharif' : 'Rabi'
        const detectedSoil = bhuvanData.soil?.soilType || 'Red Soil'
        const detectedClimate = bhuvanData.location?.climateZone || 'Tropical'
        const detectedWater = bhuvanData.landUse?.waterAvailability || 'Medium'
        const detectedIrrigation = bhuvanData.landUse?.irrigationType || ''
        const detectedDistrict = bhuvanData.location?.district || profile?.district || ''
        detectedDistrictRef.current = detectedDistrict  // ← persist for live notes regen
        if (bhuvanData.coordinates?.latitude && bhuvanData.coordinates?.longitude) {
          setDetectedCoords({ lat: bhuvanData.coordinates.latitude, lng: bhuvanData.coordinates.longitude })
        } else {
          // fallback: try to get current GPS coords for map display
          getCurrentLocation().then(pos => { if (pos) setDetectedCoords({ lat: pos.latitude, lng: pos.longitude }) })
        }

        const floodRisk = generateFloodDroughtRisk(detectedWater, detectedIrrigation, detectedClimate, detectedDistrict)
        const autoNotes = generateNotes(detectedSoil, detectedClimate, detectedSeason, detectedIrrigation, '', detectedDistrict)

        setNewField(prev => ({
          ...prev,
          ai_soil_detected: detectedSoil,
          ai_climate_detected: detectedClimate,
          ai_season_detected: detectedSeason,
          soil_type: detectedSoil,
          climate_zone: detectedClimate,
          season: detectedSeason,
          location: bhuvanData.location
            ? [bhuvanData.location.village, bhuvanData.location.taluk, bhuvanData.location.district, bhuvanData.location.state]
                .filter(Boolean)
                .join(', ')
            : `${profile?.district || profile?.city || ''}, ${profile?.state || ''}`.trim(),
          water_reliability: detectedWater,
          irrigation_type: detectedIrrigation,
          flood_drought_risk: floodRisk,
          notes: autoNotes
        }))
      } else {
        // Fallback to profile-based detection
        console.log('⚠️ Using fallback detection based on profile')
        detectedDistrictRef.current = profile?.district || ''
        const detectedSoil = profile?.state === 'Karnataka' ? 'Red Soil' : 'Alluvial'
        const detectedClimate = profile?.state === 'Karnataka' ? 'Tropical' : 'Sub-tropical'
        const currentMonth = new Date().getMonth()
        const detectedSeason = currentMonth >= 6 && currentMonth <= 9 ? 'Kharif' : 'Rabi'
        const floodRisk = generateFloodDroughtRisk('Medium', 'Rainfed', detectedClimate, profile?.district)
        const autoNotes = generateNotes(detectedSoil, detectedClimate, detectedSeason, 'Rainfed', '', profile?.district)
        
        setNewField(prev => ({
          ...prev,
          ai_soil_detected: detectedSoil,
          ai_climate_detected: detectedClimate,
          ai_season_detected: detectedSeason,
          soil_type: detectedSoil,
          climate_zone: detectedClimate,
          season: detectedSeason,
          location: `${profile?.district || profile?.city || ''}, ${profile?.state || ''}`.trim(),
          flood_drought_risk: floodRisk,
          notes: autoNotes
        }))
      }
    } catch (error) {
      console.error('❌ Error detecting field profile:', error)
      // Use basic fallback
      const currentMonth = new Date().getMonth()
      const detectedSeason = currentMonth >= 6 && currentMonth <= 9 ? 'Kharif' : 'Rabi'
      
      setNewField(prev => ({
        ...prev,
        ai_soil_detected: 'Alluvial',
        ai_climate_detected: 'Tropical',
        ai_season_detected: detectedSeason,
        soil_type: 'Alluvial',
        climate_zone: 'Tropical',
        season: detectedSeason,
        flood_drought_risk: 'Low Risk — stable water conditions detected for this region',
        notes: `Alluvial field, Tropical zone, suitable for ${detectedSeason} season.`
      }))
    } finally {
      setDetectingProfile(false)
    }
  }

  // Trigger AI detection when dialog opens
  useEffect(() => {
    if (isAddFieldOpen && !editingField && !newField.ai_soil_detected) {
      detectFieldProfile()
    }
  }, [isAddFieldOpen])

  // Regenerate notes live when crop or irrigation changes (uses detected location, not profile)
  useEffect(() => {
    if (!isAddFieldOpen) return
    if (!newField.soil_type) return
    // Use the Bhuvan-detected district (stored in ref), not profile.district
    const detectedDistrict = detectedDistrictRef.current || profile?.district || ''
    const updatedNotes = generateNotes(
      newField.soil_type,
      newField.climate_zone,
      newField.season,
      newField.irrigation_type,
      newField.current_crop,
      detectedDistrict
    )
    if (updatedNotes) {
      setNewField(prev => ({ ...prev, notes: updatedNotes }))
    }
  }, [newField.current_crop, newField.irrigation_type])

  // Add new field batch
  const handleAddField = async () => {
    if (!user?.id || !newField.name || !newField.soil_type || !newField.season || !newField.size) {
      alert('Please fill in all required fields (Name, Soil Type, Season, Size)')
      return
    }

    try {
      const res = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'field_batches', record: { user_id: user.id, ...newField } })
      })
      const { data, error } = await res.json()
      if (error) throw new Error(error)
      
      if (data) {
        setFieldBatches([data, ...fieldBatches])
        setNewField({
          name: '',
          location: '',
          soil_type: '',
          season: '',
          climate_zone: '',
          current_crop: '',
          size: 0,
          size_unit: 'hectares',
          irrigation_type: '',
          water_reliability: '',
          pest_history: false,
          disease_history: '',
          flood_drought_risk: '',
          ai_soil_detected: '',
          ai_climate_detected: '',
          ai_season_detected: '',
          status: 'planning',
          notes: ''
        })
        setIsAddFieldOpen(false)
        detectedDistrictRef.current = ''  // reset for next open
        setDetectedCoords(null)
      }
    } catch (error) {
      console.error('Error creating field:', error)
      alert('Failed to create field. Please try again.')
    }
  }

  // Edit field batch
  const handleEditField = (field: FieldBatch) => {
    setEditingField(field)
    setNewField({
      name: field.name,
      location: field.location || '',
      soil_type: field.soil_type,
      season: field.season,
      climate_zone: field.climate_zone || '',
      current_crop: field.current_crop || '',
      size: field.size,
      size_unit: field.size_unit || 'hectares',
      irrigation_type: field.irrigation_type || '',
      water_reliability: field.water_reliability || '',
      pest_history: field.pest_history || false,
      disease_history: field.disease_history || '',
      flood_drought_risk: field.flood_drought_risk || '',
      ai_soil_detected: field.ai_soil_detected || '',
      ai_climate_detected: field.ai_climate_detected || '',
      ai_season_detected: field.ai_season_detected || '',
      status: field.status,
      notes: field.notes || ''
    })
    setIsAddFieldOpen(true)
  }

  // Update field batch
  const handleUpdateField = async () => {
    if (!editingField || !newField.name || !newField.soil_type || !newField.season || !newField.size) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const res = await fetch('/api/user-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'field_batches', id: editingField.id, record: newField })
      })
      const { data, error } = await res.json()
      if (error) throw new Error(error)
      
      if (data) {
        setFieldBatches(fieldBatches.map(field => 
          field.id === editingField.id ? data : field
        ))
        setEditingField(null)
        setNewField({
          name: '',
          location: '',
          soil_type: '',
          season: '',
          climate_zone: '',
          current_crop: '',
          size: 0,
          size_unit: 'hectares',
          irrigation_type: '',
          water_reliability: '',
          pest_history: false,
          disease_history: '',
          flood_drought_risk: '',
          ai_soil_detected: '',
          ai_climate_detected: '',
          ai_season_detected: '',
          status: 'planning',
          notes: ''
        })
        setIsAddFieldOpen(false)
      }
    } catch (error) {
      console.error('Error updating field:', error)
      alert('Failed to update field. Please try again.')
    }
  }

  // Delete field batch
  const handleDeleteField = async (fieldId: string) => {
    try {
      const res = await fetch(`/api/user-data?table=field_batches&id=${fieldId}`, { method: 'DELETE' })
      const { error } = await res.json()
      if (error) throw new Error(error)
      setFieldBatches(fieldBatches.filter(field => field.id !== fieldId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting field:', error)
      setDeleteConfirm(null)
      alert('Failed to delete field. Please try again.')
    }
  }

  const handleAIPlan = async (field: FieldBatch) => {
    setAiPlanField(field)
    setAiPlan(null)
    setAiPlanError(null)
    setSelectedPlanLanguage('en')
    setTranslationCache({})
    translationInFlightRef.current = {}
    setTranslationError(null)
    setAiPlanLoading(true)
    try {
      const res = await fetch(`${KRISHICHAKRA_API_URL}/api/v1/crop-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(field)
      })
      const data = await res.json()
      if (data.success && data.plan) {
        setAiPlan(data.plan)
        setTranslationCache({ en: data.plan })
      } else {
        setAiPlanError(data.error ?? 'Unknown error from RAG server')
      }
    } catch (err: any) {
      setAiPlanError(`Could not reach unified backend/server: ${err?.message ?? err}`)
    } finally {
      setAiPlanLoading(false)
    }
  }

  const requestPlanTranslation = async (language: 'hi' | 'kn', plan: AIPlan) => {
    if (translationCache[language]) return
    const inFlight = translationInFlightRef.current[language]
    if (inFlight) {
      await inFlight
      return
    }

    const pending = (async () => {
      const res = await fetch(`${KRISHICHAKRA_API_URL}/api/v1/crop-plan/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, plan }),
      })
      const data: PlanTranslationResponse = await res.json()
      if (!data.success || !data.plan) {
        throw new Error(data.error ?? `Translation failed for ${language}`)
      }
      setTranslationCache((prev) => ({ ...prev, [language]: data.plan as AIPlan }))
    })()

    translationInFlightRef.current[language] = pending
    try {
      await pending
    } finally {
      delete translationInFlightRef.current[language]
    }
  }

  useEffect(() => {
    if (!aiPlan) return
    if (selectedPlanLanguage === 'en') {
      setTranslationError(null)
      return
    }
    if (translationCache[selectedPlanLanguage]) {
      setTranslationError(null)
      return
    }
    const translateNow = async () => {
      setTranslationBusy(true)
      setTranslationError(null)
      try {
        await requestPlanTranslation(selectedPlanLanguage, aiPlan)
      } catch (err: any) {
        setTranslationError(err?.message ?? 'Translation failed')
      } finally {
        setTranslationBusy(false)
      }
    }
    translateNow()
  }, [selectedPlanLanguage, aiPlan, translationCache])

  const displayedPlan = selectedPlanLanguage === 'en'
    ? aiPlan
    : translationCache[selectedPlanLanguage] ?? aiPlan

  const soilTypes = ['Clay', 'Clay Loam', 'Sandy', 'Sandy Loam', 'Silt', 'Silt Loam', 'Black Soil', 'Red Soil', 'Alluvial']
  const seasons = ['Kharif', 'Rabi', 'Zaid']
  const climateZones = ['Tropical', 'Sub-tropical', 'Semi-Arid', 'Arid', 'Temperate']
  const crops = [
    'Rice', 'Wheat', 
    'Chickpea', 'Green Gram', 'Peas', 'Soybean', 'Cowpea',
    'Sunflower', 'Maize', 'Potato', 'Barley',
    'Canola', 'Rapeseed',
    'Fallow (No Crop)'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your fields...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your fields</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 p-4 sm:p-6 shadow-lg text-white">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-semibold uppercase tracking-wide">
              <Leaf className="h-3.5 w-3.5" /> AI Rotation Planner
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">KrishiChakra</h1>
            <p className="text-emerald-100 text-sm font-semibold italic">
              Plan Better Rotations. Protect Soil. Improve Yield Stability.
            </p>
          </div>
          <div className="text-sm text-emerald-100 font-medium">
            Welcome, {profile?.full_name || user?.email || "Farmer"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fields</p>
                <p className="text-3xl font-bold text-gray-800">{fieldBatches.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Sprout className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Area</p>
                <p className="text-3xl font-bold text-gray-800">{fieldBatches.reduce((sum, field) => sum + field.size, 0)} ha</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Fields</p>
                <p className="text-3xl font-bold text-gray-800">{fieldBatches.filter(f => f.status === "active").length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planning</p>
                <p className="text-3xl font-bold text-gray-800">{fieldBatches.filter(f => f.status === "planning").length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl font-bold text-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded"></div>
                  <div className="w-2 h-2 bg-green-600 rounded"></div>
                  <div className="w-2 h-2 bg-yellow-600 rounded"></div>
                  <div className="w-2 h-2 bg-orange-600 rounded"></div>
                </div>
              </div>
              Field Batches ({fieldBatches.length})
            </div>
            <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setEditingField(null)
                    setNewField({
                      name: '',
                      location: '',
                      soil_type: '',
                      season: '',
                      climate_zone: '',
                      current_crop: '',
                      size: 0,
                      size_unit: 'hectares',
                      irrigation_type: '',
                      water_reliability: '',
                      pest_history: false,
                      disease_history: '',
                      flood_drought_risk: '',
                      ai_soil_detected: '',
                      ai_climate_detected: '',
                      ai_season_detected: '',
                      status: 'planning',
                      notes: ''
                    })
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingField ? 'Edit Field' : 'Add New Field'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingField ? 'Update your field information' : 'Add field details to get AI-powered crop rotation recommendations'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* STEP 1: Basic Information - Field Name and Size with Unit Toggle */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Sprout className="h-4 w-4" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Field Name *</Label>
                        <Input
                          id="name"
                          value={newField.name}
                          onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., North Field A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Size *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="size"
                            type="number"
                            step="0.1"
                            value={newField.size || ''}
                            onChange={(e) => setNewField(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
                            placeholder="e.g., 2.5"
                            className="flex-1"
                          />
                          <Select value={newField.size_unit} onValueChange={(value: 'hectares' | 'acres') => setNewField(prev => ({ ...prev, size_unit: value }))}>
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hectares">Hectares</SelectItem>
                              <SelectItem value="acres">Acres</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2 & 3: AI Detected Profile - Replace manual dropdowns with AI detection */}
                  <div className="space-y-4 border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        AI Detected Profile
                      </h4>
                      {!editingAIProfile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAIProfile(true)}
                          className="text-green-700 hover:text-green-900"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {detectingProfile ? (
                      <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
                        <p className="mt-3 text-sm text-green-700">Detecting field profile...</p>
                      </div>
                    ) : editingAIProfile ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-green-900">Soil Type *</Label>
                            <Select value={newField.soil_type} onValueChange={(value) => setNewField(prev => ({ ...prev, soil_type: value, ai_soil_detected: value }))}>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select soil type" />
                              </SelectTrigger>
                              <SelectContent>
                                {soilTypes.map((soil) => (
                                  <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-green-900">Climate Zone</Label>
                            <Select value={newField.climate_zone} onValueChange={(value) => setNewField(prev => ({ ...prev, climate_zone: value, ai_climate_detected: value }))}>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select climate" />
                              </SelectTrigger>
                              <SelectContent>
                                {climateZones.map((climate) => (
                                  <SelectItem key={climate} value={climate}>{climate}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-green-900">Primary Season *</Label>
                            <Select value={newField.season} onValueChange={(value) => setNewField(prev => ({ ...prev, season: value, ai_season_detected: value }))}>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                              <SelectContent>
                                {seasons.map((season) => (
                                  <SelectItem key={season} value={season}>{season}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAIProfile(false)}
                          className="w-full"
                        >
                          Save Override
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Soil Type</p>
                          <p className="text-sm font-semibold text-green-900">{newField.ai_soil_detected || 'Detecting...'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Climate</p>
                          <p className="text-sm font-semibold text-green-900">{newField.ai_climate_detected || 'Detecting...'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Season</p>
                          <p className="text-sm font-semibold text-green-900">{newField.ai_season_detected || 'Detecting...'}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* STEP 4: Active Crop (renamed from Current Crop) */}
                    <div className="space-y-2">
                      <Label className="text-green-900">Active Crop</Label>
                      <Select value={newField.current_crop} onValueChange={(value) => setNewField(prev => ({ ...prev, current_crop: value }))}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select active crop or fallow" />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map((crop) => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* STEP 5: Water & Irrigation Intelligence */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Water & Irrigation Intelligence
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="irrigationType">Irrigation Type</Label>
                        <Select value={newField.irrigation_type} onValueChange={(value) => setNewField(prev => ({ ...prev, irrigation_type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Rainfed">Rainfed</SelectItem>
                            <SelectItem value="Drip">Drip</SelectItem>
                            <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                            <SelectItem value="Canal">Canal</SelectItem>
                            <SelectItem value="Borewell">Borewell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waterReliability">Water Reliability</Label>
                        <Select value={newField.water_reliability} onValueChange={(value: any) => setNewField(prev => ({ ...prev, water_reliability: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reliability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* STEP 6: Location Intelligence — Satellite Map */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Field Location
                      {detectedCoords && (
                        <span className="ml-auto text-xs font-normal text-green-600 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          GPS Detected
                        </span>
                      )}
                    </h4>
                    {detectedCoords ? (
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <FieldMap
                          lat={detectedCoords.lat}
                          lng={detectedCoords.lng}
                          label={newField.location || 'Field Location'}
                        />
                        {newField.location && (
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {newField.location}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[220px] rounded-lg bg-gray-100 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300">
                        <MapPin className="h-8 w-8 text-gray-300" />
                        <p className="text-sm text-gray-400">Detecting location…</p>
                      </div>
                    )}
                  </div>

                  {/* STEP 7: Risk & Field History */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Risk & Field History
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="pestHistory"
                          checked={newField.pest_history}
                          onChange={(e) => setNewField(prev => ({ ...prev, pest_history: e.target.checked }))}
                          className="h-4 w-4 text-green-600 rounded"
                        />
                        <Label htmlFor="pestHistory" className="cursor-pointer">Pest history in this field</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diseaseHistory">Disease History (Optional)</Label>
                        <Input
                          id="diseaseHistory"
                          value={newField.disease_history}
                          onChange={(e) => setNewField(prev => ({ ...prev, disease_history: e.target.value }))}
                          placeholder="e.g., Leaf blight in 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="floodDroughtRisk">Flood/Drought Risk</Label>
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-0">
                            <Zap className="h-2.5 w-2.5 mr-1 inline" />
                            AI Suggested
                          </Badge>
                        </div>
                        {newField.flood_drought_risk ? (
                          <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                            <Zap className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-orange-900">{newField.flood_drought_risk}</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400">
                            AI will suggest based on location...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STEP 9: Notes — AI Generated, user-editable */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="notes" className="text-sm text-gray-600">Notes</Label>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0">
                        ✨ AI Generated
                      </Badge>
                      <span className="text-xs text-gray-400">(editable)</span>
                    </div>
                    <Input
                      id="notes"
                      value={newField.notes}
                      onChange={(e) => setNewField(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="AI will generate observations once location is detected..."
                      className="text-sm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddFieldOpen(false)
                    setEditingField(null)
                    detectedDistrictRef.current = ''  // reset for next open
                    setDetectedCoords(null)
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingField ? handleUpdateField : handleAddField}
                    disabled={!newField.name || !newField.soil_type || !newField.season || !newField.size}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {editingField ? 'Update Field' : 'Add Field'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription className="text-gray-600">Manage your field batches with soil and climate data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fieldBatches.map((field) => (
              <Card key={field.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{field.name}</h3>
                      {field.location && <p className="text-sm text-gray-600">{field.location}</p>}
                      <p className="text-sm text-gray-700 mb-1">
                        {field.current_crop ? field.current_crop + " • " : ""}{field.size} hectares
                      </p>
                    </div>
                    <Badge 
                      variant={field.status === "active" ? "default" : field.status === "planning" ? "secondary" : "outline"}
                      className={field.status === "active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {field.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Soil:</span>
                      <span className="font-medium">{field.soil_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Season:</span>
                      <span className="font-medium">{field.season}</span>
                    </div>
                    {field.climate_zone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Climate:</span>
                        <span className="font-medium">{field.climate_zone}</span>
                      </div>
                    )}
                  </div>

                  {field.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">{field.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleAIPlan(field)}
                    >
                      <Zap className="mr-1 h-3 w-3" />
                      AI Plan
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditField(field)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteConfirm({ id: field.id, name: field.name })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {fieldBatches.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Sprout className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No fields added yet</p>
              <p className="text-sm">Click "Add Field" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── AI Plan Dialog ── */}
      <Dialog open={!!aiPlanField} onOpenChange={(open) => {
        if (!open) {
          setAiPlanField(null)
          setAiPlan(null)
          setAiPlanError(null)
          setSelectedPlanLanguage('en')
          setTranslationCache({})
          setTranslationError(null)
          setTranslationBusy(false)
        }
      }}>
          <DialogContent className="max-w-7xl w-[96vw] max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>AI Crop Plan — {aiPlanField?.name}</DialogTitle>
            <DialogDescription>
              Generated three-season crop rotation plan with advisory cards, translated language options, and risk/input details.
            </DialogDescription>
          </DialogHeader>

          {/* ── Header ── */}
          <div className="flex items-start md:items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b border-gray-100 shrink-0 gap-4">
            <div className="flex items-start md:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">AI Crop Plan — {aiPlanField?.name}</h2>
                {aiPlanField?.location && (
                  <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 break-words">
                    <MapPin className="h-3 w-3" />{aiPlanField.location}
                  </p>
                )}
              </div>
            </div>
            {displayedPlan && (
              <Badge className={`text-xs font-semibold px-3 py-1 shrink-0 ${
                displayedPlan.confidence === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : displayedPlan.confidence === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {displayedPlan.confidence} Confidence
              </Badge>
            )}
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Loading */}
            {aiPlanLoading && (
              <div className="py-24 flex flex-col items-center gap-5">
                <div className="relative w-16 h-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-500"></div>
                  <Leaf className="h-6 w-6 text-green-500 absolute inset-0 m-auto" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Generating your crop rotation plan…</p>
                  <p className="text-xs text-gray-400 mt-1">Retrieving agronomic research</p>
                </div>
              </div>
            )}

            {/* Error */}
            {!aiPlanLoading && aiPlanError && (
              <div className="py-20 flex flex-col items-center gap-4 text-center px-10">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-400" />
                </div>
                <p className="font-semibold text-gray-800">Could not generate plan</p>
                <p className="text-sm text-gray-500 max-w-md">{aiPlanError}</p>
                <Button variant="outline" size="sm" onClick={() => aiPlanField && handleAIPlan(aiPlanField)}>
                  Try again
                </Button>
              </div>
            )}

            {/* Plan content */}
            {!aiPlanLoading && displayedPlan && (
              <div className="px-5 md:px-8 py-6 md:py-7 space-y-8">

                <section className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Plan Language</div>
                  <div className="flex items-center gap-3">
                    <Select value={selectedPlanLanguage} onValueChange={(value: PlanLanguage) => setSelectedPlanLanguage(value)}>
                      <SelectTrigger className="w-[170px] bg-white">
                        <SelectValue placeholder="Choose language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="kn">Kannada</SelectItem>
                      </SelectContent>
                    </Select>
                    {translationBusy && selectedPlanLanguage !== 'en' && (
                      <span className="text-xs text-gray-400">Translating...</span>
                    )}
                  </div>
                </section>

                {translationError && selectedPlanLanguage !== 'en' && (
                  <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {translationError}
                  </section>
                )}

                {/* ── 3-Season Rotation — 3 columns side by side ── */}
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <Sprout className="h-4 w-4 text-green-600" />
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">3-Season Rotation Plan</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {displayedPlan.rotation_plan.map((entry, idx) => (
                      <div key={idx} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white flex flex-col">

                        {/* Season header */}
                        <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
                          <p className="text-[11px] font-bold text-green-700 uppercase tracking-widest">{entry.season}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Yield: <span className="font-bold text-green-700">{entry.expected_yield}</span>
                          </p>
                        </div>

                        <div className="px-4 py-4 flex flex-col gap-3 flex-1">
                          {/* Crop + variety */}
                          <div>
                            <p className="text-base font-bold text-gray-900 leading-snug">{entry.recommended_crop}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-semibold text-gray-600">Variety: </span>{entry.variety_suggestion}
                            </p>
                          </div>

                          {/* Rationale */}
                          <p className="text-xs text-gray-600 leading-5">{entry.rationale}</p>

                          {/* Input + Risk stacked */}
                          <div className="space-y-2 mt-auto">
                            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inputs</p>
                              <p className="text-xs text-slate-700 leading-5">{entry.input_requirements}</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Risk</p>
                              <p className="text-xs text-amber-800 leading-5">{entry.risk_notes}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Field Advisory — 2×2 grid ── */}
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <ShieldAlert className="h-4 w-4 text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Field Advisory</h3>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50/40 p-3 md:p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                      {[
                        {
                          title: 'Soil Health',
                          body: displayedPlan.soil_health_advisory,
                          icon: Leaf,
                          cardClass: 'border-amber-100 bg-amber-50/70',
                          iconWrapClass: 'bg-amber-100 text-amber-700',
                          titleClass: 'text-amber-700',
                          bodyClass: 'text-amber-900'
                        },
                        {
                          title: 'Water Management',
                          body: displayedPlan.water_management_tip,
                          icon: Calendar,
                          cardClass: 'border-blue-100 bg-blue-50/70',
                          iconWrapClass: 'bg-blue-100 text-blue-700',
                          titleClass: 'text-blue-700',
                          bodyClass: 'text-blue-900'
                        },
                        {
                          title: 'Pest & Disease',
                          body: displayedPlan.pest_disease_management,
                          icon: AlertCircle,
                          cardClass: 'border-rose-100 bg-rose-50/70',
                          iconWrapClass: 'bg-rose-100 text-rose-700',
                          titleClass: 'text-rose-700',
                          bodyClass: 'text-rose-900'
                        },
                        {
                          title: 'Economic Outlook',
                          body: displayedPlan.economic_outlook,
                          icon: DollarSign,
                          cardClass: 'border-emerald-100 bg-emerald-50/70',
                          iconWrapClass: 'bg-emerald-100 text-emerald-700',
                          titleClass: 'text-emerald-700',
                          bodyClass: 'text-emerald-900'
                        }
                      ].map((advisory) => {
                        const Icon = advisory.icon
                        return (
                          <article key={advisory.title} className={`rounded-2xl border p-4 md:p-5 ${advisory.cardClass}`}>
                            <div className="flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${advisory.iconWrapClass}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${advisory.titleClass}`}>{advisory.title}</p>
                                <p className={`text-sm leading-7 ${advisory.bodyClass}`}>{advisory.body}</p>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                </section>

              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 px-5 md:px-8 py-4 border-t border-gray-100 shrink-0 bg-white">
            <Button variant="outline" onClick={() => { setAiPlanField(null); setAiPlan(null); setAiPlanError(null) }}>
              Close
            </Button>
            {displayedPlan && (
              <Button className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => aiPlanField && handleAIPlan(aiPlanField)}>
                <Zap className="mr-1.5 h-4 w-4" />Regenerate
              </Button>
            )}
          </div>

        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Field
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">{deleteConfirm?.name}</span>?
              <br />
              <span className="text-red-500 text-xs mt-1 inline-block">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteField(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
