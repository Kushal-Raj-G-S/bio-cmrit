"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Eye, Gauge,
  Thermometer, MapPin, Search, RefreshCw, Leaf, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Navigation, Activity, Waves
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const API_KEY = "32870e365cc779a01f6b8e41567562a2"
const BASE = "https://api.openweathermap.org"

// ─── Types ────────────────────────────────────────────────────────────────────
interface CurrentWeather {
  name: string
  country: string
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  humidity: number
  pressure: number
  visibility: number
  wind_speed: number
  wind_deg: number
  clouds: number
  description: string
  icon: string
  sunrise: number
  sunset: number
  dt: number
  lat: number
  lon: number
  uvi?: number
}

interface ForecastItem {
  dt: number
  temp: number
  temp_min: number
  temp_max: number
  humidity: number
  description: string
  icon: string
  wind_speed: number
  pop: number  // probability of precipitation
}

interface AirQuality {
  aqi: number
  co: number
  no2: number
  o3: number
  pm2_5: number
  pm10: number
  so2: number
}

interface HourlyItem {
  dt: number
  temp: number
  icon: string
  description: string
  pop: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function kelvinToCelsius(k: number) { return Math.round(k - 273.15) }
function mpsToKmh(m: number) { return Math.round(m * 3.6) }
function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}
function formatDay(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
}
function formatHour(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}
function windDirection(deg: number) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"]
  return dirs[Math.round(deg / 45) % 8]
}

function aqiLabel(aqi: number): { label: string; color: string; bg: string; desc: string } {
  const map = [
    { label: "Good",        color: "text-green-700",  bg: "bg-green-100",  desc: "Air quality is satisfactory." },
    { label: "Fair",        color: "text-lime-700",   bg: "bg-lime-100",   desc: "Acceptable air quality." },
    { label: "Moderate",    color: "text-yellow-700", bg: "bg-yellow-100", desc: "Moderate health concern." },
    { label: "Poor",        color: "text-orange-700", bg: "bg-orange-100", desc: "Sensitive groups affected." },
    { label: "Very Poor",   color: "text-red-700",    bg: "bg-red-100",    desc: "Everyone may be affected." },
  ]
  return map[Math.min(aqi - 1, 4)]
}

function weatherGradient(icon: string): string {
  if (icon.includes("01d")) return "from-sky-400 via-blue-500 to-indigo-600"
  if (icon.includes("01n")) return "from-indigo-900 via-blue-900 to-slate-900"
  if (icon.includes("02") || icon.includes("03") || icon.includes("04"))
    return "from-slate-400 via-gray-500 to-slate-600"
  if (icon.includes("09") || icon.includes("10")) return "from-slate-600 via-blue-700 to-indigo-800"
  if (icon.includes("11")) return "from-gray-700 via-slate-800 to-gray-900"
  if (icon.includes("13")) return "from-blue-100 via-sky-200 to-indigo-300"
  if (icon.includes("50")) return "from-gray-300 via-gray-400 to-slate-400"
  return "from-sky-400 via-blue-500 to-indigo-600"
}

function WeatherIcon({ icon, className = "" }: { icon: string; className?: string }) {
  const url = `https://openweathermap.org/img/wn/${icon}@2x.png`
  return <img src={url} alt="weather" className={className} />
}

function agriAdvice(description: string, temp: number, humidity: number, wind: number): string[] {
  const tips: string[] = []
  const d = description.toLowerCase()
  if (d.includes("rain") || d.includes("drizzle"))
    tips.push("🌧️ Postpone pesticide/fertiliser spraying — rain will wash it away.")
  if (d.includes("thunderstorm"))
    tips.push("⚡ Do not work in open fields — lightning risk.")
  if (temp > 38)
    tips.push("🌡️ High heat stress — irrigate early morning or evening.")
  if (temp < 10)
    tips.push("❄️ Frost risk — cover sensitive seedlings tonight.")
  if (humidity > 85)
    tips.push("💧 High humidity — monitor crops for fungal disease.")
  if (humidity < 30)
    tips.push("🏜️ Very dry air — increase irrigation frequency.")
  if (wind > 40)
    tips.push("💨 Strong winds — avoid aerial spraying; secure poly-tunnels.")
  if (d.includes("clear") && temp >= 25 && temp <= 35)
    tips.push("☀️ Ideal conditions for harvesting and field operations.")
  if (tips.length === 0)
    tips.push("✅ Weather conditions are favourable for regular farm activities.")
  return tips
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/20 rounded-lg ${className}`} />
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeatherDashboard() {
  const [city, setCity] = useState("")
  const [inputCity, setInputCity] = useState("")
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [current, setCurrent] = useState<CurrentWeather | null>(null)
  const [forecast, setForecast] = useState<ForecastItem[]>([])
  const [hourly, setHourly] = useState<HourlyItem[]>([])
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // ── Core fetch by exact lat/lon — most accurate, used for GPS ──────────────
  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number, displayName?: string) => {
    setLoading(true)
    setError(null)
    try {
      // Current weather by coords
      const cwRes = await fetch(`${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      if (!cwRes.ok) throw new Error("Failed to fetch weather data.")
      const cw = await cwRes.json()

      const parsed: CurrentWeather = {
        name: displayName || cw.name,
        country: cw.sys.country,
        temp: kelvinToCelsius(cw.main.temp),
        feels_like: kelvinToCelsius(cw.main.feels_like),
        temp_min: kelvinToCelsius(cw.main.temp_min),
        temp_max: kelvinToCelsius(cw.main.temp_max),
        humidity: cw.main.humidity,
        pressure: cw.main.pressure,
        visibility: Math.round((cw.visibility || 10000) / 1000),
        wind_speed: mpsToKmh(cw.wind?.speed || 0),
        wind_deg: cw.wind?.deg || 0,
        clouds: cw.clouds?.all || 0,
        description: cw.weather[0].description,
        icon: cw.weather[0].icon,
        sunrise: cw.sys.sunrise,
        sunset: cw.sys.sunset,
        dt: cw.dt,
        lat,
        lon,
      }

      // 5-day / 3-hour forecast by coords
      const fcRes = await fetch(`${BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      const fc = await fcRes.json()

      // Group forecast by day (midday reading per day)
      const dayMap = new Map<string, any>()
      fc.list.forEach((item: any) => {
        const d = new Date(item.dt * 1000)
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        const hour = d.getHours()
        if (!dayMap.has(key) || Math.abs(hour - 12) < Math.abs(new Date(dayMap.get(key).dt * 1000).getHours() - 12))
          dayMap.set(key, item)
      })
      const minMaxMap = new Map<string, { min: number; max: number }>()
      fc.list.forEach((item: any) => {
        const d = new Date(item.dt * 1000)
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        const t = kelvinToCelsius(item.main.temp)
        if (!minMaxMap.has(key)) minMaxMap.set(key, { min: t, max: t })
        else {
          const mm = minMaxMap.get(key)!
          if (t < mm.min) mm.min = t
          if (t > mm.max) mm.max = t
          minMaxMap.set(key, mm)
        }
      })
      const days = Array.from(dayMap.entries()).slice(0, 5).map(([key, item]) => {
        const mm = minMaxMap.get(key) || { min: kelvinToCelsius(item.main.temp_min), max: kelvinToCelsius(item.main.temp_max) }
        return {
          dt: item.dt, temp: kelvinToCelsius(item.main.temp),
          temp_min: mm.min, temp_max: mm.max,
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          wind_speed: mpsToKmh(item.wind?.speed || 0),
          pop: Math.round((item.pop || 0) * 100),
        }
      })
      const hourlyItems: HourlyItem[] = fc.list.slice(0, 8).map((item: any) => ({
        dt: item.dt, temp: kelvinToCelsius(item.main.temp),
        icon: item.weather[0].icon, description: item.weather[0].description,
        pop: Math.round((item.pop || 0) * 100),
      }))

      // Air quality
      const aqRes = await fetch(`${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      const aq = await aqRes.json()
      const aqComp = aq.list[0].components
      const aqParsed: AirQuality = {
        aqi: aq.list[0].main.aqi, co: aqComp.co, no2: aqComp.no2,
        o3: aqComp.o3, pm2_5: aqComp.pm2_5, pm10: aqComp.pm10, so2: aqComp.so2,
      }

      setCurrent(parsed)
      setForecast(days)
      setHourly(hourlyItems)
      setAirQuality(aqParsed)
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ── City name search — geocodes to coords then calls fetchWeatherByCoords ───
  const fetchWeather = useCallback(async (searchCity: string) => {
    setLoading(true)
    setError(null)
    try {
      const cwRes = await fetch(`${BASE}/data/2.5/weather?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}`)
      if (!cwRes.ok) {
        if (cwRes.status === 404) throw new Error(`City "${searchCity}" not found. Please try again.`)
        throw new Error("Failed to fetch weather data.")
      }
      const cw = await cwRes.json()
      // Once we have coords from the geocoded city, switch to coord-based fetch
      setGpsCoords(null) // city search — no GPS coords stored
      await fetchWeatherByCoords(cw.coord.lat, cw.coord.lon, cw.name)
    } catch (e: any) {
      setError(e.message || "Something went wrong.")
      setLoading(false)
    }
  }, [fetchWeatherByCoords])

  // ── GPS-based fetch — Nominatim for deep name, OWM by exact coords ──────────
  const fetchByCoords = async (lat: number, lon: number) => {
    setError(null)
    // Get deepest locality name from Nominatim (hamlet → neighbourhood → suburb → village → town → city)
    let deepName = ""
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16&addressdetails=1`
      )
      const nomData = await nomRes.json()
      const a = nomData.address || {}
      // Comprehensive fallback chain covering all Nominatim address schemas
      deepName =
        a.hamlet || a.neighbourhood || a.suburb || a.quarter ||
        a.residential || a.farm || a.allotments || a.isolated_dwelling ||
        a.village || a.municipality || a.town || a.borough ||
        a.city_district || a.district || a.city ||
        a.county || a.state_district || a.state || ""
      // If still empty, try the display_name first component (before first comma)
      if (!deepName && nomData.display_name) {
        deepName = nomData.display_name.split(",")[0].trim()
      }
    } catch (_) {}

    const label = deepName || `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`
    setCity(label)
    setGpsCoords({ lat, lon })
    setLocating(false)
    // Fetch everything by exact GPS coordinates — no string search involved
    await fetchWeatherByCoords(lat, lon, label)
  }

  // On mount: check permission status first, then try GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("New Delhi")
      fetchWeather("New Delhi")
      return
    }

    // Check if permission already granted — if so, get coords immediately
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          setLocating(true)
          navigator.geolocation.getCurrentPosition(
            (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
            () => {
              setLocating(false)
              setPermissionDenied(true)
              setCity("New Delhi")
              fetchWeather("New Delhi")
            },
            { timeout: 15000, maximumAge: 60000, enableHighAccuracy: true }
          )
        } else {
          // Permission denied — go straight to New Delhi
          setPermissionDenied(true)
          setCity("New Delhi")
          fetchWeather("New Delhi")
        }
      }).catch(() => {
        // permissions API not supported, try anyway
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
          () => {
            setLocating(false)
            setCity("New Delhi")
            fetchWeather("New Delhi")
          },
          { timeout: 15000, maximumAge: 60000, enableHighAccuracy: true }
        )
      })
    } else {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => {
          setLocating(false)
          setCity("New Delhi")
          fetchWeather("New Delhi")
        },
        { timeout: 15000, maximumAge: 60000, enableHighAccuracy: true }
      )
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputCity.trim()) {
      setCity(inputCity.trim())
      fetchWeather(inputCity.trim())
      setInputCity("")
    }
  }

  const handleLocate = () => {
    setLocating(true)
    if (!navigator.geolocation) { setLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { setLocating(false); setPermissionDenied(true); setError("Location access denied. Please allow location in your browser settings.") }
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  const gradient = current ? weatherGradient(current.icon) : "from-sky-400 via-blue-500 to-indigo-600"
  const tips = current ? agriAdvice(current.description, current.temp, current.humidity, current.wind_speed) : []
  const aqiInfo = airQuality ? aqiLabel(airQuality.aqi) : null

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cloud className="w-7 h-7 text-orange-500" />
            KrishiMeghMitra
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time weather intelligence for smarter farming decisions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => gpsCoords ? fetchWeatherByCoords(gpsCoords.lat, gpsCoords.lon, city) : fetchWeather(city)}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              placeholder="Search city, district or village…"
              className="pl-9 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5">
            Search
          </Button>
        </form>
        <Button
          variant="outline"
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50"
          title="Use my location"
        >
          <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating…" : "My Location"}
        </Button>
      </div>

      {/* ── Location Permission Banner ── */}
      {permissionDenied && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">📍</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Location access is blocked</p>
            <p className="text-xs text-amber-700 mt-0.5">
              To see weather for your exact location, allow location access in your browser:
              <strong> Settings → Privacy &amp; Security → Site Settings → Location → Allow</strong>.
              Then click <strong>"My Location"</strong> above or reload the page.
            </p>
          </div>
          <button onClick={() => setPermissionDenied(false)} className="text-amber-500 hover:text-amber-700 text-lg font-bold leading-none">×</button>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto text-red-500">
            Dismiss
          </Button>
        </div>
      )}

      {/* ── Hero Current Weather Card ── */}
      {loading ? (
        <div className={`rounded-3xl bg-gradient-to-br ${gradient} p-8 shadow-2xl`}>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-28" />)}
            </div>
          </div>
        </div>
      ) : current ? (
        <div className={`rounded-3xl bg-gradient-to-br ${gradient} p-8 shadow-2xl text-white relative overflow-hidden`}>
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row justify-between gap-6">
            {/* Left — main temp */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span className="text-lg font-semibold">{current.name}, {current.country}</span>
              </div>
              <div className="flex items-end gap-4">
                <WeatherIcon icon={current.icon} className="w-24 h-24 drop-shadow-xl" />
                <div>
                  <div className="text-8xl font-thin leading-none">{current.temp}°</div>
                  <div className="text-white/70 capitalize mt-1 text-lg">{current.description}</div>
                </div>
              </div>
              <div className="flex gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {current.temp_max}°
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> {current.temp_min}°
                </span>
                <span>Feels like {current.feels_like}°C</span>
              </div>
              <div className="text-white/50 text-xs">{formatDay(current.dt)}</div>
            </div>

            {/* Right — stat pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-center">
              {[
                { icon: <Droplets className="w-5 h-5" />, label: "Humidity",    value: `${current.humidity}%` },
                { icon: <Wind className="w-5 h-5" />,     label: "Wind",        value: `${current.wind_speed} km/h ${windDirection(current.wind_deg)}` },
                { icon: <Gauge className="w-5 h-5" />,    label: "Pressure",    value: `${current.pressure} hPa` },
                { icon: <Eye className="w-5 h-5" />,      label: "Visibility",  value: `${current.visibility} km` },
                { icon: <Cloud className="w-5 h-5" />,    label: "Cloud Cover", value: `${current.clouds}%` },
                { icon: <Sun className="w-5 h-5" />,      label: "Sunset",      value: formatTime(current.sunset) },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex flex-col gap-1 min-w-[110px]">
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="text-white font-semibold text-sm leading-tight">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sunrise / Sunset bar */}
          <div className="relative mt-6 bg-white/10 rounded-2xl px-5 py-3 flex items-center justify-between text-sm text-white/80">
            <span className="flex items-center gap-1.5">🌅 Sunrise <span className="font-semibold text-white ml-1">{formatTime(current.sunrise)}</span></span>
            <div className="flex-1 mx-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0,
                    ((Date.now() / 1000 - current.sunrise) / (current.sunset - current.sunrise)) * 100
                  ))}%`
                }}
              />
            </div>
            <span className="flex items-center gap-1.5">🌇 Sunset <span className="font-semibold text-white ml-1">{formatTime(current.sunset)}</span></span>
          </div>
        </div>
      ) : null}

      {/* ── Agricultural Advisory ── */}
      {!loading && tips.length > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800">
              <Leaf className="w-5 h-5" /> Krishi Advisory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tips.map((tip, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-2 text-sm text-orange-900 border border-orange-200 shadow-sm">
                  {tip}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Hourly Forecast (24h) ── */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gray-700">
            <Activity className="w-5 h-5 text-blue-500" /> 24-Hour Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 w-20 flex-shrink-0" />)}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {hourly.map((h, idx) => (
                <div
                  key={h.dt}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl px-4 py-3 min-w-[80px] transition-all
                    ${idx === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
                >
                  <div className={`text-xs font-medium ${idx === 0 ? "text-blue-100" : "text-gray-400"}`}>
                    {idx === 0 ? "Now" : formatHour(h.dt)}
                  </div>
                  <WeatherIcon icon={h.icon} className="w-10 h-10" />
                  <div className="font-bold text-sm">{h.temp}°</div>
                  {h.pop > 0 && (
                    <div className={`text-xs flex items-center gap-0.5 ${idx === 0 ? "text-blue-200" : "text-blue-500"}`}>
                      <Droplets className="w-3 h-3" />{h.pop}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 5-Day Forecast ── */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-gray-700">
            <CloudRain className="w-5 h-5 text-indigo-500" /> 5-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {forecast.map((day, idx) => (
                <div
                  key={day.dt}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-28 text-sm font-medium text-gray-600">{idx === 0 ? "Today" : formatDay(day.dt)}</div>
                  <WeatherIcon icon={day.icon} className="w-10 h-10" />
                  <div className="flex-1 capitalize text-sm text-gray-600 hidden sm:block">{day.description}</div>
                  <div className="flex items-center gap-1 text-xs text-blue-500 w-12">
                    <Droplets className="w-3 h-3" />{day.pop}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 w-20">
                    <Wind className="w-3 h-3" />{day.wind_speed}k
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <span className="text-blue-600">{day.temp_min}°</span>
                    {/* temp bar */}
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden hidden lg:block">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                        style={{
                          marginLeft: `${Math.max(0, ((day.temp_min + 10) / 50) * 100)}%`,
                          width: `${Math.min(100, ((day.temp_max - day.temp_min) / 50) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-orange-600">{day.temp_max}°</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Air Quality + Extra Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Air Quality */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
              <Waves className="w-5 h-5 text-teal-500" /> Air Quality Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !airQuality ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}
                </div>
              </div>
            ) : (
              <>
                <div className={`${aqiInfo!.bg} rounded-2xl p-4 mb-4 flex items-center gap-4`}>
                  <div className={`text-5xl font-bold ${aqiInfo!.color}`}>{airQuality.aqi}</div>
                  <div>
                    <div className={`font-semibold text-lg ${aqiInfo!.color}`}>{aqiInfo!.label}</div>
                    <div className="text-gray-600 text-sm">{aqiInfo!.desc}</div>
                  </div>
                  <Badge className={`ml-auto ${aqiInfo!.bg} ${aqiInfo!.color} border-0`}>AQI</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "PM2.5",  value: airQuality.pm2_5.toFixed(1),  unit: "µg/m³" },
                    { label: "PM10",   value: airQuality.pm10.toFixed(1),   unit: "µg/m³" },
                    { label: "O₃",     value: airQuality.o3.toFixed(1),     unit: "µg/m³" },
                    { label: "NO₂",    value: airQuality.no2.toFixed(1),    unit: "µg/m³" },
                    { label: "SO₂",    value: airQuality.so2.toFixed(1),    unit: "µg/m³" },
                    { label: "CO",     value: (airQuality.co / 1000).toFixed(2), unit: "mg/m³" },
                  ].map((p) => (
                    <div key={p.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">{p.label}</div>
                      <div className="font-bold text-gray-800 text-sm">{p.value}</div>
                      <div className="text-xs text-gray-400">{p.unit}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Extra Weather Details */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
              <Thermometer className="w-5 h-5 text-red-500" /> Detailed Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !current ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "🌡️", label: "Temperature",   value: `${current.temp}°C`,       sub: `Feels ${current.feels_like}°C` },
                  { icon: "💧", label: "Humidity",       value: `${current.humidity}%`,    sub: current.humidity > 70 ? "High" : current.humidity < 30 ? "Low" : "Comfortable" },
                  { icon: "🌬️", label: "Wind Speed",    value: `${current.wind_speed} km/h`, sub: `Direction: ${windDirection(current.wind_deg)}` },
                  { icon: "🔵", label: "Pressure",       value: `${current.pressure} hPa`, sub: current.pressure > 1013 ? "High pressure" : "Low pressure" },
                  { icon: "👁️", label: "Visibility",    value: `${current.visibility} km`, sub: current.visibility > 7 ? "Clear" : "Reduced" },
                  { icon: "☁️", label: "Cloud Cover",   value: `${current.clouds}%`,       sub: current.clouds < 20 ? "Clear sky" : current.clouds < 60 ? "Partly cloudy" : "Overcast" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                    <div className="font-bold text-gray-800">{item.value}</div>
                    <div className="text-xs text-gray-400">{item.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Weather Map (OpenWeatherMap tile layer) ── */}
      {!loading && current && (
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
              🗺️ Live Precipitation Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <WeatherMapTile lat={current.lat} lon={current.lon} cityName={current.name} />
          </CardContent>
        </Card>
      )}


    </div>
  )
}

// ─── Leaflet Satellite + OWM Precipitation overlay ───────────────────────────
function WeatherMapTile({ lat, lon, cityName }: { lat: number; lon: number; cityName: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return
    const mapId = "owm-map"

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css-owm")) {
      const link = document.createElement("link")
      link.id = "leaflet-css-owm"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    const initMap = () => {
      const lf = (window as any).L
      if (!lf) return

      // Destroy any existing map instance on the container
      const mapEl = document.getElementById(mapId) as any
      if (!mapEl) return
      if (mapEl._leaflet_id) {
        lf.map(mapId).remove()
      }

      const map = lf.map(mapId, { zoomControl: true, scrollWheelZoom: false })
        .setView([lat, lon], 13)   // zoom 13 = neighbourhood level, same as KrishiChakra

      // ── Layer 1: Esri World Imagery satellite (identical to KrishiChakra) ──
      lf.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri", maxZoom: 19 }
      ).addTo(map)

      // ── Layer 2: Esri labels on top of satellite ──
      lf.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: "", maxZoom: 19, opacity: 0.85 }
      ).addTo(map)

      // ── Layer 3: OWM precipitation overlay ──
      lf.tileLayer(
        `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        { opacity: 0.55, attribution: "© OpenWeatherMap", maxZoom: 19 }
      ).addTo(map)

      // ── Marker with popup ──
      // Fix default icon broken by webpack
      delete (lf.Icon.Default.prototype as any)._getIconUrl
      lf.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
      lf.marker([lat, lon]).addTo(map).bindPopup(`📍 ${cityName}`).openPopup()
    }

    if ((window as any).L) {
      initMap()
    } else {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = initMap
      document.head.appendChild(script)
    }
  }, [lat, lon, cityName])

  return <div id="owm-map" style={{ height: "420px", width: "100%" }} />
}
