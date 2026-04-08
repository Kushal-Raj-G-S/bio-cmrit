"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Leaf, Menu, Globe, X, Home, Search, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/context/auth-context"
import { SARVAM_LANGUAGES } from "@/lib/sarvam-languages"
import { cn } from "@/lib/utils"

interface HeaderProps {
  currentLanguage?: string
  onLanguageChange?: (language: string) => void
}

export default function Header({ currentLanguage: externalLang, onLanguageChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, currentLanguage, changeLanguage, isTranslating } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [langSearchQuery, setLangSearchQuery] = useState("")
  const [isLangPopoverOpen, setIsLangPopoverOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Use the hook's language, but allow external override
  const activeLang = externalLang || currentLanguage

  const currentLang = SARVAM_LANGUAGES.find((l) => l.code === activeLang) || SARVAM_LANGUAGES[0]

  // Focus search input when popover opens
  useEffect(() => {
    if (isLangPopoverOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
    if (!isLangPopoverOpen) {
      setLangSearchQuery("")
    }
  }, [isLangPopoverOpen])

  // Filter languages
  const filteredLanguages = SARVAM_LANGUAGES.filter((lang) => {
    const q = langSearchQuery.toLowerCase()
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.native.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    )
  })

  const handleLanguageSelect = (code: string) => {
    changeLanguage(code)
    onLanguageChange?.(code)
    setIsLangPopoverOpen(false)
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group transition-all duration-200 hover:scale-105">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
            <Image
              src="/main.png"
              alt="BioBloom Logo"
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-110"
            />
          </div>
          <span className="font-heading font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors duration-200">BioBloom</span>
          <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors duration-200">
            For Indian Farmers
          </Badge>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200 font-medium group relative">
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {t("navigation.home")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/products" className="text-gray-600 hover:text-green-600 transition-all duration-200 font-medium group relative">
            {t("navigation.products")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-green-600 transition-all duration-200 font-medium group relative">
            {t("navigation.about")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/support" className="text-gray-600 hover:text-green-600 transition-all duration-200 font-medium group relative">
            {t("navigation.support")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Language Selector — Popover with search */}
          <Popover open={isLangPopoverOpen} onOpenChange={setIsLangPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden md:flex hover:bg-green-50 transition-all duration-200 gap-1.5",
                  isTranslating && "animate-pulse"
                )}
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                ) : (
                  <Globe className="w-4 h-4 text-green-600" />
                )}
                <span className="max-w-[80px] truncate">{currentLang.native}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 p-0 shadow-xl border-green-100 animate-in zoom-in-95 duration-150"
              sideOffset={8}
            >
              {/* Header */}
              <div className="p-3 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-600" />
                  {t("dashboard.topbar.language")}
                  {isTranslating && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Translating...
                    </span>
                  )}
                </h3>
              </div>

              {/* Search */}
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search language..."
                    value={langSearchQuery}
                    onChange={(e) => setLangSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                               placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Language list */}
              <div className="max-h-72 overflow-y-auto py-1">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => {
                    const isActive = activeLang === lang.code
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-150",
                          "hover:bg-green-50",
                          isActive && "bg-green-50"
                        )}
                      >
                        <span className="text-base font-medium w-16 text-gray-900">
                          {lang.native}
                        </span>
                        <span className="text-sm text-gray-500 flex-1">
                          {lang.name}
                        </span>
                        {isActive && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-400">
                    No languages found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t bg-gray-50">
                <p className="text-[10px] text-gray-400 text-center">
                  Powered by Sarvam AI · 22 Indic languages
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hidden md:flex transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-md">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hidden md:flex transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-md">
                {t("navigation.getStarted")}
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-green-50 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200 font-medium group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              {t("navigation.home")}
            </Link>
            <Link
              href="/products"
              className="block text-gray-600 hover:text-green-600 transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("navigation.products")}
            </Link>
            <Link
              href="/about"
              className="block text-gray-600 hover:text-green-600 transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("navigation.about")}
            </Link>
            <Link
              href="/support"
              className="block text-gray-600 hover:text-green-600 transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("navigation.support")}
            </Link>

            {/* Mobile Language Selector */}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {t("dashboard.topbar.language")}
                {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-green-600 ml-1" />}
              </p>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                {SARVAM_LANGUAGES.map((lang) => {
                  const isActive = activeLang === lang.code
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageSelect(lang.code)
                        setIsMobileMenuOpen(false)
                      }}
                      className={cn(
                        "text-xs px-2 py-1.5 rounded-md transition-colors duration-150 text-center",
                        isActive
                          ? "bg-green-100 text-green-800 font-medium"
                          : "bg-gray-50 text-gray-600 hover:bg-green-50"
                      )}
                    >
                      {lang.native}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full transition-all duration-200 hover:scale-105 shadow-md">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-full transition-all duration-200 hover:scale-105 shadow-md">
                    {t("navigation.getStarted")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
