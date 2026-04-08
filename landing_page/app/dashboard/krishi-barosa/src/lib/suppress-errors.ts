// Suppress browser extension errors and MetaMask injection attempts
if (typeof window !== 'undefined') {
  // Suppress runtime.lastError messages from Chrome extensions
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Block common extension and MetaMask errors
    if (
      message.includes('runtime.lastError') ||
      message.includes('message port closed') ||
      message.includes('chrome-extension') ||
      message.includes('MetaMask') ||
      message.includes('Failed to connect to MetaMask') ||
      message.includes('MetaMask extension not found') ||
      message.includes('ethereum') ||
      message.includes('web3') ||
      message.includes('inpage.js') ||
      message.includes('s: Failed to connect')
    ) {
      return; // Don't log these errors
    }
    
    // Log all other errors normally
    originalError(...args);
  };

  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Block MetaMask warnings
    if (
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('web3')
    ) {
      return; // Don't log these warnings
    }
    
    // Log all other warnings normally
    originalWarn(...args);
  };

  // Prevent MetaMask injection completely
  Object.defineProperty(window, 'ethereum', {
    get() {
      return undefined;
    },
    set() {
      // Silently ignore MetaMask injection attempts
    },
    configurable: false,
    enumerable: false
  });

  // Clear any existing ethereum objects
  (window as any).ethereum = undefined;
  (window as any).web3 = undefined;
  (window as any).BinanceChain = undefined;
  (window as any).tronWeb = undefined;

  // Block the specific MetaMask scripts from executing
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0]?.toString() || '';
    if (url.includes('chrome-extension') && url.includes('inpage.js')) {
      return Promise.reject(new Error('Blocked MetaMask script'));
    }
    return originalFetch.apply(this, args);
  };
}
