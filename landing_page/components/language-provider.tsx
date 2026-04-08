"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTranslation } from "@/hooks/use-translation"

interface LanguageContextType {
  t: (key: string) => string
  currentLanguage: string
  changeLanguage: (language: string) => void
  availableLanguages: string[]
  getLanguageName: (code: string) => string
  hasTranslation: (key: string, language?: string) => boolean
  isTranslating: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const translation = useTranslation()

  return <LanguageContext.Provider value={translation}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
