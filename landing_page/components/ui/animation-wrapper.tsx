"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimationWrapperProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-in" | "slide-up" | "slide-left" | "slide-right" | "scale-in" | "bounce-in"
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export function AnimationWrapper({
  children,
  className,
  animation = "fade-in",
  delay = 0,
  duration = 300,
  threshold = 0.05,
  once = true,
}: AnimationWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            setHasAnimated(true)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin: "0px 0px 50px 0px",
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, once])

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out"
    
    if (!isVisible && !hasAnimated) {
      switch (animation) {
        case "fade-in":
          return cn(baseClasses, "opacity-0")
        case "slide-up":
          return cn(baseClasses, "opacity-0 translate-y-8")
        case "slide-left":
          return cn(baseClasses, "opacity-0 -translate-x-8")
        case "slide-right":
          return cn(baseClasses, "opacity-0 translate-x-8")
        case "scale-in":
          return cn(baseClasses, "opacity-0 scale-95")
        case "bounce-in":
          return cn(baseClasses, "opacity-0 scale-75")
        default:
          return baseClasses
      }
    }
    
    return cn(baseClasses, "opacity-100 translate-y-0 translate-x-0 scale-100")
  }

  return (
    <div
      ref={ref}
      className={cn(getAnimationClasses(), className)}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Quick animation components for common use cases
export function FadeIn({ children, ...props }: Omit<AnimationWrapperProps, "animation">) {
  return (
    <AnimationWrapper animation="fade-in" {...props}>
      {children}
    </AnimationWrapper>
  )
}

export function SlideUp({ children, ...props }: Omit<AnimationWrapperProps, "animation">) {
  return (
    <AnimationWrapper animation="slide-up" {...props}>
      {children}
    </AnimationWrapper>
  )
}

export function SlideLeft({ children, ...props }: Omit<AnimationWrapperProps, "animation">) {
  return (
    <AnimationWrapper animation="slide-left" {...props}>
      {children}
    </AnimationWrapper>
  )
}

export function SlideRight({ children, ...props }: Omit<AnimationWrapperProps, "animation">) {
  return (
    <AnimationWrapper animation="slide-right" {...props}>
      {children}
    </AnimationWrapper>
  )
}

export function ScaleIn({ children, ...props }: Omit<AnimationWrapperProps, "animation">) {
  return (
    <AnimationWrapper animation="scale-in" {...props}>
      {children}
    </AnimationWrapper>
  )
}

export function BounceIn({ children, ...props }: Omit<AnimationWrapperProps, "animation">) {
  return (
    <AnimationWrapper animation="bounce-in" {...props}>
      {children}
    </AnimationWrapper>
  )
}
