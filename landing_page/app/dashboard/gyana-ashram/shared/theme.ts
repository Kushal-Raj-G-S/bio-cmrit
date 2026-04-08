// Unified theme configuration for the education platform

export const theme = {
  colors: {
    primary: {
      50: '#f0f9f4',
      100: '#dcf4e6',
      200: '#bbe7d0',
      300: '#86d5ad',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    secondary: {
      50: '#fef7ee',
      100: '#fdedd8',
      200: '#fbd6b0',
      300: '#f7b77e',
      400: '#f2904a',
      500: '#ef7520',
      600: '#e05d16',
      700: '#ba4715',
      800: '#943819',
      900: '#782f17',
    },
    accent: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    }
  },
  gradients: {
    primary: 'from-green-500 to-green-600',
    secondary: 'from-orange-500 to-orange-600',
    hero: 'from-green-50 via-blue-50 to-purple-50',
    card: 'from-white to-gray-50/50',
    accent: 'from-purple-500 to-pink-500',
    warm: 'from-orange-400 via-orange-500 to-red-500',
    cool: 'from-blue-500 via-purple-500 to-indigo-600',
    success: 'from-green-400 to-green-600',
    warning: 'from-yellow-400 to-orange-500',
  },
  shadows: {
    card: 'shadow-lg hover:shadow-xl',
    button: 'shadow-md hover:shadow-lg',
    floating: 'shadow-2xl',
    soft: 'shadow-sm',
  },
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.2 }
    },
    stagger: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  spacing: {
    section: 'py-16',
    card: 'p-6',
    button: 'px-6 py-3',
  }
};

export const getGradientClass = (gradient: keyof typeof theme.gradients) => {
  return `bg-gradient-to-r ${theme.gradients[gradient]}`;
};

export const getShadowClass = (shadow: keyof typeof theme.shadows) => {
  return theme.shadows[shadow];
};
