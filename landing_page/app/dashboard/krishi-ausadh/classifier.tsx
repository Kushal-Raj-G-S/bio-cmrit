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
    <div className="space-y-6 max-w-6xl mx-auto pb-10">

      {/* ── Page hero header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-700 p-4 sm:p-6 shadow-lg top-0 left-0 text-white">
        {/* Subtle background decoration */}
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 pb-0 max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-wide uppercase shadow-sm">
              <Leaf className="h-3.5 w-3.5" /> AI Plant Doctor
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">KrishiAusadh</h1>
            <p className="text-violet-100 text-sm font-semibold italic leading-snug drop-shadow-sm">
              Instant Disease Detection. Smart Solutions. Better Harvests.
            </p>
          </div>
          
          <div className="hidden md:flex shrink-0 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
            <Leaf className="h-12 w-12 text-emerald-100" strokeWidth={1.5} />
          </div>
        </div>
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

      {/* ── Upload card ── */}
        <Card className="bg-white/80 backdrop-blur-xl border-emerald-100/50 shadow-xl shadow-emerald-900/5 flex flex-col rounded-3xl overflow-hidden ring-1 ring-emerald-900/5">
          <CardHeader className="bg-gradient-to-b from-emerald-50/50 to-transparent pb-4 pt-6 border-b border-emerald-100/50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl shadow-sm text-emerald-600">
                <Upload className="h-5 w-5" />
              </div>
              Upload Leaf Image
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500 pl-14">
              Supported: JPG, PNG, WebP, BMP or TIFF · Max 10 MB
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5 flex-1 p-6">
            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`relative border-[3px] border-dashed rounded-3xl transition-all duration-300 select-none overflow-hidden group
                ${previewUrl ? "cursor-default" : "cursor-pointer"}
                ${dragOver
                  ? "border-emerald-500 bg-emerald-50 scale-[1.02] shadow-2xl shadow-emerald-500/20"
                  : previewUrl
                  ? "border-teal-300 bg-teal-50/30"
                  : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/50"
                }`}
            >
              {previewUrl ? (
                <div className="relative group p-2">
                  <img
                    src={previewUrl}
                    alt="Selected leaf"
                    className="w-full h-72 object-cover rounded-2xl shadow-sm"
                  />
                  {/* Overlay: filename + change button */}
                  <div className="absolute inset-2 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <p className="text-white text-sm font-semibold truncate drop-shadow-md bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md">{selectedFile?.name}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="text-sm font-bold bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 px-4 py-2 rounded-xl transition-all shadow-xl shrink-0 flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" /> Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-5 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 group-hover:shadow-emerald-200/50">
                    <ImageIcon className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-bold text-slate-700">
                      {dragOver ? "Drop image here!" : "Drag & drop your leaf image here"}
                    </p>
                    <p className="text-sm font-medium text-slate-500">or click anywhere to browse</p>
                  </div>
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
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" className="h-14 sm:w-1/3 rounded-2xl border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-base shadow-sm"
                onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-5 w-5 mr-2" /> Camera
              </Button>
              <Button
                onClick={handleAnalyse}
                disabled={!selectedFile || loading || serverStatus === "down"}
                className={`h-14 sm:w-2/3 rounded-2xl text-base font-bold text-white shadow-lg transition-all duration-300
                  ${!selectedFile || serverStatus === "down" ? "bg-slate-300 shadow-none hover:bg-slate-300" : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 hover:-translate-y-0.5 hover:shadow-emerald-500/30"}`}
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-[3px] border-white/30 border-t-white animate-spin mr-3" />
                    Running Diagnosis…
                  </>
                ) : (
                  <><Zap className="h-5 w-5 mr-2" /> Analyse Image</>
                )}
              </Button>
            </div>

            {selectedFile && !loading && (
              <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-10 rounded-xl" onClick={handleReset}>
                <XCircle className="h-4 w-4 mr-2" />
                Clear &amp; start over
              </Button>
            )}

            <div className="border-t border-slate-200/60 my-2" />

            {/* Crops coverage grid */}
            <div className="px-1">
              <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> 75 Supported Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {["Tomato","Potato","Rice","Wheat","Corn","Apple","Grape","Soybean","Strawberry","Peach","Sugarcane","Cotton","Pepper","Cherry"].map(crop => (
                  <span key={crop} className="text-[13px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 px-3 py-1 rounded-xl shadow-sm">{crop}</span>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

      {/* ── Output below upload ── */}
      {!loading && !result && !apiError && !previewUrl && (
        <Card className="bg-white/80 backdrop-blur-xl border-emerald-100/50 shadow-xl shadow-emerald-900/5 rounded-3xl overflow-hidden ring-1 ring-emerald-900/5">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 rounded-full shadow-inner animate-bounce" style={{animationDuration: '3s'}}>
                <Leaf className="h-14 w-14 text-emerald-500 drop-shadow-sm" />
              </div>
            </div>
            <div className="space-y-2 mb-10">
              <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Ready to diagnose</p>
              <p className="text-base text-slate-500 max-w-sm">
                Upload a high-quality photo of a plant leaf and hit <span className="font-bold text-emerald-600">Analyse Image</span> to receive an instant prescription.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              {[
                { num: "1", label: "Select a clear leaf photo", sub: "Take a photo or browse your device" },
                { num: "2", label: "Hit Analyse", sub: "Our advanced Deep Learning model evaluates 75 categories" },
                { num: "3", label: "Read your Diagnosis", sub: "Get full treatments, control measures, and confidence" },
              ].map(step => (
                <div key={step.num} className="flex items-start gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 text-left hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 font-bold shrink-0 shadow-inner">
                    {step.num}
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{step.label}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="bg-white/80 backdrop-blur-xl border-emerald-100/50 shadow-xl shadow-emerald-900/5 rounded-3xl flex flex-col justify-center">
          <CardContent className="flex flex-col items-center justify-center p-12 gap-8">
            <div className="relative">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-emerald-100 border-t-emerald-500" />
              <Leaf className="h-10 w-10 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-slate-800">Analysing your leaf…</p>
              <p className="text-sm font-medium text-slate-500">Cross-referencing 54M parameters across 75 distinct plant diseases</p>
            </div>
            <div className="w-64 bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && apiError && (
        <Card className="bg-white/80 backdrop-blur-xl border-rose-200 shadow-xl shadow-rose-900/5 rounded-3xl flex flex-col justify-center">
          <CardContent className="flex flex-col items-center justify-center p-12 gap-6 text-center">
            <div className="bg-rose-100 p-6 rounded-3xl shadow-inner rotate-12">
              <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-rose-700">Analysis failed</p>
              <p className="text-base text-slate-600 max-w-sm">{apiError}</p>
            </div>
            <Button variant="outline" className="mt-4 h-12 px-6 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Results section (2-column grid when results show) ── */}
      {!loading && result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Prediction */}
          <div className="flex flex-col gap-4">
            <Card
              className={`border-0 shadow-xl overflow-hidden rounded-3xl ${
                result.top_prediction.is_healthy
                  ? "bg-gradient-to-br from-green-50 to-emerald-100 ring-1 ring-green-200"
                  : "bg-gradient-to-br from-rose-50 to-amber-50 ring-1 ring-amber-200"
              }`}
            >
              <div
                className={`h-2.5 w-full ${
                  result.top_prediction.is_healthy
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-rose-400 to-amber-400"
                }`}
              />
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex gap-5 items-start">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="leaf"
                      className="h-28 w-28 object-cover rounded-2xl shadow-md border-2 border-white shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" /> Diagnosis Result
                    </p>
                    <p
                      className={`text-3xl font-extrabold leading-tight ${
                        result.top_prediction.is_healthy ? "text-emerald-900" : "text-rose-950"
                      }`}
                    >
                      {result.treatment?.disease_common_name ?? result.top_prediction.condition.replace(/_/g, " ")}
                    </p>
                    <p className="text-base font-semibold text-slate-600 mt-1">{result.top_prediction.plant}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {result.top_prediction.is_healthy ? (
                        <Badge className="bg-green-500 text-white border-0 gap-1.5 py-1 px-3 shadow-sm rounded-lg text-sm">
                          <ShieldCheck className="h-4 w-4" /> Healthy
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500 text-white border-0 gap-1.5 py-1 px-3 shadow-sm rounded-lg text-sm">
                          <Bug className="h-4 w-4" /> Diseased
                        </Badge>
                      )}
                      {result.treatment?.pathogen_type && (
                        <Badge className={`border py-1 px-3 rounded-lg text-sm shadow-sm ${pathogenBadge(result.treatment.pathogen_type)}`}>
                          {result.treatment.pathogen_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-white/50 p-4 rounded-2xl border border-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Model Confidence</span>
                    <span className={`font-black text-xl ${confidenceTextColor(result.top_prediction.confidence_pct)}`}>
                      {result.top_prediction.confidence_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-3 shadow-inner overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${confidenceColor(result.top_prediction.confidence_pct)}`}
                      style={{ width: `${result.top_prediction.confidence_pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-200/50">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white/50 px-3 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5" /> {result.inference_time_ms.toFixed(1)} ms
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white/50 px-3 py-1 rounded-lg">
                    <Zap className="h-3.5 w-3.5 text-emerald-500" /> {result.model_backend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Treatment + Confidence alternatives */}
          <div className="space-y-4">
            {result.treatment && !result.top_prediction.is_healthy && (
              <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden ring-1 ring-slate-900/5">
                <CardHeader className="bg-slate-50/80 px-6 pt-6 pb-4 border-b border-slate-100">
                  <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> Treatment Guide & Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="organic">
                    <TabsList className="w-full grid grid-cols-3 mb-6 p-1 bg-slate-100/80 rounded-xl h-12">
                      <TabsTrigger value="chemical" className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Chemical</TabsTrigger>
                      <TabsTrigger value="organic" className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">Organic</TabsTrigger>
                      <TabsTrigger value="ipm" className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">IPM Practices</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chemical" className="mt-0">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 p-5 shadow-inner">
                        <p className="text-base text-blue-950 leading-relaxed font-medium">{result.treatment.chemical_control}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="organic" className="mt-0">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 p-5 shadow-inner">
                        <p className="text-base text-emerald-950 leading-relaxed font-medium">{result.treatment.organic_biological_control}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="ipm" className="mt-0">
                      <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/60 p-5 shadow-inner">
                        <p className="text-base text-teal-950 leading-relaxed font-medium">{result.treatment.ipm_practices}</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {result.top_k_predictions.length > 1 && (
              <Card className="bg-white border-slate-100 shadow-lg shadow-slate-200/20 rounded-3xl overflow-hidden ring-1 ring-slate-900/5">
                <CardHeader className="bg-slate-50/50 pb-3 pt-5 px-6 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-600 tracking-wide">Other Possible Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5 space-y-4 bg-white">
                  {result.top_k_predictions.slice(1).map((p) => (
                    <div key={p.rank} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-slate-700 truncate pr-3">
                            {p.plant} <span className="text-slate-400 mx-1">-</span> {p.condition.replace(/_/g, " ")}
                          </span>
                          <span className={`text-sm font-black shrink-0 ${confidenceTextColor(p.confidence_pct)}`}>
                            {p.confidence_pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 rounded-full h-2">
                          <div className={`h-2 rounded-full ${confidenceColor(p.confidence_pct)}`} style={{ width: `${p.confidence_pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button variant="outline" className="w-full h-14 bg-white text-slate-700 font-bold text-lg rounded-2xl shadow-sm border-slate-200 hover:bg-slate-50 hover:text-emerald-700 transition-colors" onClick={handleReset}>
              <RotateCcw className="h-5 w-5 mr-3" /> Start a New Diagnosis
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
