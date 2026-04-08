'use client';

import React from 'react';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/lib/translations';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en' as Language, name: 'English', native: 'English' },
  { code: 'kn' as Language, name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi' as Language, name: 'Hindi', native: 'हिंदी' },
  { code: 'te' as Language, name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta' as Language, name: 'Tamil', native: 'தமிழ்' },
];

export function LanguageSwitcher(): React.JSX.Element {
  const { language, setLanguage } = useLanguage();

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 transition-all duration-200 hover:bg-green-50 hover:border-green-300"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.native}</span>
          <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer transition-colors ${
              language === lang.code
                ? 'bg-green-100 text-green-800'
                : 'hover:bg-green-50'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{lang.native}</span>
              <span className="text-xs text-gray-500">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
