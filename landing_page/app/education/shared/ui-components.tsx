// Basic UI components for education platform
import React from 'react'

// Card components
export const Card = ({ className = '', children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

export const CardHeader = ({ className = '', children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className = '', children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ className = '', children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <p className={`text-sm text-gray-600 ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent = ({ className = '', children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

// Badge component
export const Badge = ({ className = '', children, variant = 'default', ...props }: { 
  className?: string; 
  children: React.ReactNode; 
  variant?: 'default' | 'outline';
  [key: string]: any 
}) => (
  <span 
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      variant === 'outline' 
        ? 'border border-gray-200 bg-white text-gray-900' 
        : 'bg-gray-100 text-gray-800'
    } ${className}`} 
    {...props}
  >
    {children}
  </span>
)

// Button component
export const Button = ({ 
  className = '', 
  children, 
  variant = 'default', 
  size = 'default',
  ...props 
}: { 
  className?: string; 
  children: React.ReactNode; 
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  [key: string]: any 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}

// Progress component
export const Progress = ({ value = 0, className = '', ...props }: { 
  value?: number; 
  className?: string; 
  [key: string]: any 
}) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
    <div 
      className="h-full bg-blue-600 transition-all" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

// Tabs components
export const Tabs = ({ value, onValueChange, className = '', children, ...props }: {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
)

export const TabsList = ({ className = '', children, ...props }: { 
  className?: string; 
  children: React.ReactNode; 
  [key: string]: any 
}) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`} {...props}>
    {children}
  </div>
)

export const TabsTrigger = ({ value, className = '', children, ...props }: { 
  value?: string;
  className?: string; 
  children: React.ReactNode; 
  [key: string]: any 
}) => (
  <button 
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm ${className}`} 
    {...props}
  >
    {children}
  </button>
)

export const TabsContent = ({ value, className = '', children, ...props }: { 
  value?: string;
  className?: string; 
  children: React.ReactNode; 
  [key: string]: any 
}) => (
  <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`} {...props}>
    {children}
  </div>
)

// Separator component
export const Separator = ({ className = '', orientation = 'horizontal', ...props }: {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  [key: string]: any;
}) => (
  <div 
    className={`shrink-0 bg-gray-200 ${
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
    } ${className}`} 
    {...props} 
  />
)
