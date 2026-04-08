"use client"

import React, { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Check,
  AlertCircle,
  X
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Species = "cow" | "buffalo" | "goat" | "sheep"
type Sex = "male" | "female"
type ReproductiveStatus = "pregnant" | "lactating" | "dry" | "heifer" | "calf" | "other"
type RiskBand = "green" | "amber" | "red"

type SymptomState = Record<string, boolean>

type SymptomQuestion = {
  key: string
  raw_symptom: string
  question_en: string
  question_kn?: string
}

type VetRow = {
  id: string
  name: string
  phone: string
  type: string
  distance_km: number
}

type SyndromeRow = {
  code: string
  name: string
  score: number
}

type DiseasePrediction = {
  disease: string
  confidence: number
  matched_symptoms: string[]
  matched_count: number
}

type TriageResponse = {
  risk_band: RiskBand
  suspected_syndromes: SyndromeRow[]
  probable_diseases: DiseasePrediction[]
  explanation: string
  recommended_action: string
  advice_points: string[]
  nearest_vets: VetRow[]
  timestamp: string
  ruleset_version: string
}

const MAIN_BACKEND_URL = process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? "http://localhost:8000"
const PASHUDHANSAKHI_API_URL = process.env.NEXT_PUBLIC_PASHUDHANSAKHI_API_URL ?? `${MAIN_BACKEND_URL}/api/gateway/pashudhansakhi`

function riskTheme(risk: RiskBand) {
  if (risk === "red") return { chip: "bg-red-100 text-red-800 border-red-200", card: "border-red-200 bg-red-50/50", icon: ShieldAlert }
  if (risk === "amber") return { chip: "bg-amber-100 text-amber-800 border-amber-200", card: "border-amber-200 bg-amber-50/50", icon: AlertTriangle }
  return { chip: "bg-emerald-100 text-emerald-800 border-emerald-200", card: "border-emerald-200 bg-emerald-50/50", icon: ShieldCheck }
}

export default function PashudhanSakhiTriage() {
  const [questionLanguage, setQuestionLanguage] = useState<"en" | "kn">("en")
  const [species, setSpecies] = useState<Species>("cow")
  const [ageYears, setAgeYears] = useState("3.5")
  const [sex, setSex] = useState<Sex>("female")
  const [reproductiveStatus, setReproductiveStatus] = useState<ReproductiveStatus>("lactating")
  const [pincode, setPincode] = useState("560064")
  const [notes, setNotes] = useState("Animal is dull since yesterday.")
  const [symptoms, setSymptoms] = useState<SymptomState>({})
  const [symptomQuestions, setSymptomQuestions] = useState<SymptomQuestion[]>([])
  const [symptomLoading, setSymptomLoading] = useState(true)
  const [backendReady, setBackendReady] = useState(false)

  const [triageLoading, setTriageLoading] = useState(false)
  const [vetsLoading, setVetsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null)
  const [vets, setVets] = useState<VetRow[]>([])

  const loadSymptoms = React.useCallback(async () => {
    setSymptomLoading(true)
    setError(null)
    try {
      const res = await fetch(`${PASHUDHANSAKHI_API_URL}/api/v1/symptoms`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data?.detail === "string" ? data.detail : "Unable to load symptom questions")
      }

      const list = (data?.symptoms || []) as SymptomQuestion[]
      setBackendReady(true)
      setSymptomQuestions(list)

      const initialState: SymptomState = {}
      for (const item of list) {
        initialState[item.key] = false
      }
      setSymptoms(initialState)
    } catch {
      setBackendReady(false)
      setError("Could not connect to backend. Please check connection.")
    } finally {
      setSymptomLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSymptoms()
  }, [loadSymptoms])

  React.useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
          const res = await fetch(url, { headers: { "Accept": "application/json" } })
          const data = await res.json()
          const postcodeRaw = String(data?.address?.postcode || "")
          const digits = postcodeRaw.replace(/\D/g, "").slice(0, 6)
          if (digits && digits.length === 6) {
            setPincode(digits)
          }
        } catch {
          // ignore
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const selectedSymptoms = useMemo(
    () => symptomQuestions.filter((s) => symptoms[s.key]).map((s) => s.raw_symptom),
    [symptoms, symptomQuestions]
  )

  const symptomProgress = useMemo(() => {
    if (!symptomQuestions.length) return 0
    return Math.round((selectedSymptoms.length / symptomQuestions.length) * 100)
  }, [selectedSymptoms.length, symptomQuestions.length])

  const validatePincode = (value: string) => /^\d{6}$/.test(value)

  const setSymptomValue = (key: string, value: boolean) => {
    setSymptoms((prev) => ({ ...prev, [key]: value }))
  }

  const resetSymptoms = () => {
    const cleared: SymptomState = {}
    for (const item of symptomQuestions) {
      cleared[item.key] = false
    }
    setSymptoms(cleared)
    setTriageResult(null)
  }

  const runTriage = async () => {
    setError(null)
    if (!validatePincode(pincode)) {
      setError("Please enter a valid 6-digit pincode.")
      return
    }

    const age = Number(ageYears)
    if (Number.isNaN(age) || age < 0 || age > 40) {
      setError("Age must be a valid number between 0 and 40.")
      return
    }

    setTriageLoading(true)
    try {
      const res = await fetch(`${PASHUDHANSAKHI_API_URL}/api/v1/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          species,
          age_years: age,
          sex,
          reproductive_status: reproductiveStatus,
          pincode,
          symptoms,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.detail || "Triage request failed")
      }

      setTriageResult(data as TriageResponse)
      setVets((data?.nearest_vets || []) as VetRow[])
      
      // Auto-scroll to results on mobile devices if needed
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Triage request failed")
    } finally {
      setTriageLoading(false)
    }
  }

  const fetchNearbyVets = async () => {
    setError(null)
    if (!validatePincode(pincode)) {
      setError("Please enter a valid 6-digit pincode.")
      return
    }

    setVetsLoading(true)
    try {
      const res = await fetch(`${PASHUDHANSAKHI_API_URL}/api/v1/vets?pincode=${encodeURIComponent(pincode)}&limit=8`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.detail || "Failed to load vets")
      }
      setVets(Array.isArray(data) ? (data as VetRow[]) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vets")
    } finally {
      setVetsLoading(false)
    }
  }

  const currentRisk = triageResult?.risk_band
  const theme = currentRisk ? riskTheme(currentRisk) : null
  const RiskIcon = theme?.icon
  const hasAnySymptom = selectedSymptoms.length > 0

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-700 p-4 sm:p-6 shadow-lg text-white">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-semibold uppercase tracking-wide mb-2">
              <Stethoscope className="h-3.5 w-3.5" /> Livestock Health Assistant
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">PashudhanSakhi Triage</h1>
            <p className="text-amber-100 mt-2 text-sm font-semibold italic max-w-xl">
              Symptom-first screening for faster field decisions and safer livestock care.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <Badge variant="outline" className={backendReady ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
            <span className={`w-2 h-2 rounded-full mr-2 ${backendReady ? "bg-emerald-500" : "bg-red-500"}`}></span>
            {backendReady ? "System Online" : "System Offline"}
          </Badge>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setQuestionLanguage("en")}
              className={`px-4 py-2 text-sm font-medium border rounded-l-lg transition-colors ${questionLanguage === "en" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            >
              EN
            </button>
            <button
              onClick={() => setQuestionLanguage("kn")}
              className={`px-4 py-2 text-sm font-medium border border-l-0 rounded-r-lg transition-colors ${questionLanguage === "kn" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            >
              KN
            </button>
          </div>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Animal Identity */}
          <Card>
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold">1</span>
                Animal Identity
              </CardTitle>
              <CardDescription>Provide basic profile information for accurate diagnosis.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              
              {/* Species */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Species</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "cow", label: "Cow" },
                    { id: "buffalo", label: "Buffalo" },
                    { id: "goat", label: "Goat" },
                    { id: "sheep", label: "Sheep" }
                  ].map(item => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={species === item.id ? "default" : "outline"}
                      onClick={() => setSpecies(item.id as Species)}
                      className={`h-16 text-base ${species === item.id ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm" : "hover:border-emerald-200 hover:bg-emerald-50/50"}`}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-semibold">Age (Years)</Label>
                  <Input 
                    type="number" step="0.5" 
                    value={ageYears} 
                    onChange={e => setAgeYears(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold">Sex</Label>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant={sex === "female" ? "default" : "outline"} 
                      onClick={() => setSex("female")}
                      className={`flex-1 h-12 ${sex === "female" ? "bg-slate-900" : ""}`}
                    >
                      Female
                    </Button>
                    <Button 
                      type="button" 
                      variant={sex === "male" ? "default" : "outline"} 
                      onClick={() => setSex("male")}
                      className={`flex-1 h-12 ${sex === "male" ? "bg-slate-900" : ""}`}
                    >
                      Male
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reproductive Status */}
              <div className="space-y-3">
                <Label className="font-semibold">Reproductive Stage</Label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "pregnant", label: "Pregnant" },
                    { id: "lactating", label: "Lactating" },
                    { id: "dry", label: "Dry Period" },
                    { id: "heifer", label: "Heifer" },
                    { id: "calf", label: "Calf" }
                  ].map(stage => (
                    <Button
                      key={stage.id}
                      type="button"
                      variant={reproductiveStatus === stage.id ? "default" : "outline"}
                      onClick={() => setReproductiveStatus(stage.id as ReproductiveStatus)}
                      className={`justify-start h-12 px-4 font-normal ${reproductiveStatus === stage.id ? "bg-emerald-600 hover:bg-emerald-700" : "hover:border-emerald-200"}`}
                    >
                      {reproductiveStatus === stage.id && <Check className="w-4 h-4 mr-2" />}
                      {!reproductiveStatus && <span className="w-4 h-4 mr-2" />}
                      {stage.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Location & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-3">
                  <Label className="font-semibold">Pincode</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={pincode} 
                      onChange={e => setPincode(e.target.value)} 
                      className="pl-10 h-12 font-medium" 
                      placeholder="e.g. 560064"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold">Additional Notes</Label>
                  <Input 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="h-12" 
                    placeholder="Brief observations..."
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Step 2: Symptoms */}
          <Card>
            <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold">2</span>
                  Clinical Markers
                </CardTitle>
                <CardDescription className="mt-1">Toggle all observed symptoms carefully.</CardDescription>
              </div>
              {!symptomLoading && symptomQuestions.length > 0 && (
                 <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-slate-500 mb-1">Completion Index</span>
                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${symptomProgress}%` }} />
                    </div>
                 </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {symptomLoading && (
                <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-emerald-600" />
                  <p>Loading clinical questionnaires...</p>
                </div>
              )}

              {!symptomLoading && error && !backendReady && (
                <div className="p-8 text-center bg-red-50/50">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-medium mb-4">{error}</p>
                  <Button variant="outline" onClick={loadSymptoms}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
                  </Button>
                </div>
              )}

              {!symptomLoading && symptomQuestions.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {symptomQuestions.map((s) => (
                    <div key={s.key} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${symptoms[s.key] === true ? 'bg-emerald-50/50' : symptoms[s.key] === false ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                      <p className="text-base font-medium text-slate-800 leading-snug">
                        {questionLanguage === "kn" ? (s.question_kn || s.question_en || s.raw_symptom) : (s.question_en || s.raw_symptom)}
                      </p>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          size="sm"
                          variant={symptoms[s.key] === true ? "default" : "outline"}
                          className={`w-20 ${symptoms[s.key] === true ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-600 border-slate-300'}`}
                          onClick={() => setSymptomValue(s.key, true)}
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Yes
                        </Button>
                        <Button 
                          size="sm"
                          variant={symptoms[s.key] === false ? "destructive" : "outline"}
                          className={`w-20 ${symptoms[s.key] === false ? 'bg-slate-800 hover:bg-slate-900' : 'text-slate-600 border-slate-300'}`}
                          onClick={() => setSymptomValue(s.key, false)}
                        >
                          <X className="w-4 h-4 mr-1.5" /> No
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            {/* Run Triage Footer */}
            <CardFooter className="p-6 bg-slate-50/80 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-medium text-slate-600">
                 <span className="text-slate-900 font-bold">{selectedSymptoms.length}</span> markers selected
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-none"
                  onClick={resetSymptoms}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button 
                  onClick={runTriage}
                  disabled={triageLoading || !backendReady || selectedSymptoms.length === 0}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-8"
                >
                  {triageLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Stethoscope className="w-4 h-4 mr-2" />}
                  Evaluate Animal
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center justify-between">
                Risk Assessment
                {triageResult && theme && <Badge variant="outline" className={theme.chip}>{triageResult.risk_band.toUpperCase()}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!triageResult ? (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                   <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                   <p className="text-sm text-slate-500">Submit a complete form to view the calculated risk band and recommendations.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {theme && RiskIcon && (
                    <div className={`p-4 rounded-lg border ${theme.card}`}>
                      <p className="text-sm font-medium text-slate-800 mb-2">Explanation</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{triageResult.explanation}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-slate-800 mb-2 mt-4">Required Action</p>
                    <div className="bg-slate-900 text-white p-4 rounded-lg">
                       <p className="text-sm leading-relaxed">{triageResult.recommended_action}</p>
                    </div>
                  </div>

                  {triageResult.advice_points && triageResult.advice_points.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-800 mb-3">Professional Advice</p>
                      <ul className="space-y-2">
                        {triageResult.advice_points.map((point, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg">Differential Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!triageResult ? (
                 <p className="text-sm text-slate-500 italic">No symptoms analyzed.</p>
              ) : (
                 <div className="space-y-4">
                   {triageResult.probable_diseases?.length ? (
                     <div className="space-y-3">
                       {triageResult.probable_diseases.map((d) => (
                         <div key={d.disease} className="p-3 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-slate-800 capitalize">{d.disease}</span>
                              <Badge variant="secondary" className="bg-slate-100">{d.confidence.toFixed(1)}%</Badge>
                            </div>
                            <span className="text-xs text-slate-500">Matched {d.matched_count} markers</span>
                         </div>
                       ))}
                     </div>
                   ) : triageResult.suspected_syndromes.length > 0 ? (
                     <div className="space-y-3">
                       {triageResult.suspected_syndromes.map((s) => (
                         <div key={s.code} className="p-3 border border-slate-200 rounded-lg bg-white shadow-sm">
                           <div className="font-semibold text-slate-800">{s.name}</div>
                           <div className="flex justify-between mt-1 text-xs text-slate-500">
                              <span>Code: {s.code}</span>
                              <span>Score: {s.score.toFixed(1)}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-slate-600 p-3 bg-slate-50 border rounded-lg">No clear syndrome identified. A vet evaluation is highly recommended.</p>
                   )}
                 </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Nearby Veterinarians</CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={fetchNearbyVets} disabled={vetsLoading || !backendReady}>
                 <Search className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 px-4">
               {vetsLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin w-5 h-5 text-emerald-600" /></div>}
               {!vetsLoading && !vets.length && (
                 <div className="text-center">
                    <p className="text-sm text-slate-500 mb-3">Find professionals near {pincode}</p>
                    <Button variant="outline" size="sm" onClick={fetchNearbyVets} disabled={!backendReady} className="w-full">Search Area</Button>
                 </div>
               )}
               {!vetsLoading && vets.length > 0 && (
                 <div className="space-y-3">
                   {vets.map((v) => (
                      <div key={v.id} className="p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50">
                         <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-slate-800">{v.name}</span>
                            <span className="text-xs bg-white px-2 py-0.5 rounded border">{v.distance_km.toFixed(1)} km</span>
                         </div>
                         <div className="text-xs text-slate-500 mb-2">{v.type}</div>
                         <div className="text-sm font-medium text-emerald-700">{v.phone}</div>
                      </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
