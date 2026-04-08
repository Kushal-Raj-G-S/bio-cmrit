export interface FieldBatch {
  id: string
  user_id: string
  name: string
  location: string
  soil_type: string
  season: string
  climate_zone: string
  size: number
  status: "active" | "planning" | "fallow" | "harvested"
  current_crop?: string
  planted_date?: string
  expected_harvest?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  location?: string
  farm_size?: number
  farm_name?: string
  created_at: string
  updated_at: string
}

export interface CropRotationPlan {
  id: string
  season: string
  description: string
  crops: string[]
  duration: string
  expectedYield: string
  profitEstimate: string
  soilBenefits: string[]
}

// ============================================================================
// NEW: Enhanced KrishiChakra Types (complete database integration)
// ============================================================================

export interface RotationPattern {
  id: string
  pattern_name: string
  crops_sequence: string[]
  duration_years: number
  suitable_regions: string[]
  soil_types: string[]
  benefits: string[]
  challenges: string[]
  success_rate: number
  roi_percentage: number
  sustainability_score: number
  water_efficiency: number
  pest_resistance: number
  created_at: string
}

export interface FieldActivity {
  id: string
  field_batch_id: string
  user_id: string
  activity_type: 'planting' | 'irrigation' | 'fertilizing' | 'pest_control' | 'harvesting'
  activity_date: string
  crop_involved?: string
  description?: string
  quantity?: number
  unit?: string
  cost?: number
  field_section?: string
  created_at: string
}

export interface HarvestRecord {
  id: string
  field_batch_id: string
  user_id: string
  crop_name: string
  variety?: string
  harvest_date: string
  quantity_kg: number
  area_harvested?: number
  yield_per_hectare?: number
  quality_grade?: string
  moisture_content?: number
  sale_price_per_kg?: number
  total_revenue?: number
  created_at: string
}

export interface UserRotationPlan {
  id: string
  user_id: string
  field_batch_id: string
  plan_name: string
  input_params: any
  plan_data: any
  duration_years: number
  expected_roi?: number
  sustainability_score?: number
  status: 'draft' | 'active' | 'completed' | 'abandoned'
  activated_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface MarketPrice {
  id: string
  crop_name: string
  variety?: string
  region: string
  state: string
  district?: string
  market_name?: string
  price_per_quintal: number
  price_date: string
  price_type: 'min' | 'max' | 'modal' | 'average'
  quality_grade?: string
  created_at: string
}

export interface CropYield {
  id: string
  region: string
  state: string
  district?: string
  crop_name: string
  variety?: string
  yield_kg_per_hectare: number
  production_tonnes?: number
  area_hectares?: number
  year: number
  season?: string
  soil_type?: string
  rainfall_mm?: number
  temperature_avg?: number
  created_at: string
}
