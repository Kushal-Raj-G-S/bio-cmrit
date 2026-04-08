import { createClient } from '@supabase/supabase-js'
import { FieldBatch } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create supabase client with optimized session management
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'biobloom-auth'
    },
    global: {
      headers: {
        'x-client-info': 'biobloom-web'
      }
    }
  }
)

// Simple cache for field batches
const fieldBatchCache = new Map<string, { data: any; expires: number }>()

// Field Batch CRUD operations
export async function getFieldBatches(userId: string) {
  console.log('🔍 Fetching field batches for user:', userId)
  
  // Check cache first
  const cacheKey = `field_batches_${userId}`
  const cached = fieldBatchCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    console.log('⚡ Using cached field batches')
    return { data: cached.data, error: null }
  }
  
  try {
    const result = await supabase
      .from('field_batches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    console.log('📊 Field batches query result:', {
      data: result.data,
      error: result.error,
      count: result.data?.length || 0
    })
    
    if (result.error) {
      console.error('🚨 Supabase error details:', {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code
      })
    }
    
    // Cache successful results for 2 minutes
    if (!result.error && result.data) {
      fieldBatchCache.set(cacheKey, {
        data: result.data,
        expires: Date.now() + 120000
      })
    }
    
    return result
  } catch (err) {
    console.error('💥 Unexpected error in getFieldBatches:', err)
    return { data: null, error: err }
  }
}

export async function createFieldBatch(userId: string, fieldData: Omit<FieldBatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  console.log('💾 Creating field batch with data:', { userId, fieldData })
  
  // Clear cache when creating new field
  fieldBatchCache.delete(`field_batches_${userId}`)
  
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8 second timeout
    
    const result = await supabase
      .from('field_batches')
      .insert({ user_id: userId, ...fieldData })
      .select()
      .single()
      .abortSignal(controller.signal)
    
    clearTimeout(timeout)
    console.log('🎯 Insert result:', result)
    
    if (result.error) {
      console.error('❌ Database error details:', result.error)
      console.error('❌ Error code:', result.error.code)
      console.error('❌ Error message:', result.error.message)
      console.error('❌ Error details:', result.error.details)
    }
    
    return result
  } catch (err) {
    console.error('💥 Unexpected error in createFieldBatch:', err)
    // Return proper error format
    return { data: null, error: { message: err.message || 'Database timeout - please try again' } }
  }
}

export async function updateFieldBatch(fieldId: string, fieldData: Partial<Omit<FieldBatch, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  // Clear all caches on update
  fieldBatchCache.clear()
  
  return await supabase
    .from('field_batches')
    .update(fieldData)
    .eq('id', fieldId)
    .select()
    .single()
}

export async function deleteFieldBatch(fieldId: string) {
  // Clear all caches on delete
  fieldBatchCache.clear()
  
  return await supabase
    .from('field_batches')
    .delete()
    .eq('id', fieldId)
}

// ============================================================================
// NEW: Enhanced KrishiChakra Functions (with complete database integration)
// ============================================================================

// Get crop rotation recommendations based on soil type and region
export async function getRotationRecommendations(soilType: string, region?: string) {
  let query = supabase
    .from('rotation_patterns')
    .select('*')
    .contains('soil_types', [soilType])
    .order('success_rate', { ascending: false })
    .limit(5)
    
  if (region) {
    query = query.contains('suitable_regions', [region])
  }
  
  return await query
}

// Get crop rotation plans for a user
export async function getRotationPlans(userId: string) {
  return await supabase
    .from('crop_rotation_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

// Create a new rotation plan
export async function createRotationPlan(userId: string, fieldBatchId: string, planData: any) {
  return await supabase
    .from('crop_rotation_plans')
    .insert({
      user_id: userId,
      field_batch_id: fieldBatchId,
      plan_name: planData.planName,
      input_params: planData.inputParams,
      plan_data: planData.planData,
      duration_years: planData.durationYears,
      expected_roi: planData.expectedRoi,
      sustainability_score: planData.sustainabilityScore
    })
    .select()
    .single()
}

// Get field activities for a field
export async function getFieldActivities(fieldBatchId: string) {
  return await supabase
    .from('field_activities')
    .select('*')
    .eq('field_batch_id', fieldBatchId)
    .order('activity_date', { ascending: false })
}

// Add field activity
export async function addFieldActivity(userId: string, fieldBatchId: string, activity: any) {
  return await supabase
    .from('field_activities')
    .insert({
      user_id: userId,
      field_batch_id: fieldBatchId,
      ...activity
    })
    .select()
    .single()
}

// Get harvest records for a field
export async function getHarvestRecords(fieldBatchId: string) {
  return await supabase
    .from('harvest_records')
    .select('*')
    .eq('field_batch_id', fieldBatchId)
    .order('harvest_date', { ascending: false })
}

// Add harvest record
export async function addHarvestRecord(userId: string, fieldBatchId: string, harvest: any) {
  return await supabase
    .from('harvest_records')
    .insert({
      user_id: userId,
      field_batch_id: fieldBatchId,
      ...harvest
    })
    .select()
    .single()
}

// Get market prices for crops
export async function getMarketPrices(cropName?: string, region?: string) {
  let query = supabase
    .from('market_prices')
    .select('*')
    .order('price_date', { ascending: false })
    .limit(20)
    
  if (cropName) {
    query = query.eq('crop_name', cropName)
  }
  
  if (region) {
    query = query.eq('region', region)
  }
  
  return await query
}

// Get crop yield data for analysis
export async function getCropYields(cropName?: string, region?: string, year?: number) {
  let query = supabase
    .from('crop_yields')
    .select('*')
    .order('year', { ascending: false })
    .limit(50)
    
  if (cropName) {
    query = query.eq('crop_name', cropName)
  }
  
  if (region) {
    query = query.eq('region', region)
  }
  
  if (year) {
    query = query.eq('year', year)
  }
  
  return await query
}
