"use client"

import React, { useState } from "react"
import {
  Recycle, Leaf, MapPin, Navigation, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, Sparkles, FlaskConical, Trash2,
  CheckCircle2, Clock, RotateCcw, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// ─── Config ───────────────────────────────────────────────────────────────────
const API_KEY = "ddc-a4f-611b0911478b4bfba29cf847dc6e3b45"
const BASE_URL = "https://api.a4f.co/v1"
const MODEL = "provider-3/llama-3.3-70b"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Method {
  title: string
  tagline: string
  steps: string[]
  benefits: string[]
  timeframe: string
  difficulty: "Easy" | "Moderate" | "Advanced"
  emoji: string
  accentColor: string
  lightBg: string
  borderColor: string
  pillText: string
}

interface Result {
  recycling: Method
  composting: Method
  alternative: Method
  summary: string
}

// ─── Language options ────────────────────────────────────────────────────────
type LangCode = "en" | "hi" | "kn" | "te" | "ta"
const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "en", label: "English",  native: "English"  },
  { code: "hi", label: "Hindi",    native: "हिन्दी"    },
  { code: "kn", label: "Kannada",  native: "ಕನ್ನಡ"    },
  { code: "te", label: "Telugu",   native: "తెలుగు"   },
  { code: "ta", label: "Tamil",    native: "தமிழ்"    },
]

// ─── Difficulty styles ────────────────────────────────────────────────────────
const diffMap: Record<string, { bg: string; text: string; dot: string }> = {
  Easy:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400" },
  Moderate: { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"   },
  Advanced: { bg: "bg-rose-50",     text: "text-rose-700",    dot: "bg-rose-400"    },
}

// ─── Enrich raw AI data with UI colors ───────────────────────────────────────
function enrichWithStyles(data: any): Result {
  const safeMethod = (raw: any, emoji: string, accentColor: string, lightBg: string, borderColor: string, pillText: string): Method => ({
    title: raw?.title ?? "",
    tagline: raw?.tagline ?? "",
    steps: Array.isArray(raw?.steps) ? raw.steps : [],
    benefits: Array.isArray(raw?.benefits) ? raw.benefits : [],
    timeframe: raw?.timeframe ?? "",
    difficulty: raw?.difficulty ?? "Moderate",
    emoji, accentColor, lightBg, borderColor, pillText,
  })
  return {
    summary: data.summary || "",
    recycling:   safeMethod(data.recycling,   "♻️", "bg-blue-500",   "bg-blue-50",   "border-blue-200",   "text-blue-700"),
    composting:  safeMethod(data.composting,  "🌿", "bg-emerald-500","bg-emerald-50", "border-emerald-200","text-emerald-700"),
    alternative: safeMethod(data.alternative, "⚗️", "bg-violet-500", "bg-violet-50", "border-violet-200", "text-violet-700"),
  }
}

// ─── Parse AI JSON response ───────────────────────────────────────────────────
// Attempt to salvage a truncated JSON string by closing open strings/arrays/objects
function repairJson(s: string): string {
  // Close any open string by appending a quote if needed
  let inString = false; let escape = false
  for (const ch of s) {
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') inString = !inString
  }
  let r = inString ? s + '"' : s
  // Count open braces/brackets and close them
  let braces = 0; let brackets = 0
  inString = false; escape = false
  for (const ch of r) {
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (!inString) {
      if (ch === '{') braces++
      else if (ch === '}') braces--
      else if (ch === '[') brackets++
      else if (ch === ']') brackets--
    }
  }
  // Strip trailing comma before closing
  r = r.trimEnd().replace(/,\s*$/, '')
  r += ']'.repeat(Math.max(0, brackets))
  r += '}'.repeat(Math.max(0, braces))
  return r
}

function parseAIResponse(raw: string, cropType: string): Result {
  // Try fenced ```json ... ``` block first, then bare object
  const fenceMatch = raw.match(/```json\s*([\s\S]*?)(?:```|$)/)
  const braceMatch = raw.match(/\{[\s\S]*"recycling"[\s\S]*/)

  const jsonStr = fenceMatch?.[1]?.trim() || braceMatch?.[0]?.trim()

  console.log("[KrishiUddhar] parseAIResponse → fenceMatch:", !!fenceMatch, "| braceMatch:", !!braceMatch)
  console.log("[KrishiUddhar] jsonStr length:", jsonStr?.length, "| first 200:", jsonStr?.slice(0, 200))

  if (jsonStr) {
    // First try direct parse
    try {
      const parsed = JSON.parse(jsonStr)
      console.log("[KrishiUddhar] JSON.parse SUCCESS, summary:", parsed?.summary?.slice?.(0, 80))
      return enrichWithStyles(parsed)
    } catch (e) {
      console.warn("[KrishiUddhar] Direct parse failed, attempting repair...", (e as Error).message)
    }
    // Try repaired parse
    try {
      const repaired = repairJson(jsonStr)
      const parsed = JSON.parse(repaired)
      console.log("[KrishiUddhar] Repaired JSON parse SUCCESS, summary:", parsed?.summary?.slice?.(0, 80))
      return enrichWithStyles(parsed)
    } catch (e2) {
      console.error("[KrishiUddhar] Repair also failed:", (e2 as Error).message, "\njsonStr tail:", jsonStr.slice(-200))
    }
  } else {
    console.warn("[KrishiUddhar] No JSON block found in raw response. Full raw:", raw.slice(0, 600))
  }
  return enrichWithStyles({
    summary: `Here are three effective waste management strategies for your ${cropType} crop waste.`,
    recycling: {
      title: "Recycling", tagline: "Convert waste into reusable materials",
      steps: ["Segregate dry crop residues from wet waste", "Bale or bundle dried stalks and husks", "Contact local agro-recycling centres or bio-fuel plants", "Transport in bulk to reduce cost", "Collect payment or exchange credits"],
      benefits: ["Generates additional income", "Reduces open burning and pollution", "Supports circular economy", "Reduces landfill burden"],
      timeframe: "1–2 weeks", difficulty: "Moderate"
    },
    composting: {
      title: "Composting", tagline: "Turn residue into rich organic fertiliser",
      steps: ["Chop or shred crop residues into small pieces", "Layer green and brown material in 1:3 ratio", "Add a thin layer of soil or old compost as activator", "Water lightly to maintain 50% moisture", "Turn pile every 10–14 days to aerate", "Compost is ready when dark and earthy-smelling"],
      benefits: ["Free organic fertiliser for next season", "Improves soil structure and water retention", "Reduces chemical fertiliser costs", "Zero-cost solution"],
      timeframe: "6–8 weeks", difficulty: "Easy"
    },
    alternative: {
      title: "Biochar / Mulching", tagline: "Advanced long-term soil enrichment",
      steps: ["Dry crop waste thoroughly in sun for 3–5 days", "Burn in low-oxygen conditions to produce biochar, OR", "Spread raw residue as mulch around plants (3–5 cm)", "Mix biochar into soil at 5–10% volume ratio", "Replenish mulch every growing season"],
      benefits: ["Biochar sequesters carbon in soil for decades", "Mulching cuts water evaporation by ~30%", "Suppresses weed growth naturally", "Long-term soil fertility improvement"],
      timeframe: "3–7 days", difficulty: "Moderate"
    }
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KrishiUddharDashboard() {
  const [cropType, setCropType]   = useState("")
  const [quantity, setQuantity]   = useState("")
  const [unit, setUnit]           = useState("kg")
  const [location, setLocation]   = useState("")
  const [locating, setLocating]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [result, setResult]       = useState<Result | null>(null)
  const [activeTab, setActiveTab] = useState<"recycling" | "composting" | "alternative">("recycling")
  const [selectedLang, setSelectedLang] = useState<LangCode>("en")
  const [retranslating, setRetranslating] = useState(false)

  // Geolocation
  const handleLocate = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          const addr = data.address
          const parts = [addr.village || addr.town || addr.city || addr.county, addr.state_district || addr.district, addr.state, addr.country].filter(Boolean)
          setLocation(parts.join(", "))
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`)
        } finally { setLocating(false) }
      },
      () => { setError("Location access denied. Please enter manually."); setLocating(false) }
    )
  }

  // Build prompt (reused by submit + retranslate)
  const buildPrompt = (ct: string, qty: string, u: string, loc: string, lang: string) => {
    console.log(`[KrishiUddhar] buildPrompt → lang="${lang}", crop="${ct}", qty="${qty} ${u}", loc="${loc || 'India'}"`)
    const fence = "```"
    return `You are an expert agricultural waste management advisor. A farmer has:
Crop Waste Type: ${ct}
Quantity: ${qty} ${u}
Location: ${loc || "India (rural farming area)"}

CRITICAL LANGUAGE RULE: You MUST write every single word of the JSON values in ${lang}. This is non-negotiable. The summary, taglines, all steps, and all benefits MUST be written in ${lang} script and language. Do NOT use English for any value — only for the JSON keys. If ${lang} is Hindi, use Devanagari. If ${lang} is Kannada, use Kannada script. If ${lang} is Telugu, use Telugu script. If ${lang} is Tamil, use Tamil script.

Return ONLY a JSON block in this exact format:
${fence}json
{
  "summary": "1-2 sentence overview tailored to this specific waste",
  "recycling": {
    "title": "Recycling",
    "tagline": "Short catchy tagline",
    "steps": ["step 1","step 2","step 3","step 4","step 5"],
    "benefits": ["benefit 1","benefit 2","benefit 3","benefit 4"],
    "timeframe": "X days/weeks",
    "difficulty": "Easy"
  },
  "composting": {
    "title": "Composting",
    "tagline": "Short catchy tagline",
    "steps": ["step 1","step 2","step 3","step 4","step 5","step 6"],
    "benefits": ["benefit 1","benefit 2","benefit 3","benefit 4"],
    "timeframe": "X weeks",
    "difficulty": "Easy"
  },
  "alternative": {
    "title": "Best single alternative (Biogas / Mulching / Biochar / Animal Feed / Bio-pesticide / Vermicompost etc.)",
    "tagline": "Short catchy tagline",
    "steps": ["step 1","step 2","step 3","step 4","step 5"],
    "benefits": ["benefit 1","benefit 2","benefit 3","benefit 4"],
    "timeframe": "X days/weeks",
    "difficulty": "Easy or Moderate or Advanced"
  }
}
${fence}
All steps must be concise (1 sentence). Advice must be practical for a small Indian farmer.`
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cropType.trim())  { setError("Please enter the crop pest / waste type."); return }
    if (!quantity.trim())  { setError("Please enter the quantity."); return }
    setError(null); setLoading(true); setResult(null)

    const langLabel = LANGUAGES.find(l => l.code === selectedLang)?.label ?? "English"
    console.log(`[KrishiUddhar] handleSubmit → selectedLang="${selectedLang}", langLabel="${langLabel}"`)
    const prompt = buildPrompt(cropType, quantity, unit, location, langLabel)

    try {
      console.log(`[KrishiUddhar] Calling API → model=${MODEL}, prompt length=${prompt.length}`)
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.4, max_tokens: 2800 })
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      const rawContent = data.choices?.[0]?.message?.content || ""
      console.log(`[KrishiUddhar] Raw API response (first 300 chars):`, rawContent.slice(0, 300))
      setResult(parseAIResponse(rawContent, cropType))
      setActiveTab("recycling")
    } catch (err: any) {
      console.error(`[KrishiUddhar] handleSubmit error:`, err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally { setLoading(false) }
  }

  // Retranslate existing result into a new language
  const handleRetranslate = async (lang: LangCode) => {
    if (!cropType.trim() || !quantity.trim()) return
    const langLabel = LANGUAGES.find(l => l.code === lang)?.label ?? "English"
    console.log(`[KrishiUddhar] handleRetranslate → lang="${lang}", langLabel="${langLabel}"`)
    setRetranslating(true)
    const prompt = buildPrompt(cropType, quantity, unit, location, langLabel)
    try {
      console.log(`[KrishiUddhar] Retranslate API call → model=${MODEL}`)
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.4, max_tokens: 2800 })
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      const rawContent = data.choices?.[0]?.message?.content || ""
      console.log(`[KrishiUddhar] Retranslate response (first 300 chars):`, rawContent.slice(0, 300))
      setResult(parseAIResponse(rawContent, cropType))
      setActiveTab("recycling")
    } catch (err) {
      console.error(`[KrishiUddhar] handleRetranslate error:`, err)
      /* keep existing result */
    }
    finally { setRetranslating(false) }
  }

  const TAB_ORDER = ["recycling", "composting", "alternative"] as const
  const tabIndex  = TAB_ORDER.indexOf(activeTab)
  const hasResult = result && !loading

  // Tab accent map
  const tabAccent = {
    recycling:   { active: "border-blue-500 text-blue-700 bg-blue-50/60",     dot: "bg-blue-500"    },
    composting:  { active: "border-emerald-500 text-emerald-700 bg-emerald-50/60", dot: "bg-emerald-500" },
    alternative: { active: "border-violet-500 text-violet-700 bg-violet-50/60",   dot: "bg-violet-500"  },
  }

  return (
    <div className="min-h-screen pb-10">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
          <Recycle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KrishiUddhar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Crop residue management — recycling, composting &amp; valorisation plans</p>
        </div>
      </div>

      {/* ── Main grid: form left, results right ───────────────────────── */}
      <div className={`grid gap-6 items-start ${hasResult ? "lg:grid-cols-[380px_1fr]" : "max-w-xl mx-auto"}`}>

        {/* ══ INPUT PANEL ═══════════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Gradient header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">Waste Input Details</p>
                  <p className="text-blue-100 text-xs mt-0.5">Tell us about your crop residue</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

              {/* Crop Type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Crop / Waste Type <span className="text-red-400 normal-case font-normal tracking-normal">*required</span>
                </Label>
                <Input
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g. Rice straw, Wheat husk, Sugarcane bagasse…"
                  className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 h-11 text-sm placeholder:text-gray-400"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Quantity <span className="text-red-400 normal-case font-normal tracking-normal">*required</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    type="number" min="0"
                    placeholder="e.g. 500"
                    className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 h-11 text-sm flex-1"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[110px]"
                  >
                    <option value="kg">kg</option>
                    <option value="quintals">quintals</option>
                    <option value="tonnes">tonnes</option>
                    <option value="bags">bags</option>
                    <option value="acres worth">acres worth</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Location <span className="text-gray-400 normal-case font-normal tracking-normal">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Village, District, State…"
                      className="pl-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 h-11 text-sm"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={handleLocate} disabled={locating}
                    className="h-11 w-11 p-0 border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0"
                    title="Detect my location">
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  </Button>
                </div>
                {location && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Location set
                  </p>
                )}
              </div>

              {/* Language selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Output Language</Label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-all duration-150
                        ${selectedLang === lang.code
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}
                    >
                      {lang.native}
                      <span className="ml-1 font-normal opacity-70">{lang.code !== "en" ? `· ${lang.label}` : ""}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-200/60 transition-all duration-200">
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Generating plan…</span>
                ) : (
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Generate Waste Management Plan</span>
                )}
              </Button>
            </form>
          </div>

          {/* What you'll get card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> What you'll get
            </p>
            <div className="space-y-3">
              {[
                { emoji: "♻️", label: "Recycling Plan",     desc: "Industrial & local recycling options"       },
                { emoji: "🌿", label: "Composting Guide",   desc: "Turn waste into free organic fertiliser"    },
                { emoji: "⚗️", label: "Best Alternative",  desc: "AI selects the optimal 3rd method for you"  },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center flex-shrink-0">{item.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">{item.label}</p>
                    <p className="text-xs text-emerald-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RESULTS PANEL ════════════════════════════════════════════════ */}

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">Analysing your waste…</p>
              <p className="text-sm text-gray-400 mt-1">AI is crafting a personalised plan</p>
            </div>
            <div className="flex gap-2 mt-1">
              {["♻️ Recycling", "🌿 Composting", "⚗️ Alternative"].map((t, i) => (
                <span key={t} className="text-xs border border-gray-200 text-gray-400 px-3 py-1.5 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {hasResult && (
          <div className="space-y-5">

            {/* ── Language switcher bar ── */}
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 shrink-0">Language</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    disabled={retranslating}
                    onClick={() => {
                      setSelectedLang(lang.code)
                      handleRetranslate(lang.code)
                    }}
                    className={`h-7 px-3 rounded-lg border text-xs font-semibold transition-all duration-150 disabled:opacity-50
                      ${selectedLang === lang.code
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
              {retranslating && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Translating…
                </div>
              )}
            </div>

            {/* ── AI Summary ── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl px-6 py-5 shadow-lg shadow-emerald-100">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1.5">AI Recommendation</p>
                  <p className="text-white text-sm leading-relaxed">{result!.summary}</p>
                </div>
              </div>
            </div>

            {/* ── Input summary pills ── */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Analysed for:</span>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-medium text-xs">🌾 {cropType}</Badge>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-medium text-xs">⚖️ {quantity} {unit}</Badge>
              {location && (
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-medium text-xs gap-1">
                  <MapPin className="w-3 h-3" />{location}
                </Badge>
              )}
            </div>

            {/* ── Tab panel ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Tab strip */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {TAB_ORDER.map((key) => {
                  const m = result![key]
                  const isActive = activeTab === key
                  const acc = tabAccent[key]
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all duration-200
                        ${isActive ? acc.active : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isActive ? acc.dot : "bg-gray-300"}`} />
                      <span className="hidden sm:inline">{m.title}</span>
                      <span className="sm:hidden text-lg">{m.emoji}</span>
                    </button>
                  )
                })}
              </div>

              {/* Active tab */}
              {TAB_ORDER.map((key) => activeTab === key && (
                <div key={key}>
                  {/* Tab hero row */}
                  <div className={`px-6 py-5 flex items-center justify-between ${result![key].lightBg} border-b ${result![key].borderColor}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${result![key].accentColor} flex items-center justify-center text-3xl shadow-sm`}>
                        {result![key].emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{result![key].title}</h3>
                        <p className="text-sm text-gray-500">{result![key].tagline}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
                        ${diffMap[result![key].difficulty]?.bg} ${diffMap[result![key].difficulty]?.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diffMap[result![key].difficulty]?.dot}`} />
                        {result![key].difficulty}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {result![key].timeframe}
                      </span>
                    </div>
                  </div>

                  {/* Two-column body */}
                  <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    {/* Steps */}
                    <div className="px-6 py-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Step-by-Step Process
                      </p>
                      <ol className="space-y-3.5">
                        {result![key].steps.map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full ${result![key].accentColor} text-white flex items-center justify-center text-xs font-bold mt-0.5`}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-gray-600 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Benefits */}
                    <div className="px-6 py-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Key Benefits
                      </p>
                      <ul className="space-y-3.5">
                        {result![key].benefits.map((b, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-600">
                            <span className={`flex-shrink-0 w-5 h-5 rounded-full ${result![key].lightBg} ${result![key].borderColor} border flex items-center justify-center mt-0.5`}>
                              <span className={`text-xs font-bold ${result![key].pillText}`}>✓</span>
                            </span>
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Mobile difficulty + time */}
                      <div className="flex gap-2 mt-5 sm:hidden">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5
                          ${diffMap[result![key].difficulty]?.bg} ${diffMap[result![key].difficulty]?.text}`}>
                          {result![key].difficulty}
                        </span>
                        <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{result![key].timeframe}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Tab navigation ── */}
            <div className="flex items-center justify-between px-1">
              <Button variant="outline" size="sm" disabled={tabIndex === 0}
                onClick={() => setActiveTab(TAB_ORDER[tabIndex - 1])}
                className="text-xs border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 gap-1.5 disabled:opacity-30">
                ← Previous
              </Button>

              <div className="flex gap-1.5">
                {TAB_ORDER.map((key) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeTab === key ? "w-6 bg-blue-600" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
                  />
                ))}
              </div>

              <Button variant="outline" size="sm" disabled={tabIndex === 2}
                onClick={() => setActiveTab(TAB_ORDER[tabIndex + 1])}
                className="text-xs border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 gap-1.5 disabled:opacity-30">
                Next →
              </Button>
            </div>

            {/* ── Reset ── */}
            <div className="flex justify-center pt-1">
              <Button variant="ghost" size="sm"
                onClick={() => { setResult(null); setCropType(""); setQuantity(""); setLocation(""); setUnit("kg") }}
                className="text-gray-400 hover:text-gray-600 gap-2 text-xs">
                <RotateCcw className="w-3.5 h-3.5" /> Start over with a new waste type
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
