// Development utility - minimal version to avoid interference
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only suppress specific known issues, not all errors
  const originalConsoleWarn = console.warn

  console.warn = (...args) => {
    const message = args[0]?.toString() || ''
    
    // Only suppress very specific placeholder image warnings
    if (message.includes('placeholder.com') || message.includes('via.placeholder')) {
      return // Suppress placeholder warnings only
    }

    originalConsoleWarn.apply(console, args)
  }
}

export {}
