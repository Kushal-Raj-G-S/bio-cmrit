// ================================================
// TYPESCRIPT TYPES FOR BIOBLOOM DATABASE
// ================================================
// Auto-generated types matching Supabase schema
// Import these in your components for type safety
// ================================================

export interface Profile {
  // Primary Key
  id: string // UUID

  // Basic Information
  full_name: string | null
  email: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null

  // Farming Experience
  experience_years: '0-2' | '3-5' | '6-10' | '11-20' | '20+' | null

  // Farm Details
  farm_name: string | null
  farm_size: 'small' | 'medium' | 'large' | 'commercial' | null
  primary_crops: string | null // Comma-separated

  // Location
  city: string | null
  district: string | null
  state: string | null
  pincode: string | null

  // Verification Status
  phone_verified: boolean
  aadhaar_verified: boolean
  aadhaar_last_4: string | null
  verified_at: string | null // ISO timestamp

  // Onboarding Status
  onboarding_complete: boolean
  onboarding_step: number

  // Timestamps
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// ================================================
// FORM DATA TYPES (for onboarding)
// ================================================

export interface OnboardingFormData {
  // Step 1: Profile
  full_name: string
  phone: string
  bio: string
  experience_years: string

  // Step 2: Verification
  aadhaar_number: string // For verification only, not stored
  otp: string
  
  // Step 3: Farm Details
  farm_name: string
  farm_size: string
  primary_crops: string

  // Step 4: Location
  city: string
  district: string
  state: string
  pincode: string
}

// ================================================
// DATABASE OPERATION TYPES
// ================================================

export interface ProfileUpdate {
  full_name?: string
  phone?: string
  bio?: string
  experience_years?: string
  farm_name?: string
  farm_size?: string
  primary_crops?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  phone_verified?: boolean
  aadhaar_verified?: boolean
  aadhaar_last_4?: string
  onboarding_complete?: boolean
  onboarding_step?: number
}

// ================================================
// SUPABASE RESPONSE TYPES
// ================================================

export interface SupabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details: string
    hint: string
  } | null
}

// ================================================
// HELPER TYPE GUARDS
// ================================================

export function isProfileComplete(profile: Profile): boolean {
  return !!(
    profile.full_name &&
    profile.phone &&
    profile.farm_name &&
    profile.city &&
    profile.state &&
    profile.onboarding_complete
  )
}

export function isPhoneVerified(profile: Profile): boolean {
  return profile.phone_verified
}

export function isAadhaarVerified(profile: Profile): boolean {
  return profile.aadhaar_verified
}
