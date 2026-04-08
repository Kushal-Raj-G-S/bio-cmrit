"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Leaf, Menu, Globe, X, Home } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/context/auth-context"

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
]

interface HeaderProps {
  currentLanguage?: string
  onLanguageChange?: (language: string) => void
}

export default function Header({ currentLanguage = "en", onLanguageChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  const currentLang = languages.find((lang) => lang.code === currentLanguage) || languages[0]

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
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex hover:bg-green-50 transition-all duration-200">
                <Globe className="w-4 h-4 mr-2" />
                {currentLang.native}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-in zoom-in-95 duration-150">
              {languages.map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => onLanguageChange?.(language.code)}
                  className={currentLanguage === language.code ? "bg-green-50" : ""}
                >
                  <span className="font-medium">{language.native}</span>
                  <span className="text-sm text-gray-500 ml-2">({language.name})</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
