"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Camera,
  Leaf,
  AlertCircle,
  XCircle,
  Zap,
  Clock,
  RotateCcw,
  ImageIcon,
  ShieldCheck,
  Bug,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Prediction {
  rank: number
  class_id: number
  label: string
  confidence: number
  confidence_pct: number
  plant: string
  condition: string
  is_healthy: boolean
}

interface Treatment {
  crop: string
  disease_common_name: string
  pathogen_type: string
  symptoms: string
  chemical_control: string
  organic_biological_control: string
  ipm_practices: string
  safety_notes: string
}

interface ClassifyResponse {
  success: boolean
  image_filename: string
  image_size: [number, number]
  inference_time_ms: number
  top_prediction: Prediction
  top_k_predictions: Prediction[]
  treatment?: Treatment
  model_backend: string
  warning: string | null
  error?: string
}

interface HealthResponse {
  status: string
  app_name: string
  version: string
  environment: string
  model_loaded: boolean
  num_classes: number
  inference_backend: string
  device: string
}

const MAIN_BACKEND_URL = process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? "http://localhost:8000"
const BASE_URL =
  process.env.NEXT_PUBLIC_KRISHI_AUSADH_API_URL ??
  process.env.NEXT_PUBLIC_KRISHI_AUSADH_URL ??
  `${MAIN_BACKEND_URL}/api/gateway/krishiausadh`

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

// ─── Component ────────────────────────────────────────────────────────────────
export default function KrishiAusadhClassifier() {
  const [serverStatus, setServerStatus] = useState<"checking" | "ok" | "down">("checking")
  const [serverInfo, setServerInfo] = useState<HealthResponse | null>(null)

  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ClassifyResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // ── Health check on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const data: HealthResponse = await res.json()
          setServerInfo(data)
          setServerStatus("ok")
        } else {
          setServerStatus("down")
        }
      } catch {
        setServerStatus("down")
      }
    }
    check()
  }, [])

  // ── File validation ───────────────────────────────────────────────────────
  const validateAndSetFile = useCallback((file: File) => {
    setFileError(null)
    setResult(null)
    setApiError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError(`Unsupported format. Allowed: JPG, PNG, WebP, BMP, TIFF`)
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`)
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  // ── Drag & Drop handlers ──────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
    e.target.value = ""
  }

  // ── Analyse ───────────────────────────────────────────────────────────────
  const handleAnalyse = async () => {
    if (!selectedFile) return
    setLoading(true)
    setResult(null)
    setApiError(null)

    try {
      const form = new FormData()
      form.append("file", selectedFile)
      form.append("top_k", "5")

      const res = await fetch(`${BASE_URL}/api/v1/classify`, {
        method: "POST",
        body: form,
      })

      const data: ClassifyResponse = await res.json()

      if (!res.ok || !data.success) {
        setApiError(data.error ?? `Server returned ${res.status}`)
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setApiError(`Could not reach the server: ${err?.message ?? err}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setApiError(null)
    setFileError(null)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const confidenceColor = (pct: number) =>
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"

  const confidenceTextColor = (pct: number) =>
    pct >= 80 ? "text-green-700" : pct >= 50 ? "text-yellow-700" : "text-red-700"

  const pathogenBadge = (type: string) => {
    const t = type?.toLowerCase() ?? ""
    if (t.includes("fungal"))   return "bg-amber-50 text-amber-700 border-amber-200"
    if (t.includes("bacterial")) return "bg-blue-50 text-blue-700 border-blue-200"
    if (t.includes("viral"))    return "bg-purple-50 text-purple-700 border-purple-200"
    if (t.includes("pest"))     return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-gray-100 text-gray-600 border-gray-200"
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* ── Page header ── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-800">KrishiAusadh</h1>
        <p className="text-gray-500 text-sm">
          Upload a plant leaf image to detect diseases instantly
        </p>
      </div>

      {/* ── Server down banner ── */}
      {serverStatus === "down" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Backend server is unreachable</p>
            <p className="text-sm text-red-600">
              Make sure KrishiAusadh backend is running on{" "}
              <code className="bg-red-100 px-1 rounded text-xs">{BASE_URL}</code>.
            </p>
          </div>
        </div>
      )}

      {/* ── Main 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ════ LEFT: Upload card ════ */}
        <Card className="bg-white border-gray-200 shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-800 flex items-center gap-2">
              <div className="bg-purple-100 p-1.5 rounded-lg">
                <Upload className="h-4 w-4 text-purple-600" />
              </div>
              Upload Leaf Image
            </CardTitle>
            <CardDescription className="text-xs">
              JPG, PNG, WebP, BMP or TIFF · Max 10 MB
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 flex-1">
            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl transition-all select-none overflow-hidden
                ${previewUrl ? "cursor-default" : "cursor-pointer"}
                ${dragOver
                  ? "border-purple-400 bg-purple-50 scale-[1.01]"
                  : previewUrl
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-purple-300 hover:bg-purple-50"
                }`}
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Selected leaf"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  {/* Overlay: filename + change button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <p className="text-white text-xs font-medium truncate drop-shadow">{selectedFile?.name}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="text-xs bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white px-2 py-1 rounded-md transition shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <ImageIcon className="h-9 w-9 text-purple-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {dragOver ? "Drop it here!" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-gray-400">JPG · PNG · WebP · BMP · TIFF</p>
                </div>
              )}
            </div>

            {/* Hidden inputs */}
            <input ref={fileInputRef} type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
              className="hidden" onChange={onFileChange} />
            <input ref={cameraInputRef} type="file"
              accept="image/*" capture="environment"
              className="hidden" onChange={onFileChange} />

            {/* File error */}
            {fileError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <XCircle className="h-4 w-4 shrink-0" />
                {fileError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2"
                onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-4 w-4" /> Camera
              </Button>
              <Button
                onClick={handleAnalyse}
                disabled={!selectedFile || loading || serverStatus === "down"}
                className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <><Zap className="h-4 w-4" /> Analyse</>
                )}
              </Button>
            </div>

            {selectedFile && !loading && (
              <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-gray-600" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Clear &amp; start over
              </Button>
            )}

            <div className="border-t border-gray-100 my-1" />

            {/* Crops coverage grid */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Supported Crops
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Tomato","Potato","Rice","Wheat","Corn","Apple","Grape","Soybean","Strawberry","Peach","Sugarcane","Cotton","Pepper","Cherry"].map(crop => (
                  <span key={crop} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{crop}</span>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ════ RIGHT: Result panel ════ */}
        <div className="flex flex-col gap-4">

          {/* Idle state */}
          {!loading && !result && !apiError && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                <div className="bg-gradient-to-br from-purple-100 to-green-100 p-6 rounded-full">
                  <Leaf className="h-12 w-12 text-purple-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-600 text-base">Ready to diagnose</p>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Upload a clear photo of a plant leaf and hit <span className="font-medium text-purple-500">Analyse</span> to get an instant AI diagnosis
                  </p>
                </div>
                <div className="w-full max-w-xs space-y-2 mt-1">
                  {[
                    { num: "01", label: "Choose a leaf photo", sub: "From your device or camera" },
                    { num: "02", label: "Hit Analyse", sub: "Deep learning does the rest" },
                    { num: "03", label: "Read your diagnosis", sub: "Crop, condition & confidence" },
                  ].map(step => (
                    <div key={step.num} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                      <span className="text-xs font-bold text-purple-400 w-5 shrink-0">{step.num}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{step.label}</p>
                        <p className="text-xs text-gray-400">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {loading && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-100 border-t-purple-600" />
                  <Leaf className="h-7 w-7 text-purple-600 absolute inset-0 m-auto" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-gray-700">Analysing your leaf…</p>
                  <p className="text-xs text-gray-400">Running EfficientNetV2-S across 75 classes</p>
                </div>
                <div className="w-48 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Error */}
          {!loading && apiError && (
            <Card className="bg-white border-red-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="h-9 w-9 text-red-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-red-700">Analysis failed</p>
                  <p className="text-sm text-gray-500 max-w-xs">{apiError}</p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Try again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Result ── */}
          {!loading && result && (
            <div className="space-y-4">

              {/* Warning banner */}
              {result.warning && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">{result.warning}</p>
                </div>
              )}

              {/* ── Diagnosis header card ── */}
              <Card className={`border-2 shadow-sm overflow-hidden ${
                result.top_prediction.is_healthy
                  ? "border-green-200"
                  : "border-red-200"
              }`}>
                {/* Coloured top strip */}
                <div className={`h-1.5 w-full ${
                  result.top_prediction.is_healthy ? "bg-green-400" : "bg-red-400"
                }`} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex gap-4 items-start">
                    {previewUrl && (
                      <img src={previewUrl} alt="leaf"
                        className="h-20 w-20 object-cover rounded-xl border border-gray-200 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Diagnosis</p>
                      <p className="text-2xl font-bold text-gray-900 leading-tight">
                        {result.treatment?.disease_common_name ?? result.top_prediction.condition.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{result.top_prediction.plant}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {result.top_prediction.is_healthy ? (
                          <Badge className="bg-green-100 text-green-800 border border-green-200 gap-1">
                            <ShieldCheck className="h-3 w-3" /> Healthy
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border border-red-200 gap-1">
                            <Bug className="h-3 w-3" /> Diseased
                          </Badge>
                        )}
                        {result.treatment?.pathogen_type && (
                          <Badge className={`border text-xs ${pathogenBadge(result.treatment.pathogen_type)}`}>
                            {result.treatment.pathogen_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</span>
                      <span className={`font-bold text-lg ${confidenceTextColor(result.top_prediction.confidence_pct)}`}>
                        {result.top_prediction.confidence_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${confidenceColor(result.top_prediction.confidence_pct)}`}
                        style={{ width: `${result.top_prediction.confidence_pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Inference meta */}
                  <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />{result.inference_time_ms.toFixed(1)} ms
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Zap className="h-3 w-3" />{result.model_backend}
                    </span>
                    <span className="text-xs text-gray-400">{result.image_size[0]}×{result.image_size[1]} px</span>
                  </div>
                </CardContent>
              </Card>

              {/* ── Treatment card (only when diseased + treatment present) ── */}
              {result.treatment && !result.top_prediction.is_healthy && (
                <Card className="bg-white border-gray-100 shadow-sm overflow-hidden">
                  <CardHeader className="px-5 pt-5 pb-3">
                    <CardTitle className="text-sm font-bold text-gray-800">Treatment Guide</CardTitle>
                    {result.treatment.symptoms && (
                      <p className="text-xs text-gray-500 mt-1 leading-5">
                        <span className="font-semibold text-gray-600">Symptoms: </span>
                        {result.treatment.symptoms}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <Tabs defaultValue="chemical">
                      <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="chemical" className="text-xs">Chemical</TabsTrigger>
                        <TabsTrigger value="organic" className="text-xs">Organic / Bio</TabsTrigger>
                        <TabsTrigger value="ipm" className="text-xs">IPM Practices</TabsTrigger>
                      </TabsList>
                      <TabsContent value="chemical">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">Chemical Control</p>
                          <p className="text-sm text-blue-900 leading-6">{result.treatment.chemical_control}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="organic">
                        <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                          <p className="text-[11px] font-bold text-green-600 uppercase tracking-widest mb-2">Organic / Biological Control</p>
                          <p className="text-sm text-green-900 leading-6">{result.treatment.organic_biological_control}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="ipm">
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2">IPM Practices</p>
                          <p className="text-sm text-emerald-900 leading-6">{result.treatment.ipm_practices}</p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Safety banner */}
                    {result.treatment.safety_notes && (
                      <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mb-1">Safety Notes</p>
                          <p className="text-xs text-rose-800 leading-5">{result.treatment.safety_notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── Other possibilities ── */}
              {result.top_k_predictions.length > 1 && (
                <Card className="bg-white border-gray-100 shadow-sm">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Other Possibilities</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 space-y-3">
                    {result.top_k_predictions.slice(1).map((p) => (
                      <div key={p.rank} className="flex items-center gap-3">
                        <span className="text-xs text-gray-300 w-5 shrink-0 font-mono font-bold">#{p.rank}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 truncate pr-2">
                              {p.plant} — {p.condition.replace(/_/g, " ")}
                            </span>
                            <span className={`text-xs font-bold shrink-0 ${confidenceTextColor(p.confidence_pct)}`}>
                              {p.confidence_pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${confidenceColor(p.confidence_pct)}`}
                              style={{ width: `${p.confidence_pct}%` }} />
                          </div>
                        </div>
                        <Badge className={`text-[10px] shrink-0 border ${
                          p.is_healthy
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {p.is_healthy ? "Healthy" : "Diseased"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button variant="outline" className="w-full gap-2" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" /> Analyse another image
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
