// Development utility - minimal version to avoid interference
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Only suppress specific known non-issues
    const originalConsoleWarn = console.warn

  console.warn = (...args) => {
    const message = args[0]?.toString() || ''
    
    // Suppress placeholder image warnings
    if (message.includes('placeholder.com') || message.includes('via.placeholder')) {
      return
    }
    // Suppress expected Bhuvan LULC 404s (ISRO has no data for some districts — fallback handles it)
    if (message.includes('Bhuvan LULC API not responding')) {
      return
    }

    originalConsoleWarn.apply(console, args)
  }
}

export {}
